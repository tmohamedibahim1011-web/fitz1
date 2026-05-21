const path = require('path');
const fs = require('fs');

/**
 * Sends an email using Brevo's HTTP API (bypasses all SMTP ESOCKET/ETIMEDOUT issues).
 *
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Rich HTML body content
 * @param {string} toEmail - Recipient email address
 * @param {string} toName - Recipient name
 * @param {string} logPrefix - Log prefix for debugging
 * @param {Array} attachments - Optional mail attachments array (Nodemailer style)
 * @returns {Promise<boolean>} - Whether email sent successfully
 */
const sendEmail = async (
  subject,
  htmlContent,
  toEmail = 'kavinath50@gmail.com',
  toName = 'Admin',
  logPrefix = 'EMAIL',
  attachments = []
) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn(`⚠️ [${logPrefix}] BREVO_API_KEY not found in environment. Skipping email.`);
    return false;
  }

  try {
    // Build final attachments array for Brevo API
    const brevoAttachments = [];

    // 1. Process dynamic attachments (like Invoice PDF buffer)
    for (const att of attachments) {
      if (att.content && Buffer.isBuffer(att.content)) {
        brevoAttachments.push({
          name: att.filename,
          content: att.content.toString('base64')
        });
      }
    }

    // 2. Add static logo (if it exists)
    const logoPath = path.join(__dirname, '../assets/fitz1.png');
    if (fs.existsSync(logoPath)) {
      brevoAttachments.push({
        name: 'fitz1.png',
        content: fs.readFileSync(logoPath).toString('base64')
      });
      // Replace CID in HTML with Brevo attachment reference (or fallback to base64 if needed)
      // Actually, for Brevo API, standard attachment works for cid if name matches, or we just embed it
      htmlContent = htmlContent.replace('cid:fitz1logo', `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`);
    }

    // 3. Add static signature (if it exists)
    const signPath = path.join(__dirname, '../assets/sign.png');
    if (fs.existsSync(signPath)) {
      brevoAttachments.push({
        name: 'sign.png',
        content: fs.readFileSync(signPath).toString('base64')
      });
      htmlContent = htmlContent.replace('cid:fitz1sign', `data:image/png;base64,${fs.readFileSync(signPath).toString('base64')}`);
    }

    const payload = {
      sender: { name: 'Fitz1', email: 'fitz1business@gmail.com' },
      to: [{ email: toEmail, name: toName }],
      replyTo: { email: 'fitz1business@gmail.com', name: 'Fitz1 Support' },
      subject: subject,
      htmlContent: htmlContent
    };

    if (brevoAttachments.length > 0) {
      // Only include actual file attachments (like PDFs) in the attachment array
      // Since we embedded the logo/sign as base64 in HTML, we only need the PDF here.
      payload.attachment = brevoAttachments.filter(a => a.name.endsWith('.pdf'));
    }

    console.log(`🔄 [${logPrefix}] Sending email to ${toEmail} via Brevo HTTP API...`);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log(`✅ [${logPrefix}] Email delivered! MessageId: ${data.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ [${logPrefix}] HTTP API Error sending to ${toEmail}:`);
    console.error(`   Message: ${error.message}`);
    return false;
  }
};

module.exports = { sendEmail };
