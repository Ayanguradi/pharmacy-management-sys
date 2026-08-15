import { useState, useMemo } from 'react';
import {
  ArrowLeftRight, Plus, Search, Filter, Send, Download, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Package, MoreVertical, ChevronDown, Eye, X
} from 'lucide-react';
import { branchTransfers, branches, getBranchName, formatCurrency } from '@/data';
import type { BranchTransfer, TransferStatus } from '@/types';
import { StatCard, Button, Badge, Card, Select } from '@/components/ui';

interface BranchTransfersProps {
  selectedBranchId: string;
}

export function BranchTransfers({ selectedBranchId }: BranchTransfersProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'send' | 'detail'>('list');
  const [selectedTransfer, setSelectedTransfer] = useState<BranchTransfer | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return branchTransfers.filter(t => {
      if (selectedBranchId !== 'all' && t.sourceBranchId !== selectedBranchId && t.destinationBranchId !== selectedBranchId) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.id.toLowerCase().includes(q) ||
          getBranchName(t.sourceBranchId).toLowerCase().includes(q) ||
          getBranchName(t.destinationBranchId).toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedBranchId, filterStatus, search]);

  const inTransitCount = branchTransfers.filter(t => t.status === 'In Transit').length;
  const pendingCount = branchTransfers.filter(t => t.status === 'Draft').length;
  const disputedCount = branchTransfers.filter(t => t.status === 'Disputed').length;
  const totalItems = branchTransfers.reduce((sum, t) => sum + t.items.length, 0);

  if (activeTab === 'detail' && selectedTransfer) {
    return <TransferDetail transfer={selectedTransfer} onBack={() => { setSelectedTransfer(null); setActiveTab('list'); }} />;
  }

  if (activeTab === 'send') {
    return <SendTransferForm onBack={() => setActiveTab('list')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Branch Transfers</h1>
          <p className="text-neutral-500 text-sm mt-1">Move inventory between branches and track shipments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>Request Transfer</Button>
          <Button icon={<Send className="w-4 h-4" />} onClick={() => setActiveTab('send')}>Send Transfer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="In Transit" value={inTransitCount} icon={<ArrowLeftRight className="w-5 h-5" />} color="blue" />
        <StatCard label="Pending Approval" value={pendingCount} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label="Disputed" value={disputedCount} icon={<AlertTriangle className="w-5 h-5" />} color="rose" />
        <StatCard label="Total Items Transferred" value={totalItems} icon={<Package className="w-5 h-5" />} color="green" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between bg-neutral-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transfers..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Transit">In Transit</option>
              <option value="Received">Received</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Disputed">Disputed</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Transfer ID</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3"></th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => { setSelectedTransfer(t); setActiveTab('detail'); }}>
                  <td className="px-6 py-4 font-mono font-medium text-primary-700">{t.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{getBranchName(t.sourceBranchId)}</div>
                  </td>
                  <td className="px-2 py-4">
                    <ArrowRight className="w-4 h-4 text-neutral-300" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{getBranchName(t.destinationBranchId)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={t.type === 'Send' ? 'blue' : 'purple'}>{t.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{t.items.length} items</td>
                  <td className="px-6 py-4 text-neutral-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-neutral-400">No transfers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: TransferStatus }) {
  const colors: Record<TransferStatus, string> = {
    'Draft': 'gray',
    'In Transit': 'blue',
    'Received': 'green',
    'Partially Received': 'amber',
    'Disputed': 'rose',
  };
  return <Badge color={colors[status]}>{status}</Badge>;
}

// ─── Transfer Detail ────────────────────────────────────────────────────────
function TransferDetail({ transfer, onBack }: { transfer: BranchTransfer; onBack: () => void }) {
  const matchedCount = transfer.items.filter(i => i.status === 'Matched').length;
  const totalItems = transfer.items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-2 flex items-center gap-1">
            <ArrowLeftRight className="w-4 h-4" /> Back to Transfers
          </button>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            {transfer.id}
            <StatusBadge status={transfer.status} />
          </h1>
        </div>
        {transfer.status === 'In Transit' && (
          <Button icon={<CheckCircle2 className="w-4 h-4" />}>Receive & Reconcile</Button>
        )}
      </div>

      {/* Transfer Flow Card */}
      <Card className="p-6">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6" />
            </div>
            <div className="font-semibold text-neutral-900">{getBranchName(transfer.sourceBranchId)}</div>
            <div className="text-xs text-neutral-500">Source</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="w-8 h-8 text-primary-400" />
            <span className="text-xs text-neutral-400">{transfer.type === 'Send' ? 'Sent' : 'Requested'} by {transfer.initiatedBy}</span>
            <span className="text-xs text-neutral-400">{transfer.date}</span>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-100 text-accent-700 flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6" />
            </div>
            <div className="font-semibold text-neutral-900">{getBranchName(transfer.destinationBranchId)}</div>
            <div className="text-xs text-neutral-500">Destination</div>
          </div>
        </div>
      </Card>

      {/* Reconciliation Summary */}
      {transfer.status !== 'Draft' && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-primary-800">{matchedCount} of {totalItems} items matched</span>
          </div>
          {transfer.items.some(i => i.status === 'Short') && (
            <Badge color="amber">{transfer.items.filter(i => i.status === 'Short').length} Short</Badge>
          )}
        </div>
      )}

      {/* Items Table */}
      <Card title="Transfer Items" className="p-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3">Expiry</th>
              <th className="px-6 py-3 text-right">Qty Sent</th>
              <th className="px-6 py-3 text-right">Qty Received</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {transfer.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 font-medium text-neutral-900">{item.itemName}</td>
                <td className="px-6 py-4 font-mono text-neutral-600">{item.batch}</td>
                <td className="px-6 py-4 text-neutral-500">{item.expiry}</td>
                <td className="px-6 py-4 text-right font-semibold">{item.qtySent}</td>
                <td className="px-6 py-4 text-right font-semibold">{item.qtyReceived ?? '—'}</td>
                <td className="px-6 py-4">
                  <Badge color={
                    item.status === 'Matched' ? 'green' :
                    item.status === 'Short' ? 'amber' :
                    item.status === 'Excess' ? 'purple' :
                    item.status === 'Missing' ? 'rose' : 'gray'
                  }>{item.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {transfer.notes && (
        <Card title="Notes">
          <p className="text-sm text-neutral-600">{transfer.notes}</p>
        </Card>
      )}
    </div>
  );
}

// ─── Send Transfer Form ─────────────────────────────────────────────────────
function SendTransferForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-2 flex items-center gap-1">
          <ArrowLeftRight className="w-4 h-4" /> Back to Transfers
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">Send Transfer</h1>
        <p className="text-neutral-500 text-sm mt-1">Transfer inventory to another branch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Transfer Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Source Branch</label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Destination Branch</label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (optional)</label>
                <textarea className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" rows={3} placeholder="Reason for transfer..." />
              </div>
            </div>
          </Card>

          <Card title="Add Items" className="mt-6">
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items to add..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              />
            </div>
            <div className="border border-dashed border-neutral-300 rounded-xl p-12 text-center text-neutral-400">
              <Package className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
              <p className="font-medium">No items added yet</p>
              <p className="text-sm mt-1">Search and select items from inventory to add to this transfer</p>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Transfer Summary" className="sticky top-24">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Items</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Quantity</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-3">
                <span className="text-neutral-500">Estimated Value</span>
                <span className="font-bold text-neutral-900">₹0</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Button className="w-full" icon={<Send className="w-4 h-4" />}>Create & Send</Button>
              <Button variant="outline" className="w-full">Save as Draft</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
