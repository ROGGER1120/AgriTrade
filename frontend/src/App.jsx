import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StorageView } from './views/StorageView';
import { DashboardView } from './views/DashboardView';
import { ProcurementView } from './views/ProcurementView';
import { SalesView } from './views/SalesView';
import { CustomersView } from './views/CustomersView';
import { EcommerceView } from './views/EcommerceView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { QuickGuideModal } from './components/QuickGuideModal';
import { CustomerStorefrontLayout } from './views/customer/CustomerStorefrontLayout';

function MainApp() {
  const { user, isAdmin, loading } = useAuth();
  // Default ERP view to 'storage' to match the attached UI screenshot!
  const [currentView, setCurrentView] = useState('storage');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161513] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#8e897e]">Initializing AgriTrade...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // CUSTOMER / FARMER SIDE: Dedicated E-Commerce System
  // Restricts all admin features (Storage, Procurement, Reports, Financial Ledgers)
  // ==========================================
  if (!isAdmin) {
    return <CustomerStorefrontLayout />;
  }

  // ==========================================
  // ADMIN / MANAGER SIDE: Full Farm ERP System
  // Matching user's reference screenshot layout
  // ==========================================
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView setCurrentView={setCurrentView} />;
      case 'storage':
        return <StorageView />;
      case 'procurement':
        return <ProcurementView />;
      case 'sales':
        return <SalesView />;
      case 'customers':
        return <CustomersView />;
      case 'ecommerce':
        return <EcommerceView />;
      case 'payments':
        return <PaymentsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <StorageView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f5] flex">
      {/* Dark Sidebar matching attached screenshot */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>

      {/* Interactive Workflow Guide Modal */}
      <QuickGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        setCurrentView={setCurrentView}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
