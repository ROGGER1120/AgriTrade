const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getSalesReport,
  getInventoryReport,
  getPayments,
} = require('../controllers/reportController');

router.get('/dashboard', getDashboardMetrics);
router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/payments', getPayments);

module.exports = router;
