const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  basePrice: { type: Number, required: true },
  size: { type: String, enum: ['regular', 'mini'], required: true },
  material: String,
  badge: String,
  stock: { type: Number, default: 50 },
  colors: [{
    id: String,
    name: String,
    hex: String,
    priceOffset: { type: Number, default: 0 },
    image: String,
    hoverImage: String
  }],
  rating: { type: Number, default: 5 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);