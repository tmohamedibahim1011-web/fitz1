const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// SMTP Verification removed since we migrated to the highly reliable HTTP API

// Seed default products
const seedProducts = async () => {
  try {
    // Drop all products
    await Product.deleteMany({});
    
    // Drop indexes to avoid duplicate key errors
    await Product.collection.dropIndexes();
  } catch (e) {
    // Indexes might not exist, continue
  }
  
  const defaultProducts = [
    {
      name: 'Pro Series Regular Parallettes',
      description: 'Premium Mahogany Wood parallettes for professional training. 40mm ergonomic grip, 450mm length, 140mm base width, 130mm height. 350kg weight capacity.',
      basePrice: 1599,
      size: 'regular',
      material: 'Premium Mahogany Wood',
      badge: 'Signature Series',
      stock: 50,
      colors: [
        { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0, image: '/products/regularnatural.jpeg', hoverImage: '/products/regularnatural.jpeg' },
        { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100, image: '/products/regularblack.jpeg', hoverImage: '/products/regularblack.jpeg' }
      ],
      rating: 5,
      reviewCount: 124
    },
    {
      name: 'Mini Parallettes',
      description: 'Travel-friendly mini parallettes for training anywhere. Compact 30mm grip, 250mm length, 120mm base width, 100mm height. Perfect for on-the-go.',
      basePrice: 999,
      size: 'mini',
      material: 'Premium Mahogany Wood',
      badge: 'Travel Edition',
      stock: 50,
      colors: [
        { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0, image: '/products/mininatural.jpeg', hoverImage: '/products/mininatural.jpeg' },
        { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100, image: '/products/miniblack.PNG', hoverImage: '/products/miniblack.PNG' }
      ],
      rating: 5,
      reviewCount: 89
    },
    {
      name: 'Live Test Product',
      description: 'Use this product to test a real Rs. 1 live transaction on Razorpay. It validates the full cart, checkout, payment gateway, and email workflows.',
      basePrice: 1,
      size: 'regular',
      material: 'Test Material',
      badge: 'Test Mode',
      stock: 999,
      colors: [
        { id: 'natural', name: 'Standard', hex: '#E0E0E0', priceOffset: 0, image: '/products/regularnatural.jpeg', hoverImage: '/products/regularnatural.jpeg' }
      ],
      rating: 5,
      reviewCount: 1
    }
  ];
  
  await Product.insertMany(defaultProducts);
  console.log('✅ Products seeded with colors');
};
seedProducts();

// Import Routes
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Debug: Test email endpoint — only works with correct ADMIN_SECRET header
// Call: POST /api/debug/test-email with header x-admin-secret: <your JWT secret>
app.post('/api/debug/test-email', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.JWT_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { sendEmail } = require('./utils/emailService');
  const to = req.body.to || process.env.SMTP_USER;
  const sent = await sendEmail(
    'Fitzone SMTP Test Email',
    '<h2>✅ SMTP is working!</h2><p>If you received this, email delivery is configured correctly.</p>',
    to,
    'Test Recipient',
    'SMTP_TEST'
  );
  res.json({ success: sent, to, smtpHost: process.env.SMTP_HOST, smtpPort: process.env.SMTP_PORT });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});