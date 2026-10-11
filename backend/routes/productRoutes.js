const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getCategoriesSummary,
  getStockMovements,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/categories/summary', getCategoriesSummary);
router.get('/movements/history', getStockMovements);

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.post('/:id/adjust-stock', protect, adminOnly, adjustStock);

module.exports = router;
