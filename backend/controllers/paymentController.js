const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');
const { generateInvoicePdf } = require('../utils/pdfGenerator');

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
/**
 * Converts a number to Indian Rupees in words
 */
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  
  return convert(Math.floor(num)) + ' Rupees only';
};

const generateOrderEmailHtml = (order, isAdmin = false) => {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const itemsHtml = order.items.map((item, index) => `
    <tr>
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: center;">${index + 1}</td>
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: left;">
        ${item.name}<br>
        <span style="font-size: 12px; color: #777;">${item.color || 'Standard'} Finish</span>
      </td>
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: right;">₹ ${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: right; font-weight: bold;">₹ ${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const amountInWords = numberToWords(order.totalAmount);

  // For admin notification, wrap the invoice with a short admin note at the top
  const adminNoteHtml = isAdmin ? `
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <p style="margin: 0; font-size: 14px; color: #856404; font-weight: bold;">🔔 New Order Received!</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #856404;">A verified payment has been received. The Tax Invoice is attached below.</p>
    </div>
  ` : `
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <p style="margin: 0; font-size: 14px; color: #166534; font-weight: bold;">✨ Order Confirmed & Paid!</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #166534;">Hi ${order.customerInfo.firstName}, thank you for shopping at Fitz1. Your order is confirmed and is being prepared. Your Tax Invoice is below.</p>
    </div>
  `;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      
      ${adminNoteHtml}

      <!-- Tax Invoice Container -->
      <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 0;">

        <!-- Company Header -->
        <div style="padding: 25px 30px 20px 30px; border-bottom: 2px solid #333;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: top; text-align: left; width: 65%;">
                <h1 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 900; color: #1a1a1a; letter-spacing: 1px;">Fitz1</h1>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #555;">
                  5/1293 THAI NAGAR Thoothukudi<br>
                  Phone no.: 8072210156<br>
                  Email: fitz1business@gmail.com<br>
                  GSTIN: 33AAKFF3665N1Z0<br>
                  State: 33-Tamil Nadu
                </p>
              </td>
              <td style="vertical-align: top; text-align: right; width: 35%;">
                <img src="cid:fitz1logo" alt="Fitz1 Logo" style="max-width: 100px; height: auto;" />
              </td>
            </tr>
          </table>
        </div>

        <!-- Tax Invoice Title -->
        <div style="text-align: center; padding: 14px 0; border-bottom: 1px solid #eee;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #aaaaaa; letter-spacing: 1px;">Tax Invoice</h2>
        </div>

        <!-- Bill To & Invoice Details -->
        <div style="padding: 20px 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: top; text-align: left; width: 55%;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #333; text-transform: uppercase;">Bill To</p>
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #111;">${order.customerInfo.firstName} ${order.customerInfo.lastName}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #555; line-height: 1.5;">
                  Contact No.: ${order.customerInfo.phone}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}
                </p>
              </td>
              <td style="vertical-align: top; text-align: right; width: 45%;">
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #333; text-transform: uppercase;">Invoice Details</p>
                <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.8;">
                  Invoice No.: <strong style="color: #111;">${order.orderId}</strong><br>
                  Date: <strong style="color: #111;">${invoiceDate}</strong>
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <div style="padding: 0 30px 20px 30px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px 12px; border: 1px solid #ddd; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; color: #333; width: 8%;">#</th>
                <th style="padding: 10px 12px; border: 1px solid #ddd; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: left; color: #333;">Description</th>
                <th style="padding: 10px 12px; border: 1px solid #ddd; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: center; color: #333; width: 10%;">Qty</th>
                <th style="padding: 10px 12px; border: 1px solid #ddd; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: right; color: #333; width: 18%;">Rate</th>
                <th style="padding: 10px 12px; border: 1px solid #ddd; font-size: 12px; font-weight: bold; text-transform: uppercase; text-align: right; color: #333; width: 18%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Totals Section -->
        <div style="padding: 0 30px 20px 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 55%; vertical-align: top;">
                <p style="font-size: 12px; font-weight: bold; color: #333; margin: 0 0 4px 0; text-transform: uppercase;">Invoice Amount In Words</p>
                <p style="font-size: 13px; color: #555; margin: 0; font-style: italic;">${amountInWords}</p>
              </td>
              <td style="width: 45%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Total</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 900; color: #2563eb; text-align: right; border-bottom: 1px solid #eee;">₹ ${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #555;">Received</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333; text-align: right;">₹ ${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #555; border-top: 1px solid #eee;">Balance</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #16a34a; text-align: right; border-top: 1px solid #eee;">₹ 0.00</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- Shipping Info -->
        <div style="padding: 0 30px 20px 30px; border-top: 1px solid #eee; margin-top: 5px; padding-top: 15px;">
          <p style="font-size: 12px; font-weight: bold; color: #333; margin: 0 0 4px 0; text-transform: uppercase;">Shipping Details</p>
          <p style="font-size: 12px; color: #555; margin: 0; line-height: 1.5;">
            ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}<br>
            Method: ${order.shippingAddress.method || 'Standard Shipping'} &nbsp;|&nbsp; Payment: Razorpay (Online) &nbsp;|&nbsp; Status: <strong style="color: #16a34a;">PAID</strong>
          </p>
        </div>

        <!-- Authorized Signatory -->
        <div style="padding: 20px 30px 30px 30px; border-top: 1px solid #eee;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; vertical-align: bottom;">
                <p style="font-size: 11px; color: #999; margin: 0;">This is a computer-generated invoice and does not require a physical signature.</p>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <p style="font-size: 13px; color: #555; margin: 0 0 6px 0;">For: <strong style="color: #111;">Fitz1</strong></p>
                <img src="cid:fitz1sign" alt="Signature" style="width: 90px; height: auto; display: block; margin-left: auto;" />
                <p style="font-size: 12px; font-weight: bold; color: #333; margin: 4px 0 0 0; border-top: 1px solid #ccc; padding-top: 6px;">Authorized Signatory</p>
              </td>
            </tr>
          </table>
        </div>

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 15px 0 5px 0;">
        <p style="font-size: 11px; color: #999; margin: 0;">For support, contact us at <a href="mailto:fitz1business@gmail.com" style="color: #2563eb; text-decoration: none;">fitz1business@gmail.com</a> or call 8072210156</p>
        <p style="font-size: 11px; color: #bbb; margin: 5px 0 0 0;">www.fitz1.in</p>
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
              
              // Atomically claim the email send slot — prevents duplicate sends from concurrent webhooks
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
                
                let attachments = [];
                try {
                  const pdfBuffer = generateInvoicePdf(updatedOrder);
                  attachments.push({
                    filename: `Invoice-${updatedOrder.orderId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                  });
                } catch (pdfErr) {
                  console.error('❌ Failed to generate invoice PDF:', pdfErr.message);
                }

                // Send both emails and track results
                // If BOTH fail, reset emailSent=false so the next Razorpay webhook retry can try again
                Promise.all([
                  sendEmail('New Order Confirmed - Fitzone', adminEmailContent, adminEmailAddress, 'Fitzone Admin', 'ADMIN_NOTIFICATION', attachments)
                    .then(sent => {
                      if (sent) console.log('✅ Background: Admin order email sent successfully.');
                      else console.error('❌ Background: Admin email returned false (delivery failed).');
                      return sent;
                    })
                    .catch(err => {
                      console.error('❌ Background: Admin email threw error:', err.code, err.responseCode, err.message);
                      return false;
                    }),

                  sendEmail('Your Order has been Confirmed! - Fitzone', customerEmailContent, updatedOrder.customerInfo.email, `${updatedOrder.customerInfo.firstName} ${updatedOrder.customerInfo.lastName}`, 'CUSTOMER_CONFIRMATION', attachments)
                    .then(sent => {
                      if (sent) console.log('✅ Background: Customer order confirmation email sent successfully.');
                      else console.error('❌ Background: Customer email returned false (delivery failed).');
                      return sent;
                    })
                    .catch(err => {
                      console.error('❌ Background: Customer email threw error:', err.code, err.responseCode, err.message);
                      return false;
                    })
                ]).then(async ([adminSent, customerSent]) => {
                  if (!adminSent && !customerSent) {
                    // Both failed — reset the flag so Razorpay's retry webhook can try again
                    console.warn('⚠️ Background: Both emails failed. Resetting emailSent=false for retry...');
                    await Order.findByIdAndUpdate(updatedOrder._id, { $set: { emailSent: false } });
                  }
                });
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
            
            // Atomically claim the email send slot — prevents duplicate sends
            const updatedOrder = await Order.findOneAndUpdate(
              { _id: order._id, emailSent: false },
              { $set: { emailSent: true } },
              { new: true }
            );

            if (updatedOrder) {
              const adminEmailContent = generateOrderEmailHtml(updatedOrder, true);
              const customerEmailContent = generateOrderEmailHtml(updatedOrder, false);
              const adminEmailAddress = process.env.ADMIN_EMAIL || 'kavinath50@gmail.com';
              
              let attachments = [];
              try {
                const pdfBuffer = generateInvoicePdf(updatedOrder);
                attachments.push({
                  filename: `Invoice-${updatedOrder.orderId}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf'
                });
              } catch (pdfErr) {
                console.error('❌ Webhook: Failed to generate invoice PDF:', pdfErr.message);
              }

              // Send both emails and track results
              // If BOTH fail, reset emailSent=false so Razorpay's next webhook retry can try again
              Promise.all([
                sendEmail('New Order Confirmed - Fitzone', adminEmailContent, adminEmailAddress, 'Fitzone Admin', 'WEBHOOK_ADMIN', attachments)
                  .then(sent => {
                    if (sent) console.log('✅ Webhook Background: Admin order email sent.');
                    else console.error('❌ Webhook Background: Admin email returned false (delivery failed).');
                    return sent;
                  })
                  .catch(err => {
                    console.error('❌ Webhook Background: Admin email threw error:', err.code, err.responseCode, err.message);
                    return false;
                  }),

                sendEmail('Your Order has been Confirmed! - Fitzone', customerEmailContent, updatedOrder.customerInfo.email, `${updatedOrder.customerInfo.firstName} ${updatedOrder.customerInfo.lastName}`, 'WEBHOOK_CUSTOMER', attachments)
                  .then(sent => {
                    if (sent) console.log('✅ Webhook Background: Customer order email sent.');
                    else console.error('❌ Webhook Background: Customer email returned false (delivery failed).');
                    return sent;
                  })
                  .catch(err => {
                    console.error('❌ Webhook Background: Customer email threw error:', err.code, err.responseCode, err.message);
                    return false;
                  })
              ]).then(async ([adminSent, customerSent]) => {
                if (!adminSent && !customerSent) {
                  // Both failed — reset the flag so Razorpay's retry webhook can try again
                  console.warn('⚠️ Webhook Background: Both emails failed. Resetting emailSent=false for retry...');
                  await Order.findByIdAndUpdate(updatedOrder._id, { $set: { emailSent: false } });
                }
              });
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