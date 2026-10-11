const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    default: 'units', // 'units', 'kg', 'L', 'bags', 'packs'
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  maxStockLevel: {
    type: Number,
    required: true,
    default: 100,
    min: 1,
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 25,
    min: 0,
  },
  criticalStockLevel: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
  },
  location: {
    type: String,
    default: 'Barn A', // 'Loft', 'Pile West', 'Shed 1', 'Tank East', 'Locker', 'Barn A'
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Critical', 'Out of Stock'],
    default: 'In Stock',
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  isEcommerceActive: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Helper function to update status
productSchema.methods.calculateStatus = function () {
  if (this.currentStock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.currentStock <= this.criticalStockLevel) {
    this.status = 'Critical';
  } else if (this.currentStock <= this.minStockLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  return this.status;
};

productSchema.pre('save', function () {
  this.calculateStatus();
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Product', productSchema);
