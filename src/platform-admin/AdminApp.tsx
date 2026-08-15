import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminLogin } from './AdminLogin';
import { AdminShell } from './AdminShell';
import type { AdminRole } from './types';

// Page components (will create these next)
import { TenantList } from './pages/TenantList';
import { TenantDetail } from './pages/TenantDetail';
import { PlanCatalog } from './pages/PlanCatalog';
import { SupportTickets } from './pages/SupportTickets';
import { TicketDetail } from './pages/TicketDetail';
import { PlatformAnalytics } from './pages/PlatformAnalytics';
import { FeatureFlags } from './pages/FeatureFlags';
import { AuditLog } from './pages/AuditLog';
import { SalesPipeline } from './pages/SalesPipeline';
import { SystemHealth } from './pages/SystemHealth';

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [role] = useState<AdminRole>('Super Admin'); // Mock logged-in role
  const navigate = useNavigate();

  if (!authed) {
    return (
      <Routes>
        <Route path="login" element={<AdminLogin onLogin={() => { setAuthed(true); navigate('/platform-control/tenants'); }} />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  }

  return (
    <AdminShell role={role} onLogout={() => { setAuthed(false); navigate('/platform-control/login'); }}>
      <Routes>
        <Route path="tenants" element={<TenantList />} />
        <Route path="tenants/:id" element={<TenantDetail />} />
        <Route path="billing" element={<PlanCatalog />} />
        <Route path="tickets" element={<SupportTickets />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
        <Route path="feature-flags" element={<FeatureFlags />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="sales" element={<SalesPipeline />} />
        <Route path="health" element={<SystemHealth />} />
        
        <Route path="*" element={<Navigate to="tenants" replace />} />
      </Routes>
    </AdminShell>
  );
}
