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
  }],
  cloudinaryCloudName: {
    type: String,
    default: ''
  },
  cloudinaryUploadPreset: {
    type: String,
    default: ''
  },
  metaTitle: {
    type: String,
    default: 'Concept Tools and Service | Industrial Supply & MRO'
  },
  metaDescription: {
    type: String,
    default: 'Providing reliable industrial tools, technical solutions, and responsive service for your operational challenges.'
  },
  metaImage: {
    type: String,
    default: ''
  },
  googleSiteVerification: {
    type: String,
    default: ''
  },
  bingSiteVerification: {
    type: String,
    default: ''
  },
  ga4Id: {
    type: String,
    default: ''
  },
  gtmId: {
    type: String,
    default: ''
  },
  ecommBannerText: {
    type: String,
    default: 'CTS B2B Procurement Desk - Fast Quotations & Logistics'
  },
  showEcommBanner: {
    type: Boolean,
    default: true
  },
  newlyAddedProductIDs: {
    type: [String],
    default: []
  },
  ecommSlides: {
    type: [{
      title: { type: String, required: true },
      subtitle: { type: String, required: true },
      image: { type: String, required: true },
      tag: { type: String, required: true }
    }],
    default: [
      {
        title: 'High-Performance Pneumatics',
        subtitle: 'Industrial Grinding and Milling tools by Ingersoll Rand',
        image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278562/port/awouogqczxlfzf4fn9qf.jpg',
        tag: 'PNEUMATICS'
      },
      {
        title: 'Precision German Engineering',
        subtitle: 'Heavy duty drilling and core machines by Eibenstock & Bosch',
        image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png',
        tag: 'POWER TOOLS'
      },
      {
        title: 'HSE Safety Standard Gear',
        subtitle: 'Full protective equipment for hazardous work sites',
        image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278562/port/i57qdajixxllurowpkev.jpg',
        tag: 'SAFETY'
      }
    ]
  },
  companyEmail: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Bind to portfolioDb connection
const PortfolioConfig = portfolioDb.model('PortfolioConfig', PortfolioConfigSchema, 'portfolio_configs');

module.exports = PortfolioConfig;
