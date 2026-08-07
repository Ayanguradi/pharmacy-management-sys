import { useState } from 'react';
import {
  TrendingUp, Plus, Trash2, Save, Printer, MessageCircle, User,
  Search, Clock, AlertTriangle, DollarSign, Package, History,
  CheckCircle2, Sparkles,
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, SearchBar, PageHeader, Modal, Input, Select, EmptyState, StatCard } from '@/components/ui';
import { BarChart, DonutChart, HBarChart } from '@/components/charts';
import { salesBills, inventoryItems, formatCurrency } from '@/data';
import type { View, SalesItem } from '@/types';

const subTabs = [
  { id: 'sales', label: 'Sales', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'sales-drafts', label: 'Drafts', icon: <Save className="w-4 h-4" /> },
  { id: 'sales-analytics', label: 'Analytics', icon: <Search className="w-4 h-4" /> },
  { id: 'sales-returns', label: 'Returns', icon: <Package className="w-4 h-4" /> },
];

interface SalesProps {
  view: View;
  onNavigate: (v: View) => void;
}

export function Sales({ view, onNavigate }: SalesProps) {
  const [activeTab, setActiveTab] = useState(view);
  const [search, setSearch] = useState('');
  const [showNewSale, setShowNewSale] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const tabView = activeTab;
  const filtered = salesBills.filter((b) => {
    const matchSearch = b.billNo.toLowerCase().includes(search.toLowerCase()) ||
      b.patient.toLowerCase().includes(search.toLowerCase()) ||
      b.mobile.includes(search);
    if (tabView === 'sales-drafts') return b.status === 'Draft' && matchSearch;
    if (tabView === 'sales-returns') return b.status === 'Returned' && matchSearch;
    return b.status !== 'Draft' && b.status !== 'Returned' && matchSearch;
  });

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Create bills, track dues, and manage returns"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewSale(true)}>New Sale</Button>}
      />

      <Card className="mb-4">
        <Tabs tabs={subTabs} active={tabView} onChange={(t) => { setActiveTab(t as View); onNavigate(t as View); }} />
      </Card>

      {tabView === 'sales-analytics' ? (
        <SalesAnalytics />
      ) : (
        <>
          <Card className="p-4 mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by bill no., patient, or mobile..." />
          </Card>

          <Card>
            {filtered.length === 0 ? (
              <EmptyState icon={<TrendingUp className="w-7 h-7" />} title="No sales bills found" subtitle="Create a new sale to get started." />
            ) : (
              <Table headers={['Bill No.', 'Entry Date', 'Bill Date', 'Entry By', 'Patient', 'Mobile', 'Amount', 'Due', 'Actions']}>
                {filtered.map((bill) => (
                  <tr key={bill.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-700">{bill.billNo}</td>
                    <td className="px-4 py-3 text-neutral-600">{bill.entryDate}</td>
                    <td className="px-4 py-3 text-neutral-600">{bill.billDate}</td>
                    <td className="px-4 py-3 text-neutral-600">{bill.entryBy}</td>
                    <td className="px-4 py-3 text-neutral-600">{bill.patient}</td>
                    <td className="px-4 py-3 text-neutral-600">{bill.mobile}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(bill.amount)}</td>
                    <td className="px-4 py-3">
                      {bill.due > 0 ? <span className="font-semibold text-danger-600">{formatCurrency(bill.due)}</span> : <Badge color="green">Cleared</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setShowHistory(bill.id)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="History"><History className="w-4 h-4" /></button>
                        <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg" title="Print"><Printer className="w-4 h-4" /></button>
                        <button className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg" title="WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </>
      )}

      {showNewSale && <NewSaleModal onClose={() => setShowNewSale(false)} />}
      {showHistory && <HistoryModal billId={showHistory} onClose={() => setShowHistory(null)} />}
    </div>
  );
}

function NewSaleModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<SalesItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const searchResults = searchTerm.length >= 3
    ? inventoryItems.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  const addItem = (invItem: typeof inventoryItems[0]) => {
    setItems((prev) => [...prev, {
      id: String(Date.now()),
      name: invItem.name,
      batch: invItem.batch,
      expiry: invItem.expiry,
      mrp: invItem.mrp,
      qty: 1,
      discount: invItem.discount,
      amount: invItem.salePrice,
    }]);
    setSearchTerm('');
    setShowResults(false);
  };

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

  const removeItem = (id: string) => setItems((p) => p.filter((it) => it.id !== id));
  const total = items.reduce((s, it) => s + it.amount, 0);

  return (
    <Modal open onClose={onClose} title="New Sale" size="xl">
      {/* Customer info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Input label="Bill Date" type="date" defaultValue="2024-08-04" />
        <Input label="Customer Name" placeholder="Patient name" />
        <Input label="Mobile Number" placeholder="98765 43210" />
        <Input label="Doctor" placeholder="Dr. name" />
      </div>

      <button className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-700 mb-4">
        <User className="w-4 h-4" /> Fetch previous record
      </button>

      {/* Item search */}
      <div className="relative mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Search Item</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Type 3+ letters to search items..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        {showResults && searchTerm.length >= 3 && (
          <div className="absolute z-10 top-full mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto animate-fade-in">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItem(item)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 border-b border-neutral-100 last:border-0 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{item.name}</p>
                    <p className="text-xs text-neutral-400">Batch {item.batch} · Exp {item.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-700">{formatCurrency(item.mrp)}</p>
                    <p className={`text-xs ${item.stock <= item.minStock ? 'text-danger-600' : 'text-accent-600'}`}>{item.stock} in stock</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4">
                <p className="text-sm text-neutral-500 mb-2">No exact match found. Related items:</p>
                {inventoryItems.slice(0, 3).map((item) => (
                  <button key={item.id} onClick={() => addItem(item)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 rounded-lg text-left">
                    <span className="text-sm text-neutral-600">{item.name}</span>
                    <span className="text-xs text-neutral-400">{formatCurrency(item.mrp)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items table */}
      {items.length > 0 && (
        <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="border-b border-neutral-200">
                {['Item', 'Batch', 'Expiry', 'MRP', 'Qty', 'Disc%', 'Amount', ''].map((h, i) => (
                  <th key={i} className="px-3 py-2.5 text-left font-semibold text-neutral-500 uppercase text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-1.5 font-medium text-neutral-700">{item.name}</td>
                  <td className="px-3 py-1.5 text-neutral-600">{item.batch}</td>
                  <td className="px-3 py-1.5 text-neutral-600">{item.expiry}</td>
                  <td className="px-3 py-1.5 text-neutral-600">{formatCurrency(item.mrp)}</td>
                  <td className="px-3 py-1.5"><input type="number" className="w-14 px-2 py-1 border border-neutral-200 rounded text-sm" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', +e.target.value)} /></td>
                  <td className="px-3 py-1.5"><input type="number" className="w-14 px-2 py-1 border border-neutral-200 rounded text-sm" value={item.discount} onChange={(e) => updateItem(item.id, 'discount', +e.target.value)} /></td>
                  <td className="px-3 py-1.5 font-semibold text-neutral-700">{formatCurrency(item.amount)}</td>
                  <td className="px-3 py-1.5"><button onClick={() => removeItem(item.id)} className="p-1 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI-assisted bottom panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Card className="p-4 bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary-500" /> Smart Suggestions</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 flex items-center gap-2"><DollarSign className="w-4 h-4 text-danger-500" /> Customer Dues</span>
              <span className="text-sm font-semibold text-danger-600">{formatCurrency(200)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 flex items-center gap-2"><Clock className="w-4 h-4 text-primary-500" /> Refill Reminder</span>
              <span className="text-sm font-medium text-primary-600">Aug 18 (14 days)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent-500" /> Best Margin</span>
              <span className="text-sm font-medium text-accent-600">Vitamin C (40%)</span>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-warning-500" /> Nearing Expiry — Sell First</p>
          <div className="space-y-2">
            {[
              { name: 'Insulin Glargine', days: 240 },
              { name: 'Amoxicillin 250mg', days: 370 },
            ].map((it) => (
              <div key={it.name} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{it.name}</span>
                <Badge color="amber">{it.days}d left</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Related products */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Related Products (Upsell)</p>
        <div className="flex flex-wrap gap-2">
          {inventoryItems.slice(0, 4).map((it) => (
            <button key={it.id} onClick={() => addItem(it)} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-primary-50 hover:text-primary-700 rounded-lg text-sm text-neutral-600 transition-colors">
              <Plus className="w-3 h-3" /> {it.name}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery + total + actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-neutral-100 pt-4">
        <div className="flex items-center gap-3">
          <Select className="w-40">
            <option>Self Delivery</option>
            <option>Third-party Delivery</option>
          </Select>
          <Button variant="outline" size="sm" icon={<MessageCircle className="w-4 h-4" />}>WhatsApp</Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-2xl font-bold text-neutral-800">{formatCurrency(total)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={<Save className="w-4 h-4" />} onClick={onClose}>Draft</Button>
            <Button icon={<CheckCircle2 className="w-4 h-4" />} onClick={onClose}>Save Bill</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function HistoryModal({ billId, onClose }: { billId: string; onClose: () => void }) {
  const bill = salesBills.find((b) => b.id === billId);
  const events = [
    { type: 'Sale', desc: `Bill created by ${bill?.entryBy}`, date: bill?.billDate, color: 'green' as const, icon: <TrendingUp className="w-4 h-4" /> },
    { type: 'Modify', desc: 'Item quantity updated', date: bill?.billDate, color: 'blue' as const, icon: <History className="w-4 h-4" /> },
  ];

  return (
    <Modal open onClose={onClose} title={`Bill History — ${bill?.billNo ?? ''}`} size="md">
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${e.color === 'green' ? 'bg-accent-50 text-accent-600' : 'bg-primary-50 text-primary-600'}`}>{e.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-700">{e.type}</span>
                <Badge color={e.color}>{e.date}</Badge>
              </div>
              <p className="text-sm text-neutral-500 mt-0.5">{e.desc}</p>
            </div>
          </div>
        ))}
        {bill && bill.items.length > 0 && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-sm font-medium text-neutral-700 mb-2">Items in this bill</p>
            {bill.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-neutral-600">{it.name} × {it.qty}</span>
                <span className="font-medium text-neutral-700">{formatCurrency(it.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
              <span className="font-medium text-neutral-700">Total</span>
              <span className="font-bold text-neutral-800">{formatCurrency(bill.amount)}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function SalesAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sales" value={formatCurrency(3580)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Bills" value="5" icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <StatCard label="Outstanding Dues" value={formatCurrency(1090)} icon={<DollarSign className="w-5 h-5" />} color="amber" />
        <StatCard label="Avg Bill Value" value={formatCurrency(716)} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 mb-4">Sales by Staff</h3>
          <HBarChart data={[
            { label: 'Rahul', value: 2140, color: '#1b80f5' },
            { label: 'Priya', value: 1380, color: '#12c983' },
            { label: 'Amit', value: 860, color: '#f59e0b' },
          ]} formatter={formatCurrency} />
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 mb-4">Payment Methods</h3>
          <DonutChart segments={[
            { label: 'Cash', value: 55, color: '#12c983' },
            { label: 'UPI', value: 30, color: '#1b80f5' },
            { label: 'Credit', value: 15, color: '#f59e0b' },
          ]} />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-neutral-800 mb-4">Daily Sales Trend</h3>
        <BarChart data={[
          { label: 'Aug 1', value: 970 }, { label: 'Aug 2', value: 1430 },
          { label: 'Aug 3', value: 500 }, { label: 'Aug 4', value: 1650 },
        ]} height={240} color="#12c983" />
      </Card>
    </div>
  );
}
