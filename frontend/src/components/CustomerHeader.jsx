import React from 'react';
import {
  Sprout,
  ShoppingBag,
  Search,
  Package,
  User,
  ShieldAlert,
  ArrowRightLeft,
  PhoneCall,
  Truck,
  Leaf,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const CustomerHeader = ({
  customerView,
  setCustomerView,
  searchQuery,
  setSearchQuery,
  onOpenCart,
}) => {
  const { user, loginAsDemo, logout } = useAuth();
  const { cartCount, cartSubtotal } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Top Banner with Quick Switch to Admin */}
      <div className="bg-[#161513] text-[#d6d0c4] text-xs px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-[#282622]">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Direct Farm Gate Deliveries Across India</span>
          </span>
          <span className="hidden md:inline text-[#8a857a]">•</span>
          <span className="hidden md:inline text-[#a6a094]">
            Free truck dispatch on orders over ₹2,000
          </span>
          <span className="hidden lg:inline text-[#8a857a]">•</span>
          <span className="hidden lg:inline text-[#a6a094]">
            Farmer Hotline: +91 98401 22334
          </span>
        </div>

        {/* Demo Switcher to Admin Mode */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8e897e]">Logged in as Farmer:</span>
          <span className="text-[11px] text-white font-bold">{user?.name || 'Ramesh Kumar'}</span>
          <button
            onClick={() => loginAsDemo('admin')}
            className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-[#141412] font-bold text-[11px] rounded-lg transition flex items-center gap-1 shadow-xs"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Switch to Admin ERP Mode</span>
          </button>
        </div>
      </div>

      {/* Main E-Commerce Header */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => setCustomerView('shop')}
          className="flex items-center gap-3 text-left shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-[#151412] shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-[#191815] tracking-tight leading-none block">
              AgriTrade
            </span>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
              Farmer Direct Store
            </span>
          </div>
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg hidden sm:block">
          <Search className="w-4 h-4 text-[#8f897e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search seeds, fertilizers, tractor diesel, sprayers..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8f7f4] border border-[#e5e2db] rounded-2xl text-xs text-[#2a2722] placeholder-[#9c9588] focus:bg-white focus:border-amber-500 focus:outline-none transition shadow-2xs"
          />
        </div>

        {/* Navigation & Cart Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setCustomerView('shop')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              customerView === 'shop'
                ? 'bg-[#faf9f5] text-amber-700 border border-amber-300'
                : 'text-[#524e45] hover:text-[#191815]'
            }`}
          >
            Store Catalog
          </button>

          <button
            onClick={() => setCustomerView('orders')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              customerView === 'orders'
                ? 'bg-[#faf9f5] text-amber-700 border border-amber-300'
                : 'text-[#524e45] hover:text-[#191815]'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>My Orders & Tracking</span>
          </button>

          <button
            onClick={() => setCustomerView('profile')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              customerView === 'profile'
                ? 'bg-[#faf9f5] text-amber-700 border border-amber-300'
                : 'text-[#524e45] hover:text-[#191815]'
            }`}
          >
            <User className="w-4 h-4 text-[#8f897e]" />
            <span className="hidden md:inline">Farm Profile</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative px-4 py-2.5 bg-[#f59e0b] hover:bg-[#ea9307] text-[#191712] rounded-2xl font-bold text-xs transition shadow-sm flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#161513] text-[#f59e0b] flex items-center justify-center text-[10px] font-black">
                {cartCount}
              </span>
            )}
            {cartSubtotal > 0 && (
              <span className="hidden md:inline ml-1 font-extrabold text-[11px] border-l border-amber-700/30 pl-2">
                ₹{cartSubtotal.toLocaleString('en-IN')}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
