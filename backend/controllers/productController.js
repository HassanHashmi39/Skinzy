const Product = require('../models/Product');

// @desc    Get all active products
// @route   GET /api/inventory/products
// @access  Public or Protected
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ type: 'product', isActive: true }).sort({ createdAt: -1 });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active remedies
// @route   GET /api/inventory/remedies
// @access  Public or Protected
const getRemedies = async (req, res) => {
    try {
        const remedies = await Product.find({ type: 'remedy', isActive: true }).sort({ createdAt: -1 });
        res.json({ remedies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getRemedies
};
