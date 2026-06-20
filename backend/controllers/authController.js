const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (patient or doctor)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const userData = { ...req.body };
        if (userData.role && !userData.userType) {
            userData.userType = userData.role;
        } else if (userData.userType && !userData.role) {
            userData.role = userData.userType;
        }
        if (!userData.joinDate) {
            userData.joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        // Map availability string array to array of objects expected by the schema
        if (userData.userType === 'doctor' && Array.isArray(userData.availability)) {
            userData.availability = userData.availability.map(dayItem => {
                if (typeof dayItem === 'string') {
                    return {
                        day: dayItem,
                        startTime: '09:00 AM',
                        endTime: '05:00 PM',
                        isActive: true
                    };
                }
                return dayItem;
            });
        }

        const user = await User.create(userData);

        // Create welcome notification
        await Notification.create({
            user: user._id,
            type: 'reminder',
            title: 'Welcome to Skinzy!',
            message: `Hello ${user.name}, welcome to Skinzy! We're glad to have you here. Let's start your skin health journey!`,
        });

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                role: user.role || user.userType,
            },
            userId: user._id.toString(),
            email: user.email,
            role: user.role || user.userType,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong password' });
        }

        const role = user.role || user.userType;
        if (!role) {
            return res.status(400).json({ message: 'User account is missing role/type information' });
        }

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType || user.role,
                role: user.role || user.userType,
            },
            userId: user._id.toString(),
            email: user.email,
            role: role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        if (!req.user) return res.status(404).json({ message: 'User not found' });
        const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
        userObj.role = userObj.role || userObj.userType;
        userObj.userType = userObj.userType || userObj.role;
        res.json({ user: userObj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request forgot password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email address' });
        }

        // Generate a 6-digit numeric OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store in user document (valid for 10 minutes)
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Log to console so the user/developer can read it
        console.log(`\n===========================================`);
        console.log(`🔑 [OTP] PASSWORD RESET OTP FOR ${email}: ${otp}`);
        console.log(`===========================================\n`);

        res.json({ message: 'OTP verification code has been sent (check server logs)' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password (Forgot Password)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    console.log(`🔑 Password reset request for: ${email}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email address' });
        }

        // Verify OTP
        if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        if (Date.now() > user.resetPasswordOTPExpires) {
            return res.status(400).json({ message: 'OTP code has expired' });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Password Reset Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate uploaded document
// @route   POST /api/auth/validate-document
// @access  Public
const validateDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ valid: false, message: 'No file uploaded' });
        }

        const { documentType } = req.body; // 'license', 'cnicFront', 'cnicBack', 'certificate'
        console.log(`📄 Validating document: ${req.file.originalname} as ${documentType}`);

        // Frontend validation: file extension, size
        const ext = req.file.originalname.split('.').pop().toLowerCase();
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        if (!allowedExtensions.includes(ext)) {
            return res.status(400).json({ valid: false, message: 'Invalid file extension. Allowed: PDF, JPG, JPEG, PNG' });
        }

        let text = '';
        if (ext !== 'pdf') {
            try {
                // Resize and convert to grayscale with sharp to optimize OCR speed/accuracy
                const processedImage = await sharp(req.file.buffer)
                    .resize(1000)
                    .grayscale()
                    .toBuffer();

                const ocrResult = await Tesseract.recognize(processedImage, 'eng');
                text = ocrResult.data.text.toLowerCase();
            } catch (ocrError) {
                console.error('OCR Error:', ocrError);
                return res.status(400).json({ valid: false, message: 'Could not parse text from image' });
            }
        } else {
            // Treat PDF as valid structure (assumed manually validated/safe structure)
            return res.json({ valid: true, message: 'PDF document accepted for manual verification' });
        }

        console.log(`🔍 Extracted text length: ${text.length}. Sample: ${text.substring(0, 100).replace(/\n/g, ' ')}`);

        // If no text is detected at all (or length is extremely small, e.g. < 5 characters), reject it
        if (text.trim().length < 5) {
            return res.status(400).json({ 
                valid: false, 
                message: 'No readable text detected. Please upload a clear image of the document.' 
            });
        }

        // Validation Rules:
        if (documentType === 'license' || documentType === 'certificate') {
            const keywords = ['pmc', 'pmdc', 'pakistan', 'medical', 'dental', 'council', 'license', 'registration', 'certificate', 'practitioner', 'dermatology', 'physician', 'surgeon'];
            const hasKeyword = keywords.some(k => text.includes(k));
            if (!hasKeyword) {
                return res.status(400).json({
                    valid: false,
                    message: 'Uploaded file does not appear to be a valid medical document.'
                });
            }
            return res.json({ valid: true, message: 'Valid Medical Document' });
        }

        if (documentType === 'cnicFront') {
            const keywords = ['identity', 'card', 'national', 'government', 'pakistan', 'name', 'father', 'gender', 'birth', 'dob', 'holder'];
            const cnicPattern = /\d{5}-\d{7}-\d/;
            const hasCnicPattern = cnicPattern.test(text);
            const hasKeyword = keywords.some(k => text.includes(k));
            
            if (!hasKeyword && !hasCnicPattern) {
                return res.status(400).json({
                    valid: false,
                    message: 'Please upload the FRONT side of a valid Pakistani CNIC.'
                });
            }
            return res.json({ valid: true, message: 'Valid CNIC Front' });
        }

        if (documentType === 'cnicBack') {
            const keywords = ['family', 'address', 'district', 'temporary', 'permanent', 'issue', 'expiry', 'card', 'pension', 'authority', 'office', 'signature', 'thumb'];
            const hasKeyword = keywords.some(k => text.includes(k));

            const cnicPattern = /\d{5}-\d{7}-\d/;
            const hasCnicPattern = cnicPattern.test(text);
            const isActuallyFront = hasCnicPattern && text.includes('name') && text.includes('father');

            if (!hasKeyword || isActuallyFront) {
                return res.status(400).json({
                    valid: false,
                    message: 'Please upload the BACK side of a valid Pakistani CNIC.'
                });
            }
            return res.json({ valid: true, message: 'Valid CNIC Back' });
        }

        return res.json({ valid: true, message: 'Document accepted' });
    } catch (error) {
        console.error('Validation Controller Error:', error);
        res.status(500).json({ valid: false, message: error.message || 'Error occurred during validation' });
    }
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword, validateDocument };
