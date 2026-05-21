const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Sends an email using Nodemailer and Brevo SMTP Relay.
 * Uses the Brevo SMTP login address as the "from" address to pass
 * Gmail's strict DMARC policy.
 * 
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Rich HTML body content
 * @param {string} toEmail - Recipient email address
 * @param {string} toName - Recipient name
 * @param {string} logPrefix - Log prefix for debugging
 * @param {Array} attachments - Optional mail attachments array
 * @returns {Promise<boolean>} - Whether email sent successfully
 */
const sendEmail = async (subject, htmlContent, toEmail = 'kavinath50@gmail.com', toName = 'Admin', logPrefix = 'EMAIL', attachments = []) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(`⚠️ [${logPrefix}] SMTP credentials not found. Skipping email.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Default logo attachment if it exists
    const finalAttachments = [...attachments];
    const logoPath = path.join(__dirname, '../assets/fitz1.png');
    if (fs.existsSync(logoPath) && !attachments.some(att => att.cid === 'fitz1logo')) {
      finalAttachments.push({
        filename: 'fitz1.png',
        path: logoPath,
        cid: 'fitz1logo'
      });
    }

    // Signature attachment
    const signPath = path.join(__dirname, '../assets/sign.png');
    if (fs.existsSync(signPath) && !attachments.some(att => att.cid === 'fitz1sign')) {
      finalAttachments.push({
        filename: 'sign.png',
        path: signPath,
        cid: 'fitz1sign'
      });
    }

    const mailOptions = {
      from: `"Fitz1" <${smtpUser}>`,
      replyTo: `"Fitz1" <fitz1business@gmail.com>`,
      to: `"${toName}" <${toEmail}>`,
      subject: subject,
      html: htmlContent,
      attachments: finalAttachments
    };

    console.log(`🔄 [${logPrefix}] Sending email to ${toEmail} via Brevo SMTP Relay...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [${logPrefix}] Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ [${logPrefix}] Error sending email via SMTP:`, error.message);
    return false;
  }
};

module.exports = { sendEmail };
