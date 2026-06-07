const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getServices,
  createService,
  updateService,
  deleteService,
  createInquiry,
  getPortfolioConfig,
  updatePortfolioConfig
} = require('../controllers/portfolioController');
const { protectAdmin } = require('../middleware/auth');

// Configuration Endpoints
router.route('/config')
  .get(getPortfolioConfig)
  .put(protectAdmin, updatePortfolioConfig);

// Activities Endpoints
router.route('/activities')
  .get(getActivities)
  .post(protectAdmin, createActivity);

router.route('/activities/:id')
  .put(protectAdmin, updateActivity)
  .delete(protectAdmin, deleteActivity);

// Product Services Endpoints
router.route('/services')
  .get(getServices)
  .post(protectAdmin, createService);

router.route('/services/:id')
  .put(protectAdmin, updateService)
  .delete(protectAdmin, deleteService);

// Inquiry Endpoint (Public submission)
router.post('/inquiries', createInquiry);

module.exports = router;
