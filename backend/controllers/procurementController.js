const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Payment = require('../models/Payment');

// ================= SUPPLIERS =================

// @desc    Get all suppliers
// @route   GET /api/procurement/suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new supplier
// @route   POST /api/procurement/suppliers
const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      taxId,
      categoriesSupplied,
      paymentTerms,
      rating,
    } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      email: email || '',
      phone,
      address: address || '',
      city: city || '',
      taxId: taxId || '',
      categoriesSupplied: categoriesSupplied || [],
      paymentTerms: paymentTerms || 'Net 30',
      rating: rating || 4.8,
    });

    res.status(201).json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update supplier
// @route   PUT /api/procurement/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/procurement/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PURCHASE ORDERS =================

// Helper to apply stock increase from received PO
const applyPurchaseStockUpdate = async (po, performedBy = 'Admin') => {
  for (const item of po.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const prevStock = product.currentStock;
      product.currentStock = prevStock + Number(item.quantity);
      product.calculateStatus();
      await product.save();

      await StockMovement.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'PURCHASE_RECEIPT',
        quantityChange: Number(item.quantity),
        previousStock: prevStock,
        newStock: product.currentStock,
        referenceId: po.poNumber,
        reason: `Procurement stock intake from ${po.supplierName} (PO: ${po.poNumber})`,
        performedBy,
      });
    }
  }
};

// @desc    Get all purchase orders
// @route   GET /api/procurement/purchases
const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplier', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create purchase order (Optionally immediately received)
// @route   POST /api/procurement/purchases
const createPurchaseOrder = async (req, res) => {
  try {
    const {
      supplierId,
      items,
      paymentStatus,
      paidAmount,
      orderStatus,
      expectedDeliveryDate,
      notes,
    } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(400).json({ success: false, message: 'Supplier is required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'PO must have at least one product' });
    }

    // Generate PO Number
    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let totalAmount = 0;
    const processedItems = items.map((item) => {
      const totalCost = Number(item.quantity) * Number(item.unitCost);
      totalAmount += totalCost;
      return {
        product: item.productId || item.product,
        productName: item.productName,
        sku: item.sku || '',
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        totalCost,
        unit: item.unit || 'units',
      };
    });

    const isImmediatelyReceived = orderStatus === 'Received';

    const po = new PurchaseOrder({
      poNumber,
      supplier: supplier._id,
      supplierName: supplier.name,
      items: processedItems,
      totalAmount,
      paymentStatus: paymentStatus || 'Pending',
      paidAmount: Number(paidAmount) || (paymentStatus === 'Paid' ? totalAmount : 0),
      orderStatus: orderStatus || 'Ordered',
      stockReceived: isImmediatelyReceived,
      receivedDate: isImmediatelyReceived ? new Date() : null,
      expectedDeliveryDate: expectedDeliveryDate || null,
      notes: notes || '',
    });

    await po.save();

    // AUTOMATIC STOCK UPDATE IF STATUS IS RECEIVED
    if (isImmediatelyReceived) {
      await applyPurchaseStockUpdate(po, req.user ? req.user.name : 'Procurement Manager');
    }

    // Record payment if paid
    if (po.paidAmount > 0) {
      await Payment.create({
        transactionId: `TXN-SUP-${Date.now()}`,
        type: 'SUPPLIER_PAYOUT',
        referenceOrder: po.poNumber,
        partyName: po.supplierName,
        amount: po.paidAmount,
        method: 'Bank Transfer',
        status: 'Success',
        notes: `PO payment to ${po.supplierName}`,
      });
    }

    res.status(201).json({ success: true, order: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Receive Purchase Order -> Updates inventory automatically!
// @route   POST /api/procurement/purchases/:id/receive
const receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    if (po.stockReceived) {
      return res.status(400).json({ success: false, message: 'Stock for this PO has already been received' });
    }

    // AUTOMATIC STOCK UPDATE
    await applyPurchaseStockUpdate(po, req.user ? req.user.name : 'Procurement Manager');

    po.orderStatus = 'Received';
    po.stockReceived = true;
    po.receivedDate = new Date();
    await po.save();

    res.json({
      success: true,
      message: `Purchase Order ${po.poNumber} received. Inventory stock successfully increased!`,
      order: po,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update PO payment status
// @route   PUT /api/procurement/purchases/:id/payment
const updatePurchasePayment = async (req, res) => {
  try {
    const { paymentStatus, paidAmount } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    po.paymentStatus = paymentStatus || po.paymentStatus;
    if (paidAmount !== undefined) {
      po.paidAmount = Number(paidAmount);
    }
    await po.save();

    res.json({ success: true, order: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  updatePurchasePayment,
};
