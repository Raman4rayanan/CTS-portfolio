const mongoose = require('mongoose');
const { portfolioDb } = require('../../config/db');

const PortfolioConfigSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    default: 'Precision & Reliability'
  },
  heroSubtitle: {
    type: String,
    default: 'Supporting industries with reliable tools, technical solutions, and responsive service tailored to real-world operational challenges.'
  },
  aboutText: {
    type: String,
    default: 'From industrial tools and MRO solutions to customized technical support, we help organizations maintain safe, efficient, and productive operations.'
  },
  aboutHeaderLight: {
    type: String,
    default: 'Powering Industries with'
  },
  aboutHeaderBold: {
    type: String,
    default: 'Precision & Reliability'
  },
  partnersBgColor1: {
    type: String,
    default: '#112A4F'
  },
  partnersBgColor2: {
    type: String,
    default: '#040C19'
  },
  partnersBgColor3: {
    type: String,
    default: '#02060C'
  },
  journey: [{
    year: { type: String, required: true },
    event: { type: String, required: true }
  }],
  reasons: [{
    title: { type: String, required: true },
    icon: { type: String, required: true },
    desc: { type: String, required: true }
  }],
  partners: [{
    name: { type: String, required: true },
    src: { type: String, required: true },
    scale: { type: Number, default: 1 }
  }],
  customers: [{
    name: { type: String, required: true },
    src: { type: String, required: true },
    scale: { type: Number, default: 1 }
  }]
}, { timestamps: true });

// Bind to portfolioDb connection
const PortfolioConfig = portfolioDb.model('PortfolioConfig', PortfolioConfigSchema, 'portfolio_configs');

module.exports = PortfolioConfig;
