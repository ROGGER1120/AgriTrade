const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  updatePurchasePayment,
} = require('../controllers/procurementController');
const { protect, adminOnly } = require('../middleware/auth');

// Suppliers
router.route('/suppliers')
  .get(getSuppliers)
  .post(protect, adminOnly, createSupplier);

router.route('/suppliers/:id')
  .put(protect, adminOnly, updateSupplier)
  .delete(protect, adminOnly, deleteSupplier);

// Purchase Orders
router.route('/purchases')
  .get(getPurchaseOrders)
  .post(protect, adminOnly, createPurchaseOrder);

router.post('/purchases/:id/receive', protect, adminOnly, receivePurchaseOrder);
router.put('/purchases/:id/payment', protect, adminOnly, updatePurchasePayment);

module.exports = router;
