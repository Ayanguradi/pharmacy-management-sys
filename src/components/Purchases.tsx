import { useState } from 'react';
import {
  ShoppingCart, Plus, FileSpreadsheet, Trash2, Save,
  Upload, CheckCircle2, AlertCircle, TrendingUp, Package,
  ArrowLeft, Printer, History, Undo2, DollarSign,
} from 'lucide-react';
import { Table, DateRangePicker, DateRange, EmptyState, Badge, Button, SearchBar, Card, Modal, Input, Select, StatCard, PageHeader, Tabs } from '@/components/ui';
import { BarChart, DonutChart, HBarChart, StackedHBarChart } from '@/components/charts';
import { purchaseBills, distributors, pendingPOs, purchaseReturns, formatCurrency, inventoryItems } from '@/data';
import { PurchaseReturns } from './PurchaseReturns';
import { RecordPaymentModal, BillLogsModal, PrintPreviewModal, DeleteConfirmModal, VoidConfirmModal } from './PaymentModals';
import { ComparePricesPanel } from './ComparePricesPanel';
import type { View, PurchaseItem, PurchaseReturn, PurchaseBill, PurchaseOrder } from '@/types';

const getMockFulfillment = (name: string) => {
  // Deterministic mock based on name length
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 75 + (hash % 25); // Range 75-99
};

const generateChartBuckets = (startDate: Date, endDate: Date) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const data = [];

  if (diffDays <= 14) {
    // Daily buckets
    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      data.push({ label, value: Math.floor(Math.random() * 30000) + 10000 });
    }
  } else if (diffDays <= 60) {
    // Weekly buckets
    let current = new Date(startDate);
    while (current <= endDate) {
      const label = `Week of ${current.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
      data.push({ label, value: Math.floor(Math.random() * 100000) + 50000 });
      current.setDate(current.getDate() + 7);
    }
  } else if (diffDays <= 365) {
    // Monthly buckets
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= endMonth) {
      const label = current.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      data.push({ label, value: Math.floor(Math.random() * 400000) + 100000 });
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    // Quarterly buckets
    let current = new Date(startDate.getFullYear(), Math.floor(startDate.getMonth() / 3) * 3, 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= endMonth) {
      const q = Math.floor(current.getMonth() / 3) + 1;
      const label = `Q${q} ${current.getFullYear()}`;
      data.push({ label, value: Math.floor(Math.random() * 1200000) + 300000 });
      current.setMonth(current.getMonth() + 3);
    }
  }
  return data;
};

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

export function Purchases({ view, onNavigate, returnState }: PurchasesProps) {
  const [activeTab, setActiveTab] = useState(view);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [draftToResume, setDraftToResume] = useState<PurchaseBill | null>(null);
  const [search, setSearch] = useState('');

  // Modal states
  const [paymentBillId, setPaymentBillId] = useState<string | null>(null);
  const [showPagePayment, setShowPagePayment] = useState(false);
  const [logsBill, setLogsBill] = useState<PurchaseBill | null>(null);
  const [printBill, setPrintBill] = useState<PurchaseBill | null>(null);
  const [deleteBill, setDeleteBill] = useState<PurchaseBill | null>(null);
  const [voidBill, setVoidBill] = useState<PurchaseBill | null>(null);

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

    // Updated payment filtering logic
    let matchPayment = true;
    if (paymentFilter !== 'all') {
      const paidAmt = b.payments?.reduce((s, p) => s + p.amount, 0) || 0;
      if (paymentFilter === 'Paid') matchPayment = paidAmt >= b.amount;
      else if (paymentFilter === 'Unpaid') matchPayment = paidAmt === 0;
      else if (paymentFilter === 'Partial') matchPayment = paidAmt > 0 && paidAmt < b.amount;
    }

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
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<DollarSign className="w-4 h-4" />} onClick={() => setShowPagePayment(true)}>Record Payment</Button>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewEntry(true)}>New Purchase</Button>
          </div>
        }
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
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
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
                      {tabView !== 'purchase-drafts' && <th className="px-4 py-3">Payment Status</th>}
                      {tabView === 'purchase-drafts' ? (
                        <>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </>
                      ) : (
                        <th className="px-4 py-3 text-center">Actions</th>
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
                          className={`hover:bg-neutral-50 transition-colors group ${tabView === 'purchase-drafts' ? 'cursor-pointer' : ''}`}
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
                              {(() => {
                                const paidAmt = bill.payments?.reduce((s, p) => s + p.amount, 0) || 0;
                                const isPaid = paidAmt >= bill.amount;
                                const isPartial = paidAmt > 0 && paidAmt < bill.amount;
                                return (
                                  <div className="flex flex-col gap-1 w-32">
                                    <Badge color={isPaid ? 'green' : isPartial ? 'amber' : 'red'}>
                                      {isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Unpaid'}
                                    </Badge>
                                    {!isPaid && (
                                      <>
                                        <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                                          {isPartial ? `${formatCurrency(paidAmt)} of ${formatCurrency(bill.amount)} paid` : `${formatCurrency(bill.amount)} due`}
                                        </span>
                                        {isPartial && (
                                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden mt-0.5">
                                            <div className="h-full bg-warning-500 rounded-full" style={{ width: `${(paidAmt / bill.amount) * 100}%` }} />
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })()}
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
                              <td className="px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => setPrintBill(bill)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                                    title="Print"
                                  >
                                    <Printer className="w-4 h-4" strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => setLogsBill(bill)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                                    title="View Logs"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-all"
                                    onClick={() => setDeleteBill(bill)}
                                    title="Delete Draft"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <td className="px-4 py-3 align-middle text-center">
                              <div className="flex justify-center items-center gap-3">
                                <button
                                  onClick={() => setPrintBill(bill)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                                  title="Print"
                                >
                                  <Printer className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => setLogsBill(bill)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all"
                                  title="View Logs"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setVoidBill(bill)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-all"
                                  title="Void Bill"
                                >
                                  <Undo2 className="w-4 h-4" />
                                </button>
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
      {paymentBillId && <RecordPaymentModal billId={paymentBillId} onClose={() => setPaymentBillId(null)} onPaymentRecorded={() => setPaymentBillId(null)} />}
      {showPagePayment && <RecordPaymentModal onClose={() => setShowPagePayment(false)} onPaymentRecorded={() => setShowPagePayment(false)} />}
      {logsBill && <BillLogsModal bill={logsBill} onClose={() => setLogsBill(null)} />}
      {printBill && <PrintPreviewModal bill={printBill} onClose={() => setPrintBill(null)} />}
      {deleteBill && <DeleteConfirmModal bill={deleteBill} onClose={() => setDeleteBill(null)} onConfirm={() => { /* mock delete */ setDeleteBill(null); }} />}
      {voidBill && <VoidConfirmModal bill={voidBill} onClose={() => setVoidBill(null)} onConfirm={(reason) => { voidBill.status = 'Voided'; voidBill.logs.push({ timestamp: new Date().toISOString(), user: 'Current User', action: 'Bill voided', details: `Reason: ${reason}` }); setVoidBill(null); }} />}
    </div>
  );
}

function DistributorPerformanceModal({ onClose, onNavigateWithState }: { onClose: () => void, onNavigateWithState: (v: View, state: any) => void }) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'purchases', direction: 'desc' });

  const tableData = distributors.map(d => {
    const distReturns = purchaseReturns.filter(r => r.distributor === d.name);
    const returnVal = distReturns.reduce((s, r) => s + r.expectedCreditAmount, 0);
    const fulfillment = getMockFulfillment(d.name);
    const returnRate = d.totalPurchases > 0 ? (returnVal / d.totalPurchases) * 100 : 0;

    return { name: d.name, purchases: d.totalPurchases, fulfillment, returnVal, returnRate };
  });

  const filtered = tableData.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  filtered.sort((a, b) => {
    let aVal = a[sortConfig.key as keyof typeof a];
    let bVal = b[sortConfig.key as keyof typeof b];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <Modal open onClose={onClose} title="Distributor Performance" size="xl">
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search distributors..." />
      </div>
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Distributor {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100 text-right" onClick={() => handleSort('purchases')}>
                  <div className="flex items-center justify-end gap-1">Purchase Value {sortConfig.key === 'purchases' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100 text-right" onClick={() => handleSort('fulfillment')}>
                  <div className="flex items-center justify-end gap-1">Fulfillment % {sortConfig.key === 'fulfillment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100 text-right" onClick={() => handleSort('returnVal')}>
                  <div className="flex items-center justify-end gap-1">Return Value {sortConfig.key === 'returnVal' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100 text-right" onClick={() => handleSort('returnRate')}>
                  <div className="flex items-center justify-end gap-1">Return Rate % {sortConfig.key === 'returnRate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No distributors found</td></tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.name} className="hover:bg-neutral-50 cursor-pointer" onClick={() => {
                    onClose();
                    onNavigateWithState('distributor-detail', { distributor: d.name });
                  }}>
                    <td className="px-4 py-3 font-medium text-neutral-800">{d.name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(d.purchases)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge color={d.fulfillment >= 90 ? 'green' : d.fulfillment >= 80 ? 'amber' : 'red'}>{d.fulfillment}%</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(d.returnVal)}</td>
                    <td className="px-4 py-3 text-right">{d.returnRate.toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function DistributorStatusCard({ allDistData, onNavigateWithState }: { allDistData: any[], onNavigateWithState: any }) {
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'purchases', direction: 'desc' });
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const itemsPerPage = 5;

  const maxPurchases = Math.max(...allDistData.map(d => d.d.totalPurchases));

  let sortedData = [...allDistData];
  sortedData.sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    if (sortConfig.key === 'purchases') { aVal = a.d.totalPurchases; bVal = b.d.totalPurchases; }
    else if (sortConfig.key === 'returnVal') { aVal = a.returnVal; bVal = b.returnVal; }
    else if (sortConfig.key === 'fulfillment') { aVal = a.fulfillment; bVal = b.fulfillment; }
    else if (sortConfig.key === 'expired') { aVal = a.segments.find((s: any) => s.label === 'Expired')?.value || 0; bVal = b.segments.find((s: any) => s.label === 'Expired')?.value || 0; }
    else if (sortConfig.key === 'nonMoving') { aVal = a.segments.find((s: any) => s.label === 'Non-moving')?.value || 0; bVal = b.segments.find((s: any) => s.label === 'Non-moving')?.value || 0; }
    else if (sortConfig.key === 'discrepancy') { aVal = a.segments.find((s: any) => s.label.includes('Discrepancy'))?.value || 0; bVal = b.segments.find((s: any) => s.label.includes('Discrepancy'))?.value || 0; }

    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  if (needsAttentionOnly) {
    sortedData = sortedData.filter(d => d.onTime < 85 || d.completeness < 85);
  }

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const startIdx = sortedData.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endIdx = Math.min(page * itemsPerPage, sortedData.length);

  return (
    <Card className="p-5 flex flex-col col-span-1 lg:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-neutral-800">Distributor Status</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 font-medium cursor-pointer">
            <input type="checkbox" checked={needsAttentionOnly} onChange={(e) => setNeedsAttentionOnly(e.target.checked)} className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500" />
            <AlertCircle className="w-4 h-4 text-amber-500" /> Needs Attention
          </label>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={sortConfig.key} onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })} className="w-full sm:w-40 text-xs py-1 h-8">
              <option value="purchases">By Purchase Value</option>
              <option value="returnVal">By Return Value</option>
              <option value="expired">By Expired Returns</option>
              <option value="nonMoving">By Non-Moving Returns</option>
              <option value="discrepancy">By Discrepancy Returns</option>
              <option value="fulfillment">By Fulfillment %</option>
            </Select>
            <button
              onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
              className="p-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 shrink-0"
            >
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {currentData.map(d => {
          const purchaseVal = d.d.totalPurchases;
          const purchaseWidth = maxPurchases > 0 ? (purchaseVal / maxPurchases) * 100 : 0;

          return (
            <div key={d.d.name} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="w-full sm:w-1/4 pt-1 flex items-center justify-between">
                  <span
                    className="text-sm font-medium text-neutral-700 truncate cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => setExpandedRow(expandedRow === d.d.name ? null : d.d.name)}
                  >
                    {d.d.name}
                  </span>
                  <div className="sm:hidden">
                    <Badge color={d.fulfillment >= 90 ? 'green' : d.fulfillment >= 85 ? 'amber' : 'red'}>{d.fulfillment}%</Badge>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="relative h-6 bg-neutral-100 rounded overflow-visible group">
                      <div className="absolute top-0 left-0 h-full bg-primary-500 rounded transition-all duration-500" style={{ width: `${purchaseWidth}%` }} />
                      <div className={`absolute top-1/2 -translate-y-1/2 flex items-center px-2 text-xs font-semibold z-10 transition-colors ${purchaseWidth < 15 ? 'left-[calc(var(--w)+4px)] text-neutral-700' : 'left-0 text-white mix-blend-difference'}`} style={{ '--w': `${purchaseWidth}%` } as any}>
                        {formatCurrency(purchaseVal)}
                      </div>
                    </div>

                    <div className="h-2 flex rounded overflow-hidden bg-neutral-100 w-full relative">
                      {d.segments.map((seg: any, i: number) => {
                        const percentage = purchaseVal > 0 ? (seg.value / purchaseVal) * 100 : 0;
                        if (percentage === 0) return null;
                        return (
                          <div
                            key={i}
                            style={{ width: `${percentage}%`, backgroundColor: seg.color }}
                            title={`${seg.label}: ${formatCurrency(seg.value)} (${percentage.toFixed(1)}%)`}
                            className="h-full hover:brightness-110 cursor-pointer"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="hidden sm:block shrink-0 w-12 text-right">
                    <Badge color={d.fulfillment >= 90 ? 'green' : d.fulfillment >= 85 ? 'amber' : 'red'}>{d.fulfillment}%</Badge>
                  </div>
                </div>
              </div>

              {(expandedRow === d.d.name || sortConfig.key === 'fulfillment') && (
                <div className="sm:ml-[25%] p-3 bg-neutral-50 rounded-lg border border-neutral-200 mt-1 mb-2 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Completeness</p>
                      <p className="text-sm font-semibold text-neutral-800">{d.completeness}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">On-Time</p>
                      <p className={`text-sm font-semibold ${d.onTime < 85 ? 'text-danger-600' : 'text-neutral-800'}`}>{d.onTime}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Total POs</p>
                      <p className="text-sm font-semibold text-neutral-800">{d.poCount}</p>
                    </div>
                    {d.avgDelay > 0 && (
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Avg Delay</p>
                        <p className="text-sm font-semibold text-danger-600">{d.avgDelay} days</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
        <span className="text-xs text-neutral-500">Showing {startIdx}-{endIdx} of {sortedData.length} distributors</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    </Card>
  );
}

function PurchaseAnalytics({ onNavigateWithState }: { onNavigateWithState: (v: View, state: any) => void }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [showAllDistributors, setShowAllDistributors] = useState(false);
  const [topDistCap, setTopDistCap] = useState(5);

  const pendingCreditNotes = purchaseReturns
    .filter(r => r.status === 'Sent' || r.status === 'Credit-note-pending')
    .reduce((sum, r) => sum + r.expectedCreditAmount, 0);

  // Compute comprehensive distributor data
  const allDistData = distributors.map(d => {
    const distReturns = purchaseReturns.filter(r => r.distributor === d.name);
    const returnVal = distReturns.reduce((s, r) => s + r.expectedCreditAmount, 0);
    const fulfillmentCompleteness = getMockFulfillment(d.name);
    const fulfillmentOnTime = getMockFulfillment(d.name + 'time');
    const poCount = Math.floor(Math.random() * 40) + 1; // 1 to 40 POs
    const prevCompleteness = fulfillmentCompleteness - (Math.random() * 10 - 5);
    const prevOnTime = fulfillmentOnTime - (Math.random() * 10 - 5);
    const avgDelay = fulfillmentOnTime < 85 ? Math.floor(Math.random() * 4) + 1 : 0;

    // Actual breakdown
    const expiredVal = distReturns.filter(r => r.reason === 'Expired' || r.reason === 'Near-expiry').reduce((s, r) => s + r.expectedCreditAmount, 0);
    const nonMovingVal = distReturns.filter(r => r.reason === 'Non-moving').reduce((s, r) => s + r.expectedCreditAmount, 0);
    const discrepancyVal = distReturns.filter(r => ['Damaged', 'Wrong-item', 'Recall'].includes(r.reason)).reduce((s, r) => s + r.expectedCreditAmount, 0);

    const finalExpired = returnVal > 0 && expiredVal === 0 ? returnVal * 0.2 : expiredVal;
    const finalNonMoving = returnVal > 0 && nonMovingVal === 0 ? returnVal * 0.3 : nonMovingVal;
    const finalDiscrepancy = returnVal > 0 && discrepancyVal === 0 ? returnVal * 0.5 : discrepancyVal;
    const totalCalculated = finalExpired + finalNonMoving + finalDiscrepancy;
    const scale = returnVal > 0 ? returnVal / totalCalculated : 1;

    return {
      d,
      returnVal,
      fulfillment: Math.round((fulfillmentCompleteness + fulfillmentOnTime) / 2),
      completeness: fulfillmentCompleteness,
      onTime: fulfillmentOnTime,
      poCount,
      trendCompleteness: fulfillmentCompleteness - prevCompleteness,
      trendOnTime: fulfillmentOnTime - prevOnTime,
      avgDelay,
      segments: returnVal === 0 ? [] : [
        { label: 'Expired', value: finalExpired * scale, color: '#ef4444' },
        { label: 'Non-moving', value: finalNonMoving * scale, color: '#f59e0b' },
        { label: 'Discrepancy (Wrong/Damage)', value: finalDiscrepancy * scale, color: '#3b82f6' }
      ]
    };
  });

  const avgFulfillment = Math.round(allDistData.reduce((s, x) => s + x.fulfillment, 0) / (allDistData.length || 1));
  const underperforming = allDistData.filter(x => x.fulfillment < 85).sort((a, b) => a.fulfillment - b.fulfillment);


  return (
    <div className="space-y-4">
      {showAllDistributors && <DistributorPerformanceModal onClose={() => setShowAllDistributors(false)} onNavigateWithState={onNavigateWithState} />}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-3 rounded-lg border border-neutral-200">
        <div>
          <h3 className="font-semibold text-neutral-800">Purchase Analytics</h3>
          <p className="text-xs text-neutral-500">Overview of purchases and returns</p>
        </div>
        <div className="hidden sm:block">
          <DateRangePicker value={dateRange} onChange={setDateRange} className="w-64" />
        </div>
        <div className="sm:hidden">
          <Button variant="outline" className="w-full justify-center">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Purchases" value={formatCurrency(98700)} icon={<ShoppingCart className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Bills" value="6" icon={<FileSpreadsheet className="w-5 h-5" />} color="green" />
        <StatCard label="Pending Dues" value={formatCurrency(86000)} icon={<AlertCircle className="w-5 h-5" />} color="amber" />
        <StatCard label="Avg Bill Value" value={formatCurrency(16450)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="Pending Credit Notes" value={formatCurrency(pendingCreditNotes)} icon={<Package className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <h3 className="font-semibold text-neutral-800 mb-4">Purchases Trend</h3>
          <div className="flex-1 min-h-[240px]">
            <BarChart data={generateChartBuckets(dateRange.startDate, dateRange.endDate)} height={240} />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col h-full min-h-[350px]">
          <ComparePricesPanel onClose={() => { }} inline />
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <DistributorStatusCard allDistData={allDistData} onNavigateWithState={onNavigateWithState} />
      </div>
    </div>
  );
}

type ExtendedPurchaseItem = PurchaseItem & {
  isNew?: boolean;
  purchase_unit?: string;
  pack_size?: number;
  sale_unit?: string;
};

function PurchaseItemRow({ item, updateItem, removeItem }: { item: ExtendedPurchaseItem, updateItem: (id: string, field: string, value: any) => void, removeItem: (id: string) => void }) {
  const [search, setSearch] = useState(item.name);
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = search ? inventoryItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [];
  const exactMatch = inventoryItems.find(i => i.name.toLowerCase() === search.toLowerCase());

  const isNewItem = search.length > 2 && !exactMatch;

  const handleSelect = (invItem: any) => {
    setSearch(invItem.name);
    setShowDropdown(false);
    updateItem(item.id, 'name', invItem.name);
    updateItem(item.id, 'purchase_unit', invItem.purchase_unit);
    updateItem(item.id, 'pack_size', invItem.pack_size);
    updateItem(item.id, 'sale_unit', invItem.sale_unit);
    updateItem(item.id, 'mrp', invItem.mrp);
    updateItem(item.id, 'purchasePrice', invItem.purchasePrice);
  };

  const packSize = item.pack_size || 1;
  const purUnit = item.purchase_unit || 'pack';
  const saleUnit = item.sale_unit || 'pack';

  const saleUnitsReceived = ((item.qty || 0) + (item.free || 0)) * packSize;
  const ppPerUnit = item.purchasePrice ? (item.purchasePrice / packSize) : 0;
  const mrpPerUnit = item.mrp ? (item.mrp / packSize) : 0;

  return (
    <>
      <tr className="border-b border-neutral-100 hover:bg-neutral-50/50">
        <td className="px-2 py-2 align-top">
          <div className="relative">
            <input
              className="w-40 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white"
              placeholder="Search or add new..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
                updateItem(item.id, 'name', e.target.value);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 shadow-lg rounded-lg z-50">
                {filtered.map(f => (
                  <div key={f.id} className="p-2 hover:bg-neutral-50 cursor-pointer text-sm border-b border-neutral-50 last:border-0" onClick={() => handleSelect(f)}>
                    <p className="font-medium text-neutral-800">{f.name}</p>
                    <p className="text-xs text-neutral-500">{f.purchase_unit} • {f.pack_size} {f.sale_unit}s</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </td>
        <td className="px-2 py-2 align-top"><input className="w-20 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" placeholder="Batch" value={item.batch} onChange={(e) => updateItem(item.id, 'batch', e.target.value)} /></td>
        <td className="px-2 py-2 align-top"><input className="w-24 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" placeholder="YYYY-MM" value={item.expiry} onChange={(e) => updateItem(item.id, 'expiry', e.target.value)} /></td>
        <td className="px-2 py-2 align-top">
          <div className="flex flex-col gap-1">
            <input type="number" className="w-20 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" value={item.mrp || ''} onChange={(e) => updateItem(item.id, 'mrp', +e.target.value)} />
            {item.mrp > 0 && packSize > 1 && <span className="text-[10px] text-neutral-500 font-medium">≈ ₹{mrpPerUnit.toFixed(2)}/{saleUnit}</span>}
          </div>
        </td>
        <td className="px-2 py-2 align-top">
          <div className="flex flex-col gap-1">
            <input type="number" className="w-16 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" value={item.qty || ''} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} />
            {item.qty > 0 && <span className="text-[10px] text-primary-600 font-medium whitespace-nowrap">= {item.qty * packSize} {saleUnit}s</span>}
          </div>
        </td>
        <td className="px-2 py-2 align-top">
          <div className="flex flex-col gap-1">
            <input type="number" className="w-16 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" value={item.free || ''} onChange={(e) => updateItem(item.id, 'free', +e.target.value)} />
            {item.free > 0 && <span className="text-[10px] text-green-600 font-medium whitespace-nowrap">+ {item.free * packSize} {saleUnit}s</span>}
          </div>
        </td>
        <td className="px-2 py-2 align-top"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" value={item.discount || ''} onChange={(e) => updateItem(item.id, 'discount', +e.target.value)} /></td>
        <td className="px-2 py-2 align-top">
          <div className="flex flex-col gap-1">
            <input type="number" className="w-20 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" value={item.purchasePrice || ''} onChange={(e) => updateItem(item.id, 'purchasePrice', +e.target.value)} />
            {item.purchasePrice > 0 && packSize > 1 && <span className="text-[10px] text-neutral-500 font-medium">≈ ₹{ppPerUnit.toFixed(2)}/{saleUnit}</span>}
          </div>
        </td>
        <td className="px-2 py-2 align-top"><input type="number" className="w-14 px-2 py-1.5 border border-neutral-300 rounded text-sm focus:border-primary-500 bg-white" value={item.gst} onChange={(e) => updateItem(item.id, 'gst', +e.target.value)} /></td>
        <td className="px-2 py-2 align-top font-bold text-neutral-800 whitespace-nowrap pt-3">{formatCurrency(item.amount)}</td>
        <td className="px-2 py-2 align-top pt-2"><button onClick={() => removeItem(item.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
      </tr>

      {isNewItem && (
        <tr className="bg-amber-50/50 border-b-2 border-amber-100">
          <td colSpan={11} className="px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-2">New item — define packaging for <span className="italic">"{search}"</span></p>
                <div className="flex flex-wrap gap-4 items-end">
                  <label className="flex flex-col gap-1 w-32">
                    <span className="text-[11px] font-medium text-amber-800">Purchase pack</span>
                    <select className="px-2 py-1.5 border border-amber-200 rounded text-sm bg-white focus:border-amber-400 outline-none" value={item.purchase_unit || ''} onChange={e => {
                      const pu = e.target.value;
                      updateItem(item.id, 'purchase_unit', pu);
                      if (pu === 'Bottle' || pu === 'Tube' || pu === 'Vial' || pu === 'Loose') {
                        updateItem(item.id, 'pack_size', 1);
                        updateItem(item.id, 'sale_unit', pu);
                      } else if (pu === 'Strip' || pu === 'Box') {
                        updateItem(item.id, 'sale_unit', 'Tablet');
                      }
                    }}>
                      <option value="">Select...</option>
                      {['Strip', 'Box', 'Bottle', 'Tube', 'Vial', 'Loose', 'Other'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 w-40">
                    <span className="text-[11px] font-medium text-amber-800">Pack Size <span className="font-normal opacity-70">(Sale packs)</span></span>
                    <input type="number" className="px-2 py-1.5 border border-amber-200 rounded text-sm bg-white focus:border-amber-400 outline-none" placeholder="e.g. 10 tabs = 10" value={item.pack_size || ''} onChange={e => {
                      const ps = +e.target.value;
                      updateItem(item.id, 'pack_size', ps);
                    }} />
                  </label>
                  <label className="flex flex-col gap-1 w-32">
                    <span className="text-[11px] font-medium text-amber-800">Sale pack</span>
                    <select className="px-2 py-1.5 border border-amber-200 rounded text-sm bg-white focus:border-amber-400 outline-none" value={item.sale_unit || ''} onChange={e => updateItem(item.id, 'sale_unit', e.target.value)}>
                      <option value="">Select...</option>
                      {['Tablet', 'Capsule', 'ml', 'Bottle', 'Tube', 'Vial', 'pack'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </label>
                </div>
                {item.pack_size === 1 && (search.toLowerCase().includes('tab') || search.toLowerCase().includes('cap')) && (
                  <p className="text-[11px] text-amber-700 mt-2 font-medium bg-amber-100/50 inline-block px-2 py-1 rounded">⚠️ This looks like a tablet/capsule item with Pack Size 1 — please confirm this is correct.</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
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
                    {['Item Name', 'Batch', 'Expiry', 'MRP (Per Pur. pack)', 'Qty (Pur. packs)', 'Free (Pur. packs)', 'Disc%', 'PP (Per Pur. pack)', 'GST%', 'Amount', ''].map((h, i) => (
                      <th key={i} className="px-2 py-3 text-left font-semibold text-neutral-500 uppercase text-[10px] tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <PurchaseItemRow
                      key={item.id}
                      item={item as ExtendedPurchaseItem}
                      updateItem={updateItem}
                      removeItem={removeItem}
                    />
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

export function POReconciliationModal({ po, onClose, onNavigateWithState }: { po: any, onClose: () => void, onNavigateWithState: (v: View, state: any) => void }) {
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
