const mongoose = require('mongoose');
const { ecommDb } = require('../../config/db');

const ConfigSchema = new mongoose.Schema({
  showBrandSpotlight: {
    type: Boolean,
    default: true
  },
  brandSpotlightTag: {
    type: String,
    default: 'Partners'
  },
  brandSpotlightTitle: {
    type: String,
    default: 'Brand Spotlight'
  },
  showNewlyAdded: {
    type: Boolean,
    default: true
  },
  newlyAddedTag: {
    type: String,
    default: 'Latest Arrivals'
  },
  newlyAddedTitle: {
    type: String,
    default: 'Newly Added Products'
  },
  newlyAddedSubtitle: {
    type: String,
    default: 'Explore the latest cutting-edge industrial equipment and tools recently added to our catalog.'
  },
  newlyAddedLimit: {
    type: Number,
    default: 8
  },
  newlyAddedProductIDs: {
    type: [String],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Bind specifically to ecommDb
const Config = ecommDb.model('Config', ConfigSchema, 'ecomm_config');

module.exports = Config;
