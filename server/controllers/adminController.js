const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Import models from all three segregated databases to show cross-database accessibility for the Admin panel
const Inquiry = require('../models/portfolio/Inquiry');
const Activity = require('../models/portfolio/Activity');
const ProductService = require('../models/portfolio/ProductService');
const { sendNewsletterEmail, sendFormalQuoteEmail } = require('../services/emailService');

const Category = require('../models/ecomm/Category');
const Product = require('../models/ecomm/Product');
const Company = require('../models/ecomm/Company');
const Brand = require('../models/ecomm/Brand');
const Order = require('../models/ecomm/Order');
const Customer = require('../models/ecomm/Customer');
const CustomerSession = require('../models/ecomm/CustomerSession');

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
    const brandCount = await Brand.countDocuments();
    const orderCount = await Order.countDocuments();

    // 3. Fetch count/metrics from cts_admin
    const userCount = await User.countDocuments();
    const metrics = await DashboardMetric.find();

    // Calculate top products
    const allOrders = await Order.find();
    const productCounts = {};
    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.product_name]) {
          productCounts[item.product_name] = 0;
        }
        productCounts[item.product_name] += item.quantity;
      });
    });
    
    const topProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate activity trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });
    const recentInquiries = await Inquiry.find({ createdAt: { $gte: thirtyDaysAgo } });
    
    const trendsByDate = {};
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
    };
    
    // Initialize 30 days
    for(let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendsByDate[formatDate(d)] = { date: formatDate(d).substring(5), orders: 0, inquiries: 0 };
    }
    
    recentOrders.forEach(o => {
      const d = formatDate(o.createdAt || o.date);
      if (trendsByDate[d]) trendsByDate[d].orders++;
    });
    recentInquiries.forEach(i => {
      const d = formatDate(i.createdAt);
      if (trendsByDate[d]) trendsByDate[d].inquiries++;
    });
    
    const activityTrends = Object.values(trendsByDate);

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
          companies: companyCount,
          brands: brandCount,
          orders: orderCount
        },
        admin: {
          users: userCount,
          metrics: metrics
        },
        trends: {
          topProducts,
          activityTrends
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Customer Management
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    
    if (!deletedCustomer) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }
    
    await CustomerSession.deleteMany({ user: customerId });
    
    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerHistory = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ 'customerDetails.email': email }).sort({ createdAt: -1 });
    const inquiries = await Inquiry.find({ email }).sort({ createdAt: -1 });
    res.json({ success: true, data: { orders, inquiries } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, htmlContent, bannerBase64, bannerName } = req.body;
    if (!subject || !htmlContent) {
      return res.status(400).json({ success: false, error: 'Subject and content are required' });
    }
    const customers = await Customer.find({ newsletterOptIn: true }).select('email');
    const emails = customers.map(c => c.email);
    
    if (emails.length === 0) {
      return res.status(400).json({ success: false, error: 'No registered customers found.' });
    }
    
    const success = await sendNewsletterEmail(subject, htmlContent, emails, bannerBase64, bannerName);
    if (success) {
      res.json({ success: true, message: `Newsletter sent to ${emails.length} customers.` });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send newsletter.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.replyToOrder = async (req, res) => {
  try {
    const { items, message, includePricing } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    
    order.items = items;
    order.adminComments = message;
    order.status = 'Approved';
    await order.save();
    
    await sendFormalQuoteEmail(order.customerDetails.email, order, message, includePricing);
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
