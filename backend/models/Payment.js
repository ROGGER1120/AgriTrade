const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['CUSTOMER_SALE', 'SUPPLIER_PAYOUT'],
    required: true,
  },
  referenceOrder: {
    type: String, // Order Number or PO Number
    required: true,
  },
  partyName: {
    type: String, // Customer or Supplier Name
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    enum: ['Cash on Delivery', 'Online Payment (UPI/Card)', 'Store Credit', 'Bank Transfer', 'Cheque'],
    default: 'Cash on Delivery',
  },
  status: {
    type: String,
    enum: ['Success', 'Pending', 'Failed', 'Refunded'],
    default: 'Success',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
