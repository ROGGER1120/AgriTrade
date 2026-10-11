const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const User = require('../models/User');
const Payment = require('../models/Payment');
const StockMovement = require('../models/StockMovement');

// @desc    Dashboard overview metrics
// @route   GET /api/reports/dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: { $in: ['customer', 'farmer'] } });

    // Low stock & Critical counts
    const lowStockProducts = await Product.find({
      status: { $in: ['Low Stock', 'Critical'] },
    }).sort({ currentStock: 1 });

    const criticalCount = lowStockProducts.filter((p) => p.status === 'Critical').length;
    const lowStockCount = lowStockProducts.length;

    // Sales metrics
    const orders = await SalesOrder.find();
    const totalSalesRevenue = orders.reduce((sum, ord) => sum + (ord.finalTotal || 0), 0);
    const totalOrdersCount = orders.length;

    // Purchase metrics
    const purchases = await PurchaseOrder.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalPurchaseSpend = purchases.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

    // Recent orders
    const recentOrders = await SalesOrder.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent stock movements
    const recentMovements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(8);

    // Monthly revenue & purchase breakdown for Recharts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyStats = months.map((monthName, index) => {
      // Filter orders in this month
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      const revenue = monthOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

      // Filter purchases in this month
      const monthPurchases = purchases.filter((p) => {
        const d = new Date(p.createdAt);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      const purchaseSpend = monthPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

      return {
        month: monthName,
        revenue: Math.round(revenue),
        purchases: Math.round(purchaseSpend),
        profit: Math.round(Math.max(0, revenue - purchaseSpend)),
      };
    });

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          stockValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalCustomers,
        totalSalesRevenue,
        totalOrdersCount,
        totalPurchaseSpend,
        lowStockCount,
        criticalCount,
        inventoryValuation: categoryDistribution.reduce((acc, c) => acc + (c.stockValue || 0), 0),
      },
      lowStockProducts,
      recentOrders,
      recentMovements,
      monthlyChart: monthlyStats,
      categoryChart: categoryDistribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Detailed Sales Reports
// @route   GET /api/reports/sales
const getSalesReport = async (req, res) => {
  try {
    const orders = await SalesOrder.find().sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);

    // Group by payment method
    const paymentMethods = {};
    orders.forEach((o) => {
      const method = o.paymentMethod || 'Other';
      paymentMethods[method] = (paymentMethods[method] || 0) + o.finalTotal;
    });

    // Group by status
    const statusCounts = {};
    orders.forEach((o) => {
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
    });

    res.json({
      success: true,
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        totalDiscount,
        totalTax,
        paymentMethods,
        statusCounts,
      },
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Detailed Inventory Report
// @route   GET /api/reports/inventory
const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });

    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let totalItemsStock = 0;

    const healthStatus = {
      'In Stock': 0,
      'Low Stock': 0,
      'Critical': 0,
      'Out of Stock': 0,
    };

    products.forEach((p) => {
      totalCostValuation += p.currentStock * p.costPrice;
      totalRetailValuation += p.currentStock * p.sellingPrice;
      totalItemsStock += p.currentStock;
      healthStatus[p.status] = (healthStatus[p.status] || 0) + 1;
    });

    res.json({
      success: true,
      valuation: {
        totalCostValuation,
        totalRetailValuation,
        potentialMargin: totalRetailValuation - totalCostValuation,
        totalItemsStock,
        healthStatus,
      },
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Payment Transactions & Settlements
// @route   GET /api/reports/payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    const totalCustomerInflow = payments
      .filter((p) => p.type === 'CUSTOMER_SALE' && p.status === 'Success')
      .reduce((s, p) => s + p.amount, 0);
    const totalSupplierOutflow = payments
      .filter((p) => p.type === 'SUPPLIER_PAYOUT' && p.status === 'Success')
      .reduce((s, p) => s + p.amount, 0);

    res.json({
      success: true,
      totalCustomerInflow,
      totalSupplierOutflow,
      netCashFlow: totalCustomerInflow - totalSupplierOutflow,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getSalesReport,
  getInventoryReport,
  getPayments,
};
