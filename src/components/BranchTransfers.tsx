import { useState, useMemo } from 'react';
import {
  ArrowLeftRight, Plus, Search, Filter, Send, Download, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Package, MoreVertical, ChevronDown, Eye, X, Printer,
  MapPin, Phone, User, FileText, Tag, Building, Globe, Edit
} from 'lucide-react';
import { branchTransfers, branches, getBranchName, formatCurrency, inventoryItems } from '@/data';
import type { BranchTransfer, TransferStatus, ChargeType, DestinationType, TransferLineItem } from '@/types';
import { StatCard, Button, Badge, Card, Select, Modal } from '@/components/ui';

interface BranchTransfersProps {
  selectedBranchId: string;
}

export function BranchTransfers({ selectedBranchId }: BranchTransfersProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'send' | 'detail' | 'receive'>('list');
  const [selectedTransfer, setSelectedTransfer] = useState<BranchTransfer | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return branchTransfers.filter(t => {
      if (selectedBranchId !== 'all' && t.sourceBranchId !== selectedBranchId && t.destinationBranchId !== selectedBranchId) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const destName = t.destinationType === 'External' ? t.externalDestination?.name || '' : getBranchName(t.destinationBranchId);
        return t.id.toLowerCase().includes(q) ||
          getBranchName(t.sourceBranchId).toLowerCase().includes(q) ||
          destName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedBranchId, filterStatus, search]);

  const inTransitCount = branchTransfers.filter(t => t.status === 'In Transit' || t.status === 'Sent').length;
  const pendingCount = branchTransfers.filter(t => t.status === 'Draft').length;
  const disputedCount = branchTransfers.filter(t => t.status === 'Disputed').length;
  const totalValue = branchTransfers.reduce((sum, t) => sum + (t.totalValue || 0), 0);

  if (activeTab === 'receive' && selectedTransfer) {
    return <ReceiveFlow transfer={selectedTransfer} onBack={() => { setSelectedTransfer(null); setActiveTab('list'); }} />;
  }

  if (activeTab === 'detail' && selectedTransfer) {
    return <TransferDetail 
      transfer={selectedTransfer} 
      onBack={() => { setSelectedTransfer(null); setActiveTab('list'); }} 
      onReceive={() => setActiveTab('receive')}
    />;
  }

  if (activeTab === 'send') {
    return <SendTransferForm onBack={() => setActiveTab('list')} />;
  }

  const getDestName = (t: BranchTransfer) => {
    if (t.destinationType === 'External') return t.externalDestination?.name || 'External';
    return getBranchName(t.destinationBranchId);
  };

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
        <StatCard label="In Transit / Sent" value={inTransitCount.toString()} icon={<ArrowLeftRight className="w-5 h-5" />} color="blue" />
        <StatCard label="Drafts" value={pendingCount.toString()} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label="Disputed" value={disputedCount.toString()} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
        <StatCard label="Total Transfer Value" value={formatCurrency(totalValue)} icon={<Tag className="w-5 h-5" />} color="green" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between bg-neutral-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transfers..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="In Transit">In Transit</option>
              <option value="Received">Received</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Confirmed Delivered">Confirmed Delivered</option>
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
                <th className="px-6 py-3">Charge</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
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
                    <div className="font-medium text-neutral-900 flex items-center gap-1.5">
                      {t.destinationType === 'External' && <Globe className="w-3.5 h-3.5 text-amber-500" />}
                      {getDestName(t)}
                    </div>
                    {t.destinationType === 'External' && <div className="text-xs text-amber-600">External</div>}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={t.type === 'Send' ? 'blue' : 'purple'}>{t.type}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-neutral-600">{t.chargeType}</span>
                    {t.totalValue != null && t.chargeType !== 'No Charge' && <div className="text-xs text-neutral-500">{formatCurrency(t.totalValue)}</div>}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{t.items.length} items</td>
                  <td className="px-6 py-4 text-neutral-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} isExternal={t.destinationType === 'External'} />
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

function StatusBadge({ status, isExternal }: { status: TransferStatus; isExternal?: boolean }) {
  const colors: Record<TransferStatus, string> = {
    'Draft': 'gray', 'Sent': 'blue', 'In Transit': 'blue', 'Received': 'green',
    'Partially Received': 'amber', 'Disputed': 'red', 'Confirmed Delivered': 'green',
  };
  return (
    <span className="flex items-center gap-1.5">
      <Badge color={colors[status] as any}>{status}</Badge>
      {status === 'Confirmed Delivered' && isExternal && (
        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">self-attested</span>
      )}
    </span>
  );
}

// ─── Transfer Detail ────────────────────────────────────────────────────────
function TransferDetail({ transfer, onBack, onReceive }: { transfer: BranchTransfer; onBack: () => void; onReceive: () => void }) {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const matchedCount = transfer.items.filter(i => i.status === 'Matched').length;
  const totalItems = transfer.items.length;
  const destName = transfer.destinationType === 'External' ? transfer.externalDestination?.name || 'External' : getBranchName(transfer.destinationBranchId);
  const isEditable = transfer.status === 'Draft' || transfer.status === 'In Transit' || transfer.status === 'Sent';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-2 flex items-center gap-1">
            <ArrowLeftRight className="w-4 h-4" /> Back to Transfers
          </button>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            {transfer.id}
            <StatusBadge status={transfer.status} isExternal={transfer.destinationType === 'External'} />
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={() => setShowPrintPreview(true)}>Transfer Note</Button>
          {(transfer.status === 'In Transit' || transfer.status === 'Sent') && transfer.destinationType === 'Internal' && (
            <Button icon={<CheckCircle2 className="w-4 h-4" />} onClick={onReceive}>Receive & Confirm</Button>
          )}
          {isEditable && <Button variant="outline" icon={<Edit className="w-4 h-4" />}>Edit Transfer</Button>}
        </div>
      </div>

      {/* Transfer Flow Card */}
      <Card className="p-6">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-2">
              <Building className="w-6 h-6" />
            </div>
            <div className="font-semibold text-neutral-900">{getBranchName(transfer.sourceBranchId)}</div>
            <div className="text-xs text-neutral-500">Source</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="w-8 h-8 text-primary-400" />
            <span className="text-xs text-neutral-400">{transfer.initiatedBy} • {transfer.date}</span>
          </div>
          <div className="text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 ${transfer.destinationType === 'External' ? 'bg-amber-100 text-amber-700' : 'bg-accent-100 text-accent-700'}`}>
              {transfer.destinationType === 'External' ? <Globe className="w-6 h-6" /> : <Building className="w-6 h-6" />}
            </div>
            <div className="font-semibold text-neutral-900">{destName}</div>
            <div className="text-xs text-neutral-500">{transfer.destinationType === 'External' ? 'External Destination' : 'Destination'}</div>
          </div>
        </div>
      </Card>

      {/* External destination details */}
      {transfer.destinationType === 'External' && transfer.externalDestination && (
        <Card className="p-4 bg-amber-50/50 border-amber-200">
          <h4 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> External Destination Details</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><div className="text-xs text-neutral-500">Contact Person</div><div className="font-medium">{transfer.externalDestination.contactPerson}</div></div>
            <div><div className="text-xs text-neutral-500">Mobile</div><div className="font-medium">{transfer.externalDestination.mobile}</div></div>
            <div className="col-span-2"><div className="text-xs text-neutral-500">Address</div><div className="font-medium">{transfer.externalDestination.address}</div></div>
          </div>
        </Card>
      )}

      {/* Charge Type & Value */}
      <div className="flex gap-4">
        <Card className="p-4 flex-1">
          <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Charge Type</div>
          <div className="font-semibold text-neutral-900">{transfer.chargeType}</div>
        </Card>
        <Card className="p-4 flex-1">
          <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Total Value</div>
          <div className="font-semibold text-neutral-900">
            {transfer.chargeType === 'No Charge' ? <span className="text-green-600">No Charge — Internal Transfer</span> : formatCurrency(transfer.totalValue || 0)}
          </div>
        </Card>
      </div>

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
              {transfer.chargeType !== 'No Charge' && <th className="px-6 py-3 text-right">Unit Price</th>}
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
                {transfer.chargeType !== 'No Charge' && <td className="px-6 py-4 text-right text-neutral-600">{item.unitPrice ? formatCurrency(item.unitPrice) : '—'}</td>}
                <td className="px-6 py-4">
                  <Badge color={
                    item.status === 'Matched' ? 'green' : item.status === 'Short' ? 'amber' :
                    item.status === 'Excess' ? 'purple' : item.status === 'Missing' ? 'red' : 'gray'
                  }>{item.status}</Badge>
                  {item.status === 'Short' && item.qtyReceived != null && (
                    <div className="text-xs text-amber-600 mt-1">
                      {item.itemName} — sent {item.qtySent}, received {item.qtyReceived} ({item.qtySent - item.qtyReceived} short)
                    </div>
                  )}
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

      {/* Print Preview Modal */}
      <Modal open={showPrintPreview} onClose={() => setShowPrintPreview(false)} title="Transfer Note" size="lg">
        <div className="space-y-4 text-sm">
          <div className="border border-neutral-200 rounded-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold">STOCK TRANSFER NOTE</h2>
              <p className="text-neutral-500">{transfer.id} • {transfer.date}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-neutral-500 uppercase mb-1">From</div>
                <div className="font-semibold">{getBranchName(transfer.sourceBranchId)}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 uppercase mb-1">To</div>
                <div className="font-semibold">{destName}</div>
                {transfer.destinationType === 'External' && transfer.externalDestination && (
                  <div className="text-xs text-neutral-500 mt-1">{transfer.externalDestination.address}</div>
                )}
              </div>
            </div>
            <table className="w-full border-collapse border border-neutral-200 text-xs">
              <thead><tr className="bg-neutral-50">
                <th className="border border-neutral-200 px-3 py-2 text-left">Item</th>
                <th className="border border-neutral-200 px-3 py-2">Batch</th>
                <th className="border border-neutral-200 px-3 py-2">Expiry</th>
                <th className="border border-neutral-200 px-3 py-2 text-right">Qty</th>
                {transfer.chargeType !== 'No Charge' && <th className="border border-neutral-200 px-3 py-2 text-right">Value</th>}
              </tr></thead>
              <tbody>
                {transfer.items.map((item, i) => (
                  <tr key={i}><td className="border border-neutral-200 px-3 py-2">{item.itemName}</td>
                    <td className="border border-neutral-200 px-3 py-2 text-center">{item.batch}</td>
                    <td className="border border-neutral-200 px-3 py-2 text-center">{item.expiry}</td>
                    <td className="border border-neutral-200 px-3 py-2 text-right">{item.qtySent}</td>
                    {transfer.chargeType !== 'No Charge' && <td className="border border-neutral-200 px-3 py-2 text-right">{item.unitPrice ? formatCurrency(item.unitPrice * item.qtySent) : '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right font-semibold">
              {transfer.chargeType === 'No Charge' ? 'No Charge — Internal Transfer' : `Total: ${formatCurrency(transfer.totalValue || 0)}`}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPrintPreview(false)}>Close</Button>
            <Button icon={<Printer className="w-4 h-4" />}>Print</Button>
            <Button variant="outline" icon={<Send className="w-4 h-4" />}>Share via WhatsApp</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Receive Flow ───────────────────────────────────────────────────────────
function ReceiveFlow({ transfer, onBack }: { transfer: BranchTransfer; onBack: () => void }) {
  const [receivedQtys, setReceivedQtys] = useState<Record<number, number>>(
    Object.fromEntries(transfer.items.map((item, i) => [i, item.qtySent]))
  );
  const [submitted, setSubmitted] = useState(false);

  const differences = transfer.items.map((item, i) => {
    const received = receivedQtys[i] ?? item.qtySent;
    const diff = received - item.qtySent;
    return { ...item, received, diff, status: diff === 0 ? 'Matched' : diff < 0 ? 'Short' : 'Excess' };
  });

  const hasDiscrepancies = differences.some(d => d.diff !== 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-2 flex items-center gap-1">
          <ArrowLeftRight className="w-4 h-4" /> Back to Transfer
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">Receive Transfer {transfer.id}</h1>
        <p className="text-neutral-500 text-sm mt-1">Confirm received quantities for each item</p>
      </div>

      {!submitted ? (
        <>
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Each "Qty Received" defaults to "Qty Sent". Adjust only the items where the physical count differs.
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 border-b text-neutral-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Batch</th>
                  <th className="px-6 py-3">Expiry</th>
                  <th className="px-6 py-3 text-right">Qty Sent</th>
                  <th className="px-6 py-3 text-right">Qty Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transfer.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">{item.itemName}</td>
                    <td className="px-6 py-4 font-mono text-neutral-600">{item.batch}</td>
                    <td className="px-6 py-4 text-neutral-500">{item.expiry}</td>
                    <td className="px-6 py-4 text-right font-semibold">{item.qtySent}</td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        min={0}
                        max={item.qtySent * 2}
                        value={receivedQtys[idx] ?? item.qtySent}
                        onChange={(e) => setReceivedQtys(prev => ({ ...prev, [idx]: parseInt(e.target.value) || 0 }))}
                        className={`w-20 px-3 py-1.5 text-sm border rounded-lg text-right font-semibold outline-none transition-colors ${
                          (receivedQtys[idx] ?? item.qtySent) !== item.qtySent ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-neutral-300'
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onBack}>Cancel</Button>
            <Button icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => setSubmitted(true)}>Submit Received Quantities</Button>
          </div>
        </>
      ) : (
        <>
          {/* Variance Summary */}
          <Card className="p-6">
            <h3 className="font-bold text-neutral-900 mb-4">Receiving Summary</h3>
            {!hasDiscrepancies ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">All items match! No discrepancies found.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Some items have discrepancies:
                </div>
                {differences.filter(d => d.diff !== 0).map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div>
                      <span className="font-medium text-neutral-900">{d.itemName}</span>
                      <span className="text-neutral-500 ml-2 text-xs">({d.batch})</span>
                    </div>
                    <div className={`text-sm font-semibold ${d.diff < 0 ? 'text-amber-600' : 'text-purple-600'}`}>
                      sent {d.qtySent}, received {d.received} ({Math.abs(d.diff)} {d.diff < 0 ? 'short' : 'excess'})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setSubmitted(false)}>Edit Quantities</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<CheckCircle2 className="w-4 h-4" />} onClick={onBack}>
              Confirm & Apply Stock Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Send Transfer Form ─────────────────────────────────────────────────────
function SendTransferForm({ onBack }: { onBack: () => void }) {
  const [destType, setDestType] = useState<DestinationType>('Internal');
  const [chargeType, setChargeType] = useState<ChargeType>('No Charge');
  const [itemSearch, setItemSearch] = useState('');
  const [addedItems, setAddedItems] = useState<(TransferLineItem & { id: string })[]>([]);
  const [showItemSearch, setShowItemSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (!itemSearch) return [];
    const q = itemSearch.toLowerCase();
    return inventoryItems.filter(i => i.name.toLowerCase().includes(q) || i.batch.toLowerCase().includes(q)).slice(0, 5);
  }, [itemSearch]);

  const addItem = (item: typeof inventoryItems[0]) => {
    const price = chargeType === 'At Purchase Price' ? item.purchasePrice : chargeType === 'At MRP' ? item.mrp : 0;
    setAddedItems(prev => [...prev, {
      id: `${item.id}-${Date.now()}`, itemName: item.name, batch: item.batch, expiry: item.expiry,
      qtySent: 1, unitPrice: price, status: 'Pending' as const
    }]);
    setItemSearch('');
    setShowItemSearch(false);
  };

  const removeItem = (id: string) => setAddedItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => setAddedItems(prev => prev.map(i => i.id === id ? { ...i, qtySent: qty } : i));

  const totalQty = addedItems.reduce((s, i) => s + i.qtySent, 0);
  const totalValue = addedItems.reduce((s, i) => s + (i.unitPrice || 0) * i.qtySent, 0);

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-2 flex items-center gap-1">
          <ArrowLeftRight className="w-4 h-4" /> Back to Transfers
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">Send Transfer</h1>
        <p className="text-neutral-500 text-sm mt-1">Transfer inventory to another branch or external destination</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Transfer Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Destination Type</label>
                <div className="flex gap-2">
                  <button onClick={() => setDestType('Internal')} className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-center flex items-center justify-center gap-2 ${destType === 'Internal' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                    <Building className="w-4 h-4" /> Our Branch
                  </button>
                  <button onClick={() => setDestType('External')} className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-center flex items-center justify-center gap-2 ${destType === 'External' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                    <Globe className="w-4 h-4" /> External / Not on MediCore
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Source Branch</label>
                  <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                {destType === 'Internal' ? (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Destination Branch</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Entity Name</label>
                    <input type="text" placeholder="e.g. City Care Pharmacy" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}
              </div>

              {destType === 'External' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Contact Person</label>
                    <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Mobile</label>
                    <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Address</label>
                    <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Charge Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['No Charge', 'At Purchase Price', 'At MRP', 'Custom'] as ChargeType[]).map(ct => (
                    <button key={ct} onClick={() => setChargeType(ct)} className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-center ${chargeType === ct ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                      {ct}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (optional)</label>
                <textarea className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" rows={2} placeholder="Reason for transfer..." />
              </div>
            </div>
          </Card>

          <Card title="Add Items">
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text" value={itemSearch}
                onChange={(e) => { setItemSearch(e.target.value); setShowItemSearch(true); }}
                onFocus={() => setShowItemSearch(true)}
                placeholder="Search items to add..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              />
              {showItemSearch && searchResults.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
                  {searchResults.map(item => (
                    <button key={item.id} className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 flex justify-between items-center border-b border-neutral-100 last:border-0" onClick={() => addItem(item)}>
                      <div>
                        <div className="font-medium text-neutral-900">{item.name}</div>
                        <div className="text-xs text-neutral-500">Batch: {item.batch} • Expiry: {item.expiry} • Stock: {item.stock}</div>
                      </div>
                      <Plus className="w-4 h-4 text-primary-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {addedItems.length === 0 ? (
              <div className="border border-dashed border-neutral-300 rounded-xl p-12 text-center text-neutral-400">
                <Package className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                <p className="font-medium">No items added yet</p>
                <p className="text-sm mt-1">Search and select items from inventory</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 border-b text-neutral-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Batch</th>
                    <th className="px-4 py-2">Expiry</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    {chargeType !== 'No Charge' && <th className="px-4 py-2 text-right">Unit Price</th>}
                    <th className="px-4 py-2 text-right">Line Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {addedItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-neutral-900">{item.itemName}</td>
                      <td className="px-4 py-3 font-mono text-neutral-600">{item.batch}</td>
                      <td className="px-4 py-3 text-neutral-500">{item.expiry}</td>
                      <td className="px-4 py-3 text-right">
                        <input type="number" min={1} value={item.qtySent} onChange={e => updateQty(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-neutral-300 rounded text-right text-sm outline-none" />
                      </td>
                      {chargeType !== 'No Charge' && <td className="px-4 py-3 text-right text-neutral-600">{formatCurrency(item.unitPrice || 0)}</td>}
                      <td className="px-4 py-3 text-right font-semibold">{chargeType === 'No Charge' ? '—' : formatCurrency((item.unitPrice || 0) * item.qtySent)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeItem(item.id)} className="text-neutral-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div>
          <Card title="Transfer Summary" className="sticky top-24">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Destination</span>
                <span className="font-semibold flex items-center gap-1">
                  {destType === 'External' && <Globe className="w-3 h-3 text-amber-500" />}
                  {destType === 'Internal' ? 'Our Branch' : 'External'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Charge Type</span>
                <span className="font-semibold">{chargeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Items</span>
                <span className="font-semibold">{addedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Quantity</span>
                <span className="font-semibold">{totalQty}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-3">
                <span className="text-neutral-500">Total Value</span>
                <span className="font-bold text-neutral-900">
                  {chargeType === 'No Charge' ? <span className="text-green-600 text-xs">No Charge — Internal</span> : formatCurrency(totalValue)}
                </span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Button className="w-full" icon={<Send className="w-4 h-4" />} disabled={addedItems.length === 0}>Create & Send</Button>
              <Button variant="outline" className="w-full" disabled={addedItems.length === 0}>Save as Draft</Button>
              {addedItems.length > 0 && (
                <Button variant="outline" className="w-full" icon={<Printer className="w-4 h-4" />}>Generate Transfer Note</Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
