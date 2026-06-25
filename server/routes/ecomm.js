const express = require('express');
const router = express.Router();
const Product = require('../models/ecomm/Product');
const Brand = require('../models/ecomm/Brand');
const Order = require('../models/ecomm/Order');
const { protectAdmin } = require('../middleware/auth');

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
    res.json({ success: true, count: brands.length, data: brands });
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
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/orders/:id', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
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
