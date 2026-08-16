import { useState, useMemo } from 'react';
import {
  ClipboardCheck, Play, History, Filter, Search, SearchCode, Calendar,
  AlertTriangle, ShieldAlert, CheckCircle2, MoreVertical, Check, ChevronDown, RefreshCcw,
  HelpCircle, ArrowLeft, SkipForward, Scan, FileText, Eye, Merge, Info, X, BarChart3
} from 'lucide-react';
import { stockAudits, disposalLogs, branches, getBranchName, inventoryItems, formatCurrency } from '@/data';
import type { StockAudit, AuditScope, AuditLineItem, VarianceReason, DisposalLog } from '@/types';
import { StatCard, Button, Badge, Card, Select, Modal } from '@/components/ui';

interface StockAuditViewProps {
  selectedBranchId: string;
}

const HELP_TEXT = "A Stock Audit compares what the system THINKS you have against what a physical count finds ON THE SHELF. Differences (variance) are either real loss (theft, breakage, undiscarded expiry) or data mistakes (typos, duplicate entries, unreconciled transfers) — this workflow helps you tell which is which before assuming stock was actually lost.";

const VARIANCE_REASONS: VarianceReason[] = [
  'Shrinkage/Theft', 'Breakage/Damage', 'Expired & Discarded', 
  'Miscount/Data Error', 'Duplicate Item/Batch Record', 'Found Extra', 'Other'
];

const TRUE_LOSS_REASONS: VarianceReason[] = ['Shrinkage/Theft', 'Breakage/Damage', 'Expired & Discarded'];

export function StockAuditView({ selectedBranchId }: StockAuditViewProps) {
  const [activeTab, setActiveTab] = useState<'audits' | 'disposals' | 'new' | 'count' | 'review' | 'report'>('audits');
  const [selectedAudit, setSelectedAudit] = useState<StockAudit | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            Stock Audit & Control
            <button onClick={() => setShowHelp(true)} className="text-neutral-400 hover:text-primary-500 transition-colors" title="What is a Stock Audit?">
              <HelpCircle className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Manage physical counts, shrinkage, and disposals</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-neutral-100 p-1 rounded-lg flex items-center mr-2">
             <button onClick={() => { setActiveTab('audits'); setSelectedAudit(null); }} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'audits' || activeTab === 'count' || activeTab === 'review' || activeTab === 'report' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>Audits</button>
             <button onClick={() => setActiveTab('disposals')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'disposals' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>Disposals</button>
          </div>
          <Button icon={<Play className="w-4 h-4" />} onClick={() => setActiveTab('new')}>Start Audit</Button>
        </div>
      </div>

      {activeTab === 'audits' && <AuditList selectedBranchId={selectedBranchId} onSelectAudit={(a) => { setSelectedAudit(a); if (a.status === 'Counting') setActiveTab('count'); else if (a.status === 'Pending Review') setActiveTab('review'); else setActiveTab('report'); }} />}
      {activeTab === 'disposals' && <DisposalsList selectedBranchId={selectedBranchId} />}
      {activeTab === 'new' && <NewAuditForm selectedBranchId={selectedBranchId} onCancel={() => setActiveTab('audits')} onStartCount={(a) => { setSelectedAudit(a); setActiveTab('count'); }} />}
      {activeTab === 'count' && selectedAudit && <CountEntry audit={selectedAudit} onBack={() => { setSelectedAudit(null); setActiveTab('audits'); }} onSubmit={(a) => { setSelectedAudit(a); setActiveTab('review'); }} />}
      {activeTab === 'review' && selectedAudit && <VarianceReview audit={selectedAudit} onBack={() => { setSelectedAudit(null); setActiveTab('audits'); }} onComplete={(a) => { setSelectedAudit(a); setActiveTab('report'); }} />}
      {activeTab === 'report' && selectedAudit && <AuditReport audit={selectedAudit} onBack={() => { setSelectedAudit(null); setActiveTab('audits'); }} />}

      {/* Help Modal */}
      <Modal open={showHelp} onClose={() => setShowHelp(false)} title="What is a Stock Audit?" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl text-sm text-primary-900 leading-relaxed">
            {HELP_TEXT}
          </div>
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-neutral-900">Workflow:</h4>
            <div className="flex items-center gap-3 text-neutral-600">
              <Badge color="blue">1</Badge> Start Audit → Choose scope & branch
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
              <Badge color="blue">2</Badge> Count Entry → Enter physical counts for each item
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
              <Badge color="blue">3</Badge> Variance Review → Assign reasons to discrepancies
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
              <Badge color="blue">4</Badge> Complete → Stock adjustments applied automatically
            </div>
          </div>
          <Button onClick={() => setShowHelp(false)} className="w-full">Got It</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Audit List ──────────────────────────────────────────────────────────
function AuditList({ selectedBranchId, onSelectAudit }: { selectedBranchId: string; onSelectAudit: (a: StockAudit) => void }) {
  const filtered = useMemo(() => {
    return stockAudits.filter(a => selectedBranchId === 'all' || a.branchId === selectedBranchId);
  }, [selectedBranchId]);

  const totalVariance = filtered.reduce((sum, a) => sum + a.totalVarianceValue, 0);
  const pendingCount = filtered.filter(a => a.status === 'Pending Review' || a.status === 'Counting').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Shrinkage (YTD)" value={`₹${Math.abs(totalVariance).toLocaleString()}`} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
        <StatCard label="Pending Reviews" value={pendingCount.toString()} icon={<ShieldAlert className="w-5 h-5" />} color={pendingCount > 0 ? "amber" : "green"} />
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
                <tr key={a.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => onSelectAudit(a)}>
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
                    {a.status === 'Counting' ? '—' : `₹${Math.abs(a.totalVarianceValue).toLocaleString()} ${a.totalVarianceValue < 0 ? 'loss' : ''}`}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={a.status === 'Completed' ? 'green' : a.status === 'Pending Review' ? 'amber' : a.status === 'Counting' ? 'blue' : 'gray'}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status === 'Counting' && <Button size="sm" variant="outline" icon={<ClipboardCheck className="w-3.5 h-3.5" />}>Continue Count</Button>}
                    {a.status === 'Pending Review' && <Button size="sm" variant="outline">Review</Button>}
                    {a.status === 'Completed' && <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">View Report</button>}
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
           <p className="text-sm text-neutral-500 mt-1">Record of expired, damaged, or otherwise destroyed stock. Entries from Inventory's "Dispose" action appear here automatically.</p>
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
                    <Badge color={d.reason === 'Expired' ? 'gray' : d.reason === 'Damaged' ? 'amber' : 'red'}>{d.reason}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{d.qty}</td>
                  <td className="px-6 py-4 text-right font-semibold text-rose-600">₹{d.value.toLocaleString()}</td>
                  <td className="px-6 py-4 text-neutral-600">{d.disposedBy}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400">No disposal records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── New Audit Form ────────────────────────────────────────────────────────
function NewAuditForm({ selectedBranchId, onCancel, onStartCount }: { selectedBranchId: string; onCancel: () => void; onStartCount: (a: StockAudit) => void }) {
  const [scope, setScope] = useState<AuditScope>('By Category');
  const [blindCount, setBlindCount] = useState(true);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Simulate duplicate detection
  const possibleDuplicates = [
    { item1: 'Azithromycin 500mg', item2: 'Azee 500', similarity: 0.72 },
    { item1: 'Paracetamol 500mg', item2: 'Paracetmol 500 mg', similarity: 0.95 },
  ];

  const handleGenerateCountSheet = () => {
    // Show duplicate detection prompt first
    setShowDuplicates(true);
  };

  const handleProceedToCount = () => {
    // Create a new audit with items from scope
    const scopeItems: AuditLineItem[] = inventoryItems.slice(0, 5).map(item => ({
      itemName: item.name, batch: item.batch, expectedQty: item.stock,
      countedQty: 0, variance: 0, varianceValue: 0,
      unitPrice: item.purchasePrice,
      inTransitExcluded: item.inTransitQty || 0
    }));

    const newAudit: StockAudit = {
      id: `AUD-${Date.now().toString().slice(-3)}`,
      branchId: selectedBranchId === 'all' ? 'br1' : selectedBranchId,
      date: new Date().toISOString().slice(0, 10),
      scope, scopeFilter: scope === 'By Category' ? 'Analgesic' : undefined,
      blindCount, status: 'Counting',
      countedBy: 'Current User',
      items: scopeItems,
      totalVarianceValue: 0,
      duplicatesDetected: possibleDuplicates
    };
    setShowDuplicates(false);
    onStartCount(newAudit);
  };

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
             <input type="checkbox" id="blindCount" className="w-4 h-4 text-primary-600 rounded border-neutral-300" checked={blindCount} onChange={e => setBlindCount(e.target.checked)} />
             <div>
               <label htmlFor="blindCount" className="text-sm font-medium text-neutral-900 block">Blind Count Mode</label>
               <p className="text-xs text-neutral-500">Hide expected quantities from the counter to ensure physical counting.</p>
             </div>
           </div>

           <div className="pt-4 flex gap-3 border-t border-neutral-100">
             <Button className="flex-1" icon={<Play className="w-4 h-4" />} onClick={handleGenerateCountSheet}>Generate Count Sheet</Button>
             <Button variant="outline" onClick={onCancel}>Cancel</Button>
           </div>
         </div>
      </Card>

      {/* Duplicate Detection Modal */}
      <Modal open={showDuplicates} onClose={() => setShowDuplicates(false)} title="Possible Duplicate Items Detected" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium">Review before counting</p>
              <p className="mt-1">These items have similar names and may be duplicates. Counting them separately could cause a false split variance.</p>
            </div>
          </div>
          {possibleDuplicates.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border rounded-xl">
              <div className="flex-1">
                <div className="font-medium text-neutral-900">{d.item1}</div>
                <div className="text-xs text-neutral-500 mt-0.5">vs.</div>
                <div className="font-medium text-neutral-900">{d.item2}</div>
                <div className="text-xs text-neutral-400 mt-1">{Math.round(d.similarity * 100)}% similar</div>
              </div>
              <Button size="sm" variant="outline" icon={<Merge className="w-3.5 h-3.5" />}>Merge</Button>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDuplicates(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleProceedToCount} className="flex-1">Proceed to Count</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Count Entry ────────────────────────────────────────────────────────────
function CountEntry({ audit, onBack, onSubmit }: { audit: StockAudit; onBack: () => void; onSubmit: (a: StockAudit) => void }) {
  const [counts, setCounts] = useState<Record<number, number | null>>(
    Object.fromEntries(audit.items.map((_, i) => [i, null]))
  );
  const [skipped, setSkipped] = useState<Set<number>>(new Set());

  const allFilled = audit.items.every((_, i) => counts[i] !== null || skipped.has(i));

  const handleSubmit = () => {
    const updatedItems = audit.items.map((item, i) => {
      const counted = counts[i] ?? 0;
      const expectedAdj = item.expectedQty - (item.inTransitExcluded || 0);
      const variance = skipped.has(i) ? 0 : counted - expectedAdj;
      return {
        ...item,
        countedQty: skipped.has(i) ? 0 : counted,
        variance,
        varianceValue: variance * (item.unitPrice || 0),
        skipped: skipped.has(i),
      };
    });
    const totalVariance = updatedItems.reduce((sum, i) => sum + i.varianceValue, 0);
    onSubmit({ ...audit, items: updatedItems, totalVarianceValue: totalVariance, status: 'Pending Review' });
  };

  const toggleSkip = (idx: number) => {
    setSkipped(prev => {
      const n = new Set(prev);
      if (n.has(idx)) { n.delete(idx); } else { n.add(idx); setCounts(c => ({ ...c, [idx]: null })); }
      return n;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 mb-2 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Audits
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Count Entry — {audit.id}</h1>
            <p className="text-neutral-500 text-sm mt-1">{audit.scope}{audit.scopeFilter ? ` • ${audit.scopeFilter}` : ''} • {audit.blindCount ? 'Blind Count Mode' : 'Expected quantities visible'}</p>
          </div>
          <Badge color="blue">{audit.items.filter((_, i) => counts[i] !== null || skipped.has(i)).length}/{audit.items.length} counted</Badge>
        </div>
      </div>

      {audit.duplicatesDetected && audit.duplicatesDetected.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {audit.duplicatesDetected.length} possible duplicate item(s) detected in this scope. Duplicates were flagged before counting began.
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 border-b text-neutral-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">Batch</th>
              {!audit.blindCount && <th className="px-6 py-3 text-right">Expected</th>}
              <th className="px-6 py-3 text-right">Counted Qty</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {audit.items.map((item, idx) => (
              <tr key={idx} className={`transition-colors ${skipped.has(idx) ? 'bg-neutral-50 opacity-60' : 'hover:bg-neutral-50'}`}>
                <td className="px-6 py-4 text-neutral-400 font-mono">{idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-neutral-900">{item.itemName}</div>
                  {(item.inTransitExcluded || 0) > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge color="blue">{item.inTransitExcluded} units in transit — excluded from expected count</Badge>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-neutral-600">{item.batch}</td>
                {!audit.blindCount && (
                  <td className="px-6 py-4 text-right text-neutral-600">
                    {item.expectedQty - (item.inTransitExcluded || 0)}
                    {(item.inTransitExcluded || 0) > 0 && <span className="text-xs text-neutral-400 ml-1">(adj.)</span>}
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  {skipped.has(idx) ? (
                    <span className="text-neutral-400 italic text-xs">Skipped</span>
                  ) : (
                    <input
                      type="number" min={0}
                      value={counts[idx] ?? ''}
                      onChange={e => setCounts(prev => ({ ...prev, [idx]: e.target.value === '' ? null : parseInt(e.target.value) || 0 }))}
                      placeholder="Enter count"
                      className="w-24 px-3 py-1.5 text-sm border border-neutral-300 rounded-lg text-right outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                    />
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleSkip(idx)} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${skipped.has(idx) ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                    {skipped.has(idx) ? 'Undo Skip' : 'Skip'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onBack}>Cancel</Button>
        <Button icon={<CheckCircle2 className="w-4 h-4" />} disabled={!allFilled} onClick={handleSubmit}>
          Submit Count
        </Button>
      </div>
    </div>
  );
}

// ─── Variance Review ────────────────────────────────────────────────────────
function VarianceReview({ audit, onBack, onComplete }: { audit: StockAudit; onBack: () => void; onComplete: (a: StockAudit) => void }) {
  const varianceItems = audit.items.filter(i => i.variance !== 0 && !i.skipped);
  const [reasons, setReasons] = useState<Record<number, VarianceReason | ''>>({});

  const origIndices = audit.items.reduce<number[]>((acc, item, i) => {
    if (item.variance !== 0 && !item.skipped) acc.push(i);
    return acc;
  }, []);

  const allReasoned = origIndices.every(i => reasons[i] && reasons[i] !== '');

  const handleComplete = () => {
    const updatedItems = audit.items.map((item, i) => ({
      ...item,
      reason: reasons[i] || item.reason,
      approved: reasons[i] ? true : item.approved,
    }));
    onComplete({ ...audit, items: updatedItems, status: 'Completed', completedDate: new Date().toISOString().slice(0, 10), approvedBy: 'Current User' });
  };

  // Categorize variance
  const trueLossValue = varianceItems.filter((_, i) => TRUE_LOSS_REASONS.includes(reasons[origIndices[i]] as VarianceReason)).reduce((s, item) => s + Math.abs(item.varianceValue), 0);
  const dataIssueValue = varianceItems.filter((_, i) => reasons[origIndices[i]] && !TRUE_LOSS_REASONS.includes(reasons[origIndices[i]] as VarianceReason)).reduce((s, item) => s + Math.abs(item.varianceValue), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 mb-2 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Audits
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">Variance Review — {audit.id}</h1>
        <p className="text-neutral-500 text-sm mt-1">Assign a reason to each discrepancy before completing the audit</p>
      </div>

      {varianceItems.length === 0 ? (
        <Card className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-neutral-900">No variances found!</h3>
          <p className="text-sm text-neutral-500 mt-1">All counted items match expected quantities.</p>
          <Button className="mt-4" onClick={() => onComplete({ ...audit, status: 'Completed', completedDate: new Date().toISOString().slice(0, 10), approvedBy: 'Current User' })}>Complete Audit</Button>
        </Card>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Total Variance</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">₹{Math.abs(audit.totalVarianceValue).toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> True Loss
              </div>
              <div className="text-2xl font-bold text-rose-600 mt-1">₹{trueLossValue.toLocaleString()}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-400" /> Data Issues
              </div>
              <div className="text-2xl font-bold text-neutral-600 mt-1">₹{dataIssueValue.toLocaleString()}</div>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-200 text-sm text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {varianceItems.length} item(s) with variance require a reason before this audit can be completed.
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 border-b text-neutral-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Batch</th>
                  <th className="px-6 py-3 text-right">Expected</th>
                  <th className="px-6 py-3 text-right">Counted</th>
                  <th className="px-6 py-3 text-right">Variance</th>
                  <th className="px-6 py-3 text-right">Value</th>
                  <th className="px-6 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {varianceItems.map((item, vi) => {
                  const origIdx = origIndices[vi];
                  const reason = reasons[origIdx] || '';
                  const isTrueLoss = TRUE_LOSS_REASONS.includes(reason as VarianceReason);
                  return (
                    <tr key={origIdx} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">{item.itemName}</td>
                      <td className="px-6 py-4 font-mono text-neutral-600">{item.batch}</td>
                      <td className="px-6 py-4 text-right text-neutral-600">{item.expectedQty - (item.inTransitExcluded || 0)}</td>
                      <td className="px-6 py-4 text-right font-semibold">{item.countedQty}</td>
                      <td className={`px-6 py-4 text-right font-bold ${item.variance < 0 ? 'text-rose-600' : 'text-green-600'}`}>{item.variance > 0 ? '+' : ''}{item.variance}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${item.varianceValue < 0 ? 'text-rose-600' : 'text-green-600'}`}>₹{Math.abs(item.varianceValue).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={reason}
                          onChange={e => setReasons(prev => ({ ...prev, [origIdx]: e.target.value as VarianceReason }))}
                          className={`w-full px-2 py-1.5 text-xs border rounded-lg outline-none transition-colors ${
                            !reason ? 'border-amber-400 bg-amber-50' : 
                            isTrueLoss ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-neutral-300 bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <option value="">Select reason...</option>
                          {VARIANCE_REASONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onBack}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<CheckCircle2 className="w-4 h-4" />} disabled={!allReasoned} onClick={handleComplete}>
              Complete Audit
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Audit Report ───────────────────────────────────────────────────────────
function AuditReport({ audit, onBack }: { audit: StockAudit; onBack: () => void }) {
  const trueLoss = audit.items.filter(i => i.reason && TRUE_LOSS_REASONS.includes(i.reason));
  const dataIssues = audit.items.filter(i => i.reason && !TRUE_LOSS_REASONS.includes(i.reason));
  const trueLossValue = trueLoss.reduce((s, i) => s + Math.abs(i.varianceValue), 0);
  const dataIssueValue = dataIssues.reduce((s, i) => s + Math.abs(i.varianceValue), 0);
  const totalVariance = Math.abs(audit.totalVarianceValue);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900 mb-2 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Audits
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">{audit.id} <Badge color="green">Completed</Badge></h1>
            <p className="text-neutral-500 text-sm mt-1">{audit.scope}{audit.scopeFilter ? ` • ${audit.scopeFilter}` : ''} • {getBranchName(audit.branchId)}</p>
          </div>
          <Button variant="outline" icon={<FileText className="w-4 h-4" />}>Export PDF</Button>
        </div>
      </div>

      {/* Metadata */}
      <Card className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><div className="text-xs text-neutral-500 uppercase">Audit Date</div><div className="font-semibold mt-1">{audit.date}</div></div>
          <div><div className="text-xs text-neutral-500 uppercase">Completed</div><div className="font-semibold mt-1">{audit.completedDate || '—'}</div></div>
          <div><div className="text-xs text-neutral-500 uppercase">Counted By</div><div className="font-semibold mt-1">{audit.countedBy}</div></div>
          <div><div className="text-xs text-neutral-500 uppercase">Approved By</div><div className="font-semibold mt-1">{audit.approvedBy || '—'}</div></div>
        </div>
      </Card>

      {/* Shrinkage Breakdown — Category 1 vs 2 */}
      {totalVariance > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary-500" /> Variance Breakdown</h3>
          <div className="space-y-3">
            {/* True loss bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-neutral-700 w-32">True Loss</span>
              <div className="flex-1 h-6 bg-neutral-100 rounded-lg overflow-hidden relative">
                <div className="h-full rounded-lg bg-gradient-to-r from-rose-500 to-rose-400 transition-all" style={{ width: `${totalVariance > 0 ? (trueLossValue / totalVariance) * 100 : 0}%` }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-700">₹{trueLossValue.toLocaleString()}</span>
              </div>
            </div>
            {/* Data issues bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-neutral-700 w-32">Data Issues</span>
              <div className="flex-1 h-6 bg-neutral-100 rounded-lg overflow-hidden relative">
                <div className="h-full rounded-lg bg-gradient-to-r from-neutral-400 to-neutral-300 transition-all" style={{ width: `${totalVariance > 0 ? (dataIssueValue / totalVariance) * 100 : 0}%` }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-700">₹{dataIssueValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1" /> Shrinkage/Theft, Breakage, Expired = actual loss &nbsp;
            <span className="inline-block w-2 h-2 rounded-full bg-neutral-400 mr-1" /> Miscount, Duplicates = bookkeeping noise
          </p>
        </Card>
      )}

      {/* Full Line List */}
      <Card title="Audit Details" className="p-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 border-b text-neutral-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3 text-right">Expected</th>
              <th className="px-6 py-3 text-right">Counted</th>
              <th className="px-6 py-3 text-right">Variance</th>
              <th className="px-6 py-3 text-right">Value</th>
              <th className="px-6 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {audit.items.map((item, i) => {
              const isTrueLoss = item.reason && TRUE_LOSS_REASONS.includes(item.reason);
              return (
                <tr key={i} className={`hover:bg-neutral-50 ${item.skipped ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-neutral-900">{item.itemName}{item.skipped && <span className="text-xs text-neutral-400 ml-1">(skipped)</span>}</td>
                  <td className="px-6 py-4 font-mono text-neutral-600">{item.batch}</td>
                  <td className="px-6 py-4 text-right text-neutral-600">{item.expectedQty}</td>
                  <td className="px-6 py-4 text-right font-semibold">{item.skipped ? '—' : item.countedQty}</td>
                  <td className={`px-6 py-4 text-right font-bold ${item.variance < 0 ? 'text-rose-600' : item.variance > 0 ? 'text-green-600' : 'text-neutral-500'}`}>
                    {item.skipped ? '—' : item.variance !== 0 ? (item.variance > 0 ? `+${item.variance}` : item.variance) : '0'}
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${item.varianceValue < 0 ? 'text-rose-600' : 'text-neutral-500'}`}>
                    {item.skipped ? '—' : item.varianceValue !== 0 ? `₹${Math.abs(item.varianceValue).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {item.reason ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isTrueLoss ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {item.reason}
                      </span>
                    ) : <span className="text-neutral-400 text-xs">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Total */}
      <div className="flex justify-end">
        <Card className="p-4 inline-block">
          <div className="text-xs text-neutral-500 uppercase">Total Variance Value</div>
          <div className={`text-2xl font-bold mt-1 ${audit.totalVarianceValue < 0 ? 'text-rose-600' : 'text-neutral-800'}`}>
            ₹{Math.abs(audit.totalVarianceValue).toLocaleString()} {audit.totalVarianceValue < 0 ? 'loss' : ''}
          </div>
        </Card>
      </div>
    </div>
  );
}
