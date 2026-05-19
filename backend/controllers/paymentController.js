const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');

// Initialize Razorpay with credentials from environment
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID?.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim()
});

/**
 * Generates an editorial-style luxury HTML email template for orders
 * @param {object} order - The complete MongoDB Order document
 * @param {boolean} isAdmin - Whether the recipient is the administrator
 * @returns {string} - Rich HTML content
 */
const generateOrderEmailHtml = (order, isAdmin = false) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: left;">
        <span style="font-weight: bold; color: #111;">${item.name}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #555; text-align: left;">
        ${item.color || 'Standard'}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #111; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #111; text-align: right;">
        Rs. ${item.price.toLocaleString()}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; font-weight: bold; color: #111; text-align: right;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #fafaf9; color: #1c1c1c; border: 1px solid #e5e5e0;">
      <!-- Brand Header -->
      <div style="background-color: #1a1a1a; padding: 30px; text-align: center; border-bottom: 3px solid #c9a84c;">
        <h1 style="color: #fafaf9; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase; font-family: Arial, sans-serif;">FITZONE</h1>
        <p style="color: #c9a84c; font-size: 11px; font-weight: bold; letter-spacing: 3px; margin: 5px 0 0 0; text-transform: uppercase;">Premium Training Equipment</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 0; border-bottom: 1px solid #e5e5e0; padding-bottom: 15px;">
          ${isAdmin ? '🔔 New Order Received!' : '✨ Order Confirmed'}
        </h2>
        
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          ${isAdmin 
            ? `An order has been successfully placed and verified. Here are the full transaction details:` 
            : `Hi ${order.customerInfo.firstName},<br><br>Thank you for shopping at FITZONE. Your order has been confirmed, paid for, and is now being prepared by our craftsmen.`}
        </p>

        <!-- Order Information Metadata -->
        <div style="background-color: #f3f3f0; border-left: 4px solid #c9a84c; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 13px; color: #666; padding: 4px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Order Number:</td>
              <td style="font-size: 14px; color: #c9a84c; padding: 4px 0; font-weight: bold; font-family: monospace; text-align: left;">${order.orderId}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #666; padding: 4px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Date:</td>
              <td style="font-size: 14px; color: #111; padding: 4px 0; text-align: left;">${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #666; padding: 4px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Payment Status:</td>
              <td style="font-size: 13px; color: #2e7d32; padding: 4px 0; font-weight: bold; text-transform: uppercase; text-align: left;">PAID (Razorpay)</td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #111; margin: 30px 0 10px 0; text-align: left;">Ordered Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #1a1a1a;">
              <th style="padding: 10px 12px; color: #fafaf9; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: left; letter-spacing: 1px;">Item</th>
              <th style="padding: 10px 12px; color: #fafaf9; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: left; letter-spacing: 1px;">Finish</th>
              <th style="padding: 10px 12px; color: #fafaf9; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; letter-spacing: 1px;">Qty</th>
              <th style="padding: 10px 12px; color: #fafaf9; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: right; letter-spacing: 1px;">Price</th>
              <th style="padding: 10px 12px; color: #fafaf9; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: right; letter-spacing: 1px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px 12px 5px 12px; text-align: right; font-size: 13px; color: #666; font-weight: bold; text-transform: uppercase;">Grand Total:</td>
              <td colspan="2" style="padding: 15px 12px 5px 12px; text-align: right; font-size: 18px; font-weight: 800; color: #c9a84c;">Rs. ${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Shipping & Customer details -->
        <div style="border-top: 1px solid #e5e5e0; padding-top: 25px; margin-top: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="vertical-align: top;">
              <td style="width: 50%; padding-right: 15px; text-align: left;">
                <h4 style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 10px 0;">Shipping Address</h4>
                <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
                  <strong style="color: #111;">${order.customerInfo.firstName} ${order.customerInfo.lastName}</strong><br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}<br>
                  <span style="font-size: 13px; color: #666;">Method: ${order.shippingAddress.method || 'Standard Shipping'}</span>
                </p>
              </td>
              <td style="width: 50%; padding-left: 15px; border-left: 1px solid #e5e5e0; text-align: left;">
                <h4 style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 10px 0;">Customer Contact</h4>
                <p style="font-size: 14px; line-height: 1.5; color: #333; margin: 0;">
                  Email: <a href="mailto:${order.customerInfo.email}" style="color: #c9a84c; text-decoration: none;">${order.customerInfo.email}</a><br>
                  Phone: ${order.customerInfo.phone}
                </p>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Email Footer -->
      <div style="background-color: #1a1a1a; padding: 25px; text-align: center; border-top: 1px solid #c9a84c;">
        <p style="color: #fafaf9; font-size: 12px; margin: 0 0 8px 0; font-weight: bold; letter-spacing: 1px;">Thank you for choosing FITZONE.</p>
        <p style="color: #888; font-size: 11px; margin: 0;">This is an automated confirmation email. For support, reply directly to this mail or write to us at <a href="mailto:kavinath50@gmail.com" style="color: #c9a84c; text-decoration: none;">kavinath50@gmail.com</a>.</p>
      </div>
    </div>
  `;
};

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
      console.log('🔍 [DEBUG] order_id received:', order_id);
      
      // Update order status in DB
      if (order_id) {
        const order = await Order.findById(order_id);
        console.log('🔍 [DEBUG] Database Order Search:', order ? `Found order: ${order.orderId}` : 'Not found');
        
        if (order) {
          console.log('🔍 [DEBUG] Order paymentStatus is:', order.paymentStatus);
          console.log('🔍 [DEBUG] Order emailSent status in DB:', order.emailSent);
          
          let needsEmail = !order.emailSent;
          
          if (order.paymentStatus !== 'paid' || needsEmail) {
            order.paymentStatus = 'paid';
            order.paymentId = razorpay_payment_id;
            await order.save();
            
            if (needsEmail) {
              console.log('🔍 [DEBUG] Triggering email services in background...');
              
              // Atomically check and update emailSent flag to true to prevent race conditions
              const updatedOrder = await Order.findOneAndUpdate(
                { _id: order._id, emailSent: false },
                { $set: { emailSent: true } },
                { new: true }
              );

              if (updatedOrder) {
                console.log('✅ Atomic update successful. Sending emails...');
                const adminEmailContent = generateOrderEmailHtml(updatedOrder, true);
                const customerEmailContent = generateOrderEmailHtml(updatedOrder, false);
                const adminEmailAddress = process.env.ADMIN_EMAIL || 'kavinath50@gmail.com';
                
                // Asynchronously send Admin notification
                sendEmail('New Order Confirmed - Fitzone', adminEmailContent, adminEmailAddress, 'Fitzone Admin', 'ADMIN_NOTIFICATION')
                  .then(adminSent => {
                    if (adminSent) console.log('✅ Background: Admin order email sent successfully.');
                  })
                  .catch(err => console.error('❌ Background: Failed to send admin email:', err.message));

                // Asynchronously send Customer confirmation
                sendEmail('Your Order has been Confirmed! - Fitzone', customerEmailContent, updatedOrder.customerInfo.email, `${updatedOrder.customerInfo.firstName} ${updatedOrder.customerInfo.lastName}`, 'CUSTOMER_CONFIRMATION')
                  .then(customerSent => {
                    if (customerSent) console.log('✅ Background: Customer order confirmation email sent successfully.');
                  })
                  .catch(err => console.error('❌ Background: Failed to send customer email:', err.message));
              } else {
                console.log('⚠️ Emails already processed by another worker/webhook.');
              }
            }
          }
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
      
      if (order) {
        console.log(`✅ Webhook: Order ${order.orderId} found. Current emailSent: ${order.emailSent}`);
        
        let needsEmail = !order.emailSent;
        
        if (order.paymentStatus !== 'paid' || needsEmail) {
          order.paymentStatus = 'paid';
          order.paymentId = paymentId;
          await order.save();
          
          if (needsEmail) {
            console.log(`✅ Webhook: Triggering confirmation emails in background for order ${order.orderId}`);
            
            const updatedOrder = await Order.findOneAndUpdate(
              { _id: order._id, emailSent: false },
              { $set: { emailSent: true } },
              { new: true }
            );

            if (updatedOrder) {
              const adminEmailContent = generateOrderEmailHtml(updatedOrder, true);
              const customerEmailContent = generateOrderEmailHtml(updatedOrder, false);
              const adminEmailAddress = process.env.ADMIN_EMAIL || 'kavinath50@gmail.com';
              
              sendEmail('New Order Confirmed - Fitzone', adminEmailContent, adminEmailAddress, 'Fitzone Admin', 'WEBHOOK_ADMIN')
                .then(adminSent => {
                  if (adminSent) console.log('✅ Webhook Background: Admin order email sent.');
                })
                .catch(err => console.error('❌ Webhook Background: Admin email failed:', err.message));

              sendEmail('Your Order has been Confirmed! - Fitzone', customerEmailContent, updatedOrder.customerInfo.email, `${updatedOrder.customerInfo.firstName} ${updatedOrder.customerInfo.lastName}`, 'WEBHOOK_CUSTOMER')
                .then(customerSent => {
                  if (customerSent) console.log('✅ Webhook Background: Customer order email sent.');
                })
                .catch(err => console.error('❌ Webhook Background: Customer email failed:', err.message));
            } else {
              console.log('⚠️ Webhook: Emails already processed by client verification.');
            }
          }
        }
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