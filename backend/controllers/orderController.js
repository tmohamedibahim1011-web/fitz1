const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { generateOrderId, calculateExpectedDeliveryDate, calculateOrderDates } = require('../utils/helpers');
const mongoose = require('mongoose');

// Helper to decrement stock color-wise and globally
const decrementProductStock = async (productId, itemColor, quantity) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return;
  const product = await Product.findById(productId);
  if (!product) return;

  const qty = quantity || 1;
  let updated = false;

  product.colors = product.colors.map(color => {
    const isMatch = itemColor && (
      color.name.toLowerCase() === itemColor.toLowerCase() ||
      color.id.toLowerCase() === itemColor.toLowerCase()
    );
    if (isMatch) {
      color.stock = Math.max(0, (color.stock || 0) - qty);
      updated = true;
    }
    return color;
  });

  product.stock = Math.max(0, product.stock - qty);
  product.updatedAt = Date.now();
  await product.save();
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, customerInfo, shippingAddress } = req.body;

    // Decrease stock for each item
    for (const item of items) {
      await decrementProductStock(item.productId, item.color, item.quantity);
    }

    // Generate base order ID
    const baseOrderId = await generateOrderId(Order);
    const savedOrders = [];

    // Flatten items so that every single unit is a separate item of quantity 1
    const flatItems = [];
    for (const item of items) {
      const qty = item.quantity || 1;
      for (let q = 0; q < qty; q++) {
        flatItems.push({
          productId: item.productId,
          name: item.name,
          color: item.color,
          price: item.price,
          quantity: 1
        });
      }
    }

    const shippingState = shippingAddress ? shippingAddress.state : '';
    const { dispatchDate, expectedDeliveryDate } = calculateOrderDates(Date.now(), shippingState, flatItems);

    if (flatItems.length <= 1) {
      const newOrder = new Order({
        ...req.body,
        items: flatItems,
        orderId: baseOrderId,
        dispatchDate,
        expectedDeliveryDate
      });
      await newOrder.save();
      savedOrders.push(newOrder);
    } else {
      const subtotal = flatItems.reduce((sum, item) => sum + item.price, 0);
      const totalShipping = Math.max(0, totalAmount - subtotal);
      const shippingPerItem = Math.floor(totalShipping / flatItems.length);
      const remainderShipping = totalShipping - (shippingPerItem * flatItems.length);

      for (let i = 0; i < flatItems.length; i++) {
        const item = flatItems[i];
        const itemShipping = shippingPerItem + (i === 0 ? remainderShipping : 0);
        const itemTotal = item.price + itemShipping;

        let shippingMethod = 'Free Shipping';
        if (itemShipping > 0) {
          shippingMethod = itemShipping === 50 ? 'Mini Shipping (Rs.50)' : `Standard Shipping (Rs.${itemShipping})`;
        }

        const newOrder = new Order({
          customerInfo,
          shippingAddress: {
            ...shippingAddress,
            method: shippingMethod
          },
          items: [item],
          totalAmount: itemTotal,
          orderId: `${baseOrderId}-${i + 1}`,
          paymentStatus: req.body.paymentStatus || 'pending',
          dispatchDate,
          expectedDeliveryDate
        });
        await newOrder.save();
        savedOrders.push(newOrder);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      order: savedOrders[0], 
      orders: savedOrders,
      orderIds: savedOrders.map(o => o.orderId)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create order and Razorpay intent in one go
const createOrderWithPayment = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    const { totalAmount, items, customerInfo, shippingAddress } = req.body;
    
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
      await decrementProductStock(item.productId, item.color, item.quantity);
    }

    const baseOrderId = await generateOrderId(Order);
    const savedOrders = [];

    // Flatten items so that every single unit is a separate item of quantity 1
    const flatItems = [];
    for (const item of items) {
      const qty = item.quantity || 1;
      for (let q = 0; q < qty; q++) {
        flatItems.push({
          productId: item.productId,
          name: item.name,
          color: item.color,
          price: item.price,
          quantity: 1
        });
      }
    }

    const shippingState = shippingAddress ? shippingAddress.state : '';
    const { dispatchDate, expectedDeliveryDate } = calculateOrderDates(Date.now(), shippingState, flatItems);

    if (flatItems.length <= 1) {
      const newOrder = new Order({
        ...req.body,
        items: flatItems,
        orderId: baseOrderId,
        paymentId: razorpayOrderId,
        paymentStatus: 'pending',
        dispatchDate,
        expectedDeliveryDate
      });
      
      await newOrder.save();
      savedOrders.push(newOrder);
    } else {
      const subtotal = flatItems.reduce((sum, item) => sum + item.price, 0);
      const totalShipping = Math.max(0, totalAmount - subtotal);
      const shippingPerItem = Math.floor(totalShipping / flatItems.length);
      const remainderShipping = totalShipping - (shippingPerItem * flatItems.length);

      for (let i = 0; i < flatItems.length; i++) {
        const item = flatItems[i];
        const itemShipping = shippingPerItem + (i === 0 ? remainderShipping : 0);
        const itemTotal = item.price + itemShipping;

        let shippingMethod = 'Free Shipping';
        if (itemShipping > 0) {
          shippingMethod = itemShipping === 50 ? 'Mini Shipping (Rs.50)' : `Standard Shipping (Rs.${itemShipping})`;
        }

        const newOrder = new Order({
          customerInfo,
          shippingAddress: {
            ...shippingAddress,
            method: shippingMethod
          },
          items: [item],
          totalAmount: itemTotal,
          orderId: `${baseOrderId}-${i + 1}`,
          paymentId: razorpayOrderId,
          paymentStatus: 'pending',
          dispatchDate,
          expectedDeliveryDate
        });
        await newOrder.save();
        savedOrders.push(newOrder);
      }
    }
    
    res.status(201).json({ 
      success: true, 
      order: savedOrders[0], 
      orders: savedOrders,
      orderIds: savedOrders.map(o => o.orderId),
      razorpayOrderId, 
      testMode: isTestMode,
      keyId: isTestMode ? 'rzp_test_demo_key' : keyId
    });
  } catch (error) {
    console.error('Create Order With Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Track orders by phone (returns matching orders)
const trackOrder = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Tracking identifier is required' });
    }

    const trimmed = identifier.trim();
    
    // Find all orders by phone number match
    const orders = await Order.find({
      'customerInfo.phone': trimmed
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

// Update order details full (admin)
const updateOrderDetailsFull = async (req, res) => {
  try {
    const { customerInfo, shippingAddress, items, totalAmount, paymentStatus, dispatchDate, expectedDeliveryDate } = req.body;
    const updateData = {};
    if (customerInfo) updateData.customerInfo = customerInfo;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (items) updateData.items = items;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (dispatchDate !== undefined) updateData.dispatchDate = dispatchDate;
    if (expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = expectedDeliveryDate;
    
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete order (admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
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
  updateOrderStatus,
  updateOrderDetailsFull,
  deleteOrder
};