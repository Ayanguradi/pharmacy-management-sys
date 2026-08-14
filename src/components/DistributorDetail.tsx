import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Building2, MapPin, Phone, FileText, DollarSign, TrendingUp,
  Package, AlertTriangle, MessageCircle, BarChart3, CreditCard, Activity,
  Clock, Edit, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, DateRangePicker, DateRange, Select } from '@/components/ui';
import { GroupedBarChart } from '@/components/charts';
import { formatCurrency, purchaseBills, purchaseReturns, pendingPOs } from '@/data';
import type { Distributor, View } from '@/types';
import { ComparePricesPanel } from '@/components/ComparePricesPanel';
import { POReconciliationModal } from '@/components/Purchases';

// Helper to mock fulfillment
const getMockFulfillment = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 75 + (hash % 25);
};

const generateChartBuckets = (startDate: Date, endDate: Date, bills: typeof purchaseBills, returns: typeof purchaseReturns) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const data = [];

  if (diffDays <= 14) {
    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const dStr = d.toISOString().split('T')[0];
      const dailyBills = bills.filter(b => b.billDate.startsWith(dStr));
      const dailyReturns = returns.filter(r => r.createdDate.startsWith(dStr));
      const sales = dailyBills.reduce((s, b) => s + b.amount, 0);
      const purchases = dailyReturns.reduce((s, r) => s + r.expectedCreditAmount, 0);
      data.push({ label, primary: sales || Math.floor(Math.random() * 20000), secondary: purchases || Math.floor(Math.random() * 2000) });
    }
  } else if (diffDays <= 60) {
    let current = new Date(startDate);
    while (current <= endDate) {
      const label = `Week of ${current.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
      data.push({ label, primary: Math.floor(Math.random() * 80000) + 20000, secondary: Math.floor(Math.random() * 10000) });
      current.setDate(current.getDate() + 7);
    }
  } else if (diffDays <= 365) {
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= endMonth) {
      const label = current.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      data.push({ label, primary: Math.floor(Math.random() * 200000) + 50000, secondary: Math.floor(Math.random() * 20000) });
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    let current = new Date(startDate.getFullYear(), Math.floor(startDate.getMonth() / 3) * 3, 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= endMonth) {
      const q = Math.floor(current.getMonth() / 3) + 1;
      const label = `Q${q} ${current.getFullYear()}`;
      data.push({ label, primary: Math.floor(Math.random() * 800000) + 200000, secondary: Math.floor(Math.random() * 50000) });
      current.setMonth(current.getMonth() + 3);
    }
  }
  return data;
};

function TabbedPaginatedStockList({ title, tabs }: { title: string, tabs: { name: string, data: any[], valueSuffix?: string }[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  // Independent pagination state per tab
  const [pages, setPages] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    tabs.forEach(t => initial[t.name] = 1);
    return initial;
  });

  const handlePageChange = (tabName: string, delta: number) => {
    setPages(prev => ({ ...prev, [tabName]: prev[tabName] + delta }));
  };

  const activeTabData = tabs.find(t => t.name === activeTab)!;
  const page = pages[activeTab];
  const itemsPerPage = 5;
  const totalPages = Math.ceil(activeTabData.data.length / itemsPerPage);
  const visible = activeTabData.data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Card className="p-0 flex flex-col overflow-hidden">
      <div className="p-5 pb-0 border-b border-neutral-100">
        <h3 className="font-semibold text-neutral-800 mb-4">{title}</h3>
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.name
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 relative">
        <div className="space-y-3 flex-1">
          {visible.map((item, i) => (
            <div key={`${activeTab}-${i}`} className="animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                <span className="text-sm font-semibold text-neutral-800">{item.value} {activeTabData.valueSuffix || "packs left"}</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <span className="text-xs text-neutral-500">{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, activeTabData.data.length)} of {activeTabData.data.length}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(activeTab, -1)}
                className="p-1 rounded text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(activeTab, 1)}
                className="p-1 rounded text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function DistributorDetail({ distributor, onBack, detailTab, setDetailTab, onNavigateWithState }: {
  distributor: Distributor;
  onBack: () => void;
  detailTab: string;
  setDetailTab: (t: string) => void;
  onNavigateWithState?: (view: View, state?: any) => void;
}) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const [poToReconcile, setPoToReconcile] = useState<any>(null);

  // Filters
  const [billStatus, setBillStatus] = useState('All');
  const [poStatus, setPoStatus] = useState('All');
  const [returnStatus, setReturnStatus] = useState('All');

  const distBills = useMemo(() => purchaseBills.filter(b => b.distributor === distributor.name), [distributor.name]);
  const distReturns = useMemo(() => purchaseReturns.filter(r => r.distributor === distributor.name), [distributor.name]);
  const distPOs = useMemo(() => pendingPOs.filter(po => po.distributor === distributor.name), [distributor.name]);

  // Compute status
  let status = 'Settled';
  if (distributor.balance < 0) status = 'Credit';
  else if (distributor.balance > 50000) status = 'High Dues';
  else if (distributor.balance > 0) status = 'Dues';

  const fulfillmentCompleteness = getMockFulfillment(distributor.name);
  const fulfillmentOnTime = getMockFulfillment(distributor.name + 'time');
  const fulfillmentAvg = Math.round((fulfillmentCompleteness + fulfillmentOnTime) / 2);

  const returnVal = distReturns.reduce((s, r) => s + r.expectedCreditAmount, 0);
  const returnRate = distributor.totalPurchases > 0 ? (returnVal / distributor.totalPurchases) * 100 : 0;

  // Ledger computation
  const ledgerEntries = useMemo(() => {
    let entries: any[] = [];
    distBills.forEach(b => {
      entries.push({ type: 'Bill', date: b.billDate, amount: b.amount, ref: b.billNo, credit: b.amount, debit: 0, status: b.status, rawDate: new Date(b.billDate) });
      if (b.paid) {
        entries.push({ type: 'Payment', date: b.entryDate, amount: b.amount, ref: b.utr || 'CASH', credit: 0, debit: b.amount, method: b.paymentType, rawDate: new Date(b.entryDate) });
      }
    });
    distReturns.filter(r => r.status === 'Settled').forEach(r => {
      entries.push({ type: 'Credit Note', date: r.createdDate, amount: r.actualCreditAmount || r.expectedCreditAmount, ref: r.id, credit: 0, debit: r.actualCreditAmount || r.expectedCreditAmount, reason: r.reason, rawDate: new Date(r.createdDate) });
    });

    entries.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    let balance = 0;
    entries = entries.map(e => {
      balance += (e.credit - e.debit);
      return { ...e, balance };
    });
    return entries.reverse();
  }, [distBills, distReturns]);

  // Aging
  const unpaidBills = distBills.filter(b => !b.paid && b.status === 'Finalized');
  const aging = unpaidBills.reduce((acc, b) => {
    const days = Math.floor((new Date().getTime() - new Date(b.billDate).getTime()) / (1000 * 3600 * 24));
    if (days <= 30) acc['0-30'] += b.amount;
    else if (days <= 60) acc['31-60'] += b.amount;
    else if (days <= 90) acc['61-90'] += b.amount;
    else acc['90+'] += b.amount;
    return acc;
  }, { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 });

  // Recent Activity Feed
  const recentActivity = useMemo(() => {
    const evts: any[] = [];
    distBills.forEach(b => evts.push({ date: new Date(b.billDate), type: 'bill', text: `Purchase Bill ${b.billNo} generated`, amount: b.amount }));
    distBills.filter(b => b.paid).forEach(b => evts.push({ date: new Date(b.entryDate), type: 'payment', text: `Payment made via ${b.paymentType}`, amount: b.amount }));
    distPOs.forEach(po => evts.push({ date: new Date(po.date), type: 'po', text: `Purchase Order ${po.poNo} placed via ${po.placed_via}`, amount: 0 }));
    return evts.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 15);
  }, [distBills, distPOs]);

  // Analytics items
  const suppliedItems = useMemo(() => {
    const map = new Map<string, { count: number, price: number, prices: number[] }>();
    distBills.forEach(b => {
      b.items.forEach(it => {
        if (!map.has(it.name)) map.set(it.name, { count: 0, price: it.purchasePrice, prices: [] });
        const obj = map.get(it.name)!;
        obj.count += it.qty;
        obj.price = it.purchasePrice;
        obj.prices.push(it.purchasePrice);
      });
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      price: data.price,
      trend: data.prices.length > 1 ? (data.prices[data.prices.length - 1] > data.prices[data.prices.length - 2] ? 'up' : data.prices[data.prices.length - 1] < data.prices[data.prices.length - 2] ? 'down' : 'flat') : 'flat'
    }));
  }, [distBills]);

  const [compareItem, setCompareItem] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const trendData = useMemo(() => generateChartBuckets(dateRange.startDate, dateRange.endDate, distBills, distReturns), [dateRange, distBills, distReturns]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700">
          <ArrowLeft className="w-4 h-4" /> Back to Distributors
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4" />}>Edit</Button>
          <Button variant="success" size="sm" icon={<DollarSign className="w-4 h-4" />}>Record Payment</Button>
          <Button size="sm" icon={<Package className="w-4 h-4" />}>Create PO</Button>
        </div>
      </div>

      {/* Persistent Header */}
      <Card className="mb-6 p-0 overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-neutral-800">{distributor.name}</h2>
                <Badge color={status === 'High Dues' ? 'red' : status === 'Dues' ? 'amber' : status === 'Credit' ? 'green' : 'gray'}>
                  {status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{distributor.city}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{distributor.mobile}</span>
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" />GST: {distributor.gstin}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Terms: Net 30 days</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-primary-600 hover:border-primary-300 transition-colors" title="Call">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-green-500 hover:text-green-600 hover:border-green-300 transition-colors" title="WhatsApp">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 bg-neutral-50 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
            <div>
              <p className="text-xs text-neutral-500 uppercase font-medium">Balance</p>
              <p className={`text-xl font-bold mt-1 ${distributor.balance > 0 ? 'text-red-600' : distributor.balance < 0 ? 'text-green-600' : 'text-neutral-700'}`}>
                {formatCurrency(Math.abs(distributor.balance))}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-medium">Period Purchases</p>
              <p className="text-xl font-bold mt-1 text-neutral-800">{formatCurrency(distributor.totalPurchases)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-medium">Total Bills</p>
              <p className="text-xl font-bold mt-1 text-neutral-800">{distributor.totalBills}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-medium">Fulfillment</p>
              <p className={`text-xl font-bold mt-1 ${fulfillmentAvg < 85 ? 'text-red-600' : 'text-green-600'}`}>{fulfillmentAvg}%</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase font-medium">Return Rate</p>
              <p className="text-xl font-bold mt-1 text-neutral-800">{returnRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="shrink-0 w-full lg:w-auto">
            <DateRangePicker value={dateRange} onChange={setDateRange} className="w-full lg:w-56" />
          </div>
        </div>
      </Card>

      <Card className="mb-4 p-0">
        <Tabs
          tabs={[
            { id: 'bills', label: 'Bills', icon: <FileText className="w-4 h-4" /> },
            { id: 'orders', label: 'Purchase Orders', icon: <Package className="w-4 h-4" /> },
            { id: 'returns', label: 'Returns', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'ledger', label: 'Ledger', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ]}
          active={detailTab}
          onChange={setDetailTab}
          className="px-4"
        />
      </Card>


      {/* BILLS TAB */}
      {detailTab === 'bills' && (
        <Card>
          <div className="p-4 border-b border-neutral-100 flex gap-4">
            <Select value={billStatus} onChange={(e) => setBillStatus(e.target.value)} className="w-40">
              <option value="All">All Statuses</option>
              <option value="Finalized">Finalized</option>
              <option value="Draft">Draft</option>
              <option value="Returned">Returned</option>
            </Select>
          </div>
          <Table headers={['Bill No.', 'Entry Date', 'Bill Date', 'Amount', 'Payment', 'Status']}>
            {distBills.filter(b => billStatus === 'All' || b.status === billStatus).map((b) => (
              <tr key={b.id} className="hover:bg-neutral-50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-primary-600">{b.billNo}</td>
                <td className="px-4 py-3 text-neutral-600">{b.entryDate}</td>
                <td className="px-4 py-3 text-neutral-600">{b.billDate}</td>
                <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3"><Badge color="gray">{b.paymentType}</Badge></td>
                <td className="px-4 py-3">
                  <Badge color={b.status === 'Draft' ? 'amber' : b.status === 'Returned' ? 'red' : 'green'}>{b.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* POs TAB */}
      {detailTab === 'orders' && (
        <Card>
          <div className="p-4 border-b border-neutral-100 flex gap-4">
            <Select value={poStatus} onChange={(e) => setPoStatus(e.target.value)} className="w-40">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Received">Received</option>
            </Select>
          </div>
          <Table headers={['PO No.', 'Date', 'Items', 'Placed Via', 'Status', 'Action']}>
            {distPOs.filter(p => poStatus === 'All' || p.status === poStatus).map((p) => (
              <tr key={p.poNo} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-700">{p.poNo}</td>
                <td className="px-4 py-3 text-neutral-600">{p.date}</td>
                <td className="px-4 py-3 text-neutral-600">{p.items} items</td>
                <td className="px-4 py-3 text-neutral-600">{p.placed_via}</td>
                <td className="px-4 py-3">
                  <Badge color={p.status === 'Pending' ? 'amber' : 'green'}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => setPoToReconcile(p)}>Compare with bill</Button>
                </td>
              </tr>
            ))}
          </Table>
          {poToReconcile && <POReconciliationModal po={poToReconcile} onClose={() => setPoToReconcile(null)} onNavigateWithState={onNavigateWithState!} />}
        </Card>
      )}

      {/* RETURNS TAB */}
      {detailTab === 'returns' && (
        <Card>
          <div className="p-4 border-b border-neutral-100 flex gap-4">
            <Select value={returnStatus} onChange={(e) => setReturnStatus(e.target.value)} className="w-40">
              <option value="All">All Statuses</option>
              <option value="Sent">Sent</option>
              <option value="Settled">Settled</option>
              <option value="Credit-note-pending">Credit-note-pending</option>
            </Select>
          </div>
          <Table headers={['ID', 'Date', 'Item', 'Reason', 'Expected', 'Actual', 'Status']}>
            {distReturns.filter(r => returnStatus === 'All' || r.status === returnStatus).map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-700">{r.id}</td>
                <td className="px-4 py-3 text-neutral-600">{r.createdDate}</td>
                <td className="px-4 py-3 text-neutral-600">{r.itemName}</td>
                <td className="px-4 py-3"><Badge color="gray">{r.reason}</Badge></td>
                <td className="px-4 py-3 font-medium text-neutral-700">{formatCurrency(r.expectedCreditAmount)}</td>
                <td className="px-4 py-3">
                  {r.actualCreditAmount ? (
                    <span className={`font-semibold ${r.actualCreditAmount !== r.expectedCreditAmount ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(r.actualCreditAmount)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge color={r.status === 'Settled' ? 'green' : 'amber'}>{r.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* LEDGER TAB */}
      {detailTab === 'ledger' && (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">Payables Aging</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase font-medium">0-30 Days</p>
                <p className="text-lg font-bold text-neutral-800">{formatCurrency(aging['0-30'])}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded border border-amber-100">
                <p className="text-xs text-amber-700 uppercase font-medium">31-60 Days</p>
                <p className="text-lg font-bold text-amber-900">{formatCurrency(aging['31-60'])}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded border border-orange-100">
                <p className="text-xs text-orange-700 uppercase font-medium">61-90 Days</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(aging['61-90'])}</p>
              </div>
              <div className="p-3 bg-red-50 rounded border border-red-100">
                <p className="text-xs text-red-700 uppercase font-medium">90+ Days</p>
                <p className="text-lg font-bold text-red-900">{formatCurrency(aging['90+'])}</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Credit Terms Comparison</p>
                <p className="text-xs text-blue-600 mt-0.5">Average payment time vs agreed Net 30</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-900">22 Days (Actual)</p>
                <p className="text-xs text-green-600 font-medium">Within terms ✓</p>
              </div>
            </div>
          </Card>

          <Card>
            <Table headers={['Date', 'Type', 'Reference', 'Debit (-)', 'Credit (+)', 'Balance']}>
              {ledgerEntries.map((e, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-600">{e.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${e.type === 'Bill' ? 'bg-blue-50 text-blue-700' : e.type === 'Payment' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>
                      {e.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{e.ref}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{e.debit > 0 ? formatCurrency(e.debit) : '-'}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{e.credit > 0 ? formatCurrency(e.credit) : '-'}</td>
                  <td className="px-4 py-3 font-bold text-neutral-800">{formatCurrency(e.balance)}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {detailTab === 'analytics' && (
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">Purchase & Return Trend</h3>
            <div className="h-72">
              <GroupedBarChart data={trendData} height={288} />
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-center">
            <h3 className="font-semibold text-neutral-800 mb-4">Fulfillment Score</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Completeness</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-neutral-800">{fulfillmentCompleteness}%</span>
                  <span className="text-sm font-medium text-green-600 mb-1 flex items-center">↑ 2%</span>
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">On-Time</p>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${fulfillmentOnTime < 85 ? 'text-red-600' : 'text-neutral-800'}`}>{fulfillmentOnTime}%</span>
                  <span className="text-sm font-medium text-red-600 mb-1 flex items-center">↓ 1%</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TabbedPaginatedStockList
              title="Stock Movement"
              tabs={[
                {
                  name: "Non-Moving",
                  data: [
                    { label: 'Insulin Glargine', value: 25, max: 100, color: '#ef4444' },
                    { label: 'Aspirin 75mg', value: 8, max: 100, color: '#ef4444' },
                    { label: 'Omeprazole 20mg', value: 12, max: 100, color: '#f59e0b' },
                    { label: 'Vitamin C 500mg', value: 3, max: 100, color: '#ef4444' },
                    { label: 'Metformin 500mg', value: 18, max: 100, color: '#ef4444' },
                    { label: 'Amlodipine 5mg', value: 45, max: 100, color: '#f59e0b' },
                    { label: 'Losartan 50mg', value: 2, max: 100, color: '#ef4444' },
                  ]
                },
                {
                  name: "Fast-Moving",
                  data: [
                    { label: 'Paracetamol 500mg', value: 145, max: 200, color: '#22c55e' },
                    { label: 'Amoxicillin 250mg', value: 120, max: 200, color: '#22c55e' },
                    { label: 'Ibuprofen 400mg', value: 95, max: 200, color: '#22c55e' },
                    { label: 'Cetirizine 10mg', value: 88, max: 200, color: '#22c55e' },
                    { label: 'Pantoprazole 40mg', value: 76, max: 200, color: '#22c55e' },
                    { label: 'Atorvastatin 10mg', value: 65, max: 200, color: '#22c55e' },
                  ]
                }
              ]}
            />
            <TabbedPaginatedStockList
              title="Stock Freshness"
              tabs={[
                {
                  name: "Expiring",
                  valueSuffix: "days left",
                  data: [
                    { label: 'Augmentin 625 Duo', value: 12, max: 90, color: '#f59e0b' },
                    { label: 'Shelcal 500', value: 25, max: 90, color: '#f59e0b' },
                    { label: 'Cough Syrup', value: 34, max: 90, color: '#f59e0b' },
                    { label: 'Eye Drops', value: 42, max: 90, color: '#f59e0b' },
                    { label: 'Azithromycin 500mg', value: 50, max: 90, color: '#f59e0b' },
                    { label: 'Dolo 650', value: 85, max: 90, color: '#f59e0b' },
                  ]
                },
                {
                  name: "Expired",
                  valueSuffix: "days ago",
                  data: [
                    { label: 'Ointment Tube', value: 45, max: 365, color: '#ef4444' },
                    { label: 'B-Complex', value: 12, max: 365, color: '#ef4444' },
                    { label: 'Calcium Tabs', value: 5, max: 365, color: '#ef4444' },
                  ]
                }
              ]}
            />
          </div>

          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-800">Item-Level Purchase History</h3>
            </div>
            {compareItem && (
              <div className="p-4 border-b border-neutral-100 bg-primary-50/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary-800">Comparing: {compareItem}</h4>
                  <button onClick={() => setCompareItem(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors">Close</button>
                </div>
                <ComparePricesPanel initialSearch={compareItem} compact />
              </div>
            )}
            <div className="overflow-x-auto">
              <Table headers={['Item', 'Total Purchased', 'Last Price', 'Trend', 'Action']}>
                {suppliedItems.slice((historyPage - 1) * 10, historyPage * 10).map((it) => (
                  <tr key={it.name} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-700">{it.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{it.count} packs</td>
                    <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(it.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center ${it.trend === 'up' ? 'text-red-600' : it.trend === 'down' ? 'text-green-600' : 'text-neutral-400'}`}>
                        {it.trend === 'up' ? '↑' : it.trend === 'down' ? '↓' : '−'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setCompareItem(it.name)}>Compare Price</Button>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
            {suppliedItems.length > 10 && (
              <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-sm text-neutral-500">Showing {(historyPage - 1) * 10 + 1}-{Math.min(historyPage * 10, suppliedItems.length)} of {suppliedItems.length} items</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={historyPage === Math.ceil(suppliedItems.length / 10)} onClick={() => setHistoryPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
