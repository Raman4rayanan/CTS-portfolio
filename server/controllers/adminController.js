const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Import models from all three segregated databases to show cross-database accessibility for the Admin panel
const Inquiry = require('../models/portfolio/Inquiry');
const Activity = require('../models/portfolio/Activity');
const ProductService = require('../models/portfolio/ProductService');

const Category = require('../models/ecomm/Category');
const Product = require('../models/ecomm/Product');
const Company = require('../models/ecomm/Company');

const User = require('../models/admin/User');
const Role = require('../models/admin/Role');
const Session = require('../models/admin/Session');
const DashboardMetric = require('../models/admin/DashboardMetric');

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const roleName = user.role ? user.role.name : 'User';

    // Clear old sessions
    await Session.deleteMany({ user: user._id });

    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await Session.create({
      user: user._id,
      token,
      expiresAt
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: roleName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin Logout
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await Session.deleteOne({ token });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Current User (Me)
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// Get All Inquiries
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Inquiry Status (Mark as Read/Unread)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    }

    inquiry.read = !!read;
    await inquiry.save();

    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    }

    await Inquiry.findByIdAndDelete(id);
    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get overall stats across all 3 databases
exports.getCrossDatabaseStats = async (req, res) => {
  try {
    // 1. Fetch count from cts_portfolio
    const inquiryCount = await Inquiry.countDocuments();
    const unreadInquiryCount = await Inquiry.countDocuments({ read: false });
    const readInquiryCount = await Inquiry.countDocuments({ read: true });
    
    const activityCount = await Activity.countDocuments();
    const serviceCount = await ProductService.countDocuments();

    // 2. Fetch count from cts_ecomm (Structure only)
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const companyCount = await Company.countDocuments();

    // 3. Fetch count/metrics from cts_admin
    const userCount = await User.countDocuments();
    const metrics = await DashboardMetric.find();

    res.json({
      success: true,
      data: {
        portfolio: {
          inquiries: inquiryCount,
          unreadInquiries: unreadInquiryCount,
          readInquiries: readInquiryCount,
          activities: activityCount,
          services: serviceCount
        },
        ecommerce: {
          categories: categoryCount,
          products: productCount,
          companies: companyCount
        },
        admin: {
          users: userCount,
          metrics: metrics
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
