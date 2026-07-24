const express = require('express');
const router = express.Router();
const { 
  login, 
  logout, 
  getMe, 
  getInquiries, 
  updateInquiryStatus, 
  deleteInquiry, 
  replyToInquiry,
  getCrossDatabaseStats,
  getCustomers,
  deleteCustomer,
  getCustomerHistory,
  sendNewsletter,
  updateOrderStatus,
  replyToOrder
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');

// Public login endpoint
router.post('/login', login);

// Protected endpoints
router.post('/logout', protectAdmin, logout);
router.get('/me', protectAdmin, getMe);

// Customer Management
router.get('/customers', protectAdmin, getCustomers);
router.delete('/customers/:id', protectAdmin, deleteCustomer);
router.get('/customers/:email/history', protectAdmin, getCustomerHistory);
router.post('/newsletter', protectAdmin, sendNewsletter);

// Inquiry management
router.route('/inquiries')
  .get(protectAdmin, getInquiries);

router.route('/inquiries/:id')
  .put(protectAdmin, updateInquiryStatus)
  .delete(protectAdmin, deleteInquiry);

router.post('/inquiries/:id/reply', protectAdmin, replyToInquiry);

// Statistics
router.get('/stats', protectAdmin, getCrossDatabaseStats);

// Orders / Quotes
router.patch('/orders/:id/status', protectAdmin, updateOrderStatus);
router.post('/orders/:id/reply', protectAdmin, replyToOrder);

module.exports = router;
