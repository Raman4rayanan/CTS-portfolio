const path = require('path');
const fs = require('fs');

// Helper to send emails via Brevo API
const sendViaBrevo = async (toEmail, subject, htmlContent) => {
  if (!process.env.BREVO_API_KEY) {
    console.error('Missing BREVO_API_KEY in environment variables.');
    return false;
  }

  const payload = {
    sender: { 
      name: 'Concept Tools and Services', 
      email: process.env.SMTP_USER || 'adminconcepttoolsandservice@gmail.com' 
    },
    to: [{ email: toEmail }],
    subject: subject,
    htmlContent: htmlContent
  };

  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 8000;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`Email sent successfully to ${toEmail}`);
        return true;
      } else {
        const errorData = await response.json();
        console.error(`Brevo API Error sending to ${toEmail} (Attempt ${attempt}):`, JSON.stringify(errorData));
        if (attempt > MAX_RETRIES) return false;
      }
    } catch (error) {
      console.error(`Network/Timeout error sending to ${toEmail} (Attempt ${attempt}):`, error.message);
      if (attempt > MAX_RETRIES) return false;
    }
    
    // Wait slightly before retrying (exponential backoff)
    if (attempt <= MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
};

const sendOtpEmail = async (toEmail, otpCode, username, context = 'signup') => {
  try {
    const actionText = context === 'reset' ? 'password reset process' : 'sign-up process';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #04667b; text-align: center;">Concept Tools and Services</h2>
        <p style="font-size: 16px; color: #333;">Hello ${username || 'there'},</p>
        <p style="font-size: 16px; color: #333;">Please use the following 4-digit verification code to complete your ${actionText}:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f5f7fa; color: #04667b; border-radius: 8px; border: 1px solid #d1d5db;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this email, please safely ignore it.</p>
      </div>
    `;

    return await sendViaBrevo(toEmail, 'Your CTS Authentication Code', htmlContent);
  } catch (error) {
    console.error('Error constructing OTP Email:', error);
    return false;
  }
};

const sendQuoteEmail = async (adminEmail, customerEmail, quoteDetails) => {
  try {
    let itemsHtml = quoteDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.sku || 'N/A'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #04667b; border-bottom: 2px solid #04667b; padding-bottom: 10px;">Quotation Request: ${quoteDetails.referenceId}</h2>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Customer Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${quoteDetails.customerDetails.name}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${quoteDetails.customerDetails.company}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${quoteDetails.customerDetails.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${quoteDetails.customerDetails.phone}</p>
          ${quoteDetails.customerDetails.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${quoteDetails.customerDetails.notes}</p>` : ''}
        </div>

        <h3 style="color: #333;">Requested Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #04667b; color: white;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">SKU/Model</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="font-size: 14px; color: #555;">Our team will review this request and provide a formal quotation shortly.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Concept Tools and Services (CTS)</p>
      </div>
    `;

    // Send to Admin
    const adminSent = await sendViaBrevo(adminEmail, `New Quote Request - ${quoteDetails.referenceId}`, htmlContent);
    // Send to Customer
    const customerSent = await sendViaBrevo(customerEmail, `Quotation Request Received - ${quoteDetails.referenceId}`, htmlContent);

    return adminSent && customerSent;
  } catch (error) {
    console.error('Error constructing Quote Emails:', error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendQuoteEmail
};
