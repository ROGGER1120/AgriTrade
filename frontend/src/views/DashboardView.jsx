import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  ShoppingCart,
  Box,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api/client';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];

export const DashboardView = ({ setCurrentView }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getDashboardMetrics();
        if (res.success) {
          setMetrics(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#7a7469]">Loading Farm ERP Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = metrics?.stats || {};
  const lowStock = metrics?.lowStockProducts || [];
  const monthlyChart = metrics?.monthlyChart || [];
  const recentOrders = metrics?.recentOrders || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Top Banner / Welcome */}
      <div className="bg-[#1b1916] rounded-2xl p-6 border border-[#2d2922] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AgriTrade Smart Enterprise</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Agricultural E-Business Management System
          </h1>
          <p className="text-xs text-[#a39d91] mt-1">
            Real-time automated inventory synchronization across Procurement, Sales Counter & E-Commerce.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('sales')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#151412] text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Sale POS</span>
          </button>
          <button
            onClick={() => setCurrentView('procurement')}
            className="px-4 py-2 bg-[#2a2721] hover:bg-[#38342c] border border-[#3e3a31] text-[#e8e4da] text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Purchase Stock</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div
          onClick={() => setCurrentView('storage')}
          className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-3">
            {stats.totalProducts || 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#716c63] mt-1.5">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> Live
            </span>
            <span>Managed items</span>
          </div>
        </div>

        {/* Total Sales */}
        <div
          onClick={() => setCurrentView('sales')}
          className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-3">
            ₹{(stats.totalSalesRevenue || 0).toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#716c63] mt-1.5">
            <span className="text-emerald-600 font-semibold">
              {stats.totalOrdersCount || 0} orders
            </span>
            <span>Fulfilled orders</span>
          </div>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => setCurrentView('customers')}
          className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Registered Customers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-3">
            {stats.totalCustomers || 0}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#716c63] mt-1.5">
            <span className="text-blue-600 font-semibold">Farmers & Buyers</span>
          </div>
        </div>

        {/* Low-stock products alert card */}
        <div
          onClick={() => setCurrentView('storage')}
          className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs hover:border-red-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Low-Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-2xl font-extrabold text-[#b91c1c]">
              {stats.lowStockCount || 0}
            </p>
            {stats.criticalCount > 0 && (
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {stats.criticalCount} Critical
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#857f73] mt-1.5">
            Needs procurement restocking
          </p>
        </div>
      </div>

      {/* Monthly Revenue & Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1f1d19]">
                Monthly Revenue & Procurement Trends
              </h2>
              <p className="text-xs text-[#7e786d] mt-0.5">
                Financial performance and profit margins
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[#59554d] font-medium">Sales Revenue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[#59554d] font-medium">Procurement Spend</span>
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede6" />
                <XAxis dataKey="month" stroke="#9e978a" fontSize={11} tickLine={false} />
                <YAxis stroke="#9e978a" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1d1b18', borderColor: '#2e2b24', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" name="Sales Revenue" />
                <Area type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#purchaseGrad)" name="Procurement Spend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Urgent Items List */}
        <div className="bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <h2 className="text-base font-bold text-[#1f1d19]">
                Low Stock Watchlist
              </h2>
              <span className="text-xs text-amber-600 font-semibold">
                {lowStock.length} items
              </span>
            </div>

            <div className="space-y-3 mt-4 overflow-y-auto max-h-[220px]">
              {lowStock.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-[#faf9f5] border border-[#ece8df] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#1f1d19] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#7a7469] mt-0.5">
                      {item.category} • Location: {item.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-red-600 text-xs">
                      {item.currentStock} {item.unit}
                    </span>
                    <p className="text-[10px] text-[#918b7f]">
                      Cap: {item.maxStockLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentView('procurement')}
            className="w-full mt-4 py-2.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1b1914] text-xs font-bold rounded-xl transition shadow-xs text-center"
          >
            Create Restock Purchase Order
          </button>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1f1d19]">Recent Sales Orders</h2>
            <p className="text-xs text-[#7e786d] mt-0.5">
              Live updates across store counter and customer web store
            </p>
          </div>
          <button
            onClick={() => setCurrentView('sales')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            View all orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#ece8df] text-[11px] font-bold text-[#8a8477] uppercase bg-[#faf9f6]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe8]">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-[#faf9f6] transition">
                  <td className="py-3.5 px-4 font-bold text-[#1f1d19]">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#4d4941]">
                    {ord.customerName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {ord.channel === 'POS_COUNTER' ? 'POS Counter' : 'Online Store'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1f1d19]">
                    ₹{(ord.finalTotal || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8a8477]">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
