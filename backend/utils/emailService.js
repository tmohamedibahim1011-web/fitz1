const sendEmail = async (subject, htmlContent) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.warn('⚠️ Brevo API key not found. Skipping email.');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: { name: 'Fitzone', email: 'no-reply@fitzone.in' },
        to: [{ email: 'kavinath50@gmail.com', name: 'Admin' }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (response.ok) {
      console.log('✅ Order confirmation email sent to kavinath50@gmail.com');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send email via Brevo:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending email via Brevo:', error.message);
    return false;
  }
};

module.exports = { sendEmail };
