import React from 'react';
import {
  X,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Box,
  Truck,
  ShoppingCart,
  TrendingDown,
  FileText,
} from 'lucide-react';

export const QuickGuideModal = ({ isOpen, onClose, setCurrentView }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'Admin / Manager Sign In',
      desc: 'Access complete ERP controls, supplier contracts, inventory thresholds and financial analytics.',
      icon: Sparkles,
      action: 'Dashboard',
      view: 'dashboard',
    },
    {
      num: 2,
      title: 'Manage Agricultural Products (Storage)',
      desc: 'Set up seeds, fertilizers, chemicals, and equipment with storage locations and minimum safety stock.',
      icon: Box,
      action: 'Go to Storage',
      view: 'storage',
    },
    {
      num: 3,
      title: 'Register Suppliers & Purchase Stock',
      desc: 'Create purchase orders with registered vendors. Click "Receive Stock" to test automatic inventory increase.',
      icon: Truck,
      action: 'Go to Procurement',
      view: 'procurement',
      special: 'Automatic Inventory Update (+ Stock increases)',
    },
    {
      num: 4,
      title: 'Customer Order (POS or E-Commerce Store)',
      desc: 'Take orders at the shop counter or let farmers buy online with Cash on Delivery or UPI.',
      icon: ShoppingCart,
      action: 'Open POS Counter',
      view: 'sales',
    },
    {
      num: 5,
      title: 'Order Confirmation & Automatic Stock Deduction',
      desc: 'Available warehouse stock reduces immediately when the order is confirmed. If cancelled, stock safely restocks.',
      icon: TrendingDown,
      action: 'View All Orders',
      view: 'sales',
      special: 'Automatic Inventory Deduction (- Stock decreases)',
    },
    {
      num: 6,
      title: 'Download PDF Invoice & Review Sales Reports',
      desc: 'Generate branded tax invoices in 1 click and inspect monthly revenue and stock valuation audits.',
      icon: FileText,
      action: 'View Reports',
      view: 'reports',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-[#e5e2db] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#ece8df]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AgriTrade Workflow Guide</span>
            </div>
            <h2 className="text-xl font-bold text-[#1f1d19]">
              Agricultural E-Business Automated Cycle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8f897e] hover:text-[#1f1d19] rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.num}>
                <div className="p-4 bg-[#faf9f5] border border-[#ece8df] rounded-2xl flex items-start gap-4 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-[#1a1813] font-black text-sm flex items-center justify-center shrink-0">
                    {step.num}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1f1d19]">
                        {step.title}
                      </h3>
                      <button
                        onClick={() => {
                          setCurrentView(step.view);
                          onClose();
                        }}
                        className="text-amber-700 font-bold hover:underline text-xs"
                      >
                        {step.action} →
                      </button>
                    </div>

                    <p className="text-[#6e685d] leading-relaxed">
                      {step.desc}
                    </p>

                    {step.special && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        ⚡ {step.special}
                      </span>
                    )}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex justify-center my-1.5">
                    <ArrowDown className="w-4 h-4 text-amber-500/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#ece8df] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#1a1813] font-bold rounded-xl text-xs shadow-xs"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
