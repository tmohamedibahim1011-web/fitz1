const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, razorpayWebhook } = require('../controllers/paymentController');

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', razorpayWebhook);

module.exports = router;