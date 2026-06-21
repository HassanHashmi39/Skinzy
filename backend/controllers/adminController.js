const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const Report = require('../models/Report');

// @desc    Get all doctors for admin (including pending)
// @route   GET /api/admin/doctors
// @access  Private (Admin)
const getDoctorsForAdmin = async (req, res) => {
    try {
        const doctorsData = await User.find({ userType: 'doctor' }).select('-password -verificationDocuments').lean();
        
        // Fetch report counts for each doctor
        const doctors = await Promise.all(doctorsData.map(async (doc) => {
            const reportCount = await Report.countDocuments({ doctor: doc._id });
            return { ...doc, reportCount };
        }));

        res.json({ doctors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update doctor verification status
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin)
const verifyDoctor = async (req, res) => {
    try {
        const { status } = req.body; // 'verified', 'rejected', 'pending', 'blocked'
        
        if (!['verified', 'rejected', 'pending', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const doctor = await User.findById(req.params.id);
        if (!doctor || doctor.userType !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.verificationStatus = status;
        await doctor.save();

        res.json({ message: `Doctor status updated to ${status}`, doctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed info of a doctor (patients, feedback)
// @route   GET /api/admin/doctors/:id/details
// @access  Private (Admin)
const getDoctorDetailsAdmin = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const doctor = await User.findById(doctorId).select('-password');
        
        if (!doctor || doctor.userType !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Find distinct patients who booked this doctor
        const appointments = await Appointment.find({ doctor: doctorId }).populate('patient', 'name email profileImage');
        const patientsMap = new Map();
        appointments.forEach(app => {
            if (app.patient && !patientsMap.has(app.patient._id.toString())) {
                patientsMap.set(app.patient._id.toString(), app.patient);
            }
        });
        const patients = Array.from(patientsMap.values());

        // Find feedbacks
        const feedbacks = await Feedback.find({ doctor: doctorId }).populate('patient', 'name profileImage');

        // Find reports
        const reports = await Report.find({ doctor: doctorId }).populate('patient', 'name email').sort({ createdAt: -1 });

        res.json({ doctor, patients, feedbacks, reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all products and remedies
// @route   GET /api/admin/products
// @access  Private (Admin)
const getProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new product or remedy
// @route   POST /api/admin/products
// @access  Private (Admin)
const addProductAdmin = async (req, res) => {
    try {
        const { name, description, type, price, imageUrl, targetDiseases } = req.body;

        if (!name || !description || !type) {
            return res.status(400).json({ message: 'Name, description, and type are required' });
        }

        if (!['remedy', 'product'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Must be remedy or product' });
        }

        const product = new Product({
            name,
            description,
            type,
            price: price || 0,
            imageUrl: imageUrl || '',
            targetDiseases: Array.isArray(targetDiseases) ? targetDiseases : (targetDiseases ? targetDiseases.split(',').map(d => d.trim()) : [])
        });

        await product.save();
        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Edit a product or remedy
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
const editProductAdmin = async (req, res) => {
    try {
        const { name, description, type, price, imageUrl, targetDiseases } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (name) product.name = name;
        if (description) product.description = description;
        if (type) {
            if (!['remedy', 'product'].includes(type)) {
                return res.status(400).json({ message: 'Invalid type. Must be remedy or product' });
            }
            product.type = type;
        }
        if (price !== undefined) product.price = price;
        if (imageUrl !== undefined) product.imageUrl = imageUrl;
        if (targetDiseases !== undefined) {
            product.targetDiseases = Array.isArray(targetDiseases) ? targetDiseases : (targetDiseases ? targetDiseases.split(',').map(d => d.trim()) : []);
        }

        await product.save();
        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a product or remedy
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
const removeProductAdmin = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports globally
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAllReportsAdmin = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('patient', 'name email profileImage')
            .populate('doctor', 'name email specialization')
            .sort({ createdAt: -1 });
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDoctorsForAdmin,
    verifyDoctor,
    getDoctorDetailsAdmin,
    getProductsAdmin,
    addProductAdmin,
    editProductAdmin,
    removeProductAdmin,
    getAllReportsAdmin
};
