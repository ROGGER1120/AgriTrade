import React, { useState } from 'react';
import { CustomerHeader } from '../../components/CustomerHeader';
import { EcommerceView } from '../EcommerceView';
import { CustomerOrdersView } from './CustomerOrdersView';
import { CustomerProfileView } from './CustomerProfileView';

export const CustomerStorefrontLayout = () => {
  const [customerView, setCustomerView] = useState('shop'); // 'shop', 'orders', 'profile'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f5] flex flex-col">
      {/* Customer E-Commerce Navigation */}
      <CustomerHeader
        customerView={customerView}
        setCustomerView={setCustomerView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Customer Views */}
      <main className="flex-1 pb-16">
        {customerView === 'shop' && (
          <EcommerceView
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            externalSearchQuery={searchQuery}
          />
        )}
        {customerView === 'orders' && (
          <CustomerOrdersView onGoToShop={() => setCustomerView('shop')} />
        )}
        {customerView === 'profile' && <CustomerProfileView />}
      </main>

      {/* Store Footer */}
      <footer className="bg-[#161513] text-[#8e897e] text-xs py-10 px-8 border-t border-[#262420]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-white font-bold text-sm">AgriTrade Farmer Direct Store</p>
            <p className="mt-1 text-[11px] text-[#716c62]">
              Verified seeds, fertilizers, and farm equipment with automated inventory tracking.
            </p>
          </div>
          <p className="text-[11px] text-[#555148]">
            © 2026 AgriTrade Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
