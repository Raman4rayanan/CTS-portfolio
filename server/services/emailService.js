const path = require('path');
const fs = require('fs');

// We will use the Brevo REST API (port 443) instead of SMTP to bypass Railway's strict port blocking
const sendBrevoEmail = async (subject, htmlContent, toEmail, senderEmail, senderName = 'Concept Tools and Services', ccEmail = null) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.error('Missing BREVO_API_KEY in environment variables.');
    return false;
  }

  try {
    const payload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    };

    if (ccEmail) {
      payload.cc = [{ email: ccEmail }];
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
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

const sendQuoteEmail = async (adminEmail, customerEmail, quoteDetails, ccEmail = null) => {
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
          <p style="margin: 5px 0 0 0; text-align: center; font-size: 14px;">Reference: #${quoteDetails.referenceId || quoteDetails.quoteId}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; border-bottom: 2px solid #0ae7f0; padding-bottom: 5px; display: inline-block;">Customer Details</h3>
          <p><strong>Name:</strong> ${quoteDetails.customerDetails?.name || quoteDetails.customer?.name}</p>
          <p><strong>Email:</strong> ${quoteDetails.customerDetails?.email || quoteDetails.customer?.email}</p>
          <p><strong>Phone:</strong> ${quoteDetails.customerDetails?.phone || quoteDetails.customer?.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${quoteDetails.customerDetails?.company || quoteDetails.customer?.company || 'Not provided'}</p>
          ${(quoteDetails.customerDetails?.message || quoteDetails.customer?.message) ? `<p><strong>Message:</strong><br/> <span style="background-color: #f9fafb; padding: 10px; display: block; border-left: 3px solid #04667b; margin-top: 5px;">${quoteDetails.customerDetails?.message || quoteDetails.customer?.message}</span></p>` : ''}
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
    const subject = `New Quotation Request - ${quoteDetails.customerDetails?.name || quoteDetails.customer?.name} (#${quoteDetails.referenceId || quoteDetails.quoteId})`;

    // Send to admin (with optional CC)
    await sendBrevoEmail(subject, htmlContent, adminEmail, senderEmail, 'Concept Tools and Services', ccEmail);
    // Send confirmation to customer
    const confirmationSubject = `We've received your quotation request (#${quoteDetails.referenceId || quoteDetails.quoteId})`;
    await sendBrevoEmail(confirmationSubject, htmlContent, customerEmail, senderEmail);

    console.log(`Quote request ${quoteDetails.quoteId} sent via API`);
    return true;
  } catch (error) {
    console.error('Error sending Quote Email:', error);
    return false;
  }
};

const sendInquiryEmail = async (adminEmail, customerEmail, inquiryDetails, ccEmail = null) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #04667b; text-align: center;">Concept Tools and Services</h2>
        </div>
        
        <div style="background-color: #04667b; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="margin: 0; text-align: center;">New Contact Inquiry</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; border-bottom: 2px solid #0ae7f0; padding-bottom: 5px; display: inline-block;">Details</h3>
          <p><strong>Name:</strong> ${inquiryDetails.name}</p>
          <p><strong>Email:</strong> ${inquiryDetails.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${inquiryDetails.phone}</p>
          <p><strong>Message:</strong><br/> <span style="background-color: #f9fafb; padding: 10px; display: block; border-left: 3px solid #04667b; margin-top: 5px;">${inquiryDetails.message}</span></p>
        </div>
      </div>
    `;

    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sales@concepttools.net';
    const subject = `New Inquiry from ${inquiryDetails.name}`;

    // Send to admin (with optional CC)
    await sendBrevoEmail(subject, htmlContent, adminEmail, senderEmail, 'Concept Tools and Services', ccEmail);
    
    // Optionally, send confirmation to customer if they provided an email
    if (customerEmail) {
      const confirmationSubject = `We've received your inquiry`;
      await sendBrevoEmail(confirmationSubject, htmlContent, customerEmail, senderEmail);
    }

    console.log('Inquiry email sent via API');
    return true;
  } catch (error) {
    console.error('Error sending Inquiry Email:', error);
    return false;
  }
};

const sendNewsletterEmail = async (subject, htmlContent, bccEmails, bannerBase64, bannerName) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) return false;
  
  const senderEmail = process.env.SMTP_FROM_EMAIL || 'sales@concepttools.net';
  
  try {
    const bccList = bccEmails.map(email => ({ email }));
    // Prepare Corporate Email Wrapper
    const formattedHtmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #02050c; padding: 20px; text-align: center; border-bottom: 4px solid #2796a9;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Concept Tools & Services</h1>
        </div>
        
        <!-- Banner Image -->
        ${bannerBase64 ? `<div style="width: 100%;"><img src="cid:${bannerName}" alt="Newsletter Banner" style="width: 100%; display: block; border-bottom: 1px solid #eee;" /></div>` : ''}
        
        <!-- Body -->
        <div style="padding: 30px 20px; color: #333333; line-height: 1.6; font-size: 16px;">
          ${htmlContent}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f7fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="margin: 0; font-size: 12px; color: #777777;">&copy; ${new Date().getFullYear()} Concept Tools and Services. All rights reserved.</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #777777;">You are receiving this email because you are registered at CTS.</p>
        </div>
      </div>
    `;

    const payload = {
      sender: { name: 'Concept Tools and Services', email: senderEmail },
      to: [{ email: senderEmail }],
      bcc: bccList,
      subject: subject,
      htmlContent: formattedHtmlContent
    };

    if (bannerBase64 && bannerName) {
      payload.attachment = [{
        content: bannerBase64,
        name: bannerName
      }];
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    return response.ok;
  } catch (err) {
    console.error('Newsletter error:', err);
    return false;
  }
};

const sendFormalQuoteEmail = async (toEmail, order, message, includePricing = true) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) return false;
  
  const senderEmail = process.env.SMTP_FROM_EMAIL || 'sales@concepttools.net';
  
  let itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      ${includePricing ? `<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">₹${item.unitPrice || 0}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">₹${(item.quantity * (item.unitPrice || 0)).toFixed(2)}</td>` : ''}
    </tr>
  `).join('');
  
  const total = order.items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
  const taxAmount = (total * (order.taxRate || 0)) / 100;
  const grandTotal = total + (order.shippingCost || 0) + taxAmount;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #04667b;">Formal Quotation: #${order.referenceId}</h2>
      <p>Dear ${order.customerDetails.name},</p>
      <p>Thank you for requesting a quote from CTS. Please find our pricing below:</p>
      <div style="background-color: #f5f7fa; padding: 15px; margin: 20px 0; border-left: 4px solid #04667b;">
        <p>${message ? message.replace(/\\n/g, '<br/>') : ''}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #04667b; color: white;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: center;">Unit Price</th>
            <th style="padding: 10px; text-align: center;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Grand Total:</td>
            <td style="text-align: center; padding: 10px; font-weight: bold;">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p>Please reply to this email to proceed with your order.</p>
      <p>Best regards,<br/>The CTS Sales Team</p>
    </div>
  `;
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'CTS Sales', email: senderEmail },
        to: [{ email: toEmail }],
        subject: `Your Quotation from CTS (#${order.referenceId})`,
        htmlContent: htmlContent
      })
    });
    return response.ok;
  } catch (err) {
    console.error('Quote email error:', err);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendQuoteEmail,
  sendInquiryEmail,
  sendNewsletterEmail,
  sendFormalQuoteEmail
};
