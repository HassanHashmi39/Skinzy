const express = require('express');
const router = express.Router();
const { getDoctorsForAdmin, verifyDoctor, getDoctorDetailsAdmin, getProductsAdmin, addProductAdmin, removeProductAdmin, editProductAdmin, getAllReportsAdmin } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/doctors', protect, adminOnly, getDoctorsForAdmin);
router.put('/doctors/:id/verify', protect, adminOnly, verifyDoctor);
router.get('/doctors/:id/details', protect, adminOnly, getDoctorDetailsAdmin);

router.get('/products', protect, adminOnly, getProductsAdmin);
router.post('/products', protect, adminOnly, addProductAdmin);
router.put('/products/:id', protect, adminOnly, editProductAdmin);
router.delete('/products/:id', protect, adminOnly, removeProductAdmin);

router.get('/reports', protect, adminOnly, getAllReportsAdmin);

module.exports = router;
