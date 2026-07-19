const path = require('path');
const fs = require('fs');

// We will use the Brevo REST API (port 443) instead of SMTP to bypass Railway's strict port blocking
const sendBrevoEmail = async (subject, htmlContent, toEmail, senderEmail, senderName = 'Concept Tools and Services') => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.error('Missing BREVO_API_KEY in environment variables.');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API Error:', errorData);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Network Error calling Brevo API:', err);
    return false;
  }
};

const sendOtpEmail = async (toEmail, otpCode, username, context = 'signup') => {
  try {
    const actionText = context === 'reset' ? 'password reset process' : 'sign-up process';
    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sales@concepttools.net';
    
    const subject = 'Your CTS Authentication Code';
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #04667b; text-align: center;">Concept Tools and Services</h2>
        </div>
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

    const success = await sendBrevoEmail(subject, htmlContent, toEmail, senderEmail);
    if (success) console.log(`OTP Email sent to ${toEmail} via API`);
    return success;
  } catch (error) {
    console.error('Error sending OTP Email:', error);
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
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #04667b; text-align: center;">Concept Tools and Services</h2>
        </div>
        
        <div style="background-color: #04667b; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="margin: 0; text-align: center;">New Quotation Request</h2>
          <p style="margin: 5px 0 0 0; text-align: center; font-size: 14px;">Reference: #${quoteDetails.quoteId}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; border-bottom: 2px solid #0ae7f0; padding-bottom: 5px; display: inline-block;">Customer Details</h3>
          <p><strong>Name:</strong> ${quoteDetails.customer.name}</p>
          <p><strong>Email:</strong> ${quoteDetails.customer.email}</p>
          <p><strong>Phone:</strong> ${quoteDetails.customer.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${quoteDetails.customer.company || 'Not provided'}</p>
          ${quoteDetails.customer.message ? `<p><strong>Message:</strong><br/> <span style="background-color: #f9fafb; padding: 10px; display: block; border-left: 3px solid #04667b; margin-top: 5px;">${quoteDetails.customer.message}</span></p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; border-bottom: 2px solid #0ae7f0; padding-bottom: 5px; display: inline-block;">Requested Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f5f7fa; text-align: left;">
                <th style="padding: 12px 10px; border-bottom: 2px solid #e0e0e0;">Product</th>
                <th style="padding: 12px 10px; border-bottom: 2px solid #e0e0e0;">SKU</th>
                <th style="padding: 12px 10px; border-bottom: 2px solid #e0e0e0; text-align: center;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <p style="text-align: center; color: #666; font-size: 14px; margin-top: 40px;">
          This quotation request was generated from the CTS Website.<br/>
          Please reply directly to the customer at <a href="mailto:${customerEmail}">${customerEmail}</a>.
        </p>
      </div>
    `;

    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sales@concepttools.net';
    const subject = `New Quotation Request - ${quoteDetails.customer.name} (#${quoteDetails.quoteId})`;

    // Send to admin
    await sendBrevoEmail(subject, htmlContent, adminEmail, senderEmail);
    // Send confirmation to customer
    const confirmationSubject = `We've received your quotation request (#${quoteDetails.quoteId})`;
    await sendBrevoEmail(confirmationSubject, htmlContent, customerEmail, senderEmail);

    console.log(`Quote request ${quoteDetails.quoteId} sent via API`);
    return true;
  } catch (error) {
    console.error('Error sending Quote Email:', error);
    return false;
  }
};

const sendInquiryEmail = async (adminEmail, inquiryData) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #04667b; text-align: center;">New General Inquiry</h2>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Message:</strong><br/>
        <div style="background-color: #f5f7fa; padding: 15px; border-left: 4px solid #04667b; margin-top: 10px;">
          ${inquiryData.message.replace(/\n/g, '<br/>')}
        </div>
        </p>
      </div>
    `;

    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sales@concepttools.net';
    const subject = `New Inquiry from ${inquiryData.name}`;

    const success = await sendBrevoEmail(subject, htmlContent, adminEmail, senderEmail);
    if (success) console.log(`Inquiry email sent via API`);
    return success;
  } catch (error) {
    console.error('Error sending Inquiry Email:', error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendQuoteEmail,
  sendInquiryEmail
};
