const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protectAdmin } = require('../middleware/authMiddleware');
const { getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const adminUsername = process.env.ADMIN_USERNAME || 'fitz1';
  const adminPassword = process.env.ADMIN_PASSWORD || 'kavinath@123';

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ success: true, message: 'Login successful', token });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.get('/orders', protectAdmin, getAllOrders);
router.put('/orders/:id/status', protectAdmin, updateOrderStatus);
router.delete('/orders/:id', protectAdmin, deleteOrder);

module.exports = router;