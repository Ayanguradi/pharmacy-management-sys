import { type ReactNode, useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, TrendingUp, Package, Users, FileBarChart,
  Tag, Settings, LogOut, Menu, X, Bell, Search, Pill, ChevronDown,
} from 'lucide-react';
import type { View } from '@/types';

interface NavItem {
  id: View;
  label: string;
  icon: ReactNode;
  group?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'purchases', label: 'Purchases', icon: <ShoppingCart className="w-5 h-5" />, group: 'Procurement' },
  { id: 'distributors', label: 'Distributors', icon: <Users className="w-5 h-5" />, group: 'Procurement' },
  { id: 'sales', label: 'Sales', icon: <TrendingUp className="w-5 h-5" />, group: 'Operations' },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" />, group: 'Operations' },
  { id: 'reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5" />, group: 'Insights' },
  { id: 'offers', label: 'Offers', icon: <Tag className="w-5 h-5" />, group: 'Insights' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, group: 'System' },
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
  onNavigate: (v: View) => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppShell({ current, onNavigate, onLogout, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const baseView = current.split('-')[0] as View;
  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? 'Main';
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-200 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-800 text-sm leading-tight">MediCore</p>
            <p className="text-xs text-neutral-400">Pharmacy Suite</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              {group !== 'Main' && <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">{group}</p>}
              <div className="space-y-1">
                {items.map((item) => {
                  const active = current === item.id || baseView === item.id ||
                    (item.id === 'purchases' && current.startsWith('purchase')) ||
                    (item.id === 'sales' && current.startsWith('sales'));
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                      }`}
                    >
                      <span className={active ? 'text-primary-600' : 'text-neutral-400'}>{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-200 shrink-0">
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
