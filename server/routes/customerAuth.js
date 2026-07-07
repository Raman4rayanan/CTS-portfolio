const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Customer = require('../models/ecomm/Customer');
const CustomerSession = require('../models/ecomm/CustomerSession');

// Customer Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, companyName, phone } = req.body;
    
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: 'Email, username, and password are required.' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
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

module.exports = router;
