import React from 'react';
import {
  Store,
  LayoutDashboard,
  Bell,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  Tractor,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header = ({ currentView, setCurrentView, onOpenGuide }) => {
  const { user, loginAsDemo } = useAuth();
  const { cartCount } = useCart();

  const isStoreView = currentView === 'ecommerce';

  return (
    <header className="h-16 bg-white border-b border-[#ece8df] px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left indicator */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 px-3 py-1 bg-[#faf9f5] border border-[#ece8df] rounded-xl text-xs font-semibold text-[#524e45]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB v8.2 Online</span>
        </span>

        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Automatic Stock Sync Active</span>
        </span>
      </div>

      {/* Right Quick Mode Switcher */}
      <div className="flex items-center gap-3">
        {/* Toggle between Admin ERP & E-Commerce Store */}
        <div className="flex items-center bg-[#faf9f5] p-1 border border-[#ece8df] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setCurrentView('storage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              !isStoreView
                ? 'bg-white text-[#1f1d19] shadow-2xs font-bold'
                : 'text-[#7e786d] hover:text-[#1f1d19]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin ERP</span>
          </button>

          <button
            onClick={() => loginAsDemo('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              isStoreView
                ? 'bg-white text-[#1f1d19] shadow-2xs font-bold'
                : 'text-[#7e786d] hover:text-[#1f1d19]'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span>Customer Storefront</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Demo Account Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          {user?.role === 'admin' ? (
            <button
              onClick={() => loginAsDemo('customer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5e2db] text-xs font-semibold text-[#524e45] hover:bg-[#faf9f5] transition"
            >
              <Tractor className="w-3.5 h-3.5 text-emerald-600" />
              <span>Switch to Farmer</span>
            </button>
          ) : (
            <button
              onClick={() => loginAsDemo('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Switch to Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
