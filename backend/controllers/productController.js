const Product = require('../models/Product');
const Category = require('../models/Category');
const StockMovement = require('../models/StockMovement');

// @desc    Get all products with category, status and search filters
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'All' && category !== 'All Items' && category !== 'undefined') {
      const singular = category.replace(/s$/i, '');
      query.category = { $regex: new RegExp(`^(${category}|${singular})$`, 'i') };
    }

    if (status && status !== 'All' && status !== 'undefined') {
      query.status = status;
    }

    if (search && search.trim() !== '' && search !== 'undefined') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unit,
      costPrice,
      sellingPrice,
      currentStock,
      maxStockLevel,
      minStockLevel,
      criticalStockLevel,
      location,
      description,
      image,
    } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }

    const product = new Product({
      name,
      sku: sku.toUpperCase(),
      category,
      unit: unit || 'units',
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      currentStock: Number(currentStock) || 0,
      maxStockLevel: Number(maxStockLevel) || 100,
      minStockLevel: Number(minStockLevel) || 20,
      criticalStockLevel: Number(criticalStockLevel) || 10,
      location: location || 'Barn A',
      description: description || '',
      image: image || '',
    });

    product.calculateStatus();
    await product.save();

    // Log initial stock movement if > 0
    if (product.currentStock > 0) {
      await StockMovement.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'MANUAL_ADJUSTMENT',
        quantityChange: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        referenceId: 'INITIAL_STOCK',
        reason: 'Initial inventory creation',
        performedBy: req.user ? req.user.name : 'Admin',
      });
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = [
      'name',
      'category',
      'unit',
      'costPrice',
      'sellingPrice',
      'maxStockLevel',
      'minStockLevel',
      'criticalStockLevel',
      'location',
      'description',
      'image',
      'isEcommerceActive',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const existing = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'SKU already in use' });
      }
      product.sku = req.body.sku.toUpperCase();
    }

    product.calculateStatus();
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual stock adjustment
// @route   POST /api/products/:id/adjust-stock
const adjustStock = async (req, res) => {
  try {
    const { quantityChange, reason } = req.body;
    const change = Number(quantityChange);

    if (isNaN(change) || change === 0) {
      return res.status(400).json({ success: false, message: 'Valid non-zero quantity change is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.currentStock;
    const newStock = Math.max(0, previousStock + change);

    product.currentStock = newStock;
    product.calculateStatus();
    await product.save();

    // Record stock movement log
    const movement = await StockMovement.create({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      type: 'MANUAL_ADJUSTMENT',
      quantityChange: newStock - previousStock,
      previousStock,
      newStock,
      referenceId: 'MANUAL',
      reason: reason || 'Inventory manual adjustment',
      performedBy: req.user ? req.user.name : 'Admin',
    });

    res.json({
      success: true,
      message: `Stock adjusted by ${change > 0 ? '+' : ''}${change}`,
      product,
      movement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get categories with dynamic item counts for pill navigation
// @route   GET /api/products/categories/summary
const getCategoriesSummary = async (req, res) => {
  try {
    const defaultCategories = ['Fertilizers', 'Seeds', 'Chemicals', 'Fuel', 'Equipment', 'Feed', 'Other'];
    const totalCount = await Product.countDocuments();

    const counts = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      if (item._id) {
        const key = item._id.toLowerCase();
        countMap[key] = (countMap[key] || 0) + item.count;
      }
    });

    const categoryList = [
      { name: 'All Items', count: totalCount },
      ...defaultCategories.map((cat) => {
        const lower = cat.toLowerCase();
        const singular = lower.replace(/s$/i, '');
        let count = (countMap[lower] || 0) + (lower !== singular ? (countMap[singular] || 0) : 0);
        if (cat === 'Chemicals') {
          count += (countMap['pesticide'] || 0) + (countMap['pesticides'] || 0);
        }
        return {
          name: cat,
          count,
        };
      }),
    ];

    res.json({ success: true, categories: categoryList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock movement history
// @route   GET /api/products/movements/history
const getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, count: movements.length, movements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getCategoriesSummary,
  getStockMovements,
};
