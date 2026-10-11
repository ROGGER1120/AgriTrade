const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
  },
  type: {
    type: String,
    enum: [
      'PURCHASE_RECEIPT',
      'SALE_DEDUCTION',
      'ORDER_CANCELLED_RESTOCK',
      'MANUAL_ADJUSTMENT'
    ],
    required: true,
  },
  quantityChange: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: String,
    default: 'MANUAL',
  },
  reason: {
    type: String,
    default: '',
  },
  performedBy: {
    type: String,
    default: 'System',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
