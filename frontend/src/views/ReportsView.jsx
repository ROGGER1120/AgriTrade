import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  DollarSign,
  PackageCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../api/client';

const HEALTH_COLORS = {
  'In Stock': '#10b981',
  'Low Stock': '#f59e0b',
  'Critical': '#ef4444',
  'Out of Stock': '#6b7280',
};

export const ReportsView = () => {
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReports = async () => {
      setLoading(true);
      try {
        const [sRes, iRes, dRes] = await Promise.all([
          api.getSalesReport(),
          api.getInventoryReport(),
          api.getDashboardMetrics(),
        ]);

        if (sRes.success) setSalesData(sRes);
        if (iRes.success) setInventoryData(iRes);
        if (dRes.success) setDashboardData(dRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!salesData?.orders) return;
    const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Items Count', 'Payment Method', 'Total (INR)'];
    const rows = salesData.orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      o.customerPhone,
      o.items.length,
      `"${o.paymentMethod}"`,
      o.finalTotal,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriTrade_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const valuation = inventoryData?.valuation || {};
  const healthStatus = valuation.healthStatus || {};
  const pieData = Object.keys(healthStatus).map((key) => ({
    name: key,
    value: healthStatus[key],
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7 print:p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1d19] tracking-tight">
            Financial & Inventory Reports
          </h1>
          <p className="text-sm text-[#7e786d] mt-0.5">
            Comprehensive sales, procurement margins, and stock valuation audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#f6f5f1] border border-[#e5e2db] text-[#33302a] text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1c1914] text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <span className="text-xs font-semibold text-[#7e786d]">Total Sales Revenue</span>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-2">
            ₹{(salesData?.summary?.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {salesData?.summary?.totalOrders || 0} customer orders
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <span className="text-xs font-semibold text-[#7e786d]">Inventory Cost Valuation</span>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-2">
            ₹{(valuation.totalCostValuation || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#716c62] mt-1">
            Cost price of warehouse assets
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <span className="text-xs font-semibold text-[#7e786d]">Inventory Retail Value</span>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-2">
            ₹{(valuation.totalRetailValuation || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Expected sales value
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <span className="text-xs font-semibold text-[#7e786d]">Potential Profit Margin</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            ₹{(valuation.potentialMargin || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#716c62] mt-1">
            Projected unrealized margin
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Purchases Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs space-y-3">
          <h2 className="text-base font-bold text-[#1f1d19]">
            Monthly Performance Breakdown (INR)
          </h2>
          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.monthlyChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede6" />
                <XAxis dataKey="month" stroke="#9e978a" fontSize={11} tickLine={false} />
                <YAxis stroke="#9e978a" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1d1b18', borderColor: '#2e2b24', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Sales" />
                <Bar dataKey="purchases" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Health Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1f1d19]">
              Stock Health Status
            </h2>
            <p className="text-xs text-[#7e786d]">Inventory alert distribution</p>

            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={HEALTH_COLORS[entry.name] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1d1b18', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#f2efe8]">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEALTH_COLORS[p.name] }} />
                <span className="text-[#555148]">{p.name}: <b>{p.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stock Valuation Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#ece8df] shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#1f1d19]">
          Product-by-Product Stock Valuation Table
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#ece8df] text-[11px] font-bold text-[#8a8477] uppercase bg-[#faf9f6]">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Valuation</th>
                <th className="py-3 px-4">Retail Valuation</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe8]">
              {inventoryData?.products?.map((p) => (
                <tr key={p._id} className="hover:bg-[#faf9f6] transition">
                  <td className="py-3.5 px-4 font-bold text-[#1f1d19]">{p.name}</td>
                  <td className="py-3.5 px-4 text-[#555148]">{p.category}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1f1d19]">
                    {p.currentStock} {p.unit}
                  </td>
                  <td className="py-3.5 px-4 text-[#555148]">₹{p.costPrice}</td>
                  <td className="py-3.5 px-4 text-[#555148]">₹{p.sellingPrice}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1f1d19]">
                    ₹{(p.currentStock * p.costPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    ₹{(p.currentStock * p.sellingPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : p.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.status}
                    </span>
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
