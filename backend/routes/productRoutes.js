const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateStock 
} = require('../controllers/productController');

const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', protectAdmin, createProduct);
router.put('/:id', protectAdmin, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);
router.put('/:id/stock', protectAdmin, updateStock);

module.exports = router;