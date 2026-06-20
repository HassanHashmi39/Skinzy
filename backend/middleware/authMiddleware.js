const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            // Ensure role and userType are in sync on the request user object
            if (req.user.role && !req.user.userType) {
                req.user.userType = req.user.role;
            } else if (req.user.userType && !req.user.role) {
                req.user.role = req.user.userType;
            }
            return next();
        } catch (error) {
            console.error('Auth Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const patientOnly = (req, res, next) => {
    const role = req.user.role || req.user.userType;
    if (role !== 'patient') {
        return res.status(403).json({ message: 'Access denied: Patient role required' });
    }
    next();
};

const doctorOnly = (req, res, next) => {
    const role = req.user.role || req.user.userType;
    if (role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied: Doctor role required' });
    }
    next();
};

module.exports = { protect, patientOnly, doctorOnly };
