const User = require('../models/User');
const SalesOrder = require('../models/SalesOrder');

// @desc    Get all customers with their order summary metrics
// @route   GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: { $in: ['customer', 'farmer'] } };

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const customers = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Aggregate orders for each customer
    const customerIds = customers.map((c) => c._id);
    const orderAggregates = await SalesOrder.aggregate([
      { $match: { customer: { $in: customerIds } } },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$finalTotal' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
    ]);

    const orderStatsMap = {};
    orderAggregates.forEach((agg) => {
      orderStatsMap[agg._id.toString()] = agg;
    });

    const enrichedCustomers = customers.map((c) => {
      const stats = orderStatsMap[c._id.toString()] || {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
      };
      return {
        ...c.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    res.json({ success: true, count: enrichedCustomers.length, customers: enrichedCustomers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer profile and full order history
// @route   GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const orders = await SalesOrder.find({
      $or: [
        { customer: customer._id },
        { customerPhone: customer.phone },
        { customerEmail: customer.email },
      ],
    }).sort({ createdAt: -1 });

    const totalSpent = orders.reduce((sum, ord) => sum + (ord.finalTotal || 0), 0);

    res.json({
      success: true,
      customer,
      totalOrders: orders.length,
      totalSpent,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, city, farmDetails } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
    }

    const customer = await User.create({
      name,
      email,
      password: 'farmer123password',
      role: 'customer',
      phone: phone || '',
      address: address || '',
      city: city || '',
      farmDetails: farmDetails || {},
    });

    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const fields = ['name', 'phone', 'address', 'city', 'farmDetails'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) customer[f] = req.body[f];
    });

    await customer.save();
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
};
