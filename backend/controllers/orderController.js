const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { generateOrderId } = require('../utils/helpers');
const mongoose = require('mongoose');

// Create new order
const createOrder = async (req, res) => {
  try {
    // Decrease stock for each item
    for (const item of req.body.items) {
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        const product = await Product.findById(item.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - (item.quantity || 1));
          await Product.findByIdAndUpdate(item.productId, { stock: newStock, updatedAt: Date.now() });
        }
      }
    }

    // Generate order ID with auto-increment
    const orderId = await generateOrderId(Order);

    // Create order with new ID format
    const newOrder = new Order({
      ...req.body,
      orderId: orderId
    });
    await newOrder.save();
    
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create order and Razorpay intent in one go
const createOrderWithPayment = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    // Calculate total amount from frontend or recalculate
    const { totalAmount, items } = req.body;
    
    let razorpayOrderId = null;
    let isTestMode = false;
    
    if (!keyId || !keySecret || keyId === 'rzp_test_demo_key') {
      isTestMode = true;
      razorpayOrderId = 'order_mock_' + Date.now();
    } else {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const rzOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: 'rcpt_' + Date.now()
      });
      razorpayOrderId = rzOrder.id;
    }
    
    // Decrease stock for each item
    for (const item of items) {
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        const product = await Product.findById(item.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - (item.quantity || 1));
          await Product.findByIdAndUpdate(item.productId, { stock: newStock, updatedAt: Date.now() });
        }
      }
    }

    const orderId = await generateOrderId(Order);

    const newOrder = new Order({
      ...req.body,
      orderId: orderId,
      paymentId: razorpayOrderId,
      paymentStatus: 'pending'
    });
    
    await newOrder.save();
    
    res.status(201).json({ 
      success: true, 
      order: newOrder, 
      razorpayOrderId, 
      testMode: isTestMode,
      keyId: isTestMode ? 'rzp_test_demo_key' : keyId
    });
  } catch (error) {
    console.error('Create Order With Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Track orders by phone (returns all orders for that phone)
const trackOrder = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Find all orders by phone number OR exact orderId match
    const orders = await Order.find({
      $or: [
        { 'customerInfo.phone': identifier },
        { orderId: identifier }
      ]
    }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found' });
    }
    
    res.status(200).json({ success: true, orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order by ID
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingId, courierName, trackingLink } = req.body;
    const updateData = { status };
    if (trackingId !== undefined) updateData.trackingId = trackingId;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (trackingLink !== undefined) updateData.trackingLink = trackingLink;
    
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  createOrderWithPayment,
  trackOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus
};