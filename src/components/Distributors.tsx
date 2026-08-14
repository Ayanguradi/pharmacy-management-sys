import { useState, useMemo } from 'react';
import {
  Plus, Phone, MapPin, FileText, DollarSign, TrendingUp,
  Package, ArrowLeft, Building2, AlertTriangle, BarChart3,
  Search, MessageCircle, CheckCircle2
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, SearchBar, PageHeader, Modal, Input, StatCard, EmptyState, Select } from '@/components/ui';
import { LineChart, HBarChart, DonutChart } from '@/components/charts';
import { distributors, purchaseBills, inventoryItems, formatCurrency } from '@/data';
import type { View, Distributor } from '@/types';
import { DistributorDetail } from '@/components/DistributorDetail';

interface DistributorsProps {
  view: View;
  onNavigate: (v: View) => void;
  selectedDistributor: string | null;
  onSelectDistributor: (id: string | null) => void;
  onNavigateWithState?: (view: View, state?: any) => void;
}

export function Distributors({ view, onNavigate, selectedDistributor, onSelectDistributor, onNavigateWithState }: DistributorsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('balanceDesc');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [detailTab, setDetailTab] = useState('analytics');



  const processedDistributors = useMemo(() => {
    return distributors.map(d => {
      const distBills = purchaseBills.filter(b => b.distributor === d.name);
      const lastPurchase = distBills.sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())[0]?.billDate || 'No purchases';
      
      const hash = d.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const fulfillment = 75 + (hash % 25);
      
      let status = 'Settled';
      if (d.balance < 0) status = 'Credit';
      else if (d.balance > 50000) status = 'High Dues';
      else if (d.balance > 0) status = 'Dues';

      return { ...d, lastPurchase, fulfillment, status };
    });
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = processedDistributors.filter(d => 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.gstin.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== 'All') {
      result = result.filter(d => d.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'balanceDesc': return b.balance - a.balance;
        case 'balanceAsc': return a.balance - b.balance;
        case 'totalBills': return b.totalBills - a.totalBills;
        case 'lastPurchase': 
          if (a.lastPurchase === 'No purchases') return 1;
          if (b.lastPurchase === 'No purchases') return -1;
          return new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime();
        case 'nameAsc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [processedDistributors, search, statusFilter, sortBy]);

  const visibleDistributors = filteredAndSorted.slice(0, page * 12);

  if (view === 'distributor-detail' && selectedDistributor) {
    const dist = distributors.find((d) => d.id === selectedDistributor);
    if (dist) return <DistributorDetail distributor={dist} onBack={() => { onSelectDistributor(null); onNavigate('distributors'); }} detailTab={detailTab} setDetailTab={setDetailTab} onNavigateWithState={onNavigateWithState} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Distributors"
        subtitle="Manage your supplier relationships, dues, and orders."
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Distributor</Button>}
      />

      <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by name, city, or GSTIN..." 
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <select 
            className="border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px] text-sm text-neutral-700 bg-white"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Settled">Settled</option>
            <option value="Dues">Dues</option>
            <option value="High Dues">High Dues</option>
            <option value="Credit">Credit</option>
          </select>
          <select 
            className="border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px] text-sm text-neutral-700 bg-white"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="balanceDesc">Balance (High to Low)</option>
            <option value="balanceAsc">Balance (Low to High)</option>
            <option value="totalBills">Total Bills</option>
            <option value="lastPurchase">Last Purchase</option>
            <option value="nameAsc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <EmptyState icon={<Building2 className="w-8 h-8"/>} title="No distributors match your search" subtitle="Try adjusting your filters or search terms." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleDistributors.map((d) => (
              <Card key={d.id} className="p-0 overflow-hidden flex flex-col hover:border-primary-300 transition-colors shadow-sm">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-800 text-base leading-tight mb-1 line-clamp-2" title={d.name}>{d.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">GST: {d.gstin}</span>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1" title="Fulfillment Score">
                            <CheckCircle2 className="w-3 h-3" /> {d.fulfillment}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <Badge color={d.status === 'High Dues' ? 'red' : d.status === 'Dues' ? 'amber' : d.status === 'Credit' ? 'green' : 'gray'}>
                        {d.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${d.status === 'High Dues' || d.status === 'Dues' ? 'bg-red-50' : d.status === 'Credit' ? 'bg-green-50' : 'bg-neutral-50'}`}>
                      <p className="text-[10px] text-neutral-500 uppercase font-medium mb-1 truncate" title="Balance">Balance</p>
                      <p className={`font-semibold text-sm ${d.status === 'High Dues' || d.status === 'Dues' ? 'text-red-700' : d.status === 'Credit' ? 'text-green-700' : 'text-neutral-700'}`}>
                        {formatCurrency(Math.abs(d.balance))}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-50">
                      <p className="text-[10px] text-neutral-500 uppercase font-medium mb-1 truncate" title="Total Bills">Total Bills</p>
                      <p className="font-semibold text-sm text-neutral-700">{d.totalBills}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-50">
                      <p className="text-[10px] text-neutral-500 uppercase font-medium mb-1 truncate" title="Last Purchase">Last Purchase</p>
                      <p className="font-semibold text-sm text-neutral-700 truncate" title={d.lastPurchase}>
                        {d.lastPurchase === 'No purchases' ? '-' : new Date(d.lastPurchase).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[80px]" title={d.city}>{d.city}</span></span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {d.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:border-primary-300 transition-colors" title="Call">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-green-500 hover:text-green-600 hover:border-green-300 transition-colors" title="WhatsApp">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <Button size="sm" variant="outline" onClick={() => { onSelectDistributor(d.id); onNavigate('distributor-detail'); }}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredAndSorted.length > visibleDistributors.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setPage(p => p + 1)}>Load More</Button>
            </div>
          )}
        </>
      )}

      {showAdd && <AddDistributorModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}


function AddDistributorModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Add Distributor" size="md">
      <div className="space-y-4">
        <Input label="Distributor Name" placeholder="e.g. MediSupply Distributors" />
        <Input label="GSTIN" placeholder="27ABCDE1234F1Z5" />
        <Input label="Mobile Number" placeholder="98765 43210" />
        <Input label="City" placeholder="Mumbai" />
        <Input label="Opening Balance" type="number" placeholder="0" />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Add Distributor</Button>
        </div>
      </div>
    </Modal>
  );
}
