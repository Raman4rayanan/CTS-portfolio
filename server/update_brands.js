require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_ECOMM_URI || 'mongodb://127.0.0.1:27017/cts_ecomm';
const ecommDb = mongoose.createConnection(MONGODB_URI);

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  src: { type: String },
  scale: { type: Number, default: 1.0 }
}, { timestamps: true });

const Brand = ecommDb.model('Brand', BrandSchema, 'brands');

const brandUpdates = [
  { name: 'Atlas', src: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857702/y9ypyosfhfdnwicpli3j.png' },
  { name: 'Bosch', src: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857697/iziqyyzfm4pk07bsf0xe.png' },
  { name: 'Eibenstock', src: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857699/sr3zhdx7bmas7nscdd9c.png' },
  { name: 'Ingersoll Rand', src: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857697/u77micfxwbh6b7td5nsz.png' },
  { name: 'Stanley Black', src: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857698/jcjic1y0hsv8jeydept7.png' }
];

async function updateBrands() {
  try {
    for (const b of brandUpdates) {
      // Find brand by exact name or regex match
      const brand = await Brand.findOne({ name: new RegExp(b.name, 'i') });
      if (brand) {
        brand.src = b.src;
        await brand.save();
        console.log(`Updated ${brand.name} with ${b.src}`);
      } else {
        console.log(`Brand not found for regex: ${b.name}`);
      }
    }
    
    console.log('Finished updating brands');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    ecommDb.close();
  }
}

ecommDb.once('open', updateBrands);
