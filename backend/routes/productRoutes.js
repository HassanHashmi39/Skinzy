const express = require('express');
const router = express.Router();
const { getProducts, getRemedies } = require('../controllers/productController');

// Allow public access for patient facing screens
router.get('/products', getProducts);
router.get('/remedies', getRemedies);

module.exports = router;
