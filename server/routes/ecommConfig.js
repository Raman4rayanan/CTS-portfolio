const express = require('express');
const router = express.Router();
const Config = require('../models/ecomm/Config');
const { protectAdmin } = require('../middleware/auth');

// Get E-commerce Config
router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update E-commerce Config (Admin Only)
router.put('/', protectAdmin, async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = new Config({});
    }
    
    if (req.body.showBrandSpotlight !== undefined) config.showBrandSpotlight = req.body.showBrandSpotlight;
    if (req.body.brandSpotlightTag !== undefined) config.brandSpotlightTag = req.body.brandSpotlightTag;
    if (req.body.brandSpotlightTitle !== undefined) config.brandSpotlightTitle = req.body.brandSpotlightTitle;
    
    if (req.body.showNewlyAdded !== undefined) config.showNewlyAdded = req.body.showNewlyAdded;
    if (req.body.newlyAddedTag !== undefined) config.newlyAddedTag = req.body.newlyAddedTag;
    if (req.body.newlyAddedTitle !== undefined) config.newlyAddedTitle = req.body.newlyAddedTitle;
    if (req.body.newlyAddedSubtitle !== undefined) config.newlyAddedSubtitle = req.body.newlyAddedSubtitle;
    if (req.body.newlyAddedLimit !== undefined) config.newlyAddedLimit = Number(req.body.newlyAddedLimit);
    
    config.updatedAt = Date.now();
    await config.save();
    
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
