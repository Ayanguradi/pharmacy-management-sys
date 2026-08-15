import { useState, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { BranchTransfers } from '@/components/BranchTransfers';
import { StockAuditView } from '@/components/StockAudit';
import { MySpace } from '@/components/MySpace';
import { usePermissions } from '@/hooks/usePermissions';
import type { PurchaseReturn } from '@/types';

// Lazy-load the entire Platform Admin app
const AdminApp = lazy(() => import('@/platform-admin/AdminApp'));

function App() {
  const [currentUserRole, setCurrentUserRole] = useState(() => {
    return localStorage.getItem('mockRole') || 'Admin';
  });
  
  return (
    <Routes>
      {/* Platform Admin — completely separate route tree */}
      <Route path="/platform-control/*" element={<AdminApp />} />
      
      {/* Root Landing Page / Login */}
      <Route path="/" element={<LandingPageWrapper />} />
      
      {/* Main Pharmacy App */}
      <Route path="/app/*" element={
        <MainAppWrapper currentUserRole={currentUserRole} />
      } />
    </Routes>
  );
}

function LandingPageWrapper() {
  const navigate = useNavigate();
  return (
    <LandingPage 
      onLogin={() => { navigate('/app/dashboard'); }}
      onSignup={() => { navigate('/app/dashboard'); }}
    />
  );
}

function MainAppWrapper({ currentUserRole }: { currentUserRole: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [returnState, setReturnState] = useState<Partial<PurchaseReturn> | undefined>(undefined);
  const [selectedBranchId, setSelectedBranchId] = useState('all');

  // Convert old onNavigate(view) pattern to navigate(path)
  const viewToPath = (view: string) => {
    const map: Record<string, string> = {
      'dashboard': '/app/dashboard',
      'purchases': '/app/purchases', 'purchase-drafts': '/app/purchases/drafts', 'purchase-orders': '/app/purchases/orders', 'purchase-analytics': '/app/purchases/analytics', 'purchase-returns': '/app/purchases/returns',
      'sales': '/app/sales', 'sales-drafts': '/app/sales/drafts', 'sales-analytics': '/app/sales/analytics', 'sales-returns': '/app/sales/returns',
      'distributors': '/app/distributors', 'distributor-detail': '/app/distributors/detail',
      'inventory': '/app/inventory',
      'reports': '/app/reports',
      'offers': '/app/offers',
      'settings': '/app/settings',
      'customers': '/app/customers', 'customer-detail': '/app/customers/detail',
      'staff': '/app/staff', 'staff-detail': '/app/staff/detail',
      'expenses': '/app/expenses',
      'branch-transfers': '/app/branch-transfers',
      'stock-audit': '/app/stock-audit',
      'my-space': '/app/my-space',
    };
    return map[view] || '/app/dashboard';
  };

  // Convert current path to view string for legacy components
  const pathToView = (pathname: string): string => {
    const p = pathname.replace('/app/', '').replace('/app', '');
    const segments = p.split('/').filter(Boolean);
    if (segments.length === 0) return 'dashboard';
    
    if (segments[0] === 'purchases') {
      if (segments[1] === 'drafts') return 'purchase-drafts';
      if (segments[1] === 'orders') return 'purchase-orders';
      if (segments[1] === 'analytics') return 'purchase-analytics';
      if (segments[1] === 'returns') return 'purchase-returns';
      return 'purchases';
    }
    if (segments[0] === 'sales') {
      if (segments[1] === 'drafts') return 'sales-drafts';
      if (segments[1] === 'analytics') return 'sales-analytics';
      if (segments[1] === 'returns') return 'sales-returns';
      return 'sales';
    }
    if (segments[0] === 'distributors' && segments[1] === 'detail') return 'distributor-detail';
    if (segments[0] === 'customers' && segments[1] === 'detail') return 'customer-detail';
    if (segments[0] === 'staff' && segments[1] === 'detail') return 'staff-detail';
    if (segments[0] === 'branch-transfers') return 'branch-transfers';
    if (segments[0] === 'stock-audit') return 'stock-audit';
    if (segments[0] === 'my-space') return 'my-space';
    return segments[0] || 'dashboard';
  };

  const currentView = pathToView(location.pathname);

  // Legacy navigation adapter
  const onNavigate = (view: string) => navigate(viewToPath(view));

  const navigateWithState = (newView: string, state?: any) => {
    if (newView === 'purchase-returns' && state) setReturnState(state);
    else setReturnState(undefined);
    navigate(viewToPath(newView));
  };

  return (
    <AppShell 
      current={currentView as any} 
      currentUserRole={currentUserRole} 
      selectedBranchId={selectedBranchId}
      onBranchChange={setSelectedBranchId}
      onNavigate={onNavigate} 
      onLogout={() => navigate('/')}
    >
      <ProtectedRoutes 
        currentUserRole={currentUserRole} 
        view={currentView} 
        onNavigate={onNavigate}
        navigateWithState={navigateWithState}
        selectedDistributor={selectedDistributor}
        setSelectedDistributor={setSelectedDistributor}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        returnState={returnState}
        selectedBranchId={selectedBranchId}
      />
    </AppShell>
  );
}

function ProtectedRoutes({ currentUserRole, view, onNavigate, navigateWithState, selectedDistributor, setSelectedDistributor, selectedCustomer, setSelectedCustomer, returnState, selectedBranchId }: any) {
  const { hasAccess } = usePermissions(currentUserRole);

  const renderView = () => {
    const baseView = view.split('-')[0];
    
    // Check permission - redirect if no access
    if (baseView !== 'dashboard' && baseView !== 'my-space' && !hasAccess(baseView)) {
      return <Navigate to="/app/dashboard" replace />;
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={onNavigate} onNavigateWithState={navigateWithState} />;
      case 'purchases':
      case 'purchase-drafts':
      case 'purchase-orders':
      case 'purchase-analytics':
      case 'purchase-returns':
        return <Purchases view={view} onNavigate={onNavigate} returnState={returnState} />;
      case 'sales':
      case 'sales-drafts':
      case 'sales-analytics':
      case 'sales-returns':
        return <Sales view={view} onNavigate={onNavigate} />;
      case 'distributors':
      case 'distributor-detail':
        return <Distributors view={view} onNavigate={onNavigate} selectedDistributor={selectedDistributor} onSelectDistributor={setSelectedDistributor} onNavigateWithState={navigateWithState} />;
      case 'inventory':
        return <Inventory onNavigateWithState={navigateWithState} />;
      case 'reports':
        return <Reports selectedBranchId={selectedBranchId} />;
      case 'offers':
        return <Offers />;
      case 'settings':
        return <SettingsView />;
      case 'customers':
        return <Customers onNavigate={(v: any, id?: string) => { if (id) setSelectedCustomer(id); onNavigate(v); }} />;
      case 'customer-detail':
        return <CustomerDetail customerId={selectedCustomer!} onNavigate={(v: any, id?: string) => { if (id) setSelectedCustomer(id); onNavigate(v); }} />;
      case 'staff':
      case 'staff-detail':
        return <StaffManagement view={view} onNavigate={onNavigate} />;
      case 'expenses':
        return <Expenses />;
      case 'branch-transfers':
        return <BranchTransfers selectedBranchId={selectedBranchId} />;
      case 'stock-audit':
        return <StockAuditView selectedBranchId={selectedBranchId} />;
      case 'my-space':
        return <MySpace />;
      default:
        return <Dashboard onNavigate={onNavigate} onNavigateWithState={navigateWithState} />;
    }
  };

  return <>{renderView()}</>;
}

export default App;
