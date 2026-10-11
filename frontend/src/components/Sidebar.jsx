import React from 'react';
import {
  LayoutDashboard,
  Box,
  Truck,
  ShoppingCart,
  Users,
  Store,
  CreditCard,
  BarChart3,
  HelpCircle,
  LogOut,
  Sprout,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentView, setCurrentView, onOpenGuide }) => {
  const { user, loginAsDemo, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'storage', label: 'Storage', icon: Box }, // Matches user's screenshot
    { id: 'procurement', label: 'Procurement', icon: Truck },
    { id: 'sales', label: 'Sales & Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'ecommerce', label: 'E-Commerce', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleRoleToggle = async () => {
    if (user?.role === 'admin') {
      await loginAsDemo('customer');
      setCurrentView('ecommerce');
    } else {
      await loginAsDemo('admin');
      setCurrentView('storage');
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-[#151412] text-[#8e897e] flex flex-col justify-between border-r border-[#24221e] select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Top Branding */}
      <div>
        <div className="p-5 pb-6 border-b border-[#22201d] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-[#151412] shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Sprout className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base tracking-tight leading-tight">
              CropBuddy
            </h1>
            <p className="text-[10px] font-bold text-[#8e897e] tracking-widest uppercase">
              FARM ERP & TRADE
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'ecommerce') {
                    handleRoleToggle();
                  } else {
                    setCurrentView(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-[#f59e0b] bg-[#221e17] border border-[#a8741a] shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                    : 'text-[#8e897e] hover:text-[#d6d0c2] hover:bg-[#1a1916]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#f59e0b]' : 'text-[#8e897e]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Helper actions */}
      <div className="p-4 border-t border-[#22201d] space-y-3">
        {/* User Profile Pill */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c1b18] border border-[#282622]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'T'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'T-User'}
              </p>
              <p className="text-[10px] text-[#8e897e] capitalize">
                {user?.role === 'admin' ? 'Farm Administrator' : 'Farmer / Buyer'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRoleToggle}
            title={`Switch to ${user?.role === 'admin' ? 'Customer' : 'Admin'} Mode`}
            className="p-1.5 rounded-lg bg-[#272520] hover:bg-[#33302a] text-amber-400 text-xs transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tutorial / Guide Action */}
        <button
          onClick={onOpenGuide}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#8e897e] hover:text-[#d6d0c2] hover:bg-[#1a1916] rounded-xl transition"
        >
          <HelpCircle className="w-4 h-4 text-amber-500/80" />
          <span>Workflow & Tutorial</span>
        </button>

        {/* Sign Out Action */}
        <button
          onClick={() => {
            logout();
            loginAsDemo('admin');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#8e897e] hover:text-red-400 hover:bg-[#1a1916] rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Reset</span>
        </button>
      </div>
    </aside>
  );
};
