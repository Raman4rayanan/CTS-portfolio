const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // Brevo uses 587 with STARTTLS (secure: false enables STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Force IPv4 to prevent 'ETIMEDOUT' on Render server connecting via IPv6
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendOtpEmail = async (toEmail, otpCode, username, context = 'signup') => {
  try {
    const transporter = createTransporter();
    const actionText = context === 'reset' ? 'password reset process' : 'sign-up process';
    
    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const mailOptions = {
      from: `"Concept Tools and Services" <${senderEmail}>`,
      to: toEmail,
      subject: 'Your CTS Authentication Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:ctslogo" alt="Concept Tools and Services" style="max-height: 60px; width: auto;" />
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
      `
    };

    const logoPath = path.join(__dirname, '../../public/admin/logo.png');
    if (fs.existsSync(logoPath)) {
      mailOptions.attachments = [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'ctslogo'
        }
      ];
    } else {
      // Fallback if public logo is missing on the serverless deployment
      mailOptions.html = mailOptions.html.replace(
        '<img src="cid:ctslogo" alt="Concept Tools and Services" style="max-height: 60px; width: auto;" />',
        '<h2 style="color: #04667b; text-align: center;">Concept Tools and Services</h2>'
      );
    }

    await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP Email:', error);
    return false;
  }
};

const sendQuoteEmail = async (adminEmail, customerEmail, quoteDetails) => {
  try {
    const transporter = createTransporter();
    
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
          <img src="cid:ctslogo" alt="Concept Tools and Services" style="max-height: 80px; width: auto;" />
        </div>
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

    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const logoPath = path.join(__dirname, '../../public/admin/logo.png');
    const mailOptionsAdmin = {
      from: `"CTS Procurement" <${senderEmail}>`,
      to: adminEmail,
      subject: `New Quote Request - ${quoteDetails.referenceId}`,
      html: htmlContent
    };

    const mailOptionsCustomer = {
      from: `"CTS Procurement" <${senderEmail}>`,
      to: customerEmail,
      subject: `Quotation Request Received - ${quoteDetails.referenceId}`,
      html: htmlContent
    };

    if (fs.existsSync(logoPath)) {
      const attachments = [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'ctslogo'
        }
      ];
      mailOptionsAdmin.attachments = attachments;
      mailOptionsCustomer.attachments = attachments;
    } else {
      const fallbackLogo = '<h2 style="color: #04667b; text-align: center;">Concept Tools and Services</h2>';
      mailOptionsAdmin.html = mailOptionsAdmin.html.replace(
        '<img src="cid:ctslogo" alt="Concept Tools and Services" style="max-height: 80px; width: auto;" />',
        fallbackLogo
      );
      mailOptionsCustomer.html = mailOptionsCustomer.html.replace(
        '<img src="cid:ctslogo" alt="Concept Tools and Services" style="max-height: 80px; width: auto;" />',
        fallbackLogo
      );
    }

    // Send to Admin
    await transporter.sendMail(mailOptionsAdmin);

    // Send to Customer
    await transporter.sendMail(mailOptionsCustomer);

    console.log(`Quote Emails sent to Admin and ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending Quote Emails:', error);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendQuoteEmail
};
