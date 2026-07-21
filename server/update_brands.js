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
  { name: 'Atlas', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278516/port/hym3rag4eal3xxn9bx6d.png' },
  { name: 'Bosch', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278517/port/svdnbsmz2mkirhr9oqes.png' },
  { name: 'Eibenstock', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278519/port/wkn0oyaxl2jgzwklcupo.png' },
  { name: 'Ingersoll Rand', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278558/port/ctrjijbpcixvkfvv636m.png' },
  { name: 'Stanley Black', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278565/port/dfhdgyfgk2q4ddivq0rv.png' }
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
