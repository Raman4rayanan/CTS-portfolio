const express = require('express');
const router = express.Router();
const Product = require('../models/ecomm/Product');
const Brand = require('../models/ecomm/Brand');
const Order = require('../models/ecomm/Order');
const { protectAdmin } = require('../middleware/auth');
const { sendQuoteEmail } = require('../services/emailService');
const PortfolioConfig = require('../models/portfolio/PortfolioConfig');

// Get all products (Public)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create product (Admin Only)
router.post('/products', protectAdmin, async (req, res) => {
  try {
    const { product_id, sku, brand, category, type, sub_type, model, product_name, description, specifications, images } = req.body;
    
    // Check if product_id or sku already exists
    const duplicate = await Product.findOne({ $or: [{ product_id }, { sku }] });
    if (duplicate) {
      return res.status(400).json({ success: false, error: 'Product with this Product ID or SKU already exists.' });
    }

    const product = new Product({
      product_id,
      sku,
      brand,
      category,
      type,
      sub_type,
      model,
      product_name,
      description,
      specifications,
      images
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update product (Admin Only)
router.put('/products/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product (Admin Only)
router.delete('/products/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk upload (Admin Only)
router.post('/products/bulk', protectAdmin, async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ success: false, error: 'Invalid payload: products array required.' });
    }

    const operations = products.map(p => ({
      updateOne: {
        filter: { product_id: p.product_id },
        update: { $set: p },
        upsert: true
      }
    }));

    await Product.bulkWrite(operations);

    res.json({
      success: true,
      message: `Bulk uploaded/synchronized ${products.length} products.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk delete products matching filter (Admin Only)
router.post('/products/bulk-delete', protectAdmin, async (req, res) => {
  try {
    const { filter, deleteAll } = req.body;
    if (!filter || typeof filter !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload: filter object required.' });
    }

    const cleanFilter = {};
    if (filter.brand) cleanFilter.brand = filter.brand;
    if (filter.category) cleanFilter.category = filter.category;
    if (filter.type) cleanFilter.type = filter.type;
    if (filter.sub_type) cleanFilter.sub_type = filter.sub_type;

    const finalFilter = deleteAll ? {} : cleanFilter;

    // Block accidental deletes of everything
    if (Object.keys(finalFilter).length === 0 && !deleteAll) {
      return res.status(400).json({ success: false, error: 'No deletion criteria specified.' });
    }

    const result = await Product.deleteMany(finalFilter);

    res.json({
      success: true,
      count: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} products matching criteria.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Default brands to seed if empty
const defaultBrands = [
  { name: 'Atlas Protective Products', logoUrl: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png' },
  { name: 'Bosch Power Tools', logoUrl: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png' },
  { name: 'Cromwell Tools Industries', logoUrl: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png' },
  { name: 'Eibenstock', logoUrl: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png' },
  { name: 'Ingersoll Rand', logoUrl: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png' },
  { name: 'Stanley Black & Decker', logoUrl: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png' }
];

// Brand API Routes
router.get('/brands', async (req, res) => {
  try {
    let brands = await Brand.find().sort({ name: 1 });
    if (brands.length === 0) {
      await Brand.insertMany(defaultBrands);
      brands = await Brand.find().sort({ name: 1 });
    }
    
    // Auto-update placeholders
    const brandUpdates = [
      { name: 'Atlas', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278516/port/hym3rag4eal3xxn9bx6d.png' },
      { name: 'Bosch', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278517/port/svdnbsmz2mkirhr9oqes.png' },
      { name: 'Eibenstock Positron', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278519/port/wkn0oyaxl2jgzwklcupo.png' },
      { name: 'Ingersoll Rand', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278558/port/ctrjijbpcixvkfvv636m.png' },
      { name: 'Stanley Black & Decker', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278565/port/dfhdgyfgk2q4ddivq0rv.png' }
    ];

    let modified = false;
    for (let brand of brands) {
      if (brand.src && brand.src.includes('placeholder')) {
        const update = brandUpdates.find(b => b.name === brand.name);
        if (update) {
          brand.src = update.src;
          await brand.save();
          modified = true;
        }
      }
    }
    
    if (modified) {
      brands = await Brand.find().sort({ name: 1 });
    }

    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/brands/sync', protectAdmin, async (req, res) => {
  try {
    const { brands } = req.body;
    if (!Array.isArray(brands)) {
      return res.status(400).json({ success: false, error: 'Brands array is required.' });
    }

    // Drop all existing brands and insert the new array
    await Brand.deleteMany({});
    
    const formattedBrands = brands.map(b => ({
      name: b.name.trim(),
      logoUrl: b.src || b.logoUrl || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png'
    }));

    if (formattedBrands.length > 0) {
      await Brand.insertMany(formattedBrands);
    }
    
    const updatedBrands = await Brand.find().sort({ name: 1 });
    res.json({ success: true, count: updatedBrands.length, data: updatedBrands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/brands', protectAdmin, async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Brand name is required.' });
    }
    const duplicate = await Brand.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (duplicate) {
      return res.status(400).json({ success: false, error: 'Brand with this name already exists.' });
    }

    const brand = new Brand({
      name: name.trim(),
      logoUrl: logoUrl ? logoUrl.trim() : 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png'
    });
    await brand.save();
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/brands/:id', protectAdmin, async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Brand name is required.' });
    }
    const duplicate = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (duplicate) {
      return res.status(400).json({ success: false, error: 'Brand with this name already exists.' });
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        logoUrl: logoUrl ? logoUrl.trim() : 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png'
      },
      { new: true, runValidators: true }
    );
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand not found.' });
    }
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/brands/:id', protectAdmin, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand not found.' });
    }
    res.json({ success: true, message: 'Brand deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Order/RFQ API Routes
router.get('/orders', protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { referenceId, customerDetails, items } = req.body;
    if (!referenceId || !customerDetails || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required order details.' });
    }

    const order = new Order({
      referenceId,
      customerDetails,
      items,
      status: 'Pending'
    });

    await order.save();

    // Try to send email notifications asynchronously (don't block the response)
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

    sendQuoteEmail(adminEmail, customerDetails.email, order, ccEmail).catch(err => console.error('Failed to send quote emails', err));

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/orders/:id', protectAdmin, async (req, res) => {
  try {
    const { status, items, shippingCost, taxRate, adminComments, paymentTerms, validUntil } = req.body;

    const updateObj = {};
    if (status) updateObj.status = status;
    if (items && Array.isArray(items)) updateObj.items = items;
    if (shippingCost !== undefined) updateObj.shippingCost = Number(shippingCost) || 0;
    if (taxRate !== undefined) updateObj.taxRate = Number(taxRate) || 0;
    if (adminComments !== undefined) updateObj.adminComments = adminComments;
    if (paymentTerms !== undefined) updateObj.paymentTerms = paymentTerms;
    if (validUntil !== undefined) updateObj.validUntil = validUntil;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/orders/:id', protectAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/orders/track/:referenceId', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      referenceId: { $regex: new RegExp(`^${req.params.referenceId.trim()}$`, 'i') } 
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order/RFQ reference ID not found.' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
