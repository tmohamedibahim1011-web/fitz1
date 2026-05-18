const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer and Brevo SMTP Relay
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - Rich HTML body content
 * @param {string} toEmail - Recipient email address
 * @param {string} toName - Recipient name
 * @returns {Promise<boolean>} - Whether email sent successfully
 */
const sendEmail = async (subject, htmlContent, toEmail = 'kavinath50@gmail.com', toName = 'Admin') => {
  const smtpHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP credentials not found. Skipping email.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false, // false for 587 (uses STARTTLS), true for 465
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Fitzone" <kavinath50@gmail.com>`,
      to: `"${toName}" <${toEmail}>`,
      subject: subject,
      html: htmlContent
    };

    console.log(`🔄 Sending email to ${toEmail} via Brevo SMTP Relay...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email via SMTP:', error.message);
    return false;
  }
};

module.exports = { sendEmail };
