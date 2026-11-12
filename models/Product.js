const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, trim: true },
  category: { type: String, required: true },
  packSize: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  orderCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);