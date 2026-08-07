import { useState } from 'react';
import {
  Plus, Phone, MapPin, FileText, DollarSign, TrendingUp,
  Package, ArrowLeft, Building2, AlertTriangle, BarChart3,
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, SearchBar, PageHeader, Modal, Input, StatCard, EmptyState } from '@/components/ui';
import { LineChart, HBarChart, DonutChart } from '@/components/charts';
import { distributors, purchaseBills, inventoryItems, formatCurrency } from '@/data';
import type { View, Distributor } from '@/types';

interface DistributorsProps {
  view: View;
  onNavigate: (v: View) => void;
  selectedDistributor: string | null;
  onSelectDistributor: (id: string | null) => void;
  onNavigateWithState?: (view: View, state?: any) => void;
}

export function Distributors({ view, onNavigate, selectedDistributor, onSelectDistributor, onNavigateWithState }: DistributorsProps) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detailTab, setDetailTab] = useState('bills');

  if (view === 'distributor-detail' && selectedDistributor) {
    const dist = distributors.find((d) => d.id === selectedDistributor);
    if (dist) return <DistributorDetail distributor={dist} onBack={() => { onSelectDistributor(null); onNavigate('distributors'); }} detailTab={detailTab} setDetailTab={setDetailTab} onNavigateWithState={onNavigateWithState} />;
  }

  const filtered = distributors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase()) ||
    d.gstin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Distributors"
        subtitle="Manage your supplier relationships, dues, and orders"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Distributor</Button>}
      />

      <Card className="p-4 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, city, or GSTIN..." />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <button key={d.id} onClick={() => { onSelectDistributor(d.id); onNavigate('distributor-detail'); }} className="text-left">
            <Card hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">{d.name}</p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.city}</p>
                  </div>
                </div>
                <Badge color={d.balance > 0 ? 'amber' : d.balance < 0 ? 'green' : 'gray'}>
                  {d.balance > 0 ? 'Dues' : d.balance < 0 ? 'Credit' : 'Settled'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">GSTIN</span>
                  <span className="font-medium text-neutral-700">{d.gstin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Mobile</span>
                  <span className="font-medium text-neutral-700">{d.mobile}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Total Bills</span>
                  <span className="font-medium text-neutral-700">{d.totalBills}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">Balance</span>
                  <span className={`font-bold ${d.balance > 0 ? 'text-danger-600' : d.balance < 0 ? 'text-accent-600' : 'text-neutral-600'}`}>
                    {formatCurrency(Math.abs(d.balance))}
                  </span>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {showAdd && <AddDistributorModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function DistributorDetail({ distributor, onBack, detailTab, setDetailTab, onNavigateWithState }: {
  distributor: Distributor;
  onBack: () => void;
  detailTab: string;
  setDetailTab: (t: string) => void;
  onNavigateWithState?: (view: View, state?: any) => void;
}) {
  const distBills = purchaseBills.filter((b) => b.distributor === distributor.name);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Distributors
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-neutral-800">{distributor.name}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-neutral-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{distributor.city}</span>
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{distributor.mobile}</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{distributor.gstin}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4" />}>Call</Button>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-neutral-500">Running Balance</p>
          <p className={`text-3xl font-bold mt-1 ${distributor.balance > 0 ? 'text-danger-600' : 'text-accent-600'}`}>
            {formatCurrency(Math.abs(distributor.balance))}
          </p>
          <p className="text-xs text-neutral-400 mt-1">{distributor.balance > 0 ? 'You owe' : 'They owe you'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Bills" value={String(distributor.totalBills)} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Purchases" value={formatCurrency(distributor.totalPurchases)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
        <StatCard label="Pending Dues" value={formatCurrency(Math.max(0, distributor.balance))} icon={<DollarSign className="w-5 h-5" />} color="amber" />
        <StatCard label="Active Items" value={String(inventoryItems.length)} icon={<Package className="w-5 h-5" />} color="blue" />
      </div>

      <Card className="mb-4">
        <Tabs
          tabs={[
            { id: 'bills', label: 'Bills', icon: <FileText className="w-4 h-4" /> },
            { id: 'dues', label: 'Dues', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'returns', label: 'Purchase Returns', icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: 'Purchase Orders', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ]}
          active={detailTab}
          onChange={setDetailTab}
        />
      </Card>

      {detailTab === 'bills' && (
        <Card>
          <Table headers={['Bill No.', 'Bill Date', 'Amount', 'Payment', 'Status']}>
            {distBills.map((b) => (
              <tr key={b.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-700">{b.billNo}</td>
                <td className="px-4 py-3 text-neutral-600">{b.billDate}</td>
                <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3"><Badge color="blue">{b.paymentType}</Badge></td>
                <td className="px-4 py-3"><Badge color={b.paid ? 'green' : 'amber'}>{b.paid ? 'Paid' : 'Unpaid'}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {detailTab === 'dues' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-500">Total Outstanding</p>
              <p className="text-2xl font-bold text-danger-600">{formatCurrency(Math.max(0, distributor.balance))}</p>
            </div>
            <Button variant="success" icon={<DollarSign className="w-4 h-4" />}>Record Payment</Button>
          </div>
          <Table headers={['Bill No.', 'Date', 'Amount', 'Status']}>
            {distBills.filter((b) => !b.paid).map((b) => (
              <tr key={b.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-700">{b.billNo}</td>
                <td className="px-4 py-3 text-neutral-600">{b.billDate}</td>
                <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3"><Badge color="amber">Unpaid</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {detailTab === 'returns' && (
        <Card>
          <EmptyState icon={<Package className="w-7 h-7" />} title="No returns recorded" subtitle="Purchase returns for this distributor will appear here." />
        </Card>
      )}

      {detailTab === 'orders' && (
        <Card>
          <Table headers={['PO No.', 'Date', 'Items', 'Status']}>
            <tr className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium text-neutral-700">PO-024</td>
              <td className="px-4 py-3 text-neutral-600">2024-08-03</td>
              <td className="px-4 py-3 text-neutral-600">12</td>
              <td className="px-4 py-3"><Badge color="amber">Pending</Badge></td>
            </tr>
          </Table>
        </Card>
      )}

      {detailTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold text-neutral-800 mb-4">Purchase Trend</h3>
              <LineChart data={[
                { label: 'Feb', value: 120000 }, { label: 'Mar', value: 145000 },
                { label: 'Apr', value: 132000 }, { label: 'May', value: 168000 },
                { label: 'Jun', value: 155000 }, { label: 'Jul', value: 190000 },
                { label: 'Aug', value: 175000 },
              ]} height={220} />
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-neutral-800 mb-4">Payables vs Receivables</h3>
              <DonutChart segments={[
                { label: 'Payables', value: 45200, color: '#f59e0b' },
                { label: 'Receivables', value: 12500, color: '#12c983' },
              ]} />
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" /> Non-Moving / Dead Stock
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Insulin Glargine', value: 25, max: 100, color: '#ef4444' },
                { label: 'Aspirin 75mg', value: 8, max: 100, color: '#ef4444' },
                { label: 'Omeprazole 20mg', value: 12, max: 100, color: '#f59e0b' },
                { label: 'Amoxicillin 250mg', value: 60, max: 100, color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-800">{item.value} units</span>
                      <button onClick={() => {
                        onNavigateWithState?.('purchase-returns', {
                          distributor: distributor.name,
                          itemName: item.label,
                          returnQty: item.value,
                          reason: 'Non-moving'
                        });
                      }} className="text-xs text-primary-600 hover:underline">Return</button>
                    </div>
                  </div>
                  <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / item.max) * 100}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-neutral-400 mt-4">Items from this distributor with low sales velocity</p>
          </Card>
        </div>
      )}
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
