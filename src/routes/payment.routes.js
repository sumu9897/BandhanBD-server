const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const { createPaymentIntent, createPayment, getPayments, getPaymentsByEmail } = require('../controllers/payment.controller');

const router = express.Router();
router.post('/payment/create-intent', verifyToken, asyncHandler(createPaymentIntent));
router.post('/payments', verifyToken, asyncHandler(createPayment));
router.get('/payments', verifyToken, verifyAdmin, asyncHandler(getPayments));
router.get('/payments/:email', verifyToken, asyncHandler(getPaymentsByEmail));
module.exports = router;
