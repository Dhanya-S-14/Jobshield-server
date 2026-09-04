const axios = require('axios');

const sendEmail = async (options) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn('BREVO_API_KEY not set - using console fallback');
      console.log('[EMAIL WOULD SEND]:', options.subject, '->', options.email);
      return { success: true, fallback: true };
    }

    const payload = {
      sender: { email: process.env.FROM_EMAIL || 'noreply@jobshield.com', name: process.env.FROM_NAME || 'JobShield' },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.html || options.message
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    console.error('Email send error:', error.response?.data?.message || error.message);
    throw error;
  }
};

module.exports = sendEmail;
