import { type ReactNode, useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, TrendingUp, Package, Users, FileBarChart,
  Tag, Settings, LogOut, Menu, X, Bell, Search, Pill, ChevronDown, ChevronLeft, ChevronRight, Truck, UserCog, Receipt
} from 'lucide-react';
import type { View, StaffMember } from '@/types';

interface NavItem {
  id: View;
  label: string;
  icon: ReactNode;
  group?: string;
  roles?: string[]; // Allowed roles. If undefined, all roles allowed.
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'purchases', label: 'Purchases', icon: <ShoppingCart className="w-5 h-5" />, group: 'Procurement' },
  { id: 'distributors', label: 'Distributors', icon: <Truck className="w-5 h-5" />, group: 'Procurement' },
  { id: 'sales', label: 'Sales & Billing', icon: <TrendingUp className="w-5 h-5" />, group: 'Operations' },
  { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" />, group: 'Operations' },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" />, group: 'Operations' },
  { id: 'reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5" />, group: 'Insights' },
  { id: 'offers', label: 'Offers', icon: <Tag className="w-5 h-5" />, group: 'Insights' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, group: 'System' },
  { id: 'staff', label: 'Staff', icon: <UserCog className="w-5 h-5" />, group: 'Management', roles: ['Owner', 'Admin', 'Manager'] },
  { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-5 h-5" />, group: 'Management', roles: ['Owner', 'Admin', 'Manager'] },
];

const viewLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'purchases': 'Purchases', 'purchase-drafts': 'Purchase Drafts', 'purchase-analytics': 'Purchase Analytics', 'purchase-returns': 'Purchase Returns',
  'sales': 'Sales', 'sales-drafts': 'Sales Drafts', 'sales-analytics': 'Sales Analytics', 'sales-returns': 'Sales Returns',
  'distributors': 'Distributors', 'distributor-detail': 'Distributor Detail',
  'inventory': 'Inventory',
  'reports': 'Reports',
  'offers': 'Offers',
  'settings': 'Settings',
};

interface AppShellProps {
  current: View;
  currentUserRole?: string;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({ current, currentUserRole = 'Admin', onNavigate, onLogout, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const baseView = current.split('-')[0] as View;
  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(currentUserRole));
  const groups = Array.from(new Set(filteredNavItems.map((item) => item.group || '')));

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-neutral-200 flex flex-col transition-[width,transform] duration-200 overflow-visible ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 shadow-sm z-50 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`flex items-center px-5 h-16 border-b border-neutral-200 shrink-0 ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <p className="font-bold text-neutral-800 text-sm leading-tight">MediCore</p>
            <p className="text-xs text-neutral-400">Pharmacy Suite</p>
          </div>
          {!sidebarCollapsed && (
            <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 text-neutral-400 hover:text-neutral-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-visible py-4 px-3 space-y-4">
          {groups.map((group) => (
            <div key={group}>
              {group !== 'Main' && (
                sidebarCollapsed ? (
                  <hr className="my-3 mx-2 border-neutral-100" />
                ) : (
                  <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider transition-all duration-200">{group}</p>
                )
              )}
              <div className="space-y-1">
                {filteredNavItems.filter(item => (item.group || 'Main') === group).map((item) => {
                  const active = current === item.id || baseView === item.id ||
                    (item.id === 'purchases' && current.startsWith('purchase')) ||
                    (item.id === 'sales' && current.startsWith('sales'));
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                        className={`w-full flex items-center py-2 rounded-lg text-sm font-medium transition-all ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${
                          active
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                        }`}
                      >
                        <span className={`shrink-0 ${active ? 'text-primary-600' : 'text-neutral-400'}`}>{item.icon}</span>
                        <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                          {item.label}
                        </span>
                      </button>
                      
                      {/* Tooltip */}
                      {sidebarCollapsed && (
                        <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                          {item.label}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[4px] border-transparent border-r-neutral-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-neutral-200 shrink-0">
          {sidebarCollapsed ? (
             <div className="flex flex-col items-center justify-center py-2 relative group cursor-pointer">
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-accent-50">
                   <svg className="w-10 h-10 absolute -rotate-90">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#e0e7ff" strokeWidth="4" />
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="100.53" strokeDashoffset="22.11" strokeLinecap="round" />
                   </svg>
                   <span className="text-[10px] font-bold text-primary-700 z-10">11</span>
                </div>
                {/* Tooltip for Free Trial */}
                <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  11 days left on trial
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[4px] border-transparent border-r-neutral-900"></div>
                </div>
             </div>
          ) : (
            <div className="rounded-xl bg-gradient-to-br from-accent-50 to-primary-50 p-4">
              <p className="text-xs font-semibold text-neutral-700">Free Trial</p>
              <p className="text-2xl font-bold text-primary-700 mt-1">11 <span className="text-sm font-normal text-neutral-500">days left</span></p>
              <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: '78%' }} />
              </div>
              <button className="mt-3 w-full text-xs font-semibold text-primary-700 bg-white py-2 rounded-lg hover:bg-primary-50 transition-colors">
                Upgrade Plan
              </button>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-neutral-900/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200 flex items-center gap-4 px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-400">MediCore</span>
            <span className="text-neutral-300">/</span>
            <span className="font-medium text-neutral-700">{viewLabels[current] ?? 'Dashboard'}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                placeholder="Search anything..."
                className="w-56 pl-10 pr-4 py-2 text-sm bg-neutral-100 border border-transparent rounded-lg focus:bg-white focus:border-primary-300 transition-all"
              />
            </div>

            <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
            </button>

            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 pr-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">A</div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-neutral-700 leading-tight">Apollo Pharmacy</p>
                  <p className="text-xs text-neutral-400">Admin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-20 animate-fade-in">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-700">Apollo Pharmacy</p>
                      <p className="text-xs text-neutral-400">admin@apollo.pharmacy</p>
                    </div>
                    <button onClick={() => { onNavigate('settings'); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
