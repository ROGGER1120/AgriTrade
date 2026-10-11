import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Box,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  History,
  CheckCircle2,
  RefreshCw,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../api/client';

export const StorageView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movements, setMovements] = useState([]);

  // Adjust stock form state
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Manual physical count adjustment');

  // New / Edit product form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Fertilizers',
    unit: 'kg',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    maxStockLevel: '500',
    minStockLevel: '100',
    criticalStockLevel: '30',
    location: 'Barn A',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await api.getCategoriesSummary();
      if (catRes.success) {
        setCategories(catRes.categories);
      }

      const params = {};
      if (selectedCategory !== 'All Items') {
        params.category = selectedCategory;
      }
      if (selectedStatus !== 'All') {
        params.status = selectedStatus;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const prodRes = await api.getProducts(params);
      if (prodRes.success) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleOpenAddModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        currentStock: product.currentStock,
        maxStockLevel: product.maxStockLevel,
        minStockLevel: product.minStockLevel,
        criticalStockLevel: product.criticalStockLevel,
        location: product.location,
        description: product.description || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'Fertilizers',
        unit: 'kg',
        costPrice: '',
        sellingPrice: '',
        currentStock: '50',
        maxStockLevel: '500',
        minStockLevel: '100',
        criticalStockLevel: '25',
        location: 'Barn A',
        description: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.updateProduct(editingProduct._id, formData);
        if (res.success) {
          setIsAddModalOpen(false);
          loadData();
        } else {
          alert(res.message || 'Error updating product');
        }
      } else {
        const res = await api.createProduct(formData);
        if (res.success) {
          setIsAddModalOpen(false);
          loadData();
        } else {
          alert(res.message || 'Error creating product');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from inventory?`)) {
      try {
        const res = await api.deleteProduct(id);
        if (res.success) {
          loadData();
        } else {
          alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const change = Number(adjustQty);
    if (isNaN(change) || change === 0) {
      alert('Please enter a valid quantity change (+ or -)');
      return;
    }

    try {
      const res = await api.adjustStock(adjustingProduct._id, change, adjustReason);
      if (res.success) {
        setAdjustingProduct(null);
        setAdjustQty('');
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Stock adjustment error');
    }
  };

  const handleOpenMovements = async () => {
    try {
      const res = await api.getStockMovements();
      if (res.success) {
        setMovements(res.movements);
        setIsMovementModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1d19] tracking-tight">Storage</h1>
          <p className="text-sm text-[#7e786d] mt-0.5">
            Track inventory and manage stock levels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenMovements}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#f6f5f1] border border-[#e5e2db] text-[#33302a] text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <History className="w-4 h-4 text-amber-600" />
            <span>Stock Audit Logs</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1c1914] text-xs font-bold rounded-xl transition shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add item</span>
          </button>
        </div>
      </div>

      {/* Pill Filter Tabs matching reference UI */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#f59e0b] text-[#1a1813] shadow-xs'
                  : 'bg-white text-[#524e46] border border-[#e8e5de] hover:border-[#cfcbc2] hover:bg-[#fcfbf9]'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                  isActive ? 'bg-[#e59307] text-[#1a1813]' : 'bg-[#f2efe9] text-[#716c63]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8f897e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs text-[#2a2722] placeholder-[#9c9588] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#736e65] absolute left-3 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs font-medium text-[#423f38] focus:outline-none focus:border-amber-500 transition shadow-2xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('All');
              setSelectedCategory('All Items');
            }}
            title="Reset Filters"
            className="p-2 bg-white border border-[#e5e2db] rounded-xl text-[#736e65] hover:text-[#2a2722] hover:bg-[#f6f5f1] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inventory Table matching screenshot styling */}
      <div className="bg-white rounded-2xl border border-[#ece9e2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ece9e2] text-[11px] font-bold text-[#8f897e] uppercase tracking-wider bg-[#fdfdfc]">
                <th className="py-3.5 px-6">Item</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Stock Level</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe8] text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#8e897e]">
                    Loading inventory stock levels...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#8e897e]">
                    No inventory items found matching your filters.
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  const percent = Math.min(
                    100,
                    Math.round((item.currentStock / item.maxStockLevel) * 100)
                  );
                  const isCritical = item.status === 'Critical' || item.currentStock <= item.criticalStockLevel;
                  const isLow = item.status === 'Low Stock' || item.currentStock <= item.minStockLevel;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#fbfaf7] transition group"
                    >
                      {/* Item Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
                            <Box className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#24211a]">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#918b7f] mt-0.5">
                              Updated {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="py-4 px-6 text-[#524e45] font-medium">
                        {item.category}
                      </td>

                      {/* Stock Level Column with progress bar matching screenshot */}
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          {/* Progress bar track */}
                          <div className="flex-1 max-w-[130px] h-2 bg-[#ece8df] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCritical
                                  ? 'bg-[#ef4444]'
                                  : isLow
                                  ? 'bg-[#f59e0b]'
                                  : 'bg-[#10b981]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[#696357] font-medium whitespace-nowrap text-[11px]">
                            {item.currentStock}/{item.maxStockLevel} {item.unit}
                          </span>
                        </div>
                      </td>

                      {/* Location Column */}
                      <td className="py-4 px-6 text-[#524e45] font-medium">
                        {item.location}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2]">
                            <AlertTriangle className="w-3 h-3" />
                            Critical
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]">
                            <CheckCircle2 className="w-3 h-3" />
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setAdjustingProduct(item)}
                            title="Quick Adjust Stock (+/-)"
                            className="p-1.5 rounded-lg text-[#787266] hover:text-amber-600 hover:bg-[#f4efe6] transition"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAddModal(item)}
                            title="Edit Item"
                            className="p-1.5 rounded-lg text-[#787266] hover:text-[#1f1d19] hover:bg-[#f4efe6] transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item._id, item.name)}
                            title="Delete Item"
                            className="p-1.5 rounded-lg text-[#787266] hover:text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e2db] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#ece8df]">
              <h2 className="text-base font-bold text-[#1f1d19]">
                {editingProduct ? 'Edit Agricultural Product' : 'Add New Agricultural Product'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#8f897e] hover:text-[#1f1d19] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. NPK 10-10-10 or Hybrid Corn Seeds"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. NPK-BAL-03"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl uppercase focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Chemicals">Chemicals / Pesticides</option>
                    <option value="Feed">Feed</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="L">L (Liters)</option>
                    <option value="units">units (Items / Bales)</option>
                    <option value="bags">bags</option>
                    <option value="packs">packs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Storage Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Shed 1, Loft, Barn A"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Purchase Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="Cost per unit"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="Retail price"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="Current count"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Max Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxStockLevel}
                    onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                    placeholder="Warehouse capacity"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Low Stock Threshold *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    placeholder="Alert below this"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Critical Stock Threshold *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.criticalStockLevel}
                    onChange={(e) => setFormData({ ...formData, criticalStockLevel: e.target.value })}
                    placeholder="Red alert below this"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Description & Applications
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Usage notes, soil suitability, active composition..."
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#e5e2db] text-[#524e45] rounded-xl hover:bg-[#f6f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Quick Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e5e2db]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <div>
                <h3 className="font-bold text-sm text-[#1f1d19]">
                  Adjust Stock Quantity
                </h3>
                <p className="text-xs text-[#7d786d] mt-0.5">
                  {adjustingProduct.name} ({adjustingProduct.location})
                </p>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl">
                <span className="text-[#7d786d]">Current Available Stock:</span>
                <span className="font-bold text-sm text-[#1f1d19] ml-2">
                  {adjustingProduct.currentStock} {adjustingProduct.unit}
                </span>
              </div>

              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  Quantity Adjustment (+ to add, - to reduce) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. +20 or -5"
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  <option value="Physical count discrepancy correction">Physical count discrepancy correction</option>
                  <option value="Damaged / expired bag written off">Damaged / expired bag written off</option>
                  <option value="Internal farm usage / test batch">Internal farm usage / test batch</option>
                  <option value="Unrecorded customer return restocked">Unrecorded customer return restocked</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ece8df]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3.5 py-1.5 border border-[#e5e2db] text-[#524e45] rounded-xl hover:bg-[#f6f5f1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl shadow-xs"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Audit Log Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#e5e2db] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <div>
                <h3 className="font-bold text-base text-[#1f1d19]">
                  Inventory Movement Audit Trail
                </h3>
                <p className="text-xs text-[#7d786d]">
                  Automatic logs for purchases, customer sales, and adjustments
                </p>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-2">
              {movements.length === 0 ? (
                <p className="text-center py-8 text-xs text-[#8f897e]">
                  No movement logs recorded yet.
                </p>
              ) : (
                movements.map((m) => (
                  <div
                    key={m._id}
                    className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1f1d19]">{m.productName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.quantityChange > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.type}
                        </span>
                      </div>
                      <p className="text-[#756f64] text-[11px] mt-0.5">
                        {m.reason} • Ref: {m.referenceId}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${
                          m.quantityChange > 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </p>
                      <p className="text-[10px] text-[#918b7f]">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
