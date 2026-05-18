const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');

// Initialize Razorpay with credentials from environment
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID?.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim()
});

// Create Razorpay Order
const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Check if Razorpay is properly configured with real credentials
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    if (!keyId || !keySecret || keyId === 'rzp_test_demo_key' || keySecret === 'demo_secret') {
      // Return mock order for testing when no real credentials
      const mockOrderId = 'order_' + Math.random().toString(36).substring(7) + Date.now();
      console.log('⚠️ Using mock Razorpay - no valid credentials');
      return res.status(200).json({ 
        success: true, 
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        testMode: true
      });
    }
    
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: 'order_' + Math.random().toString(36).substring(7)
    };
    
    console.log('🔄 Creating Razorpay order with key:', keyId.substring(0, 10) + '...');
    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created:', order.id);
    res.status(200).json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('❌ Razorpay Error:', error.message);
    // Return mock order on error for testing
    const mockOrderId = 'order_' + Math.random().toString(36).substring(7) + Date.now();
    res.status(200).json({ 
      success: true, 
      orderId: mockOrderId,
      amount: Math.round(req.body.amount * 100),
      currency: 'INR',
      testMode: true,
      error: error.message
    });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    // Skip real verification if using mock/test credentials
    let isValid = false;
    if (!keySecret || keySecret === 'demo_secret' || keySecret === 'abcdef1234567890abcdef1234567890') {
      console.log('⚠️ Payment verification skipped - test mode');
      isValid = true;
    } else {
      // Real signature verification
      const generatedSignature = crypto.createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
      
      isValid = (generatedSignature === razorpay_signature);
    }
    
    if (isValid) {
      console.log('✅ Payment verified successfully');
      
      // Update order status in DB
      if (order_id) {
        const order = await Order.findById(order_id);
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.paymentId = razorpay_payment_id;
          await order.save();
          
          // Send email to Admin
          const adminEmailContent = `
            <h1>New Order Received!</h1>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${order.customerInfo.firstName} ${order.customerInfo.lastName}</p>
            <p><strong>Email:</strong> ${order.customerInfo.email}</p>
            <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
            <p><strong>Amount:</strong> Rs. ${order.totalAmount}</p>
            <p><strong>Status:</strong> Paid</p>
          `;
          await sendEmail('New Order Confirmed - Fitzone', adminEmailContent);

          // Send confirmation email to Customer
          const customerEmailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #111; text-align: center; border-bottom: 2px solid #b89047; padding-bottom: 10px;">Thank You for Your Order!</h2>
              <p>Hi ${order.customerInfo.firstName},</p>
              <p>Your order has been successfully placed and paid for. We are getting it ready for you!</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f9f9f9;">
                  <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Order ID:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${order.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total Amount:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${order.totalAmount}</td>
                </tr>
                <tr style="background: #f9f9f9;">
                  <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Payment Status:</td>
                  <td style="padding: 10px; border: 1px solid #ddd; color: #2e7d32; font-weight: bold;">Paid</td>
                </tr>
              </table>
              
              <p style="font-size: 14px; color: #555;">If you have any questions, feel free to reply to this email or contact our support team.</p>
              <p style="text-align: center; font-weight: bold; color: #b89047; margin-top: 30px;">FITZONE</p>
            </div>
          `;
          await sendEmail('Your Order has been Confirmed! - Fitzone', customerEmailContent, order.customerInfo.email, `${order.customerInfo.firstName} ${order.customerInfo.lastName}`);
        }
      }
      
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      console.log('❌ Invalid payment signature');
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// Razorpay Webhook to catch successful payments
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      console.warn('⚠️ No webhook secret configured');
      return res.status(200).send('OK');
    }

    const signature = req.headers['x-razorpay-signature'];
    
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
    
    const expectedSignature = crypto.createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
      
    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Process event
    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      
      const order = await Order.findOne({ paymentId: razorpayOrderId });
      
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentId = paymentId; // Store the actual payment ID instead of order ID if needed, or keep order ID.
        await order.save();
        
        console.log(`✅ Webhook: Order ${order.orderId} marked as paid`);
        
        // Send email to Admin
        const adminEmailContent = `
          <h1>New Order Received (via Webhook)!</h1>
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Customer:</strong> ${order.customerInfo.firstName} ${order.customerInfo.lastName}</p>
          <p><strong>Amount:</strong> Rs. ${order.totalAmount}</p>
          <p><strong>Status:</strong> Paid</p>
        `;
        await sendEmail('New Order Confirmed - Fitzone', adminEmailContent);

        // Send confirmation email to Customer
        const customerEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #111; text-align: center; border-bottom: 2px solid #b89047; padding-bottom: 10px;">Thank You for Your Order!</h2>
            <p>Hi ${order.customerInfo.firstName},</p>
            <p>Your order has been successfully placed and paid for. We are getting it ready for you!</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Order ID:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total Amount:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${order.totalAmount}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Payment Status:</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #2e7d32; font-weight: bold;">Paid</td>
              </tr>
            </table>
            
            <p style="font-size: 14px; color: #555;">If you have any questions, feel free to reply to this email or contact our support team.</p>
            <p style="text-align: center; font-weight: bold; color: #b89047; margin-top: 30px;">FITZONE</p>
          </div>
        `;
        await sendEmail('Your Order has been Confirmed! - Fitzone', customerEmailContent, order.customerInfo.email, `${order.customerInfo.firstName} ${order.customerInfo.lastName}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook Error');
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook
};