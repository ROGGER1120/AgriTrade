import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Tractor,
  ShoppingBag,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { api } from '../api/client';

export const CustomersView = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Coimbatore',
    address: '',
    farmName: '',
    acreage: '',
    primaryCrop: '',
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({ search: searchQuery });
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        farmDetails: {
          farmName: formData.farmName,
          acreage: Number(formData.acreage) || 0,
          primaryCrop: formData.primaryCrop,
        },
      };

      const res = await api.createCustomer(payload);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          city: 'Coimbatore',
          address: '',
          farmName: '',
          acreage: '',
          primaryCrop: '',
        });
        loadCustomers();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating customer');
    }
  };

  const handleViewCustomerHistory = async (customerId) => {
    try {
      const res = await api.getCustomer(customerId);
      if (res.success) {
        setSelectedCustomerOrders(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1d19] tracking-tight">
            Customer & Farmer Directory
          </h1>
          <p className="text-sm text-[#7e786d] mt-0.5">
            Farmer profiles, acreage, crops, and cumulative purchase reports
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1c1914] text-xs font-bold rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Register Farmer / Buyer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8f897e] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by farmer name, email, phone or city..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs text-[#2a2722] placeholder-[#9c9588] focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-[#8e897e]">
            Loading customer profiles...
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs text-[#8e897e]">
            No customers found matching search.
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c._id}
              className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs space-y-4 hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#1f1d19]">{c.name}</h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-semibold uppercase">
                    {c.role === 'farmer' ? '🌾 Farmer Producer' : 'Buyer'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 block">
                    ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#8e897e]">
                    {c.totalOrders || 0} orders
                  </span>
                </div>
              </div>

              {/* Farm Details */}
              {c.farmDetails?.farmName && (
                <div className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl text-xs space-y-1">
                  <p className="font-semibold text-[#24211a] flex items-center gap-1.5">
                    <Tractor className="w-3.5 h-3.5 text-amber-600" />
                    <span>{c.farmDetails.farmName}</span>
                  </p>
                  <p className="text-[11px] text-[#716c62]">
                    Acreage: <b>{c.farmDetails.acreage} acres</b> • Primary Crop: <b>{c.farmDetails.primaryCrop}</b>
                  </p>
                </div>
              )}

              {/* Contact info */}
              <div className="space-y-1 text-xs text-[#524e45]">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8f897e]" />
                  <span>{c.phone}</span>
                </p>
                {c.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8f897e]" />
                    <span>{c.email}</span>
                  </p>
                )}
                {c.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8f897e]" />
                    <span>{c.address}, {c.city}</span>
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleViewCustomerHistory(c._id)}
                className="w-full py-2 bg-[#faf9f5] hover:bg-amber-50 text-amber-700 hover:text-amber-800 border border-[#e5e2db] rounded-xl text-xs font-semibold transition"
              >
                View Purchase History →
              </button>
            </div>
          ))
        )}
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomerOrders && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e5e2db] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <div>
                <h3 className="font-bold text-base text-[#1f1d19]">
                  {selectedCustomerOrders.customer?.name} - Purchase History
                </h3>
                <p className="text-xs text-[#7d786d]">
                  Total Orders: {selectedCustomerOrders.totalOrders} • Total Spent: ₹{(selectedCustomerOrders.totalSpent || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerOrders(null)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3">
              {selectedCustomerOrders.orders?.length === 0 ? (
                <p className="text-center py-8 text-xs text-[#8f897e]">
                  No orders recorded for this customer yet.
                </p>
              ) : (
                selectedCustomerOrders.orders?.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1f1d19]">{ord.orderNumber}</span>
                      <span className="font-bold text-emerald-600">₹{ord.finalTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#736e65] text-[11px]">
                      <span>{new Date(ord.createdAt).toLocaleDateString()} • {ord.channel}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                        {ord.orderStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#555148] pt-1 border-t border-[#f0ede6]">
                      {ord.items?.map((it, idx) => (
                        <span key={idx} className="mr-2">
                          {it.productName} ({it.quantity} {it.unit})
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e2db]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <h3 className="font-bold text-base text-[#1f1d19]">
                Register Farmer / Buyer
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8f897e] hover:text-[#1f1d19]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="farmer@gmail.com"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    placeholder="e.g. Aliyar Agro Farm"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Acreage (Acres)
                  </label>
                  <input
                    type="number"
                    value={formData.acreage}
                    onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#524e45] font-semibold mb-1">
                  Primary Crop(s)
                </label>
                <input
                  type="text"
                  value={formData.primaryCrop}
                  onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
                  placeholder="e.g. Sugarcane, Paddy, Vegetables"
                  className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    City / Taluk
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-[#e5e2db] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#524e45] font-semibold mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Village / Road"
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
