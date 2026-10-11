import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  Printer,
  Sparkles,
  X,
  CreditCard,
  User,
  Trash2,
} from 'lucide-react';
import { api } from '../api/client';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export const SalesView = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'pos'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [notification, setNotification] = useState(null);

  // POS State
  const [posCustomerName, setPosCustomerName] = useState('Ramesh Kumar');
  const [posCustomerPhone, setPosCustomerPhone] = useState('+91 94432 11029');
  const [posAddress, setPosAddress] = useState('Farm Counter Pickup');
  const [posItems, setPosItems] = useState([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState('Cash on Delivery');
  const [posPaymentStatus, setPosPaymentStatus] = useState('Paid');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, custRes] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getCustomers(),
      ]);

      if (ordRes.success) setOrders(ordRes.orders);
      if (prodRes.success) setProducts(prodRes.products);
      if (custRes.success) setCustomers(custRes.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Add product to POS basket
  const handleAddPosProduct = (prod) => {
    if (prod.currentStock <= 0) {
      alert(`Cannot add ${prod.name}: Out of Stock!`);
      return;
    }

    setPosItems((prev) => {
      const existing = prev.find((item) => item._id === prod._id);
      if (existing) {
        if (existing.quantity >= prod.currentStock) {
          alert(`Maximum available stock reached for ${prod.name} (${prod.currentStock} ${prod.unit})`);
          return prev;
        }
        return prev.map((item) =>
          item._id === prod._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...prod, quantity: 1 }];
      }
    });
  };

  const handleUpdatePosQty = (prodId, delta) => {
    setPosItems((prev) =>
      prev
        .map((item) => {
          if (item._id === prodId) {
            const newQty = item.quantity + delta;
            if (newQty > item.currentStock) {
              alert(`Cannot exceed stock level of ${item.currentStock} ${item.unit}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemovePosItem = (prodId) => {
    setPosItems((prev) => prev.filter((item) => item._id !== prodId));
  };

  // Calculations
  const posSubtotal = posItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const posTax = Math.round((posSubtotal - Number(posDiscount || 0)) * 0.05 * 100) / 100;
  const posTotal = Math.max(0, posSubtotal - Number(posDiscount || 0) + posTax);

  // Submit POS Order -> automatically decrements stock!
  const handleCompletePosOrder = async (e) => {
    e.preventDefault();
    if (posItems.length === 0) {
      alert('Please add at least one product to the POS basket.');
      return;
    }

    try {
      const orderPayload = {
        customerName: posCustomerName,
        customerPhone: posCustomerPhone,
        shippingAddress: posAddress,
        channel: 'POS_COUNTER',
        items: posItems.map((item) => ({
          productId: item._id,
          productName: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          unit: item.unit,
        })),
        discount: Number(posDiscount || 0),
        taxRate: 0.05,
        paymentMethod: posPaymentMethod,
        paymentStatus: posPaymentStatus,
        orderStatus: 'Confirmed',
      };

      const res = await api.createOrder(orderPayload);
      if (res.success) {
        showNotification(`🎉 Order ${res.order.orderNumber} created! Stock automatically reduced.`);
        setPosItems([]);
        setPosDiscount(0);
        setActiveTab('orders');
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating sales order');
    }
  };

  // Status progression workflow
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showNotification(
          newStatus === 'Cancelled'
            ? 'Order Cancelled: Reserved stock has been automatically restocked to inventory!'
            : `Order status updated to ${newStatus}`
        );
        loadData();
        if (selectedOrderForModal && selectedOrderForModal._id === orderId) {
          setSelectedOrderForModal(res.order);
        }
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#191815] text-[#f59e0b] border border-amber-500/30 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1d19] tracking-tight">
            Sales & Orders Management
          </h1>
          <p className="text-sm text-[#7e786d] mt-0.5">
            Create sales orders, automate stock deductions, track orders & generate PDF invoices
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs ${
              activeTab === 'pos'
                ? 'bg-[#f59e0b] text-[#1c1914]'
                : 'bg-white border border-[#e5e2db] text-[#33302a] hover:bg-[#f6f5f1]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Counter</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs ${
              activeTab === 'orders'
                ? 'bg-[#f59e0b] text-[#1c1914]'
                : 'bg-white border border-[#e5e2db] text-[#33302a] hover:bg-[#f6f5f1]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>View All Orders</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: POS COUNTER */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Product Selection Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-[#ece8df] shadow-2xs">
              <h2 className="text-sm font-bold text-[#1f1d19] mb-3">
                Click Product to Add to Counter Basket:
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const isOutOfStock = p.currentStock <= 0;
                  return (
                    <button
                      key={p._id}
                      disabled={isOutOfStock}
                      onClick={() => handleAddPosProduct(p)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isOutOfStock
                          ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-[#faf9f5] border-[#ece8df] hover:border-amber-400 hover:bg-[#fffdfa]'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase">
                          {p.category}
                        </span>
                        <p className="font-bold text-xs text-[#1f1d19] line-clamp-1 mt-0.5">
                          {p.name}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#1f1d19]">
                          ₹{p.sellingPrice}
                          <span className="text-[10px] font-normal text-[#857f73]">/{p.unit}</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            p.currentStock <= p.minStockLevel
                              ? 'bg-red-50 text-red-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {p.currentStock} left
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: POS Cart & Checkout */}
          <div className="bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
                <h2 className="text-base font-bold text-[#1f1d19]">
                  Counter Sale Basket ({posItems.length})
                </h2>
                {posItems.length > 0 && (
                  <button
                    onClick={() => setPosItems([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Details */}
              <div className="mt-4 space-y-2 text-xs">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-0.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    placeholder="Farmer / Buyer Name"
                    className="w-full px-3 py-1.5 border border-[#e5e2db] rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#524e45] font-semibold mb-0.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-1.5 border border-[#e5e2db] rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Basket Items List */}
              <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto">
                {posItems.length === 0 ? (
                  <p className="text-center py-8 text-xs text-[#8f897e]">
                    Click items on the left to add to sale counter.
                  </p>
                ) : (
                  posItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-2.5 bg-[#faf9f5] border border-[#ece8df] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[#1f1d19] truncate">{item.name}</p>
                        <p className="text-[10px] text-[#787265]">
                          ₹{item.sellingPrice} × {item.quantity} = ₹{item.sellingPrice * item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdatePosQty(item._id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-[#e2ded6] flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdatePosQty(item._id, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-[#e2ded6] flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemovePosItem(item._id)}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations and Actions */}
            <div className="pt-4 border-t border-[#ece8df] space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#615c52]">
                <span>Subtotal:</span>
                <span>₹{posSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#615c52]">Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={posDiscount}
                  onChange={(e) => setPosDiscount(e.target.value)}
                  className="w-20 px-2 py-1 border border-[#e5e2db] rounded-lg text-right font-bold"
                />
              </div>

              <div className="flex items-center justify-between text-[#615c52]">
                <span>GST (5%):</span>
                <span>+ ₹{posTax.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-base font-extrabold text-[#1f1d19] pt-2 border-t border-[#ece8df]">
                <span>Total Amount:</span>
                <span className="text-amber-600">₹{posTotal.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="block text-[10px] text-[#716c62] mb-0.5">Method</label>
                  <select
                    value={posPaymentMethod}
                    onChange={(e) => setPosPaymentMethod(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e5e2db] rounded-xl text-xs bg-white"
                  >
                    <option value="Cash on Delivery">Cash Counter</option>
                    <option value="Online Payment (UPI/Card)">UPI / QR Pay</option>
                    <option value="Store Credit">Store Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#716c62] mb-0.5">Status</label>
                  <select
                    value={posPaymentStatus}
                    onChange={(e) => setPosPaymentStatus(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#e5e2db] rounded-xl text-xs bg-white"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Pending">Payment Pending</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompletePosOrder}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl transition shadow-xs text-sm mt-2"
              >
                Complete Sale & Deduct Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8f897e] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order #, invoice #, customer name or phone..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs text-[#2a2722] placeholder-[#9c9588] focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs font-medium text-[#423f38]"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#ece9e2] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#ece8df] text-[11px] font-bold text-[#8a8477] uppercase bg-[#faf9f6]">
                    <th className="py-3.5 px-6">Order / Invoice #</th>
                    <th className="py-3.5 px-6">Customer & Phone</th>
                    <th className="py-3.5 px-6">Items Purchased</th>
                    <th className="py-3.5 px-6">Final Total</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Order Status Workflow</th>
                    <th className="py-3.5 px-6 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2efe8]">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-[#8e897e]">
                        Loading sales orders...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-[#8e897e]">
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-[#fbfaf7] transition">
                        <td className="py-4 px-6 font-bold text-[#1f1d19]">
                          <div className="flex items-center gap-1.5">
                            <span>{ord.orderNumber}</span>
                          </div>
                          <p className="text-[10px] text-[#918b7f] font-normal mt-0.5">
                            {ord.invoiceNumber || 'INV-2026'} • {new Date(ord.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-semibold text-[#1f1d19]">{ord.customerName}</p>
                          <p className="text-[11px] text-[#787265] mt-0.5">{ord.customerPhone}</p>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {ord.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-[#f4f2eb] px-2 py-0.5 rounded-md text-[11px] mr-1.5 text-[#423f38]"
                              >
                                {item.productName}: <b>{item.quantity} {item.unit}</b>
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold text-[#1f1d19]">
                          ₹{(ord.finalTotal || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              ord.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                          <p className="text-[10px] text-[#8e897e] mt-1">{ord.paymentMethod}</p>
                        </td>

                        {/* Interactive Workflow dropdown */}
                        <td className="py-4 px-6">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled (Auto-Restock)</option>
                          </select>
                        </td>

                        {/* 1-Click PDF Invoice Download */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => generateInvoicePDF(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] hover:bg-amber-50 text-amber-700 hover:text-amber-800 border border-amber-300 font-semibold rounded-xl text-xs transition shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
