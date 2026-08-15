import { useState, useMemo } from 'react';
import {
  ClipboardCheck, Play, History, Filter, Search, SearchCode, Calendar,
  AlertTriangle, ShieldAlert, CheckCircle2, MoreVertical, Check, ChevronDown, RefreshCcw
} from 'lucide-react';
import { stockAudits, disposalLogs, branches, getBranchName } from '@/data';
import type { StockAudit, AuditScope, DisposalLog } from '@/types';
import { StatCard, Button, Badge, Card, Select } from '@/components/ui';

interface StockAuditViewProps {
  selectedBranchId: string;
}

export function StockAuditView({ selectedBranchId }: StockAuditViewProps) {
  const [activeTab, setActiveTab] = useState<'audits' | 'disposals' | 'new'>('audits');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Stock Audit & Control</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage physical counts, shrinkage, and disposals</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-neutral-100 p-1 rounded-lg flex items-center mr-2">
             <button onClick={() => setActiveTab('audits')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'audits' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>Audits</button>
             <button onClick={() => setActiveTab('disposals')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'disposals' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>Disposals</button>
          </div>
          <Button icon={<Play className="w-4 h-4" />} onClick={() => setActiveTab('new')}>Start Audit</Button>
        </div>
      </div>

      {activeTab === 'audits' && <AuditList selectedBranchId={selectedBranchId} />}
      {activeTab === 'disposals' && <DisposalsList selectedBranchId={selectedBranchId} />}
      {activeTab === 'new' && <NewAuditForm selectedBranchId={selectedBranchId} onCancel={() => setActiveTab('audits')} />}
    </div>
  );
}

// ─── Audit List ──────────────────────────────────────────────────────────
function AuditList({ selectedBranchId }: { selectedBranchId: string }) {
  const filtered = useMemo(() => {
    return stockAudits.filter(a => selectedBranchId === 'all' || a.branchId === selectedBranchId);
  }, [selectedBranchId]);

  const totalVariance = filtered.reduce((sum, a) => sum + a.totalVarianceValue, 0);
  const pendingCount = filtered.filter(a => a.status === 'Pending Review').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Shrinkage (YTD)" value={`₹${Math.abs(totalVariance).toLocaleString()}`} icon={<AlertTriangle className="w-5 h-5" />} color="rose" />
        <StatCard label="Pending Reviews" value={pendingCount} icon={<ShieldAlert className="w-5 h-5" />} color={pendingCount > 0 ? "amber" : "gray"} />
        <StatCard label="Last Audit" value="2 weeks ago" icon={<History className="w-5 h-5" />} color="blue" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Audit ID</th>
                {selectedBranchId === 'all' && <th className="px-6 py-3">Branch</th>}
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Scope</th>
                <th className="px-6 py-3">Items Counted</th>
                <th className="px-6 py-3 text-right">Variance Value</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono font-medium text-primary-700">{a.id}</td>
                  {selectedBranchId === 'all' && (
                    <td className="px-6 py-4 font-medium text-neutral-900">{getBranchName(a.branchId)}</td>
                  )}
                  <td className="px-6 py-4 text-neutral-500">{a.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-700">{a.scope}</div>
                    {a.scopeFilter && <div className="text-xs text-neutral-500">{a.scopeFilter}</div>}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{a.items.length} items</td>
                  <td className={`px-6 py-4 text-right font-semibold ${a.totalVarianceValue < 0 ? 'text-rose-600' : a.totalVarianceValue > 0 ? 'text-green-600' : 'text-neutral-500'}`}>
                    ₹{Math.abs(a.totalVarianceValue).toLocaleString()} {a.totalVarianceValue < 0 && 'loss'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={a.status === 'Completed' ? 'green' : a.status === 'Pending Review' ? 'amber' : 'blue'}>{a.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status === 'Pending Review' ? (
                      <Button size="sm" variant="outline">Review</Button>
                    ) : (
                      <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">View Report</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Disposals List ──────────────────────────────────────────────────────
function DisposalsList({ selectedBranchId }: { selectedBranchId: string }) {
  const filtered = useMemo(() => {
    return disposalLogs.filter(d => selectedBranchId === 'all' || d.branchId === selectedBranchId);
  }, [selectedBranchId]);

  const totalDisposed = filtered.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
           <h3 className="text-lg font-semibold text-neutral-900">Disposal Log</h3>
           <p className="text-sm text-neutral-500 mt-1">Record of expired, damaged, or otherwise destroyed stock</p>
        </div>
        <div className="text-right">
           <div className="text-sm text-neutral-500">Total Value Written Off</div>
           <div className="text-2xl font-bold text-rose-600">₹{totalDisposed.toLocaleString()}</div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                {selectedBranchId === 'all' && <th className="px-6 py-3">Branch</th>}
                <th className="px-6 py-3">Item & Batch</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Value Lost</th>
                <th className="px-6 py-3">Disposed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-neutral-500">{d.date}</td>
                  {selectedBranchId === 'all' && (
                    <td className="px-6 py-4 font-medium text-neutral-900">{getBranchName(d.branchId)}</td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{d.itemName}</div>
                    <div className="text-xs text-neutral-500 font-mono">{d.batch}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={d.reason === 'Expired' ? 'gray' : d.reason === 'Damaged' ? 'amber' : 'rose'}>{d.reason}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{d.qty}</td>
                  <td className="px-6 py-4 text-right font-semibold text-rose-600">₹{d.value.toLocaleString()}</td>
                  <td className="px-6 py-4 text-neutral-600">{d.disposedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── New Audit Form ────────────────────────────────────────────────────────
function NewAuditForm({ selectedBranchId, onCancel }: { selectedBranchId: string, onCancel: () => void }) {
  const [scope, setScope] = useState<AuditScope>('By Category');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card title="Start New Stock Audit">
         <div className="space-y-6">
           {selectedBranchId === 'all' && (
             <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-sm">You have "All Branches" selected globally. Please select a specific branch for this audit.</div>
             </div>
           )}

           <div>
             <label className="block text-sm font-medium text-neutral-700 mb-1">Branch</label>
             <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-neutral-50 text-neutral-500" disabled>
               <option>{selectedBranchId === 'all' ? 'Select Branch...' : getBranchName(selectedBranchId)}</option>
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-neutral-700 mb-2">Audit Scope</label>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               {(['Full Inventory', 'By Category', 'By Rack', 'Random Sample', 'Specific Items'] as AuditScope[]).map(s => (
                 <button
                   key={s}
                   onClick={() => setScope(s)}
                   className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-center ${scope === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                 >
                   {s}
                 </button>
               ))}
             </div>
           </div>

           {scope === 'By Category' && (
             <div>
               <label className="block text-sm font-medium text-neutral-700 mb-1">Select Category</label>
               <Select>
                 <option>Analgesics</option>
                 <option>Antibiotics</option>
                 <option>Cardiovascular</option>
               </Select>
             </div>
           )}

           <div className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl bg-neutral-50">
             <input type="checkbox" id="blindCount" className="w-4 h-4 text-primary-600 rounded border-neutral-300" defaultChecked />
             <div>
               <label htmlFor="blindCount" className="text-sm font-medium text-neutral-900 block">Blind Count Mode</label>
               <p className="text-xs text-neutral-500">Hide expected quantities from the counter to ensure physical counting.</p>
             </div>
           </div>

           <div className="pt-4 flex gap-3 border-t border-neutral-100">
             <Button className="flex-1" icon={<Play className="w-4 h-4" />}>Generate Count Sheet</Button>
             <Button variant="outline" onClick={onCancel}>Cancel</Button>
           </div>
         </div>
      </Card>
    </div>
  );
}
