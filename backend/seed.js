const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const PurchaseOrder = require('./models/PurchaseOrder');
const SalesOrder = require('./models/SalesOrder');
const StockMovement = require('./models/StockMovement');
const Payment = require('./models/Payment');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritrade');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await SalesOrder.deleteMany({});
    await StockMovement.deleteMany({});
    await Payment.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Users
    const admin = await User.create({
      name: 'Admin Manager',
      email: 'admin@agritrade.com',
      password: 'admin123password',
      role: 'admin',
      phone: '+91 98401 22334',
      address: '74 Agri Central Hub, Market Yard',
      city: 'Coimbatore',
    });

    const customers = await User.create([
      {
        name: 'Ramesh Kumar',
        email: 'ramesh.farmer@gmail.com',
        password: 'farmer123password',
        role: 'farmer',
        phone: '+91 94432 11029',
        address: '12 Temple Street, Aliyar Valley',
        city: 'Pollachi',
        farmDetails: { farmName: 'Aliyar Green Valley Farm', acreage: 15, primaryCrop: 'Sugarcane & Paddy' },
      },
      {
        name: 'Anitha Sundaram',
        email: 'anitha.organics@gmail.com',
        password: 'farmer123password',
        role: 'farmer',
        phone: '+91 98940 33821',
        address: '45 Orchard Lane',
        city: 'Salem',
        farmDetails: { farmName: 'Sundaram Organic Orchards', acreage: 8, primaryCrop: 'Mango & Guava' },
      },
      {
        name: 'Suresh Patel',
        email: 'suresh.patel@agro.in',
        password: 'farmer123password',
        role: 'farmer',
        phone: '+91 97234 88120',
        address: 'Kisan Marg, Sector 4',
        city: 'Erode',
        farmDetails: { farmName: 'Shreeji Cotton Farm', acreage: 22, primaryCrop: 'Cotton & Maize' },
      },
      {
        name: 'Muthu Velan',
        email: 'muthu.cauvery@gmail.com',
        password: 'farmer123password',
        role: 'customer',
        phone: '+91 98412 99043',
        address: 'Delta Canal Bank Road',
        city: 'Thanjavur',
        farmDetails: { farmName: 'Cauvery Riverbed Farm', acreage: 12, primaryCrop: 'Paddy & Blackgram' },
      },
    ]);

    // 2. Categories
    const categories = await Category.create([
      { name: 'Feed', slug: 'feed', description: 'Cattle & livestock nutritious feed', icon: 'Box', color: '#f59e0b' },
      { name: 'Fertilizers', slug: 'fertilizers', description: 'Organic & chemical fertilizers for soil enrichment', icon: 'Sprout', color: '#10b981' },
      { name: 'Seeds', slug: 'seeds', description: 'Certified high-yield crop seeds', icon: 'Wheat', color: '#eab308' },
      { name: 'Chemicals', slug: 'chemicals', description: 'Pesticides, fungicides and plant protection', icon: 'FlaskConical', color: '#ef4444' },
      { name: 'Fuel', slug: 'fuel', description: 'Farm tractor and generator diesel & lubricants', icon: 'Fuel', color: '#f97316' },
      { name: 'Equipment', slug: 'equipment', description: 'Tools, sprayers and irrigation equipment', icon: 'Wrench', color: '#6366f1' },
      { name: 'Other', slug: 'other', description: 'General agricultural consumables & twine', icon: 'Package', color: '#8b5cf6' },
    ]);

    // 3. Products (Matching user's reference image data exactly!)
    const productsData = [
      {
        name: 'Hay bales',
        sku: 'HAY-BAL-01',
        category: 'Feed',
        unit: 'units',
        costPrice: 120,
        sellingPrice: 180,
        currentStock: 58,
        maxStockLevel: 200,
        minStockLevel: 70,
        criticalStockLevel: 20,
        location: 'Loft',
        description: 'Dry cured Timothy & alfalfa grass hay bales for cattle livestock feed.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Compost',
        sku: 'CMP-ORG-02',
        category: 'Fertilizer',
        unit: 'kg',
        costPrice: 8,
        sellingPrice: 14,
        currentStock: 1200,
        maxStockLevel: 3000,
        minStockLevel: 1500,
        criticalStockLevel: 500,
        location: 'Pile West',
        description: 'Aged vermicompost packed with beneficial microbial bacteria.',
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'NPK 10-10-10',
        sku: 'NPK-BAL-03',
        category: 'Fertilizer',
        unit: 'kg',
        costPrice: 28,
        sellingPrice: 42,
        currentStock: 180,
        maxStockLevel: 500,
        minStockLevel: 250,
        criticalStockLevel: 50,
        location: 'Shed 1',
        description: 'Balanced Nitrogen-Phosphorus-Potassium complex fertilizer granules.',
        image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Diesel fuel',
        sku: 'DSL-AGR-04',
        category: 'Fuel',
        unit: 'L',
        costPrice: 88,
        sellingPrice: 98,
        currentStock: 640,
        maxStockLevel: 1500,
        minStockLevel: 800,
        criticalStockLevel: 200,
        location: 'Tank East',
        description: 'High cetane agricultural machinery fuel for tractors and pump sets.',
        image: 'https://images.unsplash.com/photo-1545063914-a1a6ec821c88?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Glyphosate',
        sku: 'GLY-PST-05',
        category: 'Chemicals',
        unit: 'L',
        costPrice: 320,
        sellingPrice: 460,
        currentStock: 24,
        maxStockLevel: 80,
        minStockLevel: 30,
        criticalStockLevel: 10,
        location: 'Locker',
        description: 'Systemic broad-spectrum herbicide for weed control prior to seeding.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Corn seed',
        sku: 'CRN-SD-06',
        category: 'Seeds',
        unit: 'kg',
        costPrice: 140,
        sellingPrice: 210,
        currentStock: 95,
        maxStockLevel: 400,
        minStockLevel: 120,
        criticalStockLevel: 100,
        location: 'Barn A',
        description: 'Hybrid high-yielding maize seed, drought-resistant variety.',
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Wheat seed',
        sku: 'WHT-SD-07',
        category: 'Seeds',
        unit: 'kg',
        costPrice: 65,
        sellingPrice: 95,
        currentStock: 420,
        maxStockLevel: 1000,
        minStockLevel: 500,
        criticalStockLevel: 150,
        location: 'Barn A',
        description: 'Certified Lokwan durum wheat grains with 98% germination rate.',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=60',
      },
      // Additional rich catalog items:
      {
        name: 'Urea 46% Nitrogen',
        sku: 'URE-FER-08',
        category: 'Fertilizer',
        unit: 'kg',
        costPrice: 18,
        sellingPrice: 26,
        currentStock: 1650,
        maxStockLevel: 2500,
        minStockLevel: 500,
        criticalStockLevel: 200,
        location: 'Shed 2',
        description: 'High nitrogen white prilled fertilizer for vegetative plant growth.',
        image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Knapsack Battery Sprayer 16L',
        sku: 'SPR-EQP-09',
        category: 'Equipment',
        unit: 'units',
        costPrice: 1800,
        sellingPrice: 2450,
        currentStock: 18,
        maxStockLevel: 30,
        minStockLevel: 5,
        criticalStockLevel: 2,
        location: 'Tool Shed',
        description: 'Rechargeable 12V 8Ah battery pressure sprayer with adjustable brass nozzle.',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Drip Irrigation Pipe 16mm',
        sku: 'DRP-EQP-10',
        category: 'Equipment',
        unit: 'units',
        costPrice: 850,
        sellingPrice: 1200,
        currentStock: 35,
        maxStockLevel: 50,
        minStockLevel: 10,
        criticalStockLevel: 5,
        location: 'Barn B',
        description: 'UV stabilized 400 meter coil with 40cm emitter spacing.',
        image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Neem Bio-Pesticide 10000 PPM',
        sku: 'NEM-PST-11',
        category: 'Chemicals',
        unit: 'L',
        costPrice: 410,
        sellingPrice: 580,
        currentStock: 65,
        maxStockLevel: 100,
        minStockLevel: 20,
        criticalStockLevel: 10,
        location: 'Chemical Room',
        description: 'Cold-pressed azadirachtin botanical pesticide for organic pest management.',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=60',
      },
      {
        name: 'Baling Twine Heavy Duty',
        sku: 'TWN-OTH-12',
        category: 'Other',
        unit: 'units',
        costPrice: 220,
        sellingPrice: 340,
        currentStock: 48,
        maxStockLevel: 80,
        minStockLevel: 15,
        criticalStockLevel: 5,
        location: 'Loft Shelf',
        description: 'High tensile poly twine for square and round straw baling.',
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=60',
      },
    ];

    const products = [];
    for (const p of productsData) {
      const prod = new Product(p);
      prod.calculateStatus();
      await prod.save();
      products.push(prod);

      // Create initial stock movement log
      await StockMovement.create({
        product: prod._id,
        productName: prod.name,
        sku: prod.sku,
        type: 'MANUAL_ADJUSTMENT',
        quantityChange: prod.currentStock,
        previousStock: 0,
        newStock: prod.currentStock,
        referenceId: 'INITIAL_STOCK',
        reason: 'Initial warehouse inventory audit',
        performedBy: 'Farm Admin',
      });
    }

    console.log(`Created ${products.length} agricultural products with calculated status.`);

    // 4. Suppliers
    const suppliers = await Supplier.create([
      {
        name: 'GreenFields Agro Supply Corp',
        contactPerson: 'David Ramanathan',
        email: 'sales@greenfieldsagro.com',
        phone: '+91 94441 55001',
        address: 'Plot 18, Industrial Estate',
        city: 'Coimbatore',
        taxId: '33AABCG1234F1Z9',
        categoriesSupplied: ['Fertilizer', 'Feed'],
        balanceDue: 0,
        rating: 4.9,
      },
      {
        name: 'Krishi Vigyan Seeds Ltd',
        contactPerson: 'Sanjay Deshmukh',
        email: 'supply@krishivigyan.org',
        phone: '+91 98220 44102',
        address: 'National Seed Park, Bypass Rd',
        city: 'Nagpur',
        taxId: '27AABCK5678B1Z2',
        categoriesSupplied: ['Seeds'],
        balanceDue: 12500,
        rating: 4.8,
      },
      {
        name: 'Apex Petro & Fuels Terminal',
        contactPerson: 'Manish Chawla',
        email: 'distributor@apexpetro.com',
        phone: '+91 98110 33490',
        address: 'Depot 4, Harbour Road',
        city: 'Chennai',
        taxId: '33AABCA9012K1ZY',
        categoriesSupplied: ['Fuel'],
        balanceDue: 0,
        rating: 4.7,
      },
      {
        name: 'Kaveri Agri Mechanization Hub',
        contactPerson: 'R. Senthil Nathan',
        email: 'service@kaveriagri.in',
        phone: '+91 98422 77011',
        address: 'Agri Machinery Complex, Ring Road',
        city: 'Trichy',
        taxId: '33AABCK3456N1ZX',
        categoriesSupplied: ['Equipment', 'Chemicals'],
        balanceDue: 4500,
        rating: 4.9,
      },
    ]);

    // 5. Purchase Orders
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-2026-0001',
      supplier: suppliers[0]._id,
      supplierName: suppliers[0].name,
      items: [
        {
          product: products[1]._id, // Compost
          productName: products[1].name,
          sku: products[1].sku,
          quantity: 1000,
          unitCost: products[1].costPrice,
          totalCost: 1000 * products[1].costPrice,
          unit: products[1].unit,
        },
        {
          product: products[2]._id, // NPK 10-10-10
          productName: products[2].name,
          sku: products[2].sku,
          quantity: 200,
          unitCost: products[2].costPrice,
          totalCost: 200 * products[2].costPrice,
          unit: products[2].unit,
        },
      ],
      totalAmount: 1000 * 8 + 200 * 28, // 8000 + 5600 = 13600
      paymentStatus: 'Paid',
      paidAmount: 13600,
      orderStatus: 'Received',
      stockReceived: true,
      receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Spring season soil preparation procurement',
    });

    const po2 = await PurchaseOrder.create({
      poNumber: 'PO-2026-0002',
      supplier: suppliers[1]._id,
      supplierName: suppliers[1].name,
      items: [
        {
          product: products[5]._id, // Corn seed
          productName: products[5].name,
          sku: products[5].sku,
          quantity: 150,
          unitCost: products[5].costPrice,
          totalCost: 150 * products[5].costPrice,
          unit: products[5].unit,
        },
      ],
      totalAmount: 150 * 140, // 21000
      paymentStatus: 'Partial',
      paidAmount: 10000,
      orderStatus: 'Ordered',
      stockReceived: false,
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'High demand hybrid seed restocking',
    });

    // 6. Sales Orders
    const so1 = await SalesOrder.create({
      orderNumber: 'SO-2026-0101',
      customer: customers[0]._id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      shippingAddress: customers[0].address,
      city: customers[0].city,
      channel: 'POS_COUNTER',
      items: [
        {
          product: products[0]._id, // Hay bales
          productName: products[0].name,
          sku: products[0].sku,
          quantity: 10,
          unitPrice: products[0].sellingPrice,
          total: 10 * products[0].sellingPrice,
          unit: products[0].unit,
        },
        {
          product: products[7]._id, // Urea
          productName: products[7].name,
          sku: products[7].sku,
          quantity: 100,
          unitPrice: products[7].sellingPrice,
          total: 100 * products[7].sellingPrice,
          unit: products[7].unit,
        },
      ],
      subtotal: 10 * 180 + 100 * 26, // 1800 + 2600 = 4400
      discount: 100,
      tax: 215,
      finalTotal: 4515,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      stockDeducted: true,
      invoiceNumber: 'INV-2026-0101',
      invoiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Farmer counter purchase with farm vehicle delivery',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const so2 = await SalesOrder.create({
      orderNumber: 'SO-2026-0102',
      customer: customers[1]._id,
      customerName: customers[1].name,
      customerEmail: customers[1].email,
      customerPhone: customers[1].phone,
      shippingAddress: customers[1].address,
      city: customers[1].city,
      channel: 'ECOMMERCE_WEB',
      items: [
        {
          product: products[1]._id, // Compost
          productName: products[1].name,
          sku: products[1].sku,
          quantity: 200,
          unitPrice: products[1].sellingPrice,
          total: 200 * products[1].sellingPrice,
          unit: products[1].unit,
        },
        {
          product: products[10]._id, // Neem bio pesticide
          productName: products[10].name,
          sku: products[10].sku,
          quantity: 5,
          unitPrice: products[10].sellingPrice,
          total: 5 * products[10].sellingPrice,
          unit: products[10].unit,
        },
      ],
      subtotal: 200 * 14 + 5 * 580, // 2800 + 2900 = 5700
      discount: 200,
      tax: 275,
      finalTotal: 5775,
      paymentMethod: 'Online Payment (UPI/Card)',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      stockDeducted: true,
      invoiceNumber: 'INV-2026-0102',
      invoiceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Online store direct delivery to organic orchard',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    const so3 = await SalesOrder.create({
      orderNumber: 'SO-2026-0103',
      customer: customers[2]._id,
      customerName: customers[2].name,
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
      shippingAddress: customers[2].address,
      city: customers[2].city,
      channel: 'POS_COUNTER',
      items: [
        {
          product: products[8]._id, // Sprayer
          productName: products[8].name,
          sku: products[8].sku,
          quantity: 1,
          unitPrice: products[8].sellingPrice,
          total: products[8].sellingPrice,
          unit: products[8].unit,
        },
        {
          product: products[4]._id, // Glyphosate
          productName: products[4].name,
          sku: products[4].sku,
          quantity: 4,
          unitPrice: products[4].sellingPrice,
          total: 4 * products[4].sellingPrice,
          unit: products[4].unit,
        },
      ],
      subtotal: 2450 + 4 * 460, // 2450 + 1840 = 4290
      discount: 90,
      tax: 210,
      finalTotal: 4410,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      stockDeducted: true,
      invoiceNumber: 'INV-2026-0103',
      invoiceDate: new Date(),
      notes: 'Counter POS sale awaiting COD dispatch',
      createdAt: new Date(),
    });

    // 7. Payments
    await Payment.create([
      {
        transactionId: 'TXN-ORD-0101',
        type: 'CUSTOMER_SALE',
        referenceOrder: 'SO-2026-0101',
        partyName: customers[0].name,
        amount: 4515,
        method: 'Cash on Delivery',
        status: 'Success',
      },
      {
        transactionId: 'TXN-ORD-0102',
        type: 'CUSTOMER_SALE',
        referenceOrder: 'SO-2026-0102',
        partyName: customers[1].name,
        amount: 5775,
        method: 'Online Payment (UPI/Card)',
        status: 'Success',
      },
      {
        transactionId: 'TXN-SUP-0001',
        type: 'SUPPLIER_PAYOUT',
        referenceOrder: 'PO-2026-0001',
        partyName: suppliers[0].name,
        amount: 13600,
        method: 'Bank Transfer',
        status: 'Success',
      },
    ]);

    console.log('✅ AgriTrade database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
