require('dotenv').config();

const sendTest = async () => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  console.log('Key exists:', !!brevoApiKey);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Concept Tools and Services', email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sales@concepttools.net' },
        to: [{ email: 'ramanarayanan.gs@gmail.com' }],
        subject: 'Test API',
        htmlContent: '<p>Test</p>'
      })
    });

    const data = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Network Error:', err);
  }
};

sendTest();
