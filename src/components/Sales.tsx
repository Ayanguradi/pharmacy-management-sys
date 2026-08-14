import React, { useState, useMemo, useRef, useEffect, KeyboardEvent } from 'react';
import {
  TrendingUp, Plus, Trash2, Save, Printer, MessageCircle, User,
  Search, Clock, AlertTriangle, DollarSign, Package, History,
  CheckCircle2, Sparkles, Filter, ArrowUpDown, ChevronDown, Check,
  X, Activity, PieChart, BarChart2
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, SearchBar, PageHeader, Modal, Input, Select, EmptyState, StatCard } from '@/components/ui';
import { BarChart, DonutChart, HBarChart } from '@/components/charts';
import { salesBills, inventoryItems, formatCurrency, offers } from '@/data';
import type { View, SalesItem, SalesBill } from '@/types';
import { SalesReturns } from './SalesReturns';

const subTabs = [
  { id: 'sales', label: 'Sales List', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'sales-drafts', label: 'Drafts', icon: <Save className="w-4 h-4" /> },
  { id: 'sales-analytics', label: 'Analytics', icon: <PieChart className="w-4 h-4" /> },
  { id: 'sales-returns', label: 'Returns', icon: <Package className="w-4 h-4" /> },
];

interface SalesProps {
  view: View;
  onNavigate: (v: View) => void;
}

export function Sales({ view, onNavigate }: SalesProps) {
  const [activeTab, setActiveTab] = useState(view);
  const [showNewSale, setShowNewSale] = useState(false);

  const [showRecordPayment, setShowRecordPayment] = useState(false);

  useEffect(() => {
    setActiveTab(view);
  }, [view]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <PageHeader
        title="Sales & Billing"
        subtitle="Manage point-of-sale, drafts, analytics, and returns"
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon={<DollarSign className="w-4 h-4" />} onClick={() => setShowRecordPayment(true)}>Record Payment</Button>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewSale(true)}>New Sale (F9)</Button>
          </div>
        }
      />

      <Card className="mb-4 shrink-0">
        <Tabs tabs={subTabs} active={activeTab} onChange={(t) => { setActiveTab(t as View); onNavigate(t as View); }} />
      </Card>

      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        {activeTab === 'sales' && <SalesList />}
        {activeTab === 'sales-drafts' && <SalesDrafts onResume={() => setShowNewSale(true)} />}
        {activeTab === 'sales-analytics' && <SalesAnalytics />}
        {activeTab === 'sales-returns' && <SalesReturns />}
      </div>

      {showNewSale && <NewSaleModal onClose={() => setShowNewSale(false)} />}
    </div>
  );
}

// ────────────────────────────────────────────────
// SALES LIST (Enhanced)
// ────────────────────────────────────────────────
function SalesList() {
  const [search, setSearch] = useState('');
  
  // Filters
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

  // Sorting
  const [sortCol, setSortCol] = useState<'date'|'billNo'|'amount'|'due'|'patient'|'staff'|'paymentMode'>('date');
  const [sortDesc, setSortDesc] = useState(true);

  // Modals
  const [viewLogsFor, setViewLogsFor] = useState<SalesBill | null>(null);
  const [printBill, setPrintBill] = useState<SalesBill | null>(null);

  const filtered = useMemo(() => {
    return salesBills.filter(b => {
      if (b.status === 'Draft' || b.status === 'Returned') return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        const match = 
          b.billNo.toLowerCase().includes(q) ||
          b.patient.toLowerCase().includes(q) ||
          b.mobile.includes(q) ||
          b.items.some(i => i.name.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Filter: Date Range
      if (filterFromDate) {
        if (new Date(b.billDate) < new Date(filterFromDate)) return false;
      }
      if (filterToDate) {
        if (new Date(b.billDate) > new Date(filterToDate)) return false;
      }

      // Filter: Mode
      if (filterMode && b.paymentMode !== filterMode) return false;

      // Filter: Status
      if (filterStatus) {
        const s = b.due === 0 ? 'Cleared' : b.due === b.amount ? 'Due' : 'Partially Due';
        if (filterStatus !== s) return false;
      }

      // Filter: Staff
      if (filterStaff && b.entryBy !== filterStaff) return false;
      
      // Filter: Patient
      if (filterPatient && b.patient !== filterPatient) return false;

      return true;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'date') cmp = a.entryDate.localeCompare(b.entryDate);
      if (sortCol === 'billNo') cmp = a.billNo.localeCompare(b.billNo);
      if (sortCol === 'amount') cmp = a.amount - b.amount;
      if (sortCol === 'due') cmp = a.due - b.due;
      if (sortCol === 'patient') cmp = a.patient.localeCompare(b.patient);
      if (sortCol === 'staff') cmp = a.entryBy.localeCompare(b.entryBy);
      if (sortCol === 'paymentMode') cmp = (a.paymentMode || '').localeCompare(b.paymentMode || '');
      return sortDesc ? -cmp : cmp;
    });
  }, [search, filterFromDate, filterToDate, filterMode, filterStatus, filterStaff, filterPatient, sortCol, sortDesc]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDesc(!sortDesc);
    else { setSortCol(col); setSortDesc(true); }
  };

  const getSortIcon = (col: typeof sortCol) => {
    if (sortCol !== col) return null;
    return <ArrowUpDown className={`w-3 h-3 ml-1 inline-block ${sortDesc ? 'opacity-100' : 'rotate-180 opacity-100'}`} />;
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row gap-3 items-center bg-white z-10 sticky top-0 flex-wrap">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto items-center">
          <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-36" title="From Date" />
          <span className="text-neutral-400 text-sm">to</span>
          <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-36" title="To Date" />
          
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-32">
            <option value="">Status</option>
            <option value="Cleared">Cleared</option>
            <option value="Partially Due">Partially Due</option>
            <option value="Due">Due</option>
          </Select>
          
          <Select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="w-32">
            <option value="">Payment</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Credit">Credit</option>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="No sales found" subtitle="Try adjusting your filters or create a new sale." />
        ) : (
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('billNo')}>Bill No. {getSortIcon('billNo')}</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('patient')}>Patient {getSortIcon('patient')}</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 uppercase text-xs">Items</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('amount')}>Amount {getSortIcon('amount')}</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('due')}>Due {getSortIcon('due')}</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('paymentMode')}>Mode {getSortIcon('paymentMode')}</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-500 uppercase text-xs cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('staff')}>Staff {getSortIcon('staff')}</th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-500 uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(bill => {
                const isCleared = bill.due === 0;
                const isPartiallyDue = bill.due > 0 && bill.due < bill.amount;
                const isDue = bill.due === bill.amount;

                return (
                  <tr key={bill.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{bill.billNo}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      <div>{bill.billDate}</div>
                      <div className="text-xs text-neutral-400">{bill.entryDate.split(' ')[1]} {bill.entryDate.split(' ')[2]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-800">{bill.patient}</div>
                      <div className="text-xs text-neutral-500">{bill.mobile}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-xs truncate max-w-[150px]">
                      {bill.items.map(i => i.name).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-800">{formatCurrency(bill.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      {isCleared && <Badge color="green">Cleared</Badge>}
                      {isDue && <Badge color="red">{formatCurrency(bill.due)} Due</Badge>}
                      {isPartiallyDue && (
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <span className="font-semibold text-amber-700">{formatCurrency(bill.due)} Due</span>
                          <span className="text-neutral-500">{formatCurrency(bill.amount - bill.due)} paid</span>
                          <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full bg-amber-500" style={{ width: `${((bill.amount - bill.due) / bill.amount) * 100}%` }} />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-800">{bill.paymentMode || '-'}</td>
                    <td className="px-4 py-3 text-neutral-800">{bill.entryBy}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewLogsFor(bill)} className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Logs">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPrintBill(bill)} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors" title="Print/Save/Share">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {viewLogsFor && <SalesLogsModal bill={viewLogsFor} onClose={() => setViewLogsFor(null)} />}
      {printBill && <PrintSalesPreviewModal bill={printBill} onClose={() => setPrintBill(null)} />}
    </Card>
  );
}

// ────────────────────────────────────────────────
// SALES DRAFTS
// ────────────────────────────────────────────────
function SalesDrafts({ onResume }: { onResume: () => void }) {
  const drafts = salesBills.filter(b => b.status === 'Draft');

  const getStaleness = (dateStr: string) => {
    const days = Math.floor((new Date('2024-08-07').getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
    return days;
  };

  return (
    <Card>
      {drafts.length === 0 ? (
        <EmptyState icon={<Save className="w-8 h-8" />} title="No drafts found" subtitle="Saved drafts will appear here." />
      ) : (
        <Table headers={['Draft No.', 'Last Edited', 'Patient', 'Items', 'Amount', 'Actions']}>
          {drafts.map(d => {
            const staleDays = getStaleness(d.billDate);
            return (
              <tr key={d.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-800">{d.billNo}</td>
                <td className="px-4 py-3 text-neutral-600 flex items-center gap-2">
                  {d.entryDate}
                  {staleDays >= 7 && <Badge color="amber">Stale ({staleDays}d)</Badge>}
                </td>
                <td className="px-4 py-3 text-neutral-800">{d.patient || 'Unknown Patient'}</td>
                <td className="px-4 py-3 text-neutral-600">{d.items.length} items</td>
                <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(d.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onResume}>Resume</Button>
                    <button className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded" title="Discard">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </Card>
  );
}

// ────────────────────────────────────────────────
// SALES ANALYTICS
// ────────────────────────────────────────────────
function SalesAnalytics() {
  // Mock calculations for demonstration
  const totalSales = 4850;
  const totalPurchases = 2100;
  const totalReturns = 350;
  const totalProfit = 1200;
  const netProfit = totalSales - totalReturns - totalPurchases;
  const returnsCount = 2;

  return (
    <div className="space-y-4 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard label="Total Sales" value={formatCurrency(totalSales)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="Profit" value={formatCurrency(totalProfit)} icon={<Activity className="w-5 h-5" />} color="green" />
        <StatCard label="Net Profit" value={formatCurrency(netProfit)} icon={<DollarSign className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Bills" value="8" icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <StatCard label="Customers" value="6" icon={<User className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Dues" value={formatCurrency(1270)} icon={<DollarSign className="w-5 h-5" />} color="red" />
        <StatCard label="Returns" value={returnsCount} icon={<Package className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-neutral-800">Sales Trend</h3>
            <Select className="w-32 text-xs">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </Select>
          </div>
          <BarChart data={[
            { label: 'Aug 1', value: 850 }, { label: 'Aug 2', value: 2630 },
            { label: 'Aug 3', value: 630 }, { label: 'Aug 4', value: 742 },
          ]} height={260} color="#1b80f5" />
        </Card>

        <Card className="p-5 flex flex-col">
          <h3 className="font-semibold text-neutral-800 mb-6">Payment Mode Split</h3>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart segments={[
              { label: 'Cash', value: 45, color: '#12c983' },
              { label: 'UPI', value: 35, color: '#1b80f5' },
              { label: 'Credit', value: 15, color: '#f59e0b' },
              { label: 'Card', value: 5, color: '#8b5cf6' },
            ]} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-neutral-800">Staff Performance</h3>
            <Select className="w-32 text-xs">
              <option>By Revenue</option>
              <option>By Bills</option>
            </Select>
          </div>
          <HBarChart data={[
            { label: 'Rahul', value: 2062, color: '#1b80f5' },
            { label: 'Priya', value: 1260, color: '#12c983' },
            { label: 'Amit', value: 990, color: '#f59e0b' },
          ]} formatter={formatCurrency} />
        </Card>

        <Card className="p-5 flex flex-col">
          <h3 className="font-semibold text-neutral-800 mb-4">Refill Reminder Performance</h3>
          <div className="flex-1 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 p-6 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-primary-500 mb-3" />
            <p className="text-4xl font-bold text-primary-700 mb-1">32%</p>
            <p className="text-sm font-medium text-primary-900 mb-2">Conversion Rate</p>
            <p className="text-xs text-neutral-500">45 reminders sent, 14 resulted in refill purchases.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// NEW SALE ENTRY (Core Billing Screen)
// ────────────────────────────────────────────────
function NewSaleModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<SalesItem[]>([]);
  const [customer, setCustomer] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Search
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Focus search on mount
  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 3) return { exact: [], related: [] };
    const q = searchTerm.toLowerCase();
    const exact = inventoryItems.filter(i => i.name.toLowerCase().includes(q) && i.stock > 0);
    const exactComps = exact.map(i => i.composition).filter(Boolean);
    const related = inventoryItems.filter(i => 
      !exact.includes(i) && i.stock > 0 && i.composition && exactComps.includes(i.composition)
    );
    return { exact, related };
  }, [searchTerm]);

  const addItem = (invItem: InventoryItem) => {
    const activeOffer = offers.find(o => o.productId === invItem.id && o.status === 'Active');
    const effectivePrice = activeOffer ? activeOffer.offerPrice : invItem.salePrice;
    const effectiveDiscount = activeOffer ? Math.round(((invItem.mrp - activeOffer.offerPrice)/invItem.mrp)*100) : invItem.discount;

    setItems(prev => [...prev, {
      id: String(Date.now() + Math.random()),
      name: invItem.name,
      batch: invItem.batch, // Assuming FEFO is default in mock data
      expiry: invItem.expiry,
      mrp: invItem.mrp,
      qty: 1,
      discount: effectiveDiscount,
      amount: effectivePrice,
      dosage: '1-0-1', // Mock logic
      offerApplied: !!activeOffer
    } as any]);
    setSearchTerm('');
    setShowResults(false);
    setTimeout(() => searchInputRef.current?.focus(), 10);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Barcode simulation: if there's exactly 1 exact match (or barcode match), add it immediately
      if (searchResults.exact.length > 0) {
        addItem(searchResults.exact[0]);
      }
    }
    if (e.key === 'Escape') {
      setSearchTerm('');
      setShowResults(false);
    }
  };

  // Keyboard shortcuts F9, Ctrl+S
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        onClose(); // Finalize
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        onClose(); // Draft
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onClose]);

  const updateItem = (id: string, field: keyof SalesItem, value: string | number) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === 'qty' || field === 'discount' || field === 'mrp') {
        updated.amount = Math.round(updated.mrp * updated.qty * (1 - updated.discount / 100));
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => setItems(p => p.filter(it => it.id !== id));
  
  const total = items.reduce((s, it) => s + it.amount, 0);

  // AI Tab
  const [aiTab, setAiTab] = useState<'dues'|'related'|'margin'|'expiry'>('margin');
  
  // Payment
  const [isSplit, setIsSplit] = useState(false);
  const [payments, setPayments] = useState([{ mode: 'Cash', amount: 0 }]);
  const [delivery, setDelivery] = useState('Self-pickup');

  // Customer autofetch mock
  const knownCustomer = customer.toLowerCase() === 'amit kumar' || mobile === '9876543210';

  return (
    <Modal open onClose={onClose} title="New Sale" size="xl">
      
      {/* 1. Header Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Input label="Bill Date" type="date" defaultValue="2024-08-07" />
        <div className="relative">
          <Input label="Customer Name" placeholder="Search or type..." value={customer} onChange={e => setCustomer(e.target.value)} />
          {knownCustomer && (
            <div className="absolute right-0 -top-5 flex items-center gap-2">
              <Badge color="red">₹450 Due</Badge>
              <button className="text-xs text-primary-600 hover:underline">View History</button>
            </div>
          )}
        </div>
        <Input label="Mobile Number" placeholder="9876543210" value={mobile} onChange={e => setMobile(e.target.value)} />
        <Input label="Doctor (Optional)" placeholder="Search doctor..." />
      </div>

      {/* 2. Item Search */}
      <div className="relative mb-5 z-20">
        <div className="relative shadow-sm rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Type 3+ letters or scan barcode (Enter to add)..."
            className="w-full pl-10 pr-4 py-3 text-sm border-2 border-primary-200 rounded-lg bg-primary-50/30 focus:border-primary-500 focus:bg-white outline-none transition-colors font-medium placeholder:font-normal"
          />
        </div>
        
        {showResults && searchTerm.length >= 3 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-fade-in divide-y divide-neutral-100">
            {searchResults.exact.length > 0 && (
              <div className="p-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase">Exact Matches</div>
                {searchResults.exact.map(item => (
                  <button key={item.id} onClick={() => addItem(item)} className="w-full flex items-center justify-between p-3 hover:bg-primary-50 rounded-lg text-left group">
                    <div>
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700">{item.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Batch: <span className="font-medium text-neutral-700">{item.batch}</span> · Exp: {item.expiry}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-800">{formatCurrency(item.mrp)}</p>
                      <p className="text-xs text-green-600 font-medium">{item.stock} in stock</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {searchResults.related.length > 0 && (
              <div className="p-1 bg-neutral-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-neutral-500 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Substitute / Alternative
                </div>
                {searchResults.related.map(item => (
                  <button key={item.id} onClick={() => addItem(item)} className="w-full flex items-center justify-between p-3 hover:bg-neutral-100 rounded-lg text-left">
                    <div>
                      <p className="text-sm font-medium text-neutral-700">{item.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.composition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-700">{formatCurrency(item.mrp)}</p>
                      <p className="text-xs text-green-600 font-medium">{item.stock} in stock</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchResults.exact.length === 0 && searchResults.related.length === 0 && (
              <div className="p-6 text-center text-neutral-500 text-sm">
                No items found. Ensure spelling is correct.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Items Grid */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              {['Item Details', 'Batch', 'Qty', 'MRP', 'Disc%', 'Amount', ''].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left font-semibold text-neutral-600 uppercase text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">Search and add items to begin billing.</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <p className="font-medium text-neutral-800">{item.name}</p>
                  <p className="text-[11px] text-primary-600 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Refill due ~14 Sept</p>
                  {(item as any).offerApplied && <span className="inline-block mt-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium border border-green-200">Offer Applied</span>}
                </td>
                <td className="px-3 py-2">
                  <select className="w-24 px-2 py-1.5 border border-neutral-200 rounded text-xs bg-white focus:border-primary-500 outline-none">
                    <option>{item.batch}</option>
                  </select>
                </td>
                <td className="px-3 py-2"><input type="number" className="w-16 px-2 py-1.5 border border-neutral-300 rounded text-sm text-center focus:border-primary-500 outline-none" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} /></td>
                <td className="px-3 py-2 text-neutral-600">{formatCurrency(item.mrp)}</td>
                <td className="px-3 py-2"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-300 rounded text-sm text-center focus:border-primary-500 outline-none" value={item.discount} onChange={(e) => updateItem(item.id, 'discount', +e.target.value)} /></td>
                <td className="px-3 py-2 font-bold text-neutral-800">{formatCurrency(item.amount)}</td>
                <td className="px-3 py-2"><button onClick={() => removeItem(item.id)} className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. AI Panel */}
      <Card className="mb-5 overflow-hidden border-primary-100 shadow-sm">
        <div className="flex border-b border-neutral-100 bg-neutral-50/50">
          {[
            { id: 'dues', label: 'Customer Dues', icon: DollarSign, show: knownCustomer },
            { id: 'margin', label: 'Best Margin', icon: TrendingUp, show: true },
            { id: 'related', label: 'Related Products', icon: Sparkles, show: items.length > 0 },
            { id: 'expiry', label: 'Nearing Expiry', icon: AlertTriangle, show: true },
          ].filter(t => t.show).map(t => (
            <button
              key={t.id}
              onClick={() => setAiTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                aiTab === t.id ? 'border-primary-600 text-primary-700 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50'
              }`}
            >
              <t.icon className={`w-3.5 h-3.5 ${aiTab === t.id ? '' : 'opacity-60'}`} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 bg-white">
          {aiTab === 'dues' && knownCustomer && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-semibold text-red-900">Outstanding Dues: ₹450</p>
                <p className="text-xs text-red-700 mt-0.5">From previous visit on Aug 03, 2024</p>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-none">Add to this bill</Button>
            </div>
          )}
          {aiTab === 'margin' && (
            <div className="flex flex-wrap gap-2">
              {inventoryItems.filter(i => i.ownBrand || i.generic).slice(0,3).map(it => (
                <div key={it.id} className="flex items-center justify-between gap-4 p-2.5 border border-primary-100 bg-primary-50/30 rounded-lg w-[300px]">
                  <div>
                    <p className="text-sm font-semibold text-primary-900">{it.name}</p>
                    <p className="text-xs text-primary-700">Margin: 40%</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addItem(it)} className="text-primary-700 hover:bg-primary-100 h-8">Add</Button>
                </div>
              ))}
            </div>
          )}
          {aiTab === 'expiry' && (
            <div className="flex flex-wrap gap-2">
              {inventoryItems.slice(8, 11).map(it => (
                <div key={it.id} className="flex items-center justify-between gap-4 p-2.5 border border-amber-100 bg-amber-50/30 rounded-lg w-[300px]">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">{it.name}</p>
                    <p className="text-xs text-amber-700">Exp: {it.expiry}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addItem(it)} className="text-amber-700 hover:bg-amber-100 h-8">Add</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 5. Payment & Delivery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Payment</span>
            <label className="flex items-center gap-2 text-xs font-medium text-primary-600 cursor-pointer">
              <input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} className="rounded border-primary-300" />
              Split Payment
            </label>
          </div>
          
          {isSplit ? (
            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Select value={p.mode} onChange={e => { const np = [...payments]; np[i].mode = e.target.value; setPayments(np); }} className="flex-1">
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </Select>
                  <Input type="number" value={p.amount} onChange={e => { const np = [...payments]; np[i].amount = +e.target.value; setPayments(np); }} className="w-32" />
                </div>
              ))}
              <button onClick={() => setPayments([...payments, { mode: 'Cash', amount: 0 }])} className="text-xs font-medium text-primary-600 hover:underline">+ Add Mode</button>
            </div>
          ) : (
            <Select className="w-full">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Credit (Due)</option>
            </Select>
          )}

          <div className="pt-2">
            <span className="text-sm font-medium text-neutral-700 block mb-1.5">Delivery</span>
            <Select value={delivery} onChange={e => setDelivery(e.target.value)} className="w-full">
              <option>Self-pickup</option>
              <option>Self-delivery</option>
              <option>Third-party delivery</option>
            </Select>
            {delivery === 'Third-party delivery' && (
              <Input placeholder="Courier Name / Tracking ID" className="mt-2" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between bg-neutral-50 p-4 rounded-xl border border-neutral-100">
          <div className="w-full space-y-2 mb-6">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Discount</span>
              <span>-₹0.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-neutral-900 border-t border-neutral-200 pt-2 mt-2">
              <span>Net Payable</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={onClose} className="w-32 justify-center">Draft <span className="text-neutral-400 font-normal text-xs ml-1">Ctrl+S</span></Button>
              <Button onClick={onClose} className="w-48 justify-center">Finalize & Print <span className="text-white/60 font-normal text-xs ml-1">F9</span></Button>
              <Button variant="outline" icon={<MessageCircle className="w-4 h-4 text-green-600" />} onClick={onClose} className="px-3" title="Finalize & Send via WhatsApp" />
            </div>
            <p className="text-[11px] text-neutral-400">Press <kbd className="bg-neutral-200 px-1 rounded text-neutral-600">Esc</kbd> to clear search</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ────────────────────────────────────────────────
// UTILITY MODALS
// ────────────────────────────────────────────────
function RecordSalesPaymentModal({ bill, onClose }: { bill: SalesBill; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Record Payment" size="sm">
      <div className="space-y-4 mb-6">
        <div className="p-3 bg-red-50 text-red-900 rounded-lg text-sm border border-red-100">
          <span className="font-semibold block">Outstanding Amount: {formatCurrency(bill.due)}</span>
          <span className="text-xs text-red-700">Patient: {bill.patient} | Bill No: {bill.billNo}</span>
        </div>
        
        <Input label="Payment Date" type="date" defaultValue="2024-08-07" />
        
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1.5">Payment Mode</span>
          <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm">
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank Transfer</option>
          </select>
        </label>
        
        <Input label="Amount Received" type="number" defaultValue={bill.due} />
        <Input label="Reference / Transaction ID (Optional)" placeholder="e.g. UTR123456" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Save Payment</Button>
      </div>
    </Modal>
  );
}

function SalesLogsModal({ bill, onClose }: { bill: SalesBill; onClose: () => void }) {
  const sortedLogs = [...bill.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return (
    <Modal open onClose={onClose} title={`Bill Logs — ${bill.billNo}`} size="md">
      {sortedLogs.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">No logs found.</div>
      ) : (
        <div className="space-y-4">
          {sortedLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-neutral-800">{log.action}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{log.timestamp} • by {log.user}</p>
                {log.details && <p className="text-neutral-600 mt-1">{log.details}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function PrintSalesPreviewModal({ bill, onClose }: { bill: SalesBill; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Preview Bill" size="lg">
      <div className="bg-neutral-100 p-8 rounded-xl flex justify-center mb-6 max-h-[60vh] overflow-y-auto">
        <div className="bg-white p-8 shadow-sm w-full max-w-md print-area">
          <div className="text-center border-b border-dashed border-neutral-300 pb-4 mb-4">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">HEALTHPLUS PHARMACY</h2>
            <p className="text-xs text-neutral-500">123 Health Avenue, Medical District</p>
            <p className="text-xs text-neutral-500">Phone: +91 98765 43210</p>
          </div>
          <div className="flex justify-between text-xs mb-6 text-neutral-700">
            <div>
              <p><span className="font-semibold">Bill No:</span> {bill.billNo}</p>
              <p><span className="font-semibold">Date:</span> {bill.entryDate}</p>
            </div>
            <div className="text-right">
              <p><span className="font-semibold">Patient:</span> {bill.patient}</p>
              <p><span className="font-semibold">Doctor:</span> {bill.doctor || 'Self'}</p>
            </div>
          </div>
          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Rate</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map(i => (
                <tr key={i.id}>
                  <td className="py-1">{i.name}</td>
                  <td className="text-right py-1">{i.qty}</td>
                  <td className="text-right py-1">{formatCurrency(i.mrp)}</td>
                  <td className="text-right py-1">{formatCurrency(i.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-neutral-800 pt-2 flex justify-between font-bold text-sm">
            <span>Total Payable</span>
            <span>{formatCurrency(bill.amount)}</span>
          </div>
          <p className="text-center text-[10px] text-neutral-400 mt-8">Thank you for your visit!</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button variant="outline" icon={<Download className="w-4 h-4" />}>Download PDF</Button>
        <Button icon={<Printer className="w-4 h-4" />}>Print</Button>
      </div>
    </Modal>
  );
}
