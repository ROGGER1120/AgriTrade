const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Helper to deduct stock
const deductOrderStock = async (order, performedBy = 'System') => {
  if (order.stockDeducted) return;

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const prevStock = product.currentStock;
      const newStock = Math.max(0, prevStock - Number(item.quantity));
      product.currentStock = newStock;
      product.calculateStatus();
      await product.save();

      await StockMovement.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'SALE_DEDUCTION',
        quantityChange: -Number(item.quantity),
        previousStock: prevStock,
        newStock,
        referenceId: order.orderNumber,
        reason: `Sales deduction for order ${order.orderNumber} (${order.customerName})`,
        performedBy,
      });
    }
  }

  order.stockDeducted = true;
};

// Helper to restock if cancelled
const restockCancelledOrder = async (order, performedBy = 'System') => {
  if (!order.stockDeducted) return;

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const prevStock = product.currentStock;
      const newStock = prevStock + Number(item.quantity);
      product.currentStock = newStock;
      product.calculateStatus();
      await product.save();

      await StockMovement.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'ORDER_CANCELLED_RESTOCK',
        quantityChange: Number(item.quantity),
        previousStock: prevStock,
        newStock,
        referenceId: order.orderNumber,
        reason: `Restocked after order cancellation (${order.orderNumber})`,
        performedBy,
      });
    }
  }

  order.stockDeducted = false;
};

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const { status, channel, search, customerId } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }
    if (channel && channel !== 'All') {
      query.channel = channel;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (search && search.trim() !== '') {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { invoiceNumber: { $regex: search.trim(), $options: 'i' } },
        { customerName: { $regex: search.trim(), $options: 'i' } },
        { customerPhone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const orders = await SalesOrder.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    let order;
    if (req.params.id.startsWith('SO-')) {
      order = await SalesOrder.findOne({ orderNumber: req.params.id }).populate('items.product');
    } else {
      order = await SalesOrder.findById(req.params.id).populate('items.product');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order (POS or Ecommerce)
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      channel,
      items,
      discount,
      taxRate,
      paymentMethod,
      paymentStatus,
      orderStatus,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Check available stock first
    for (const item of items) {
      const prodId = item.productId || item.product || item._id;
      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.productName || prodId}` });
      }
      if (product.currentStock < Number(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.currentStock} ${product.unit}, requested: ${item.quantity} ${product.unit}`,
        });
      }
    }

    // Generate Order Number & Invoice Number
    const count = await SalesOrder.countDocuments();
    const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

    let subtotal = 0;
    const processedItems = items.map((item) => {
      const unitPrice = Number(item.price || item.unitPrice || item.sellingPrice);
      const quantity = Number(item.quantity);
      const total = unitPrice * quantity;
      subtotal += total;
      return {
        product: item.productId || item.product || item._id,
        productName: item.name || item.productName,
        sku: item.sku || '',
        quantity,
        unitPrice,
        total,
        unit: item.unit || 'units',
      };
    });

    const parsedDiscount = Number(discount) || 0;
    const calculatedTax = taxRate !== undefined ? Math.round((subtotal - parsedDiscount) * Number(taxRate) * 100) / 100 : 0;
    const finalTotal = Math.max(0, subtotal - parsedDiscount + calculatedTax);

    const initialStatus = orderStatus || (channel === 'ECOMMERCE_WEB' ? 'Confirmed' : 'Confirmed');

    const order = new SalesOrder({
      orderNumber,
      customer: customerId || (req.user ? req.user._id : null),
      customerName: customerName || (req.user ? req.user.name : 'Walk-in Customer'),
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      customerPhone: customerPhone || '9876543210',
      shippingAddress: shippingAddress || 'Store Pickup',
      city: city || 'Local',
      channel: channel || 'POS_COUNTER',
      items: processedItems,
      subtotal,
      discount: parsedDiscount,
      tax: calculatedTax,
      finalTotal,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'),
      orderStatus: initialStatus,
      invoiceNumber,
      invoiceDate: new Date(),
      notes: notes || '',
    });

    // Save order
    await order.save();

    // AUTOMATIC INVENTORY DECREASE WHEN ORDER IS CONFIRMED
    if (order.orderStatus === 'Confirmed' || order.orderStatus === 'Processing' || order.orderStatus === 'Delivered') {
      await deductOrderStock(order, req.user ? req.user.name : (channel === 'ECOMMERCE_WEB' ? 'E-Commerce Store' : 'Admin'));
      await order.save();
    }

    // Record Payment if Paid
    if (order.paymentStatus === 'Paid') {
      await Payment.create({
        transactionId: `TXN-ORD-${Date.now()}`,
        type: 'CUSTOMER_SALE',
        referenceOrder: order.orderNumber,
        partyName: order.customerName,
        amount: order.finalTotal,
        method: order.paymentMethod,
        status: 'Success',
        notes: `Customer order settlement for ${order.orderNumber}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully with automatic stock reduction!',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (workflow progression: Pending -> Confirmed -> Shipped -> Delivered -> Cancelled)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    // Automatic inventory management:
    // If transitioning to Confirmed/Delivered and stock wasn't deducted yet -> deduct stock!
    if (
      (orderStatus === 'Confirmed' || orderStatus === 'Processing' || orderStatus === 'Delivered') &&
      !order.stockDeducted
    ) {
      await deductOrderStock(order, req.user ? req.user.name : 'Order Manager');
    }

    // If order was cancelled and stock was previously deducted -> RESTOCK automatically!
    if (orderStatus === 'Cancelled' && order.stockDeducted) {
      await restockCancelledOrder(order, req.user ? req.user.name : 'Order Manager');
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated from ${previousStatus} to ${orderStatus}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
const updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevPayment = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save();

    if (paymentStatus === 'Paid' && prevPayment !== 'Paid') {
      await Payment.create({
        transactionId: `TXN-ORD-${Date.now()}`,
        type: 'CUSTOMER_SALE',
        referenceOrder: order.orderNumber,
        partyName: order.customerName,
        amount: order.finalTotal,
        method: order.paymentMethod,
        status: 'Success',
        notes: `Payment settled for ${order.orderNumber}`,
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
};
