const express = require('express');
const router = express.Router();
const { 
  login, 
  logout, 
  getMe, 
  getInquiries, 
  updateInquiryStatus, 
  deleteInquiry, 
  getCrossDatabaseStats,
  getCustomers,
  deleteCustomer
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

// Inquiry management
router.route('/inquiries')
  .get(protectAdmin, getInquiries);

router.route('/inquiries/:id')
  .put(protectAdmin, updateInquiryStatus)
  .delete(protectAdmin, deleteInquiry);

// Statistics
router.get('/stats', protectAdmin, getCrossDatabaseStats);

module.exports = router;
