import { useState, useMemo } from 'react';
import { 
  Users, Plus, Search, Filter, Phone, MessageCircle, Eye, 
  UserPlus, ArrowUpDown, Clock, Package, Bell, DollarSign
} from 'lucide-react';
import { Card, Badge, Button, PageHeader, StatCard, EmptyState, Select } from '@/components/ui';
import { customers, salesBills, formatCurrency, salesReturns } from '@/data';
import type { View, Customer } from '@/types';

interface CustomersProps {
  onNavigate: (v: View, id?: string) => void;
}

export function Customers({ onNavigate }: CustomersProps) {
  const [search, setSearch] = useState('');
  const [searchScope, setSearchScope] = useState('Name');
  const [filterDues, setFilterDues] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRefill, setFilterRefill] = useState('');
  const [filterReturn, setFilterReturn] = useState('');
  const [sortCol, setSortCol] = useState('recent');

  // Compute metrics for each customer based on sales bills
  const customerMetrics = useMemo(() => {
    const metrics: Record<string, { totalSpend: number, totalBills: number, lastPurchase: string, dues: number, type: string, refillStatus: string, pendingReturns: number }> = {};
    
    customers.forEach(c => {
      const bills = salesBills.filter(b => b.patient === c.name || b.mobile === c.mobile);
      const totalSpend = bills.reduce((sum, b) => sum + b.amount, 0);
      const dues = bills.reduce((sum, b) => sum + b.due, 0);
      const lastPurchase = bills.length > 0 ? bills.sort((a,b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())[0].billDate : 'N/A';
      
      let type = 'New';
      if (bills.length >= 6) type = 'Regular';
      else if (bills.length >= 2) type = 'Repeat';

      const pendingReturns = salesReturns.filter(sr => 
        (sr.patient === c.name) && (sr.status === 'Draft' || sr.status === 'Saved' || sr.status === 'Sent' || sr.status === 'Credit-note-pending')
      ).length;

      const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      let refillStatus = 'None';
      if (hash % 7 === 0) refillStatus = 'Overdue';
      else if (hash % 5 === 0) refillStatus = 'Due';
      else if (hash % 3 === 0) refillStatus = 'Upcoming';

      metrics[c.id] = { totalSpend, totalBills: bills.length, lastPurchase, dues, type, refillStatus, pendingReturns };
    });
    return metrics;
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (searchScope === 'Name' && !c.name.toLowerCase().includes(q)) return false;
        if (searchScope === 'Mobile' && !c.mobile.includes(q)) return false;
        if (searchScope === 'ID' && !c.id.toLowerCase().includes(q)) return false;
      }

      const m = customerMetrics[c.id];
      if (filterDues) {
        if (filterDues === 'Cleared' && m.dues > 0) return false;
        if (filterDues === 'Has Dues' && m.dues === 0) return false;
        // Skipping partially due for simplicity unless we want to define it explicitly based on bill states
      }

      if (filterType && m.type !== filterType) return false;

      if (filterRefill) {
        if (filterRefill === 'None' && m.refillStatus !== 'None') return false;
        if (filterRefill !== 'None' && m.refillStatus !== filterRefill) return false;
      }

      if (filterReturn) {
        if (filterReturn === 'Has Pending Return' && m.pendingReturns === 0) return false;
        if (filterReturn === 'No Pending Return' && m.pendingReturns > 0) return false;
      }

      return true;
    }).sort((a, b) => {
      const mA = customerMetrics[a.id];
      const mB = customerMetrics[b.id];
      
      if (sortCol === 'recent') {
        if (mA.lastPurchase === 'N/A') return 1;
        if (mB.lastPurchase === 'N/A') return -1;
        return new Date(mB.lastPurchase).getTime() - new Date(mA.lastPurchase).getTime();
      }
      if (sortCol === 'spend') return mB.totalSpend - mA.totalSpend;
      if (sortCol === 'dues') return mB.dues - mA.dues;
      if (sortCol === 'name') return a.name.localeCompare(b.name);
      if (sortCol === 'refill') {
        const rank = (s: string) => s === 'Overdue' ? 3 : s === 'Due' ? 2 : s === 'Upcoming' ? 1 : 0;
        return rank(mB.refillStatus) - rank(mA.refillStatus);
      }
      if (sortCol === 'returns') return mB.pendingReturns - mA.pendingReturns;
      return 0; 
    });
  }, [search, searchScope, filterDues, filterType, filterRefill, filterReturn, sortCol, customerMetrics]);

  // Overall KPIs
  const totalDues = Object.values(customerMetrics).reduce((s, m) => s + m.dues, 0);
  const repeatCount = Object.values(customerMetrics).filter(m => m.type === 'Repeat' || m.type === 'Regular').length;
  const refillsDueCount = Object.values(customerMetrics).filter(m => m.refillStatus === 'Due' || m.refillStatus === 'Overdue').length;
  const pendingReturnsCount = Object.values(customerMetrics).filter(m => m.pendingReturns > 0).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        subtitle="Manage patients, dues, and purchase history"
        action={<Button icon={<Plus className="w-4 h-4" />}>Add Customer</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Customers" value={customers.length} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label="New This Month" value={2} icon={<UserPlus className="w-5 h-5" />} color="green" />
        <StatCard label="Repeat Customers" value={repeatCount} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label="Total Dues" value={formatCurrency(totalDues)} icon={<DollarSign className="w-5 h-5" />} color="red" />
        <div onClick={() => setFilterRefill('Due')} className="cursor-pointer hover:opacity-90 transition-opacity">
          <StatCard label="Refills Due" value={refillsDueCount} icon={<Clock className="w-5 h-5" />} color="amber" />
        </div>
        <div onClick={() => setFilterReturn('Has Pending Return')} className="cursor-pointer hover:opacity-90 transition-opacity">
          <StatCard label="Pending Returns" value={pendingReturnsCount} icon={<Package className="w-5 h-5" />} color="blue" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Scoped Search */}
        <div className="flex h-[38px] border border-neutral-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary-200 transition-colors w-full md:w-96">
          <select 
            className="bg-neutral-50 border-r border-neutral-300 px-3 py-1.5 text-xs text-neutral-800 outline-none font-medium"
            value={searchScope}
            onChange={(e) => setSearchScope(e.target.value)}
          >
            <option>Name</option>
            <option>Mobile</option>
            <option>ID</option>
          </select>
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder={`Search by ${searchScope.toLowerCase()}...`}
              className="w-full h-full pl-9 pr-3 text-sm outline-none bg-transparent"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-36">
            <option value="">All Types</option>
            <option value="New">New</option>
            <option value="Repeat">Repeat</option>
            <option value="Regular">Regular</option>
          </Select>
          <Select value={filterDues} onChange={e => setFilterDues(e.target.value)} className="w-36">
            <option value="">All Dues</option>
            <option value="Cleared">Cleared</option>
            <option value="Has Dues">Has Dues</option>
          </Select>
          <Select value={filterRefill} onChange={e => setFilterRefill(e.target.value)} className="w-36">
            <option value="">All Refills</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
            <option value="None">None</option>
          </Select>
          <Select value={filterReturn} onChange={e => setFilterReturn(e.target.value)} className="w-44">
            <option value="">All Returns</option>
            <option value="Has Pending Return">Has Pending Return</option>
            <option value="No Pending Return">No Pending Return</option>
          </Select>
          <Select value={sortCol} onChange={e => setSortCol(e.target.value)} className="w-44">
            <option value="recent">Recent Purchase First</option>
            <option value="spend">Total Spend (High-Low)</option>
            <option value="dues">Dues (High-Low)</option>
            <option value="refill">Refill Due Soonest</option>
            <option value="returns">Most Pending Returns</option>
            <option value="name">Name (A-Z)</option>
          </Select>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card className="p-12">
          <EmptyState icon={<Users className="w-8 h-8" />} title="No customers found" subtitle="Try adjusting your filters or search." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(c => {
            const m = customerMetrics[c.id];
            return (
              <Card key={c.id} className="p-4 flex flex-col hover:border-primary-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-800 text-lg flex items-center flex-wrap gap-2">
                      {c.name}
                      {c.familyGroupId && <Badge color="blue" className="text-[10px]"><Users className="w-3 h-3 mr-1 inline" />Family</Badge>}
                      
                      {(m.refillStatus === 'Due' || m.refillStatus === 'Overdue') && (
                        <Badge color="amber" className="text-[10px]"><Clock className="w-3 h-3 mr-1 inline" />Refill {m.refillStatus.toLowerCase()}</Badge>
                      )}
                      {m.pendingReturns > 0 && (
                        <Badge color="blue" className="text-[10px]"><Package className="w-3 h-3 mr-1 inline" />{m.pendingReturns} pending return{m.pendingReturns > 1 ? 's' : ''}</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">{c.mobile} • {c.city}</p>
                  </div>
                  {m.dues > 0 ? (
                    <Badge color="red">₹{m.dues} Due</Badge>
                  ) : (
                    <Badge color="green">Cleared</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-100 mb-4 bg-neutral-50/50 rounded-lg px-2">
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Spend</p>
                    <p className="font-semibold text-neutral-800 text-sm">{formatCurrency(m.totalSpend)}</p>
                  </div>
                  <div className="text-center border-x border-neutral-200">
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Bills</p>
                    <p className="font-semibold text-neutral-800 text-sm">{m.totalBills}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-500 uppercase font-semibold">Last Visit</p>
                    <p className="font-semibold text-neutral-800 text-xs mt-0.5">{m.lastPurchase !== 'N/A' ? m.lastPurchase : 'Never'}</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" icon={<Phone className="w-4 h-4" />}>Call</Button>
                  <Button variant="outline" size="sm" className="flex-1" icon={<MessageCircle className="w-4 h-4 text-green-600" />} disabled={!c.whatsappConsent} title={!c.whatsappConsent ? 'Opted out' : ''}>WhatsApp</Button>
                  {(m.refillStatus === 'Due' || m.refillStatus === 'Overdue') && (
                    <Button variant="outline" size="sm" className="px-3" icon={<Bell className="w-4 h-4 text-amber-600" />} disabled={!c.whatsappConsent} title={!c.whatsappConsent ? 'WhatsApp Opted out' : 'Send Refill Reminder'}></Button>
                  )}
                  <Button size="sm" className="flex-1" icon={<Eye className="w-4 h-4" />} onClick={() => onNavigate('customer-detail', c.id)}>View</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
