const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    zip: String,
    method: String,
  },
  items: [{
    productId: String,
    name: String,
    color: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ['processing', 'packing', 'shipping', 'delivered'],
    default: 'processing'
  },
  trackingId: { type: String, default: '' },
  courierName: { type: String, default: '' },
  trackingLink: { type: String, default: '' },
  paymentId: String,
  paymentStatus: { type: String, default: 'pending' },
  emailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);