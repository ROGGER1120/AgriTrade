import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { api } from '../api/client';

export const PaymentsView = () => {
  const [paymentsData, setPaymentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.getPayments();
        if (res.success) {
          setPaymentsData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const payments = paymentsData?.payments || [];
  const filteredPayments = payments.filter((p) => {
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceOrder.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1f1d19] tracking-tight">
          Payment & Financial Transactions
        </h1>
        <p className="text-sm text-[#7e786d] mt-0.5">
          Settlement ledger for customer counter sales, online orders, and supplier payouts
        </p>
      </div>

      {/* KPI Cards for Cash Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Total Customer Inflow</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-3">
            ₹{(paymentsData?.totalCustomerInflow || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Sales & POS collections
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Total Supplier Outflow</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#1f1d19] mt-3">
            ₹{(paymentsData?.totalSupplierOutflow || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
            Procurement settlements
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ece8df] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7e786d]">Net Cash Flow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p
            className={`text-2xl font-extrabold mt-3 ${
              (paymentsData?.netCashFlow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            ₹{(paymentsData?.netCashFlow || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-[#716c62] mt-1 inline-block">
            Operating balance
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8f897e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by txn ID, party name, or order ref..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs text-[#2a2722] placeholder-[#9c9588] focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#e5e2db] rounded-xl text-xs font-medium text-[#423f38]"
          >
            <option value="All">All Transactions</option>
            <option value="CUSTOMER_SALE">Customer Inflows</option>
            <option value="SUPPLIER_PAYOUT">Supplier Payouts</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#ece9e2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#ece8df] text-[11px] font-bold text-[#8a8477] uppercase bg-[#faf9f6]">
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Type & Party</th>
                <th className="py-3.5 px-6">Reference Document</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Payment Method</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe8]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8e897e]">
                    Loading financial transactions...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8e897e]">
                    No transactions matching your filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isInflow = p.type === 'CUSTOMER_SALE';
                  return (
                    <tr key={p._id} className="hover:bg-[#fbfaf7] transition">
                      <td className="py-4 px-6 font-mono font-bold text-[#1f1d19]">
                        {p.transactionId}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isInflow ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                          />
                          <span className="font-semibold text-[#1f1d19]">{p.partyName}</span>
                        </div>
                        <p className="text-[10px] text-[#8e897e] ml-4 mt-0.5">
                          {isInflow ? 'Farmer Customer Receipt' : 'Vendor Procurement Settlement'}
                        </p>
                      </td>

                      <td className="py-4 px-6 font-bold text-[#555148]">
                        {p.referenceOrder}
                      </td>

                      <td
                        className={`py-4 px-6 font-extrabold ${
                          isInflow ? 'text-emerald-600' : 'text-blue-600'
                        }`}
                      >
                        {isInflow ? '+' : '-'} ₹{(p.amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6 text-[#555148]">
                        {p.method}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {p.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right text-[#8e897e]">
                        {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
