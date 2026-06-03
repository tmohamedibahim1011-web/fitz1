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

// Trust reverse proxy (Render, Vercel, Heroku, etc.)
// This allows express-rate-limit to retrieve the client's real IP address from headers
app.set('trust proxy', 1);

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (more reasonable for standard browsing/testing)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// Migration for old orders with multiple items
const migrateOldOrders = async () => {
  try {
    const Order = require('./models/Order');
    
    // Find all orders that have more than 1 item OR any item with quantity > 1
    const ordersToSplit = await Order.find({
      $or: [
        { 'items.1': { $exists: true } },
        { 'items.quantity': { $gt: 1 } }
      ]
    });
    
    if (ordersToSplit.length === 0) {
      console.log('ℹ️ No old orders to split.');
      return;
    }
    
    console.log(`🔄 Found ${ordersToSplit.length} old orders to split...`);
    
    for (const order of ordersToSplit) {
      const originalOrderId = order.orderId;
      
      // Flatten all items in the order so that every single unit is a separate item of quantity 1
      const flatItems = [];
      for (const item of order.items) {
        const qty = item.quantity || 1;
        for (let q = 0; q < qty; q++) {
          flatItems.push({
            productId: item.productId,
            name: item.name,
            color: item.color,
            price: item.price,
            quantity: 1
          });
        }
      }

      if (flatItems.length <= 1) {
        continue;
      }
      
      // Determine total shipping of this order document
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalShipping = Math.max(0, order.totalAmount - subtotal);
      const shippingPerItem = totalShipping / flatItems.length;
      
      // Update original order to contain only the first flat item unit
      const newTotalAmount1 = flatItems[0].price + shippingPerItem;
      let shippingMethod = 'Free Shipping';
      if (shippingPerItem > 0) {
        shippingMethod = shippingPerItem === 50 ? 'Mini Shipping (Rs.50)' : `Standard Shipping (Rs.${shippingPerItem.toFixed(2)})`;
      }
      
      order.items = [flatItems[0]];
      order.totalAmount = newTotalAmount1;
      if (order.shippingAddress) {
        order.shippingAddress.method = shippingMethod;
      }
      order.markModified('items');
      order.markModified('shippingAddress');
      await order.save();
      console.log(`   Split order ${originalOrderId}: updated original doc.`);
      
      // Determine base order ID and find max suffix in DB to avoid collisions
      const parts = originalOrderId.split('-');
      let baseOrderId = originalOrderId;
      if (parts.length > 3) {
        baseOrderId = parts.slice(0, 3).join('-');
      }
      
      const suffixPattern = new RegExp(`^${baseOrderId}-`);
      const existingRelated = await Order.find({ orderId: suffixPattern });
      
      let maxSuffix = 1;
      for (const rel of existingRelated) {
        const p = rel.orderId.split('-');
        if (p.length > 3) {
          const suffixVal = parseInt(p[3], 10);
          if (!isNaN(suffixVal) && suffixVal > maxSuffix) {
            maxSuffix = suffixVal;
          }
        }
      }

      // Create new order documents for the remaining flat items
      for (let i = 1; i < flatItems.length; i++) {
        const nextSuffix = maxSuffix + i;
        const newOrderId = `${baseOrderId}-${nextSuffix}`;
        const itemShipping = shippingPerItem;
        const itemTotal = flatItems[i].price + itemShipping;

        let itemShippingMethod = 'Free Shipping';
        if (itemShipping > 0) {
          itemShippingMethod = itemShipping === 50 ? 'Mini Shipping (Rs.50)' : `Standard Shipping (Rs.${itemShipping.toFixed(2)})`;
        }
        
        const splitOrder = new Order({
          orderId: newOrderId,
          customerInfo: order.customerInfo,
          shippingAddress: {
            address: order.shippingAddress.address,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip: order.shippingAddress.zip,
            method: itemShippingMethod
          },
          items: [flatItems[i]],
          totalAmount: itemTotal,
          status: order.status,
          trackingId: order.trackingId,
          courierName: order.courierName,
          trackingLink: order.trackingLink,
          paymentId: order.paymentId,
          paymentStatus: order.paymentStatus,
          emailSent: order.emailSent,
          createdAt: order.createdAt
        });
        
        await splitOrder.save();
        console.log(`   Split order ${originalOrderId}: created new doc -> ${splitOrder.orderId}`);
      }
    }
    
    console.log('✅ Migration of old orders complete!');
  } catch (error) {
    console.error('❌ Error during old orders migration:', error);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    try {
      await migrateOldOrders();
    } catch (migErr) {
      console.error('❌ Migration error on startup:', migErr);
    }
  })
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
      description: 'Premium Mahogany Wood parallettes for professional training. 45mm ergonomic grip, 450mm length, 140mm base width, 130mm height. 350kg weight capacity.',
      basePrice: 1499,
      size: 'regular',
      material: 'Premium Mahogany Wood',
      badge: 'Signature Series',
      stock: 50,
      colors: [
        { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0, image: '/products/regularnatural.jpeg', hoverImage: '/products/regularnatural.jpeg', stock: 50 },
        { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100, image: '/products/regularblack.jpeg', hoverImage: '/products/regularblack.jpeg', stock: 0 }
      ],
      rating: 5,
      reviewCount: 124
    },
    {
      name: 'Mini Parallettes',
      description: 'Travel-friendly mini parallettes for training anywhere. Compact 45mm grip, 250mm length, 120mm base width, 100mm height. Perfect for on-the-go.',
      basePrice: 799,
      size: 'mini',
      material: 'Premium Mahogany Wood',
      badge: 'Travel Edition',
      stock: 30,
      colors: [
        { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0, image: '/products/mininatural.jpeg', hoverImage: '/products/mininatural.jpeg', stock: 5 },
        { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100, image: '/products/miniblack.PNG', hoverImage: '/products/miniblack.PNG', stock: 25 }
      ],
      rating: 5,
      reviewCount: 89
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

// Admin Route to wipe all test orders before production launch
app.delete('/api/admin/wipe-orders-danger', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.JWT_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const Order = require('./models/Order');
    await Order.deleteMany({});
    res.json({ success: true, message: 'All test orders have been wiped successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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