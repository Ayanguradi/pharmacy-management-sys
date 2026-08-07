import { useState, useEffect } from 'react';
import {
  Package, Plus, Search, AlertCircle, FileText, CheckCircle2,
  Printer, ArrowLeft, MoreVertical, X, TrendingUp
} from 'lucide-react';
import { Card, Badge, Button, Table, SearchBar, Select, Modal, Input, EmptyState } from '@/components/ui';
import { purchaseReturns, distributors, inventoryItems, formatCurrency } from '@/data';
import type { PurchaseReturn, ReturnReason, ReturnStatus, InventoryItem } from '@/types';

interface PurchaseReturnsProps {
  initialReturn?: Partial<PurchaseReturn>; // For pre-filling from other views
}

export function PurchaseReturns({ initialReturn }: PurchaseReturnsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDateDesc, setSortDateDesc] = useState(true);
  const [showNewModal, setShowNewModal] = useState(!!initialReturn);
  const [returns, setReturns] = useState(purchaseReturns);
  
  const [showExpiryList, setShowExpiryList] = useState(false);
  const [expiryList, setExpiryList] = useState<(InventoryItem & { distributorId: string; distributorName: string; daysToExpiry: number })[]>([]);

  // Compute expiry list
  useEffect(() => {
    const today = new Date('2024-08-07');
    const expiring: any[] = [];
    
    // Simplistic check, assume all inventory items are linked to a distributor somehow. 
    inventoryItems.forEach(item => {
      if (!item.expiry) return;
      const expDate = new Date(item.expiry + '-01'); // YYYY-MM
      const diffTime = Math.abs(expDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Mock distributor assignment for demo
      const dist = distributors[parseInt(item.id.replace(/\D/g, '')) % distributors.length];
      const minDays = dist?.returnPolicy?.minShelfLifeDays || 90;
      
      if (diffDays <= minDays) {
        expiring.push({
          ...item,
          distributorId: dist.id,
          distributorName: dist.name,
          daysToExpiry: diffDays
        });
      }
    });
    setExpiryList(expiring);
  }, []);

  const filtered = returns.filter((r) => {
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) || 
                        r.distributor.toLowerCase().includes(search.toLowerCase()) ||
                        r.itemName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    return sortDateDesc 
      ? new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      : new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
  });

  const getStatusBadgeColor = (status: ReturnStatus) => {
    switch (status) {
      case 'Draft': return 'gray';
      case 'Sent': return 'blue';
      case 'Credit-note-pending': return 'amber';
      case 'Settled': return 'green';
      case 'Rejected': return 'red';
      default: return 'gray';
    }
  };

  const handleSaveReturn = (newReturn: PurchaseReturn) => {
    setReturns([newReturn, ...returns]);
    setShowNewModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this return?')) {
      setReturns(returns.filter(r => r.id !== id));
    }
  };

  const handleSettle = (id: string, actualAmount: number) => {
    setReturns(returns.map(r => r.id === id ? { ...r, status: 'Settled', actualCreditAmount: actualAmount } : r));
  };

  if (showExpiryList) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setShowExpiryList(false)} className="text-neutral-500 hover:text-neutral-700 p-1 rounded hover:bg-neutral-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-neutral-800">Auto-Generated Expiry Return List</h2>
        </div>
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary-800">Review expiring stock</p>
              <p className="text-sm text-primary-600 mt-1">
                These items are approaching their distributor's return policy cutoff (or default 90 days). Return them now to avoid write-offs.
              </p>
            </div>
          </div>
        </Card>
        
        <Card>
          <Table headers={['Item', 'Batch', 'Expiry', 'Days Left', 'Distributor', 'Stock', 'Action']}>
             {expiryList.map(item => (
               <tr key={item.id} className="hover:bg-neutral-50">
                 <td className="px-4 py-3 font-medium text-neutral-700">{item.name}</td>
                 <td className="px-4 py-3 text-neutral-600">{item.batch}</td>
                 <td className="px-4 py-3 text-neutral-600">{item.expiry}</td>
                 <td className="px-4 py-3 font-semibold text-danger-600">{item.daysToExpiry} days</td>
                 <td className="px-4 py-3 text-neutral-600">{item.distributorName}</td>
                 <td className="px-4 py-3 font-semibold text-neutral-700">{item.stock}</td>
                 <td className="px-4 py-3">
                   <Button size="sm" variant="outline" onClick={() => {
                     // Open modal with prefilled
                     setShowNewModal(true);
                   }}>Return</Button>
                 </td>
               </tr>
             ))}
          </Table>
          {expiryList.length === 0 && (
            <div className="p-8 text-center text-neutral-500">No expiring items found.</div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="w-full sm:w-64">
            <SearchBar value={search} onChange={setSearch} placeholder="Search returns..." />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-48">
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent (Challan Gen)</option>
            <option value="Credit-note-pending">Pending Credit Note</option>
            <option value="Settled">Settled</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<AlertCircle className="w-4 h-4" />} onClick={() => setShowExpiryList(true)}>
            Expiry Returns ({expiryList.length})
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNewModal(true)}>
            New Return
          </Button>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8" />} title="No returns found" subtitle="Create a new purchase return or adjust your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3">Return ID</th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100" onClick={() => setSortDateDesc(!sortDateDesc)}>
                    <div className="flex items-center gap-1">Date {sortDateDesc ? '↓' : '↑'}</div>
                  </th>
                  <th className="px-4 py-3">Distributor</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expected Credit</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(r => (
                  <ReturnRow key={r.id} returnData={r} getStatusBadgeColor={getStatusBadgeColor} onSettle={handleSettle} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showNewModal && (
        <NewReturnModal 
          initialData={initialReturn} 
          onClose={() => setShowNewModal(false)} 
          onSave={handleSaveReturn} 
        />
      )}
    </div>
  );
}

function ReturnRow({ returnData, getStatusBadgeColor, onSettle, onDelete }: { 
  returnData: PurchaseReturn, 
  getStatusBadgeColor: (s: ReturnStatus) => any,
  onSettle: (id: string, amount: number) => void,
  onDelete: (id: string) => void
}) {
  const [showSettle, setShowSettle] = useState(false);
  const [showChallan, setShowChallan] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  
  const variance = returnData.status === 'Settled' && returnData.actualCreditAmount !== undefined 
      ? returnData.actualCreditAmount - returnData.expectedCreditAmount 
      : 0;

  return (
    <>
      <tr className="hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
        <td className="px-4 py-3 font-medium text-neutral-800">{returnData.id}</td>
        <td className="px-4 py-3 text-neutral-600">{returnData.createdDate}</td>
        <td className="px-4 py-3 text-neutral-700">{returnData.distributor}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-neutral-800">{returnData.itemName}</p>
          <p className="text-xs text-neutral-500">Qty: {returnData.returnQty} | Batch: {returnData.batch}</p>
        </td>
        <td className="px-4 py-3 text-neutral-600">{returnData.reason}</td>
        <td className="px-4 py-3">
          <Badge color={getStatusBadgeColor(returnData.status)}>{returnData.status}</Badge>
        </td>
        <td className="px-4 py-3">
          <div className="font-semibold text-neutral-800">{formatCurrency(returnData.expectedCreditAmount)}</div>
          {returnData.status === 'Settled' && variance !== 0 && (
            <div className={`text-xs mt-1 px-1.5 py-0.5 inline-block rounded font-medium ${variance > 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
              Variance: {variance > 0 ? '+' : ''}{formatCurrency(variance)}
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowChallan(true)}>Print</Button>
            {returnData.status === 'Credit-note-pending' && (
              <Button size="sm" variant="outline" onClick={() => setShowSettle(true)}>Settle</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowLogs(true)}>Logs</Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(returnData.id)} className="text-danger-600 hover:text-danger-700">Delete</Button>
          </div>
        </td>
      </tr>

      {showSettle && (
        <SettleModal 
          returnData={returnData} 
          onClose={() => setShowSettle(false)} 
          onSave={(amt) => { onSettle(returnData.id, amt); setShowSettle(false); }} 
        />
      )}

      {showChallan && (
        <ChallanModal returnData={returnData} onClose={() => setShowChallan(false)} />
      )}

      {showLogs && (
        <Modal open onClose={() => setShowLogs(false)} title="Return Activity Logs" size="sm">
          <div className="space-y-4 text-sm text-neutral-700">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500" />
              <div>
                <p>Created by Admin</p>
                <p className="text-xs text-neutral-400">{returnData.createdDate} 10:23 AM</p>
              </div>
            </div>
            {returnData.status !== 'Draft' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                <div>
                  <p>Status changed to {returnData.status}</p>
                  <p className="text-xs text-neutral-400">{returnData.createdDate} 11:00 AM</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 mt-4 border-t border-neutral-100">
            <Button onClick={() => setShowLogs(false)}>Close</Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function SettleModal({ returnData, onClose, onSave }: { returnData: PurchaseReturn, onClose: () => void, onSave: (amount: number) => void }) {
  const [actualAmount, setActualAmount] = useState(returnData.expectedCreditAmount);
  
  return (
    <Modal open onClose={onClose} title="Settle Credit Note" size="sm">
      <div className="space-y-4">
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-sm text-neutral-500">Expected Credit Amount</p>
          <p className="text-xl font-bold text-neutral-800">{formatCurrency(returnData.expectedCreditAmount)}</p>
        </div>
        
        <Input 
          label="Actual Credit Note Amount" 
          type="number" 
          value={actualAmount} 
          onChange={(e) => setActualAmount(Number(e.target.value))} 
        />
        
        {actualAmount !== returnData.expectedCreditAmount && (
          <div className="flex gap-2 p-3 bg-warning-50 text-warning-700 rounded-lg text-sm border border-warning-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>There is a variance of <strong>{formatCurrency(actualAmount - returnData.expectedCreditAmount)}</strong>. This will be flagged for review.</p>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(actualAmount)}>Mark as Settled</Button>
        </div>
      </div>
    </Modal>
  );
}

function ChallanModal({ returnData, onClose }: { returnData: PurchaseReturn, onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Return Challan" size="lg">
      <div className="bg-white p-8 border border-neutral-200 rounded-xl max-w-2xl mx-auto my-4 print:border-none print:shadow-none font-sans" id="printable-challan">
        <div className="flex justify-between items-start border-b border-neutral-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">PURCHASE RETURN CHALLAN</h1>
            <p className="text-neutral-500 mt-1">Challan No: <span className="font-semibold text-neutral-700">{returnData.id}</span></p>
            <p className="text-neutral-500">Date: <span className="font-semibold text-neutral-700">{returnData.createdDate}</span></p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-neutral-800">Apollo Pharmacy</h2>
            <p className="text-sm text-neutral-500">123 Health Ave, Mumbai</p>
            <p className="text-sm text-neutral-500">GSTIN: 27APOLLO0000Z1</p>
          </div>
        </div>
        
        <div className="mb-8 flex justify-between">
           <div>
             <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">To Distributor:</p>
             <p className="font-bold text-neutral-800 text-lg">{returnData.distributor}</p>
             <p className="text-sm text-neutral-600">Please issue credit note against these returned goods.</p>
           </div>
           {returnData.originalBillId && (
             <div className="text-right">
               <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Ref Invoice:</p>
               <p className="font-semibold text-neutral-800">{returnData.originalBillId}</p>
             </div>
           )}
        </div>
        
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-neutral-800">
              <th className="py-3 font-semibold text-neutral-800">Item Description</th>
              <th className="py-3 font-semibold text-neutral-800">Batch</th>
              <th className="py-3 font-semibold text-neutral-800 text-center">Reason</th>
              <th className="py-3 font-semibold text-neutral-800 text-right">Qty</th>
              <th className="py-3 font-semibold text-neutral-800 text-right">Price</th>
              <th className="py-3 font-semibold text-neutral-800 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            <tr>
              <td className="py-4 font-medium text-neutral-800">{returnData.itemName}</td>
              <td className="py-4 text-neutral-600">{returnData.batch}</td>
              <td className="py-4 text-center text-neutral-600">{returnData.reason}</td>
              <td className="py-4 text-right font-semibold text-neutral-800">{returnData.returnQty}</td>
              <td className="py-4 text-right text-neutral-600">{formatCurrency(returnData.returnPrice)}</td>
              <td className="py-4 text-right font-bold text-neutral-800">{formatCurrency(returnData.expectedCreditAmount)}</td>
            </tr>
          </tbody>
        </table>
        
        <div className="flex justify-between items-end mt-16 pt-8 border-t border-neutral-200">
          <div className="text-center">
            <div className="w-48 border-b border-neutral-400 mb-2"></div>
            <p className="text-sm text-neutral-500">Authorized Signatory (Pharmacy)</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-neutral-400 mb-2"></div>
            <p className="text-sm text-neutral-500">Receiver's Signature (Distributor)</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print Challan</Button>
      </div>
    </Modal>
  );
}

function NewReturnModal({ initialData, onClose, onSave }: { initialData?: Partial<PurchaseReturn>, onClose: () => void, onSave: (r: PurchaseReturn) => void }) {
  const [formData, setFormData] = useState({
    distributor: initialData?.distributor || '',
    itemName: initialData?.itemName || '',
    batch: initialData?.batch || '',
    returnQty: initialData?.returnQty || 1,
    reason: initialData?.reason || 'Expired' as ReturnReason,
    customReason: '',
    originalBillId: initialData?.originalBillId || '',
    returnPrice: initialData?.returnPrice || 0,
    linkedReconciliationIssueId: initialData?.linkedReconciliationIssueId || ''
  });

  const distObj = distributors.find(d => d.name === formData.distributor);
  const expectedCreditAmount = formData.returnQty * formData.returnPrice;

  // Eligibility Check
  const [eligibilityWarning, setEligibilityWarning] = useState<string | null>(null);

  useEffect(() => {
    if (distObj?.returnPolicy && formData.reason === 'Near-expiry') {
      // Very basic mock check. In reality, we'd compare item expiry date with minShelfLifeDays
      if (formData.distributor === 'Sun Pharma Depot') {
        setEligibilityWarning('Item may be outside the return window (15 days max for this distributor). It might be rejected.');
      } else {
        setEligibilityWarning(null);
      }
    } else {
      setEligibilityWarning(null);
    }
  }, [formData.distributor, formData.reason, distObj]);

  const handleSave = (status: ReturnStatus) => {
    const newReturn: PurchaseReturn = {
      id: `PR-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      distributor: formData.distributor,
      itemName: formData.itemName,
      batch: formData.batch,
      returnQty: formData.returnQty,
      reason: (formData.reason === 'Others' && formData.customReason ? formData.customReason as any : formData.reason) as ReturnReason,
      returnPrice: formData.returnPrice,
      originalBillId: formData.originalBillId,
      status,
      expectedCreditAmount,
      createdDate: new Date().toISOString().split('T')[0],
      linkedReconciliationIssueId: formData.linkedReconciliationIssueId
    };
    onSave(newReturn);
  };

  return (
    <Modal open onClose={onClose} title="New Purchase Return" size="md">
      <div className="space-y-4">
        {formData.linkedReconciliationIssueId && (
          <div className="flex items-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Linked to PO Reconciliation Issue: <strong>{formData.linkedReconciliationIssueId}</strong></span>
          </div>
        )}

        <Select 
          label="Distributor" 
          value={formData.distributor} 
          onChange={e => setFormData({...formData, distributor: e.target.value})}
        >
          <option value="">Select Distributor...</option>
          {distributors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </Select>

        {distObj && !distObj.returnPolicy && (
          <p className="text-xs text-neutral-500 mt-1">No return policy configured for this distributor.</p>
        )}

        {eligibilityWarning && (
          <div className="flex items-start gap-2 p-3 bg-warning-50 text-warning-700 rounded-lg text-sm border border-warning-200 mt-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{eligibilityWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Item Name" 
            value={formData.itemName} 
            onChange={e => setFormData({...formData, itemName: e.target.value})} 
          />
          <Input 
            label="Batch Number" 
            value={formData.batch} 
            onChange={e => setFormData({...formData, batch: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="Reason for Return" 
            value={formData.reason} 
            onChange={e => setFormData({...formData, reason: e.target.value as ReturnReason})}
          >
            <option value="Expired">Expired</option>
            <option value="Near-expiry">Near Expiry</option>
            <option value="Non-moving">Non-Moving / Dead Stock</option>
            <option value="Damaged">Damaged in Transit</option>
            <option value="Wrong-item">Wrong Item Received</option>
            <option value="Recall">Product Recall</option>
            <option value="Others">Others</option>
          </Select>
          <Input 
            label="Original Bill No. (Optional)" 
            value={formData.originalBillId} 
            onChange={e => setFormData({...formData, originalBillId: e.target.value})} 
          />
        </div>

        {formData.reason === 'Others' && (
          <Input 
            label="Please specify reason" 
            value={formData.customReason} 
            onChange={e => setFormData({...formData, customReason: e.target.value})} 
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Return Quantity" 
            type="number" 
            value={formData.returnQty} 
            onChange={e => setFormData({...formData, returnQty: Number(e.target.value)})} 
          />
          <Input 
            label="Unit Price (₹)" 
            type="number" 
            value={formData.returnPrice} 
            onChange={e => setFormData({...formData, returnPrice: Number(e.target.value)})} 
          />
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-neutral-600 font-medium">Expected Credit Value</span>
            <span className="text-2xl font-bold text-neutral-800">{formatCurrency(expectedCreditAmount)}</span>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-neutral-100">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave('Draft')}>Save as Draft</Button>
            <Button variant="outline" onClick={() => handleSave('Saved')}>Save</Button>
            <Button onClick={() => handleSave('Sent')}>Send</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
