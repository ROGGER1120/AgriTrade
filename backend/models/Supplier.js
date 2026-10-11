const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  taxId: {
    type: String, // GSTIN or Tax Reg No.
    default: '',
  },
  categoriesSupplied: [{
    type: String,
  }],
  balanceDue: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5,
  },
  paymentTerms: {
    type: String,
    default: 'Net 30',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Supplier', supplierSchema);
