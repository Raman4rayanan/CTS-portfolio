require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { portfolioDb } = require('../config/db');

// Import Models
const Activity = require('../models/portfolio/Activity');
const ProductService = require('../models/portfolio/ProductService');

const activities = [
  {
    title: 'Work Updates',
    subtitle: 'Latest developments and operational milestones from our daily industrial engagements.',
    image: '/port/image1.png',
    gradient: 'linear-gradient(135deg, #0F4C81, #0B1F3A)',
  },
  {
    title: 'Project Highlights',
    subtitle: 'Showcasing our recent successful implementations and turnkey solutions.',
    image: '/port/image2.png',
    gradient: 'linear-gradient(135deg, #198e9d, #0B1F3A)',
  },
  {
    title: 'Product Demonstrations',
    subtitle: 'On-site technical demonstrations of our newest power tools and equipment.',
    image: '/port/image3.png',
    gradient: 'linear-gradient(135deg, #016A8A, #053b4d)',
  },
  {
    title: 'Client Visits',
    subtitle: 'Building lasting partnerships through on-site visits and collaborative consultations with our clients.',
    image: '/port/image1.png',
    gradient: 'linear-gradient(135deg, #1a3a5c, #0B1F3A)',
  },
  {
    title: 'Training & Workshops',
    subtitle: 'Empowering our teams with the latest safety protocols, tool handling skills, and industry best practices.',
    image: '/port/image2.png',
    gradient: 'linear-gradient(135deg, #0e5c6e, #0B1F3A)',
  },
  {
    title: 'Trade Exhibitions',
    subtitle: 'Representing CTS at premier industrial expos to showcase innovations and connect with global partners.',
    image: '/port/image3.png',
    gradient: 'linear-gradient(135deg, #0a4a7a, #0B1F3A)',
  },
];

const services = [
  { 
    title: 'Lifting Equipment', 
    icon: 'ArrowUpSquare', 
    image: '/port/lifting.jpg', 
    desc: 'Safe and certified lifting gear for seamless material handling.' 
  },
  { 
    title: 'Pneumatic Tools', 
    icon: 'Settings', 
    image: '/port/pneumatic.png', 
    desc: 'High-performance air-powered tools for heavy-duty applications.' 
  },
  { 
    title: 'Hand Tools', 
    icon: 'Wrench', 
    image: '/port/hand.jpg', 
    desc: 'Durable manual tools crafted for everyday industrial tasks.' 
  },
  { 
    title: 'Storage Cabinets', 
    icon: 'Archive', 
    image: '/port/storage.jpg', 
    desc: 'Robust industrial storage solutions to keep workspaces organized.' 
  },
  { 
    title: 'Power Tools', 
    icon: 'PenTool', 
    image: '/port/power.jpg', 
    desc: 'Reliable and efficient electric tools for precision and power.' 
  },
  { 
    title: 'PPE (Personal Protective Equipment)', 
    icon: 'HardHat', 
    image: '/port/personal.jpg', 
    desc: 'Industry-standard safety gear to protect your workforce.' 
  },
  { 
    title: 'Environmental Protection Equipment', 
    icon: 'Leaf', 
    image: '/port/environment.jpg', 
    desc: 'Sustainable solutions for emission control and safe disposal.' 
  },
  { 
    title: 'Service Solutions', 
    icon: 'Wrench', 
    image: '/port/services.jpg', 
    desc: 'Expert MRO support and repair services to minimize downtime.' 
  },
  { 
    title: 'Customized Tools', 
    icon: 'Cog', 
    image: '/port/customized.jpg', 
    desc: 'Bespoke tool designs tailored to your specific operational needs.' 
  },
];

async function seed() {
  console.log('Connecting and waiting for database to open...');
  // Wait 1.5 seconds for mongoose connections
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    // 1. Seed Activities
    console.log('\nSyncing recent activities...');
    // Delete existing test activities or duplicates
    await Activity.deleteMany({});
    const insertedActivities = await Activity.insertMany(activities);
    console.log(`✓ Seeded ${insertedActivities.length} activities successfully.`);

    // 2. Seed Services
    console.log('\nSyncing product services / capabilities...');
    await ProductService.deleteMany({});
    const insertedServices = await ProductService.insertMany(services);
    console.log(`✓ Seeded ${insertedServices.length} product services successfully.`);

    console.log('\n=======================================');
    console.log(' PORTFOLIO SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
  } catch (error) {
    console.error('✗ Seeding error:', error);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}

seed();
