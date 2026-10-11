import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Download,
  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

export const CustomerOrdersView = ({ onGoToShop }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      setLoading(true);
      try {
        const res = await api.getOrders();
        if (res.success) {
          // Filter to current customer's orders or recent orders
          const myOrders = res.orders.filter(
            (o) =>
              (user?._id && o.customer === user._id) ||
              (user?.name && o.customerName?.toLowerCase().includes(user.name.toLowerCase())) ||
              o.channel === 'ECOMMERCE_WEB'
          );
          setOrders(myOrders.length > 0 ? myOrders : res.orders.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerOrders();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ece8df]">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1d19]">My Farm Orders & Deliveries</h1>
          <p className="text-xs text-[#7e786d] mt-0.5">
            Track live dispatch status, delivery schedules and download official tax invoices
          </p>
        </div>

        <button
          onClick={onGoToShop}
          className="px-4 py-2 bg-white border border-[#e5e2db] text-[#33302a] text-xs font-bold rounded-xl hover:bg-[#faf9f5] transition flex items-center gap-1.5 shadow-2xs self-start"
        >
          <ShoppingBag className="w-4 h-4 text-amber-600" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#8e897e]">
          Loading your order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ece8df] max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#1f1d19]">No Orders Placed Yet</h2>
          <p className="text-xs text-[#7e786d]">
            Browse certified seeds, organic fertilizers and farm tools from our catalogue.
          </p>
          <button
            onClick={onGoToShop}
            className="mt-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#191712] font-bold text-xs rounded-xl shadow-xs"
          >
            Start Shopping Now
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((ord) => {
            const isDelivered = ord.orderStatus === 'Delivered';
            const isProcessing = ord.orderStatus === 'Processing';
            const isConfirmed = ord.orderStatus === 'Confirmed' || isProcessing || isDelivered;

            return (
              <div
                key={ord._id}
                className="bg-white rounded-3xl border border-[#ece8df] p-6 shadow-2xs space-y-5 hover:border-amber-300 transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f2efe8]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#faf9f5] border border-[#ece8df] flex items-center justify-center text-amber-600 font-bold text-sm">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#1f1d19]">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {ord.invoiceNumber || 'INV-2026'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8e897e] mt-0.5">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-[#1f1d19]">
                      Total: ₹{(ord.finalTotal || 0).toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => generateInvoicePDF(ord)}
                      className="px-3.5 py-1.5 bg-[#faf9f5] hover:bg-amber-50 text-amber-700 hover:text-amber-800 border border-amber-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Tax Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Stepper */}
                <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ece8df]">
                  <p className="text-[11px] font-bold text-[#716c62] uppercase tracking-wider mb-3">
                    Live Order & Warehouse Tracking:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Step 1: Placed & Confirmed */}
                    <div className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          isConfirmed ? 'bg-amber-500' : 'bg-gray-200'
                        }`}
                      />
                      <p className="font-bold text-[#1f1d19]">1. Order Confirmed</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Stock Reserved In Warehouse</p>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          isProcessing || isDelivered ? 'bg-amber-500' : 'bg-gray-200'
                        }`}
                      />
                      <p className="font-bold text-[#1f1d19]">2. Truck Dispatched</p>
                      <p className="text-[10px] text-[#716c62]">En route to farm</p>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          isDelivered ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                      <p className="font-bold text-[#1f1d19]">3. Delivered</p>
                      <p className="text-[10px] text-[#716c62]">Farm gate received</p>
                    </div>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#524e45]">Items in this shipment:</p>
                  <div className="divide-y divide-[#f5f3ec] border border-[#ece8df] rounded-2xl overflow-hidden">
                    {ord.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 flex items-center justify-between text-xs bg-white"
                      >
                        <div>
                          <p className="font-bold text-[#1f1d19]">{it.productName}</p>
                          <p className="text-[11px] text-[#787265]">
                            Quantity: <b>{it.quantity} {it.unit}</b> • Rate: ₹{it.unitPrice}/{it.unit}
                          </p>
                        </div>
                        <span className="font-bold text-[#1f1d19]">
                          ₹{(it.total || it.quantity * it.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer notes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#716c62] pt-2 border-t border-[#f2efe8] gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Delivered to: <b>{ord.shippingAddress}</b></span>
                  </div>
                  <div>
                    <span>Payment: <b>{ord.paymentMethod}</b> ({ord.paymentStatus})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
