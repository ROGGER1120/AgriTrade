// Centralized API client for AgriTrade

const BASE_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('agritrade_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQuery = (params = {}) => {
  const cleaned = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'undefined') {
      cleaned[key] = params[key];
    }
  });
  const q = new URLSearchParams(cleaned).toString();
  return q ? `?${q}` : '';
};

export const api = {
  // Products & Inventory
  getProducts: async (params = {}) => {
    const res = await fetch(`${BASE_URL}/products${buildQuery(params)}`);
    return res.json();
  },

  getProduct: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return res.json();
  },

  createProduct: async (data) => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateProduct: async (id, data) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  adjustStock: async (id, quantityChange, reason) => {
    const res = await fetch(`${BASE_URL}/products/${id}/adjust-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ quantityChange, reason }),
    });
    return res.json();
  },

  getCategoriesSummary: async () => {
    const res = await fetch(`${BASE_URL}/products/categories/summary`);
    return res.json();
  },

  getStockMovements: async () => {
    const res = await fetch(`${BASE_URL}/products/movements/history`);
    return res.json();
  },

  // Procurement & Suppliers
  getSuppliers: async () => {
    const res = await fetch(`${BASE_URL}/procurement/suppliers`);
    return res.json();
  },

  createSupplier: async (data) => {
    const res = await fetch(`${BASE_URL}/procurement/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateSupplier: async (id, data) => {
    const res = await fetch(`${BASE_URL}/procurement/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteSupplier: async (id) => {
    const res = await fetch(`${BASE_URL}/procurement/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  getPurchaseOrders: async () => {
    const res = await fetch(`${BASE_URL}/procurement/purchases`);
    return res.json();
  },

  createPurchaseOrder: async (data) => {
    const res = await fetch(`${BASE_URL}/procurement/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  receivePurchaseOrder: async (id) => {
    const res = await fetch(`${BASE_URL}/procurement/purchases/${id}/receive`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  updatePurchasePayment: async (id, data) => {
    const res = await fetch(`${BASE_URL}/procurement/purchases/${id}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Sales Orders & POS
  getOrders: async (params = {}) => {
    const res = await fetch(`${BASE_URL}/orders${buildQuery(params)}`);
    return res.json();
  },

  getOrder: async (id) => {
    const res = await fetch(`${BASE_URL}/orders/${id}`);
    return res.json();
  },

  createOrder: async (data) => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateOrderStatus: async (id, orderStatus) => {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ orderStatus }),
    });
    return res.json();
  },

  updateOrderPayment: async (id, paymentStatus, paymentMethod) => {
    const res = await fetch(`${BASE_URL}/orders/${id}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ paymentStatus, paymentMethod }),
    });
    return res.json();
  },

  // Customers
  getCustomers: async (params = {}) => {
    const res = await fetch(`${BASE_URL}/customers${buildQuery(params)}`);
    return res.json();
  },

  getCustomer: async (id) => {
    const res = await fetch(`${BASE_URL}/customers/${id}`);
    return res.json();
  },

  createCustomer: async (data) => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Reports
  getDashboardMetrics: async () => {
    const res = await fetch(`${BASE_URL}/reports/dashboard`);
    return res.json();
  },

  getSalesReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/sales`);
    return res.json();
  },

  getInventoryReport: async () => {
    const res = await fetch(`${BASE_URL}/reports/inventory`);
    return res.json();
  },

  getPayments: async () => {
    const res = await fetch(`${BASE_URL}/reports/payments`);
    return res.json();
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  demoLogin: async (role = 'admin') => {
    const res = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },
};
