const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
} = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/status', updateOrderStatus);
router.put('/:id/payment', updateOrderPayment);

module.exports = router;
