import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { AuthScreen } from '@/components/AuthScreen';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { Purchases } from '@/components/Purchases';
import { Sales } from '@/components/Sales';
import { Distributors } from '@/components/Distributors';
import { Inventory } from '@/components/Inventory';
import { Reports } from '@/components/Reports';
import { Offers } from '@/components/Offers';
import { SettingsView } from '@/components/Settings';
import { Customers } from '@/components/Customers';
import { CustomerDetail } from '@/components/CustomerDetail';
import { StaffManagement } from '@/components/StaffManagement';
import { Expenses } from '@/components/Expenses';
import type { View, PurchaseReturn } from '@/types';

function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<View>('landing');
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [returnState, setReturnState] = useState<Partial<PurchaseReturn> | undefined>(undefined);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentUserRole] = useState<'Owner'|'Manager'|'Admin'|'Pharmacist'|'Cashier'>('Admin'); // Mocked for demonstration

  const navigateWithState = (newView: View, state?: any) => {
    if (newView === 'purchase-returns' && state) {
      setReturnState(state);
    } else {
      setReturnState(undefined);
    }
    setView(newView);
  };

  // Landing page — pre-auth marketing page
  if (view === 'landing' && !authed) {
    return (
      <LandingPage 
        onLogin={() => { setAuthMode('signin'); setView('dashboard'); }}
        onSignup={() => { setAuthMode('signup'); setView('dashboard'); }}
      />
    );
  }

  // Auth screens
  if (!authed) {
    return (
      <AuthScreen 
        initialMode={authMode}
        onLogin={() => { setAuthed(true); setView('dashboard'); }} 
        onBack={() => setView('landing')}
      />
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={setView} onNavigateWithState={navigateWithState} />;
      case 'purchases':
      case 'purchase-drafts':
      case 'purchase-orders':
      case 'purchase-analytics':
      case 'purchase-returns':
        return <Purchases view={view} onNavigate={setView} returnState={returnState} />;
      case 'sales':
      case 'sales-drafts':
      case 'sales-analytics':
      case 'sales-returns':
        return <Sales view={view} onNavigate={setView} />;
      case 'distributors':
      case 'distributor-detail':
        return <Distributors view={view} onNavigate={setView} selectedDistributor={selectedDistributor} onSelectDistributor={setSelectedDistributor} onNavigateWithState={navigateWithState} />;
      case 'inventory':
        return <Inventory onNavigateWithState={navigateWithState} />;
      case 'reports':
        return <Reports />;
      case 'offers':
        return <Offers />;
      case 'settings':
        return <SettingsView />;
      case 'customers':
        return <Customers onNavigate={(v, id) => { setSelectedCustomer(id || null); setView(v); }} />;
      case 'customer-detail':
        return <CustomerDetail customerId={selectedCustomer!} onNavigate={(v, id) => { if (id) setSelectedCustomer(id); setView(v); }} />;
      case 'staff':
      case 'staff-detail':
        if (!['Owner', 'Admin', 'Manager'].includes(currentUserRole)) return <Dashboard onNavigate={setView} />;
        return <StaffManagement view={view} onNavigate={setView} />;
      case 'expenses':
        if (!['Owner', 'Admin', 'Manager'].includes(currentUserRole)) return <Dashboard onNavigate={setView} />;
        return <Expenses />;
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <AppShell current={view} currentUserRole={currentUserRole} onNavigate={setView} onLogout={() => { setAuthed(false); setView('landing'); }}>
      {renderView()}
    </AppShell>
  );
}

export default App;
