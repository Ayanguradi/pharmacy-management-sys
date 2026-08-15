import { type ReactNode, useState } from 'react';
import { 
  Building2, Receipt, Ticket, BarChart3, ShieldAlert, FileKey,
  Users, Activity, LogOut, Menu, X, ChevronRight, Pill, User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AdminRole } from './types';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  roles?: AdminRole[]; // allowed roles
}

const adminNav: NavItem[] = [
  { path: '/platform-control/tenants', label: 'Pharmacies', icon: <Building2 className="w-5 h-5" /> },
  { path: '/platform-control/billing', label: 'Plans & Billing', icon: <Receipt className="w-5 h-5" />, roles: ['Super Admin', 'Finance'] },
  { path: '/platform-control/tickets', label: 'Support Tickets', icon: <Ticket className="w-5 h-5" />, roles: ['Super Admin', 'Support Agent'] },
  { path: '/platform-control/sales', label: 'Sales Pipeline', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Sales'] },
  { path: '/platform-control/analytics', label: 'Platform Analytics', icon: <BarChart3 className="w-5 h-5" />, roles: ['Super Admin'] },
  { path: '/platform-control/feature-flags', label: 'Feature Flags', icon: <FileKey className="w-5 h-5" />, roles: ['Super Admin', 'Support Agent'] },
  { path: '/platform-control/audit', label: 'Audit Log', icon: <ShieldAlert className="w-5 h-5" />, roles: ['Super Admin', 'Finance'] },
  { path: '/platform-control/health', label: 'System Health', icon: <Activity className="w-5 h-5" />, roles: ['Super Admin'] },
];

interface AdminShellProps {
  role: AdminRole;
  onLogout: () => void;
  children: ReactNode;
}

export function AdminShell({ role, onLogout, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const allowedNav = adminNav.filter(item => !item.roles || item.roles.includes(role));

  return (
    <div className="min-h-screen bg-[#0f1115] flex text-neutral-300">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-[#16191f] border-r border-[#2a2e37] flex flex-col transition-transform duration-200 w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[#2a2e37] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-sm">
            <Pill className="w-4 h-4" />
          </div>
          <div>
             <p className="font-bold text-white text-sm leading-tight">MediCore</p>
             <p className="text-[10px] text-primary-400 font-medium uppercase tracking-widest">Platform Admin</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {allowedNav.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-neutral-400 hover:bg-[#2a2e37] hover:text-neutral-200'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2a2e37] shrink-0">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-[#2a2e37] flex items-center justify-center text-neutral-400">
               <User className="w-4 h-4" />
             </div>
             <div>
               <p className="text-sm font-medium text-white">Vikram Mehta</p>
               <p className="text-xs text-neutral-500">{role}</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-[#f87171] bg-[#7f1d1d]/20 hover:bg-[#7f1d1d]/40 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-[#16191f]/90 backdrop-blur-md border-b border-[#2a2e37] flex items-center gap-4 px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-neutral-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="text-sm text-neutral-400 font-medium">
             {allowedNav.find(n => location.pathname.startsWith(n.path))?.label || 'Overview'}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
