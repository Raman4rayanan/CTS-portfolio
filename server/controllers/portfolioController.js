const Activity = require('../models/portfolio/Activity');
const ProductService = require('../models/portfolio/ProductService');
const Inquiry = require('../models/portfolio/Inquiry');
const PortfolioConfig = require('../models/portfolio/PortfolioConfig');
const { sendInquiryEmail } = require('../services/emailService');

const defaultConfig = {
  heroTitle: 'Precision & Reliability',
  heroSubtitle: 'Supporting industries with reliable tools, technical solutions, and responsive service tailored to real-world operational challenges.',
  aboutText: 'From industrial tools and MRO solutions to customized technical support, we help organizations maintain safe, efficient, and productive operations.',
  aboutHeaderLight: 'Powering Industries with',
  aboutHeaderBold: 'Precision & Reliability',
  partnersBgColor1: '#112A4F',
  partnersBgColor2: '#040C19',
  partnersBgColor3: '#02060C',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
  journey: [
    { year: '2021', event: 'Founded' },
    { year: '2022', event: 'Expanded Portfolio' },
    { year: '2023', event: 'Engineering & Global Partnerships' },
    { year: '2024', event: 'Presence across Wind Energy Sector' }
  ],
  reasons: [
    { title: 'High-Quality Products', icon: 'ShieldCheck', desc: 'Sourced from best global brands.' },
    { title: 'HSE COMPLIANCE', icon: 'HardHat', desc: 'Highest standards in health & safety.' },
    { title: 'Advanced Technology', icon: 'Cpu', desc: 'State-of-the-art tools and equipment.' },
    { title: 'Reliable Service', icon: 'ThumbsUp', desc: 'Consistent support you can count on.' }
  ],
  partners: [
    { name: 'Bosch Power Tools', src: '/port/boach-Photoroom.png' },
    { name: 'Ingersoll Rand', src: '/port/inger.png', scale: 1.35 },
    { name: 'Stanley Black & Decker', src: '/port/stanley.png' },
    { name: 'Kärcher', src: '/port/karcher.png' },
    { name: 'Eibenstock', src: '/port/elbenstock.png', scale: 2.5 },
    { name: 'Klingspor', src: '/port/Klingspor-Emblem.png' },
    { name: 'Cromwell Tools Industries', src: '/port/comwell.png', scale: 1.8 },
    { name: 'KOVAX Abrasive Solutions', src: '/port/kovax.png' },
    { name: 'Atlas Protective Products', src: '/port/atlas.png', scale: 3.5 }
  ],
  customers: [
    { name: 'Nordex India', src: '/port/nordex-Photoroom.png' },
    { name: 'Senvion India', src: '/port/Senvion-Photoroom.png' },
    { name: 'Suzlon Energy', src: '/port/suzlon-Photoroom.png', scale: 1.35 },
    { name: 'Gurit Wind', src: '/port/gurit-Photoroom.png' },
    { name: 'Indocool Composites', src: '/port/indocool-Photoroom.png' },
    { name: 'Stellantis Avtec Powertrain', src: '/port/Stellantis-Photoroom.png', scale: 1.35 },
    { name: 'Exeraxis India', src: '/port/EVERAXIS-Photoroom.png', scale: 1.35 }
  ],
  ecommBannerText: 'CTS B2B Procurement Desk - Fast Quotations & Logistics',
  ecommSlides: [
    {
      title: 'Industrial Storage Units',
      subtitle: 'Heavy-duty storage solutions for your workspace',
      image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857708/mwiwaarn1zhykjtpu4hp.jpg',
      tag: 'STORAGE'
    },
    {
      title: 'Precision German Engineering',
      subtitle: 'Heavy duty drilling and core machines by Eibenstock & Bosch',
      image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857696/vzthjir8tfsmgpjq9b6c.png',
      tag: 'POWER TOOLS'
    },
    {
      title: 'HSE Safety Standard Gear',
      subtitle: 'Full protective equipment for hazardous work sites',
      image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857710/mja5koba7dyakvpdae7c.jpg',
      tag: 'SAFETY'
    }
  ]
};

// ===== ACTIVITIES CONTROLLER =====
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { title, subtitle, image, gradient } = req.body;
    if (!title || !subtitle || !image) {
      return res.status(400).json({ success: false, error: 'Title, subtitle, and image are required.' });
    }
    const newActivity = await Activity.create({ title, subtitle, image, gradient });
    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image, gradient } = req.body;
    
    let activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found.' });
    }

    activity = await Activity.findByIdAndUpdate(
      id,
      { title, subtitle, image, gradient },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found.' });
    }
    await Activity.findByIdAndDelete(id);
    res.json({ success: true, message: 'Activity deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ===== PRODUCT SERVICES CONTROLLER =====
exports.getServices = async (req, res) => {
  try {
    const services = await ProductService.find().sort({ createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { title, icon, image, desc } = req.body;
    if (!title || !icon || !image || !desc) {
      return res.status(400).json({ success: false, error: 'Title, icon, image, and desc are required.' });
    }
    const newService = await ProductService.create({ title, icon, image, desc });
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon, image, desc } = req.body;

    let service = await ProductService.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    service = await ProductService.findByIdAndUpdate(
      id,
      { title, icon, image, desc },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ProductService.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    await ProductService.findByIdAndDelete(id);
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ===== INQUIRIES CONTROLLER =====
exports.createInquiry = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, error: 'Name, phone, and message are required.' });
    }
    const newInquiry = await Inquiry.create({ name, phone, email, message });

    // Try to send email notifications asynchronously
    const adminEmail = process.env.SMTP_USER || 'adminconcepttoolsandservice@gmail.com';
    let ccEmail = null;
    try {
      const config = await PortfolioConfig.findOne();
      if (config && config.companyEmail) {
        ccEmail = config.companyEmail;
      }
    } catch (e) {
      console.error('Failed to fetch config for CC email:', e);
    }
    sendInquiryEmail(adminEmail, email, { name, phone, email, message }, ccEmail).catch(err => console.error('Failed to send inquiry email:', err));

    res.status(201).json({ success: true, data: newInquiry, message: 'Inquiry saved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== PORTFOLIO CONFIG CONTROLLER =====
exports.getPortfolioConfig = async (req, res) => {
  try {
    let config = await PortfolioConfig.findOne();
    if (!config) {
      config = await PortfolioConfig.create(defaultConfig);
      console.log('Database: Created and seeded default Portfolio Configuration.');
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePortfolioConfig = async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, aboutText, aboutHeaderLight, aboutHeaderBold, partnersBgColor1, partnersBgColor2, partnersBgColor3, journey, reasons, partners, customers, cloudinaryCloudName, cloudinaryUploadPreset, metaTitle, metaDescription, metaImage, ecommBannerText, showEcommBanner, ecommSlides, companyEmail } = req.body;
    
    let config = await PortfolioConfig.findOne();
    if (!config) {
      config = new PortfolioConfig();
    }

    if (heroTitle !== undefined) config.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) config.heroSubtitle = heroSubtitle;
    if (aboutText !== undefined) config.aboutText = aboutText;
    if (aboutHeaderLight !== undefined) config.aboutHeaderLight = aboutHeaderLight;
    if (aboutHeaderBold !== undefined) config.aboutHeaderBold = aboutHeaderBold;
    if (partnersBgColor1 !== undefined) config.partnersBgColor1 = partnersBgColor1;
    if (partnersBgColor2 !== undefined) config.partnersBgColor2 = partnersBgColor2;
    if (partnersBgColor3 !== undefined) config.partnersBgColor3 = partnersBgColor3;
    if (journey !== undefined) config.journey = journey;
    if (reasons !== undefined) config.reasons = reasons;
    if (partners !== undefined) config.partners = partners;
    if (customers !== undefined) config.customers = customers;
    if (cloudinaryCloudName !== undefined) config.cloudinaryCloudName = cloudinaryCloudName;
    if (cloudinaryUploadPreset !== undefined) config.cloudinaryUploadPreset = cloudinaryUploadPreset;
    if (metaTitle !== undefined) config.metaTitle = metaTitle;
    if (metaDescription !== undefined) config.metaDescription = metaDescription;
    if (metaImage !== undefined) config.metaImage = metaImage;
    if (ecommBannerText !== undefined) config.ecommBannerText = ecommBannerText;
    if (showEcommBanner !== undefined) config.showEcommBanner = showEcommBanner;
    if (ecommSlides !== undefined) config.ecommSlides = ecommSlides;
    if (companyEmail !== undefined) config.companyEmail = companyEmail;

    await config.save();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
