const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

/**
 * Singleton transporter — created once and reused across all email sends.
 * Avoids the overhead of creating a new SMTP connection on every call (critical in production).
 */
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  _transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false // Required for many cloud hosts (Render, Railway, etc.)
    },
    connectionTimeout: 15000,  // 15s to establish TCP connection
    greetingTimeout: 15000,    // 15s for SMTP greeting
    socketTimeout: 45000,      // 45s for idle socket (large for PDF attachments)
  });

  console.log(`📧 [EMAIL] Transporter initialized: ${smtpHost}:${smtpPort}`);
  return _transporter;
};

/**
 * Sends an email using Nodemailer with a persistent SMTP connection.
 *
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Rich HTML body content
 * @param {string} toEmail - Recipient email address
 * @param {string} toName - Recipient name
 * @param {string} logPrefix - Log prefix for debugging
 * @param {Array} attachments - Optional mail attachments array
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
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(`⚠️ [${logPrefix}] SMTP credentials not found in environment. Skipping email.`);
    return false;
  }

  try {
    const transporter = getTransporter();

    // Build final attachments array — add logo/signature if they exist on disk
    const finalAttachments = [...attachments];

    const logoPath = path.join(__dirname, '../assets/fitz1.png');
    if (fs.existsSync(logoPath) && !finalAttachments.some(a => a.cid === 'fitz1logo')) {
      finalAttachments.push({
        filename: 'fitz1.png',
        path: logoPath,
        cid: 'fitz1logo'
      });
    }

    const signPath = path.join(__dirname, '../assets/sign.png');
    if (fs.existsSync(signPath) && !finalAttachments.some(a => a.cid === 'fitz1sign')) {
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

    console.log(`🔄 [${logPrefix}] Sending email to ${toEmail} via ${process.env.SMTP_HOST || 'smtp-relay.brevo.com'}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [${logPrefix}] Email delivered! MessageId: ${info.messageId} | Response: ${info.response}`);
    return true;
  } catch (error) {
    // Log the FULL error — not just .message — so we can see SMTP error codes in production
    console.error(`❌ [${logPrefix}] SMTP Error sending to ${toEmail}:`);
    console.error(`   Code: ${error.code || 'N/A'} | ResponseCode: ${error.responseCode || 'N/A'}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Command: ${error.command || 'N/A'}`);

    // Reset the singleton transporter on auth/connection errors so it re-initializes next time
    if (
      error.code === 'ECONNECTION' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.responseCode === 535 || // Auth failed
      error.responseCode === 421    // Service unavailable
    ) {
      console.warn(`⚠️ [${logPrefix}] Resetting SMTP transporter due to connection/auth error.`);
      _transporter = null;
    }

    return false;
  }
};

module.exports = { sendEmail };
