const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Customer = require('../models/ecomm/Customer');
const CustomerSession = require('../models/ecomm/CustomerSession');
const Otp = require('../models/ecomm/Otp');
const { sendOtpEmail } = require('../services/emailService');

// Generate and send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, error: 'Email already registered. Try signing in.' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete any existing OTPs for this email to prevent spam/confusion
    await Otp.deleteMany({ email });

    const newOtp = new Otp({ email, otp: otpCode });
    await newOtp.save();

    const emailSent = await sendOtpEmail(email, otpCode, username);
    if (emailSent) {
      res.json({ success: true, message: 'OTP sent successfully.' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send OTP email. Please check your SMTP configuration.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, companyName, phone, otp } = req.body;
    
    if (!email || !password || !username || !otp) {
      return res.status(400).json({ success: false, error: 'Email, username, password, and OTP are required.' });
    }

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP.' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Delete used OTP
    await Otp.deleteMany({ email });

    const customer = new Customer({
      email,
      password: hashedPassword,
      username,
      companyName,
      phone
    });

    await customer.save();

    // Create session automatically after register
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await CustomerSession.create({
      customer: customer._id,
      token,
      expiresAt
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: customer._id,
        email: customer.email,
        username: customer.username,
        companyName: customer.companyName,
        phone: customer.phone,
        role: customer.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ success: false, error: 'Email not registered. Try signing up.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    // Clear old sessions
    await CustomerSession.deleteMany({ customer: customer._id });

    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await CustomerSession.create({
      customer: customer._id,
      token,
      expiresAt
    });

    res.json({
      success: true,
      token,
      user: {
        _id: customer._id,
        email: customer.email,
        username: customer.username,
        companyName: customer.companyName,
        phone: customer.phone,
        role: customer.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    
    await CustomerSession.deleteOne({ token });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

    const existingCustomer = await Customer.findOne({ email });
    if (!existingCustomer) {
      return res.status(400).json({ success: false, error: 'No account found with this email.' });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.deleteMany({ email });
    await new Otp({ email, otp: otpCode }).save();

    const emailSent = await sendOtpEmail(email, otpCode, existingCustomer.username, 'reset');
    if (emailSent) {
      res.json({ success: true, message: 'Password reset OTP sent.' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send OTP email.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset Password - Verify OTP and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required.' });
    }

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP.' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ success: false, error: 'No account found with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    customer.password = hashedPassword;
    await customer.save();

    await Otp.deleteMany({ email });

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
