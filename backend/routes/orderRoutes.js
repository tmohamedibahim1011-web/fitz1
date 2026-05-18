const express = require('express');
const router = express.Router();
const { createOrder, createOrderWithPayment, trackOrder } = require('../controllers/orderController');

router.post('/create', createOrder);
router.post('/create-with-payment', createOrderWithPayment);
router.get('/track/:identifier', trackOrder);

module.exports = router;