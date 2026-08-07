import { useState } from 'react';
import {
  ShoppingCart, Plus, FileSpreadsheet, Trash2, Save,
  Upload, CheckCircle2, AlertCircle, TrendingUp, Package,
  ArrowLeft,
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, SearchBar, PageHeader, Modal, Input, Select, EmptyState, StatCard } from '@/components/ui';
import { BarChart, DonutChart, HBarChart, StackedHBarChart } from '@/components/charts';
import { purchaseBills, distributors, pendingPOs, purchaseReturns, formatCurrency } from '@/data';
import { PurchaseReturns } from './PurchaseReturns';
import type { View, PurchaseItem, PurchaseReturn } from '@/types';

const subTabs = [
  { id: 'purchases', label: 'Purchase', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'purchase-drafts', label: 'Drafts', icon: <FileSpreadsheet className="w-4 h-4" /> },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: <Package className="w-4 h-4" /> },
  { id: 'purchase-analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'purchase-returns', label: 'Returns', icon: <Package className="w-4 h-4" /> },
];

interface PurchasesProps {
  view: View;
  onNavigate: (v: View) => void;
  returnState?: Partial<PurchaseReturn>;
}

import { PurchaseOrders } from './PurchaseOrders';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

export function Purchases({ view, onNavigate, returnState }: PurchasesProps) {
  const [activeTab, setActiveTab] = useState(view);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [draftToResume, setDraftToResume] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
    endDate: new Date() 
  });
  const [sortConfig, setSortConfig] = useState<{ key: 'amount' | 'entryDate' | 'billDate'; direction: 'asc' | 'desc' } | null>(null);
  const [showReconciliation, setShowReconciliation] = useState<string | null>(null);

  const handleInternalNavigate = (v: View, state?: any) => {
    if (v === 'purchases' && state?.distributor) {
      setSearch(state.distributor);
    }
    setActiveTab(v);
    onNavigate(v);
  };

  const tabView = activeTab;

  let filtered = purchaseBills.filter((b) => {
    const matchSearch = b.billNo.toLowerCase().includes(search.toLowerCase()) ||
      b.distributor.toLowerCase().includes(search.toLowerCase());
    const matchPayment = paymentFilter === 'all' || b.paymentType === paymentFilter;
    if (tabView === 'purchase-drafts') return b.status === 'Draft' && matchSearch;
    if (tabView === 'purchase-returns') return b.status === 'Returned' && matchSearch;
    return b.status !== 'Draft' && b.status !== 'Returned' && matchSearch && matchPayment;
  });

  if (sortConfig) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }

  const handleSort = (key: 'amount' | 'entryDate' | 'billDate') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Manage purchase bills, drafts, analytics, and returns"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewEntry(true)}>New Purchase</Button>}
      />

      <Card className="mb-4">
        <Tabs tabs={subTabs} active={tabView} onChange={(t) => { setActiveTab(t as View); onNavigate(t as View); }} />
      </Card>

      {tabView === 'purchase-orders' ? (
        <PurchaseOrders onNavigateWithState={handleInternalNavigate} />
      ) : tabView === 'purchase-analytics' ? (
        <PurchaseAnalytics onNavigateWithState={handleInternalNavigate} />
      ) : tabView === 'purchase-returns' ? (
        <PurchaseReturns initialReturn={returnState} />
      ) : (
        <>
          <Card className="p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <SearchBar value={search} onChange={setSearch} placeholder="Search by bill no. or distributor..." />
                {tabView !== 'purchase-drafts' && (
                  <DateRangePicker value={dateRange} onChange={setDateRange} className="w-64" />
                )}
              </div>
              {tabView !== 'purchase-drafts' && (
                <>
                  <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="sm:w-40">
                    <option value="all">All Payments</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit">Credit</option>
                    <option value="Cash">Cash</option>
                  </Select>
                </>
              )}
            </div>
          </Card>

          <Card>
            {filtered.length === 0 ? (
              <EmptyState icon={<ShoppingCart className="w-7 h-7" />} title={tabView === 'purchase-drafts' ? "No draft bills found" : "No purchase bills found"} subtitle={tabView === 'purchase-drafts' ? "" : "Try adjusting your search or create a new purchase."} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">S.No</th>
                      <th className="px-4 py-3">{tabView === 'purchase-drafts' ? 'Draft No.' : 'Bill No.'}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('entryDate')}>
                        <div className="flex items-center gap-1">Entry Date {sortConfig?.key === 'entryDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                      </th>
                      {tabView === 'purchase-drafts' ? (
                        <th className="px-4 py-3">Last Edited</th>
                      ) : (
                        <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('billDate')}>
                          <div className="flex items-center gap-1">Bill Date {sortConfig?.key === 'billDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                        </th>
                      )}
                      {tabView !== 'purchase-drafts' && <th className="px-4 py-3">Entry By</th>}
                      <th className="px-4 py-3">Distributor</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('amount')}>
                        <div className="flex items-center gap-1">Amount {sortConfig?.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                      </th>
                      {tabView !== 'purchase-drafts' && <th className="px-4 py-3">Paid</th>}
                      {tabView === 'purchase-drafts' ? (
                        <>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </>
                      ) : (
                        <th className="px-4 py-3 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filtered.map((bill, i) => {
                  const today = new Date('2024-08-07');
                  const entryDate = new Date(bill.entryDate);
                  const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 3600 * 24));
                  const isStale = diffDays > 7 && tabView === 'purchase-drafts';
                  const relativeTime = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;

                  return (
                    <tr 
                      key={bill.id} 
                      className={`hover:bg-neutral-50 transition-colors ${tabView === 'purchase-drafts' ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (tabView === 'purchase-drafts') {
                          setDraftToResume(bill);
                          setShowNewEntry(true);
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-neutral-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-neutral-700">{bill.billNo}</td>
                      <td className="px-4 py-3 text-neutral-600">{bill.entryDate}</td>
                      {tabView === 'purchase-drafts' ? (
                        <td className="px-4 py-3 text-neutral-600">{relativeTime}</td>
                      ) : (
                        <td className="px-4 py-3 text-neutral-600">{bill.billDate}</td>
                      )}
                      {tabView !== 'purchase-drafts' && <td className="px-4 py-3 text-neutral-600">{bill.entryBy}</td>}
                      <td className="px-4 py-3 text-neutral-600">{bill.distributor}</td>
                      <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(bill.amount)}</td>
                      {tabView !== 'purchase-drafts' && (
                        <td className="px-4 py-3">
                          <Badge color={bill.paid ? 'green' : 'amber'}>{bill.paid ? 'Paid' : 'Unpaid'}</Badge>
                        </td>
                      )}
                      
                      {tabView === 'purchase-drafts' ? (
                        <>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 items-center">
                              <Badge color="gray">{bill.status}</Badge>
                              {isStale && <Badge color="amber">Stale draft</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to discard this draft?')) {
                                  // Mock discard logic
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">Print</Button>
                            <Button size="sm" variant="ghost" className="text-danger-600 hover:text-danger-700">Delete</Button>
                            <Button size="sm" variant="ghost">Logs</Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {showNewEntry && <NewPurchaseModal initialData={draftToResume} onClose={() => { setShowNewEntry(false); setDraftToResume(null); }} />}
      {showReconciliation && (
        <POReconciliationModal 
          po={pendingPOs.find(p => p.poNo === showReconciliation)!} 
          onClose={() => setShowReconciliation(null)}
          onNavigateWithState={handleInternalNavigate}
        />
      )}
    </div>
  );
}

function PurchaseAnalytics({ onNavigateWithState }: { onNavigateWithState: (v: View, state: any) => void }) {
  const [dateRange, setDateRange] = useState<DateRange>({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
    endDate: new Date() 
  });
  
  const pendingCreditNotes = purchaseReturns
    .filter(r => r.status === 'Sent' || r.status === 'Credit-note-pending')
    .reduce((sum, r) => sum + r.expectedCreditAmount, 0);

  // Compute return rates for StackedHBarChart
  const returnRateData = distributors.slice(0, 3).map(d => {
    const distReturns = purchaseReturns.filter(r => r.distributor === d.name);
    
    return {
      label: d.name,
      segments: [
        { label: 'Expired', value: distReturns.filter(r => r.reason === 'Expired' || r.reason === 'Near-expiry').reduce((s, r) => s + r.expectedCreditAmount, 0), color: '#ef4444' },
        { label: 'Non-moving', value: distReturns.filter(r => r.reason === 'Non-moving').reduce((s, r) => s + r.expectedCreditAmount, 0), color: '#f59e0b' },
        { label: 'Discrepancy (Wrong/Damage)', value: distReturns.filter(r => ['Damaged', 'Wrong-item', 'Recall'].includes(r.reason)).reduce((s, r) => s + r.expectedCreditAmount, 0), color: '#3b82f6' }
      ]
    };
  });

  const fulfillmentData = distributors.slice(0, 5).map(d => ({
    label: d.name,
    value: Math.floor(Math.random() * (100 - 80) + 80), // Mock 80-100%
    color: '#12c983'
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-200">
        <div>
          <h3 className="font-semibold text-neutral-800">Purchase Analytics</h3>
          <p className="text-xs text-neutral-500">Overview of purchases and returns</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} className="w-64" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Purchases" value={formatCurrency(98700)} icon={<ShoppingCart className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Bills" value="6" icon={<FileSpreadsheet className="w-5 h-5" />} color="green" />
        <StatCard label="Pending Dues" value={formatCurrency(86000)} icon={<AlertCircle className="w-5 h-5" />} color="amber" />
        <StatCard label="Avg Bill Value" value={formatCurrency(16450)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="Pending Credit Notes" value={formatCurrency(pendingCreditNotes)} icon={<Package className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 mb-4">Purchases by Day</h3>
          <BarChart data={[
            { label: 'Aug 1', value: 24500 }, { label: 'Aug 2', value: 18200 },
            { label: 'Aug 3', value: 40500 }, { label: 'Aug 4', value: 15600 },
          ]} height={240} />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 mb-4">Top Distributors by Purchase Value</h3>
          <HBarChart
            data={distributors.slice(0, 5).map((d) => ({ label: d.name, value: d.totalPurchases }))}
            formatter={formatCurrency}
            onRowClick={(distributor) => onNavigateWithState('purchases', { distributor })}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 mb-4">Distributor Fulfillment Score</h3>
          <p className="text-xs text-neutral-500 mb-4 -mt-3">% of PO line items delivered complete and on-time</p>
          <HBarChart
            data={fulfillmentData}
            formatter={(n) => `${n}%`}
          />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 mb-4">Return Value Breakdown by Distributor</h3>
          <StackedHBarChart
            data={returnRateData}
            formatter={formatCurrency}
            onRowClick={(distributor) => onNavigateWithState('purchases', { distributor })}
          />
        </Card>
      </div>
    </div>
  );
}

function NewPurchaseModal({ initialData, onClose }: { initialData?: any; onClose: () => void }) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'form'>(initialData ? 'form' : 'upload');
  const [items, setItems] = useState<PurchaseItem[]>(
    initialData?.items?.length ? initialData.items :
    [{ id: '1', name: '', batch: '', expiry: '', mrp: 0, qty: 0, free: 0, discount: 0, purchasePrice: 0, gst: 12, amount: 0 }]
  );
  const [fileName] = useState('');

  const updateItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === 'qty' || field === 'purchasePrice' || field === 'discount' || field === 'gst') {
        const subtotal = updated.qty * updated.purchasePrice;
        const afterDiscount = subtotal * (1 - updated.discount / 100);
        updated.amount = Math.round(afterDiscount * (1 + updated.gst / 100));
      }
      return updated;
    }));
  };

  const addItem = () => setItems((p) => [...p, { id: String(Date.now()), name: '', batch: '', expiry: '', mrp: 0, qty: 0, free: 0, discount: 0, purchasePrice: 0, gst: 12, amount: 0 }]);
  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id));

  const totalAmount = items.reduce((s, it) => s + it.amount, 0);

  return (
    <Modal open onClose={onClose} title="New Purchase Entry" size="xl">
      {step === 'upload' && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">1</span> Upload</span>
            <span className="text-neutral-300">—</span>
            <span className="flex items-center gap-1.5 text-neutral-400"><span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-xs font-bold">2</span> Map Columns</span>
            <span className="text-neutral-300">—</span>
            <span className="flex items-center gap-1.5 text-neutral-400"><span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center text-xs font-bold">3</span> Review & Save</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setStep('form')}
              className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all group"
            >
              <FileSpreadsheet className="w-10 h-10 text-neutral-400 group-hover:text-primary-500 mx-auto mb-3" />
              <p className="font-medium text-neutral-700">Import via CSV</p>
              <p className="text-sm text-neutral-400 mt-1">Upload a spreadsheet from your distributor</p>
            </button>

            <button
              onClick={() => setStep('form')}
              className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all group"
            >
              <Upload className="w-10 h-10 text-neutral-400 group-hover:text-primary-500 mx-auto mb-3" />
              <p className="font-medium text-neutral-700">Scan Hardcopy Bill</p>
              <p className="text-sm text-neutral-400 mt-1">Upload a photo of the physical bill</p>
            </button>
          </div>

          <div className="flex items-center gap-2 p-3 bg-accent-50 border border-accent-200 rounded-lg mb-4">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
            <p className="text-sm text-accent-700">Uploads auto-save as draft — you won't lose your work.</p>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="outline" onClick={() => setStep('form')}>Skip & enter manually</Button>
          </div>
        </div>
      )}

      {step === 'mapping' && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="flex items-center gap-1.5 text-accent-600"><CheckCircle2 className="w-4 h-4" /> Upload</span>
            <span className="text-neutral-300">—</span>
            <span className="flex items-center gap-1.5 text-primary-600 font-medium"><span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">2</span> Map Columns</span>
            <span className="text-neutral-300">—</span>
            <span className="text-neutral-400">Review & Save</span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-warning-50 border border-warning-200 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-warning-600" />
            <p className="text-sm text-warning-700">Some columns didn't auto-match. Map them below — we'll remember this for next time.</p>
          </div>

          <p className="text-sm font-medium text-neutral-600 mb-3">File: {fileName || 'bill_august.csv'}</p>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[
              { file: 'Item Name', system: 'Item Name' },
              { file: 'Batch No', system: 'Batch' },
              { file: 'Exp Date', system: 'Expiry' },
              { file: 'MRP', system: 'MRP' },
              { file: 'Quantity', system: 'Qty' },
              { file: 'Free Qty', system: 'Free' },
              { file: 'Disc %', system: 'Discount' },
              { file: 'PP', system: 'Purchase Price' },
              { file: 'GST %', system: 'GST %' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-neutral-600 w-32 truncate">{m.file}</span>
                <ArrowLeft className="w-4 h-4 text-neutral-300 rotate-180" />
                <select className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500" defaultValue={m.system}>
                  <option>{m.system}</option>
                  <option>Item Name</option><option>Batch</option><option>Expiry</option>
                  <option>MRP</option><option>Qty</option><option>Free</option>
                  <option>Discount</option><option>Purchase Price</option><option>GST %</option>
                </select>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 mt-4 text-sm text-neutral-600">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300 text-primary-600" />
            Remember this mapping for future uploads from this source
          </label>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={() => setStep('form')}>Continue</Button>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div>
          {/* Bill-level fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Select label="Distributor" defaultValue={initialData?.distributor}>
              {distributors.map((d) => <option key={d.id}>{d.name}</option>)}
            </Select>
            <Input label="Bill No." placeholder="INV-2024-007" defaultValue={initialData?.billNo} />
            <Input label="Bill Date" type="date" defaultValue={initialData?.billDate || "2024-08-04"} />
            <Select label="Payment Type" defaultValue={initialData?.paymentType}>
              <option>UPI</option><option>Credit</option><option>Cash</option>
            </Select>
            <Input label="UTR (for UPI/Transfer)" placeholder="UTR number" defaultValue={initialData?.utr} />
            <Input label="Entry Date" type="date" defaultValue={initialData?.entryDate || "2024-08-04"} />
          </div>

          {/* Line items */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    {['Item Name', 'Batch', 'Expiry', 'MRP', 'Qty', 'Free', 'Disc%', 'PP', 'GST%', 'Amount', ''].map((h, i) => (
                      <th key={i} className="px-2 py-2.5 text-left font-semibold text-neutral-500 uppercase text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-2 py-1.5"><input className="w-32 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" placeholder="Item name" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input className="w-20 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" placeholder="Batch" value={item.batch} onChange={(e) => updateItem(item.id, 'batch', e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input className="w-24 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" placeholder="YYYY-MM" value={item.expiry} onChange={(e) => updateItem(item.id, 'expiry', e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input type="number" className="w-16 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" value={item.mrp || ''} onChange={(e) => updateItem(item.id, 'mrp', +e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" value={item.qty || ''} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" value={item.free || ''} onChange={(e) => updateItem(item.id, 'free', +e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" value={item.discount || ''} onChange={(e) => updateItem(item.id, 'discount', +e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input type="number" className="w-16 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" value={item.purchasePrice || ''} onChange={(e) => updateItem(item.id, 'purchasePrice', +e.target.value)} /></td>
                      <td className="px-2 py-1.5"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-200 rounded text-sm focus:border-primary-500" value={item.gst} onChange={(e) => updateItem(item.id, 'gst', +e.target.value)} /></td>
                      <td className="px-2 py-1.5 font-semibold text-neutral-700 whitespace-nowrap">{formatCurrency(item.amount)}</td>
                      <td className="px-2 py-1.5"><button onClick={() => removeItem(item.id)} className="p-1 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} className="w-full py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50 flex items-center justify-center gap-1.5 border-t border-neutral-200">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-right">
              <p className="text-sm text-neutral-500">Total Amount</p>
              <p className="text-2xl font-bold text-neutral-800">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="flex justify-between border-t border-neutral-100 pt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <div className="flex gap-2">
              <Button variant="outline" icon={<Save className="w-4 h-4" />} onClick={onClose}>Save as Draft</Button>
              <Button variant="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={onClose}>Save & Finalize</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function POReconciliationModal({ po, onClose, onNavigateWithState }: { po: any, onClose: () => void, onNavigateWithState: (v: View, state: any) => void }) {
  // Mock data for reconciliation
  const items = [
    { id: '1', name: 'Montair LC', poQty: 100, billQty: 90, status: 'Short' },
    { id: '2', name: 'Dolo 650', poQty: 50, billQty: 50, status: 'Matched' },
    { id: '3', name: 'Aspirin 75mg', poQty: 0, billQty: 20, status: 'Excess' },
    { id: '4', name: 'Omeprazole 20mg', poQty: 30, billQty: 30, status: 'Matched' },
  ];

  return (
    <Modal open onClose={onClose} title="PO Reconciliation" size="lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div>
            <h3 className="font-semibold text-neutral-800">PO: {po.poNo}</h3>
            <p className="text-sm text-neutral-500">Distributor: {po.distributor}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-neutral-800">Linked Bill: {po.linkedBillId}</h3>
            <Badge color="amber">Discrepancies Found</Badge>
          </div>
        </div>

        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="py-2 text-neutral-500 font-medium">Item Name</th>
              <th className="py-2 text-neutral-500 font-medium text-right">PO Qty</th>
              <th className="py-2 text-neutral-500 font-medium text-right">Bill Qty</th>
              <th className="py-2 text-neutral-500 font-medium text-center">Variance</th>
              <th className="py-2 text-neutral-500 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map(item => {
              const variance = item.billQty - item.poQty;
              return (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="py-3 font-medium text-neutral-800">{item.name}</td>
                  <td className="py-3 text-right text-neutral-600">{item.poQty}</td>
                  <td className="py-3 text-right text-neutral-600">{item.billQty}</td>
                  <td className="py-3 text-center">
                    <Badge color={item.status === 'Matched' ? 'green' : 'amber'}>{item.status} {variance !== 0 && `(${variance > 0 ? '+' : ''}${variance})`}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    {item.status !== 'Matched' && (
                      <Button size="sm" variant="outline" onClick={() => {
                        onClose();
                        onNavigateWithState('purchase-returns', {
                          distributor: po.distributor,
                          itemName: item.name,
                          originalBillId: po.linkedBillId,
                          returnQty: Math.abs(variance),
                          reason: 'Wrong-item',
                          linkedReconciliationIssueId: po.poNo
                        });
                      }}>Add to return</Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
