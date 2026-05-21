require('dotenv').config();
const { sendEmail } = require('./utils/emailService');
const { generateInvoicePdf } = require('./utils/pdfGenerator');

const mockOrder = {
  orderId: 'ORD-TEST-1234',
  createdAt: new Date(),
  totalAmount: 1599,
  customerInfo: { firstName: 'Sudharsan', lastName: 'M', phone: '9566324568', email: 'kavinath50@gmail.com' },
  shippingAddress: { address: 'Door no - 123, Main Road', city: 'Chennai', state: 'Tamil Nadu', zip: '600001', method: 'Standard Shipping' },
  items: [{ name: 'Regular size Natural Finish', color: 'Natural', quantity: 1, price: 1599 }]
};

// Build the same HTML template used in production
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
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: right;">Rs. ${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 10px 12px; border: 1px solid #ddd; font-size: 13px; color: #333; text-align: right; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const adminNoteHtml = isAdmin ? `
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <p style="margin: 0; font-size: 14px; color: #856404; font-weight: bold;">🔔 New Order Received!</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #856404;">A verified payment has been received. The Tax Invoice is attached below.</p>
    </div>
  ` : `
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <p style="margin: 0; font-size: 14px; color: #166534; font-weight: bold;">✨ Order Confirmed &amp; Paid!</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #166534;">Hi ${order.customerInfo.firstName}, thank you for shopping at Fitz1. Your order is confirmed and is being prepared. Your Tax Invoice is attached below.</p>
    </div>
  `;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      ${adminNoteHtml}
      <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 0;">
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
        <div style="text-align: center; padding: 14px 0; border-bottom: 1px solid #eee;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #aaaaaa; letter-spacing: 1px;">Tax Invoice</h2>
        </div>
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
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
        <div style="padding: 0 30px 20px 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 55%; vertical-align: top;">
                <p style="font-size: 12px; font-weight: bold; color: #333; margin: 0 0 4px 0; text-transform: uppercase;">Invoice Amount In Words</p>
                <p style="font-size: 13px; color: #555; margin: 0; font-style: italic;">One Thousand Five Hundred and Ninety Nine Rupees only</p>
              </td>
              <td style="width: 45%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #333; border-bottom: 1px solid #eee;">Total</td>
                    <td style="padding: 6px 0; font-size: 14px; font-weight: 900; color: #111; text-align: right; border-bottom: 1px solid #eee;">Rs. ${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #555;">Received</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333; text-align: right;">Rs. ${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #555; border-top: 1px solid #eee;">Balance</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #16a34a; text-align: right; border-top: 1px solid #eee;">Rs. 0.00</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
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
      <div style="text-align: center; padding: 15px 0 5px 0;">
        <p style="font-size: 11px; color: #999; margin: 0;">For support, contact us at <a href="mailto:fitz1business@gmail.com" style="color: #2563eb; text-decoration: none;">fitz1business@gmail.com</a> or call 8072210156</p>
        <p style="font-size: 11px; color: #bbb; margin: 5px 0 0 0;">www.fitz1.in</p>
      </div>
    </div>
  `;
};

async function runTest() {
  try {
    const pdfBuffer = generateInvoicePdf(mockOrder);
    const attachments = [{
      filename: `Tax_Invoice_${mockOrder.orderId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }];

    const toEmail = process.argv[2] || 'kavinath50@gmail.com';
    const isAdmin = process.argv[3] === 'admin';
    const htmlContent = generateOrderEmailHtml(mockOrder, isAdmin);
    const subject = isAdmin
      ? `New Order Confirmed - Fitzone`
      : `Order Confirmation: ${mockOrder.orderId}`;

    const success = await sendEmail(subject, htmlContent, toEmail, 'Test User', 'TEST', attachments);

    if (success) {
      console.log(`✅ Test email successfully sent to ${toEmail}`);
    } else {
      console.log('❌ Test email failed to send. Check credentials in .env');
    }
  } catch (error) {
    console.error('Test script error:', error);
  }
}

runTest();
