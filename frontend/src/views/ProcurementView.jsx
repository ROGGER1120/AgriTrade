import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Building2,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';

export const ProcurementView = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'suppliers'
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // New PO state
  const [poForm, setPoForm] = useState({
    supplierId: '',
    items: [{ productId: '', productName: '', quantity: 10, unitCost: 100, unit: 'kg' }],
    paymentStatus: 'Pending',
    paidAmount: 0,
    orderStatus: 'Ordered', // or 'Received'
    notes: '',
  });

  // New Supplier state
  const [supForm, setSupForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    taxId: '',
    paymentTerms: 'Net 30',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pos, sups, prods] = await Promise.all([
        api.getPurchaseOrders(),
        api.getSuppliers(),
        api.getProducts(),
      ]);

      if (pos.success) setPurchaseOrders(pos.orders);
      if (sups.success) setSuppliers(sups.suppliers);
      if (prods.success) setProducts(prods.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPoModal = () => {
    if (suppliers.length === 0) {
      alert('Please add at least one supplier before creating a purchase order.');
      return;
    }
    const defaultProduct = products[0] || {};
    setPoForm({
      supplierId: suppliers[0]?._id || '',
      items: [
        {
          productId: defaultProduct._id || '',
          productName: defaultProduct.name || '',
          quantity: 50,
          unitCost: defaultProduct.costPrice || 50,
          unit: defaultProduct.unit || 'units',
        },
      ],
      paymentStatus: 'Pending',
      paidAmount: 0,
      orderStatus: 'Ordered',
      notes: 'Season replenishment',
    });
    setIsPoModalOpen(true);
  };

  const handleAddPoItem = () => {
    const defaultProduct = products[0] || {};
    setPoForm({
      ...poForm,
      items: [
        ...poForm.items,
        {
          productId: defaultProduct._id || '',
          productName: defaultProduct.name || '',
          quantity: 20,
          unitCost: defaultProduct.costPrice || 50,
          unit: defaultProduct.unit || 'units',
        },
      ],
    });
  };

  const handleRemovePoItem = (index) => {
    if (poForm.items.length === 1) return;
    setPoForm({
      ...poForm,
      items: poForm.items.filter((_, i) => i !== index),
    });
  };

  const handlePoItemChange = (index, field, value) => {
    const updated = [...poForm.items];
    if (field === 'productId') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        updated[index].productId = prod._id;
        updated[index].productName = prod.name;
        updated[index].unitCost = prod.costPrice;
        updated[index].unit = prod.unit;
      }
    } else {
      updated[index][field] = value;
    }
    setPoForm({ ...poForm, items: updated });
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createPurchaseOrder(poForm);
      if (res.success) {
        setIsPoModalOpen(false);
        showNotification(
          poForm.orderStatus === 'Received'
            ? 'Purchase Order created & Inventory stock updated automatically!'
            : 'Purchase Order created successfully!'
        );
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating purchase order');
    }
  };

  // Special Automatic Inventory Update action!
  const handleReceiveStock = async (poId, poNumber) => {
    try {
      const res = await api.receivePurchaseOrder(poId);
      if (res.success) {
        showNotification(`🎉 Stock for PO ${poNumber} received! Warehouse inventory has automatically increased.`);
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error receiving purchase order');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createSupplier(supForm);
      if (res.success) {
        setIsSupplierModalOpen(false);
        showNotification(`Supplier "${supForm.name}" registered successfully!`);
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error registering supplier');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification for Automatic Inventory updates */}
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
            Procurement Management
          </h1>
          <p className="text-sm text-[#7e786d] mt-0.5">
            Suppliers, purchase orders and automated warehouse stock replenishment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#f6f5f1] border border-[#e5e2db] text-[#33302a] text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>+ Add Supplier</span>
          </button>

          <button
            onClick={handleOpenPoModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1c1914] text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-3 border-b border-[#ece8df] pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-amber-500 text-[#1f1d19]'
              : 'border-transparent text-[#7e786d] hover:text-[#1f1d19]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition ${
            activeTab === 'suppliers'
              ? 'border-amber-500 text-[#1f1d19]'
              : 'border-transparent text-[#7e786d] hover:text-[#1f1d19]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Registered Suppliers ({suppliers.length})</span>
        </button>
      </div>

      {/* Tab 1: Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#ece9e2] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ece9e2] text-[11px] font-bold text-[#8f897e] uppercase bg-[#fdfdfc]">
                  <th className="py-3.5 px-6">PO Number</th>
                  <th className="py-3.5 px-6">Supplier</th>
                  <th className="py-3.5 px-6">Items Purchased</th>
                  <th className="py-3.5 px-6">Total Cost</th>
                  <th className="py-3.5 px-6">Payment Status</th>
                  <th className="py-3.5 px-6">Stock Update</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2efe8]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#8e897e]">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#8e897e]">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po._id} className="hover:bg-[#fbfaf7] transition">
                      <td className="py-4 px-6 font-bold text-[#1f1d19]">
                        {po.poNumber}
                        <p className="text-[10px] text-[#918b7f] font-normal mt-0.5">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="py-4 px-6 font-semibold text-[#3b3832]">
                        {po.supplierName}
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {po.items.map((item, idx) => (
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
                        ₹{(po.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.8 rounded-full text-[11px] font-semibold ${
                            po.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.paymentStatus === 'Partial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {po.paymentStatus}
                        </span>
                      </td>

                      {/* Special Stock Update indicator */}
                      <td className="py-4 px-6">
                        {po.stockReceived ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Stock In Warehouse
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Awaiting Intake
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {!po.stockReceived ? (
                          <button
                            onClick={() => handleReceiveStock(po._id, po.poNumber)}
                            className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1b1914] font-bold rounded-xl transition text-[11px] shadow-xs"
                          >
                            Receive Stock
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8e897e]">
                            Received on {new Date(po.receivedDate || po.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup._id}
              className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1f1d19]">{sup.name}</h3>
                  <p className="text-xs text-[#7e786d] mt-0.5">
                    Contact: {sup.contactPerson || 'Sales Desk'}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                  ★ {sup.rating || 4.8}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#524e45] pt-2 border-t border-[#f2efe8]">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8f897e]" />
                  <span>{sup.phone}</span>
                </p>
                {sup.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8f897e]" />
                    <span>{sup.email}</span>
                  </p>
                )}
                {sup.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8f897e]" />
                    <span>{sup.address}, {sup.city}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-[#f2efe8]">
                <span className="text-[#7e786d]">Terms: {sup.paymentTerms}</span>
                <span className="text-[11px] font-mono text-[#8f897e]">
                  GST: {sup.taxId || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Purchase Order Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#e5e2db] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <div>
                <h3 className="font-bold text-base text-[#1f1d19]">
                  Create Restock Purchase Order
                </h3>
                <p className="text-xs text-[#7d786d]">
                  Procure stock from authorized agricultural suppliers
                </p>
              </div>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  Supplier *
                </label>
                <select
                  required
                  value={poForm.supplierId}
                  onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Line */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[#524e45] font-semibold">
                    Procurement Items *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="text-amber-600 font-bold hover:text-amber-700"
                  >
                    + Add Another Item
                  </button>
                </div>

                <div className="space-y-2">
                  {poForm.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl flex items-center gap-2"
                    >
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => handlePoItemChange(index, 'productId', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#e5e2db] rounded-lg bg-white"
                        >
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handlePoItemChange(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-2.5 py-1.5 border border-[#e5e2db] rounded-lg bg-white"
                        />
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitCost}
                          onChange={(e) => handlePoItemChange(index, 'unitCost', e.target.value)}
                          placeholder="Cost ₹"
                          className="w-full px-2.5 py-1.5 border border-[#e5e2db] rounded-lg bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePoItem(index)}
                        className="text-red-500 hover:text-red-700 px-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Order Status *
                  </label>
                  <select
                    value={poForm.orderStatus}
                    onChange={(e) => setPoForm({ ...poForm, orderStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Ordered">Ordered (Pending Delivery)</option>
                    <option value="Received">Received (Update Stock Immediately!)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={poForm.paymentStatus}
                    onChange={(e) => setPoForm({ ...poForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid in Full</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Automatic Stock Feature: Marking this PO as "Received" or clicking "Receive Stock" later automatically increments the product's available warehouse inventory.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df]">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e2db] text-[#524e45] rounded-xl hover:bg-[#f6f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl shadow-xs"
                >
                  Place Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e2db]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <h3 className="font-bold text-base text-[#1f1d19]">
                Register New Supplier
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={supForm.name}
                  onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                  placeholder="e.g. Kisan Agro Biotech Ltd"
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supForm.contactPerson}
                    onChange={(e) => setSupForm({ ...supForm, contactPerson: e.target.value })}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={supForm.email}
                    onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                    placeholder="sales@supplier.com"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    value={supForm.taxId}
                    onChange={(e) => setSupForm({ ...supForm, taxId: e.target.value })}
                    placeholder="33AAB..."
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl uppercase focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  City & Address
                </label>
                <input
                  type="text"
                  value={supForm.city}
                  onChange={(e) => setSupForm({ ...supForm, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df]">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e2db] text-[#524e45] rounded-xl hover:bg-[#f6f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
