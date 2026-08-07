import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { AuthScreen } from '@/components/AuthScreen';
import { Dashboard } from '@/components/Dashboard';
import { Purchases } from '@/components/Purchases';
import { Sales } from '@/components/Sales';
import { Distributors } from '@/components/Distributors';
import { Inventory } from '@/components/Inventory';
import { Reports } from '@/components/Reports';
import { Offers } from '@/components/Offers';
import { SettingsView } from '@/components/Settings';
import type { View, PurchaseReturn } from '@/types';

function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [returnState, setReturnState] = useState<Partial<PurchaseReturn> | undefined>(undefined);

  const navigateWithState = (newView: View, state?: any) => {
    if (newView === 'purchase-returns' && state) {
      setReturnState(state);
    } else {
      setReturnState(undefined);
    }
    setView(newView);
  };

  if (!authed) {
    return <AuthScreen onLogin={() => { setAuthed(true); setView('dashboard'); }} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={setView} />;
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
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <AppShell current={view} onNavigate={setView} onLogout={() => setAuthed(false)}>
      {renderView()}
    </AppShell>
  );
}

export default App;
