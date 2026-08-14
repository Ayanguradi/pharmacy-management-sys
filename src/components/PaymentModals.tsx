import React, { useState, useMemo } from 'react';
import { Modal, Input, Button, Select, Table, Badge } from '@/components/ui';
import { purchaseBills, formatCurrency, distributors } from '@/data';
import type { PurchaseBill } from '@/types';
import { DollarSign, FileText, CheckCircle2, Printer, Download, Share2, X, Clock, Edit3, Ban, CreditCard, Trash2 } from 'lucide-react';

// ────────────────────────────────────────────────
// 1. Bill Logs Modal — structured timeline
// ────────────────────────────────────────────────
export function BillLogsModal({ bill, onClose }: { bill: PurchaseBill; onClose: () => void }) {
  const getEventIcon = (action: string) => {
    if (action.toLowerCase().includes('payment')) return <CreditCard className="w-4 h-4" />;
    if (action.toLowerCase().includes('edit')) return <Edit3 className="w-4 h-4" />;
    if (action.toLowerCase().includes('void')) return <Ban className="w-4 h-4" />;
    if (action.toLowerCase().includes('created')) return <CheckCircle2 className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getEventColor = (action: string) => {
    if (action.toLowerCase().includes('payment')) return 'bg-success-500';
    if (action.toLowerCase().includes('void')) return 'bg-danger-500';
    if (action.toLowerCase().includes('edit')) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  const sortedLogs = [...bill.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Modal title={`Bill Logs — ${bill.billNo}`} onClose={onClose} size="lg" open>
      <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-sm">
        <div>
          <span className="text-neutral-500">Distributor:</span>{' '}
          <span className="font-medium text-neutral-800">{bill.distributor}</span>
        </div>
        <div>
          <span className="text-neutral-500">Amount:</span>{' '}
          <span className="font-semibold text-neutral-800">{formatCurrency(bill.amount)}</span>
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Clock className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
          <p>No events recorded for this bill.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-200" />
          <div className="space-y-4">
            {sortedLogs.map((log, i) => (
              <div key={i} className="relative flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-full ${getEventColor(log.action)} text-white flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                  {getEventIcon(log.action)}
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-neutral-800">{log.action}</p>
                    <span className="text-xs text-neutral-400">
                      {new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">By {log.user}</p>
                  {log.details && (
                    <div className="mt-2 p-2 bg-neutral-50 rounded text-sm text-neutral-600 border border-neutral-100">
                      {log.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ────────────────────────────────────────────────
// 2. Record Payment Modal (unified — page-level + row-level)
// ────────────────────────────────────────────────
export function RecordPaymentModal({ 
  billId, distributorName, onClose, onPaymentRecorded 
}: { 
  billId?: string, 
  distributorName?: string, 
  onClose: () => void,
  onPaymentRecorded: () => void
}) {
  const isPageLevel = !billId && !distributorName;
  
  // Single bill mode setup
  const bill = billId ? purchaseBills.find(b => b.id === billId) : null;
  const billPaid = bill ? bill.payments.reduce((s, p) => s + p.amount, 0) : 0;
  const billDue = bill ? bill.amount - billPaid : 0;

  // Page-level mode: select a distributor first
  const [selectedDistributor, setSelectedDistributor] = useState(distributorName || (bill ? bill.distributor : ''));
  const [selectedInvoice, setSelectedInvoice] = useState(billId || '');

  // Get unpaid bills for selected distributor
  const unpaidBills = useMemo(() => {
    if (!selectedDistributor) return [];
    return purchaseBills
      .filter(b => b.distributor === selectedDistributor && b.status === 'Finalized' && b.payments.reduce((s, p) => s + p.amount, 0) < b.amount)
      .sort((a, b) => new Date(a.billDate).getTime() - new Date(b.billDate).getTime());
  }, [selectedDistributor]);

  const selectedBill = selectedInvoice ? purchaseBills.find(b => b.id === selectedInvoice) : null;
  const selectedBillDue = selectedBill ? selectedBill.amount - selectedBill.payments.reduce((s, p) => s + p.amount, 0) : 0;

  const defaultAmount = billId ? billDue : (selectedInvoice && selectedBill ? selectedBillDue : 0);
  const [amount, setAmount] = useState(defaultAmount);
  const [mode, setMode] = useState('UPI');
  const [ref, setRef] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const [allocationMode, setAllocationMode] = useState<'FIFO' | 'Manual'>('FIFO');
  const [manualAllocations, setManualAllocations] = useState<Record<string, number>>({});
  const totalAllocated = Object.values(manualAllocations).reduce((s, v) => s + (v || 0), 0);

  const handleManualAllocationChange = (id: string, val: number) => {
    setManualAllocations(prev => ({ ...prev, [id]: val }));
  };

  // When invoice selection changes, update amount
  const handleInvoiceChange = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    if (invoiceId) {
      const b = purchaseBills.find(x => x.id === invoiceId);
      if (b) {
        const paid = b.payments.reduce((s, p) => s + p.amount, 0);
        setAmount(b.amount - paid);
      }
    } else {
      setAmount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetDistributor = selectedDistributor || (bill ? bill.distributor : '');
    
    if (selectedInvoice || billId) {
      const targetBill = purchaseBills.find(b => b.id === (selectedInvoice || billId));
      if (targetBill) {
        targetBill.payments.push({
          id: `pay-${Date.now()}`,
          amount,
          date,
          mode,
          ref,
          recorded_by: 'Current User'
        });
        targetBill.logs.push({ timestamp: new Date().toISOString(), user: 'Current User', action: 'Payment recorded', details: `Amount: ${formatCurrency(amount)} via ${mode}${ref ? ` (Ref: ${ref})` : ''}${note ? ` — ${note}` : ''}` });
      }
    } else if (targetDistributor) {
      let remaining = amount;
      const distBills = purchaseBills
        .filter(b => b.distributor === targetDistributor && b.status === 'Finalized' && b.payments.reduce((s, p) => s + p.amount, 0) < b.amount)
        .sort((a, b) => new Date(a.billDate).getTime() - new Date(b.billDate).getTime());
      
      if (allocationMode === 'FIFO') {
        for (const b of distBills) {
          if (remaining <= 0) break;
          const bPaid = b.payments.reduce((s, p) => s + p.amount, 0);
          const bDue = b.amount - bPaid;
          const alloc = Math.min(bDue, remaining);
          b.payments.push({ id: `pay-${Date.now()}-${Math.random()}`, amount: alloc, date, mode, ref, recorded_by: 'Current User' });
          b.logs.push({ timestamp: new Date().toISOString(), user: 'Current User', action: 'Payment recorded', details: `Allocated ${formatCurrency(alloc)} via FIFO` });
          remaining -= alloc;
        }
      } else {
        for (const b of distBills) {
          const alloc = manualAllocations[b.id] || 0;
          if (alloc > 0) {
            b.payments.push({ id: `pay-${Date.now()}-${Math.random()}`, amount: alloc, date, mode, ref, recorded_by: 'Current User' });
            b.logs.push({ timestamp: new Date().toISOString(), user: 'Current User', action: 'Payment recorded', details: `Allocated ${formatCurrency(alloc)} manually` });
          }
        }
      }
    }

    const dist = distributors.find(d => d.name === targetDistributor);
    if (dist) dist.balance -= amount;
    
    onPaymentRecorded();
    onClose();
  };

  const showAllocationUI = !selectedInvoice && !billId && selectedDistributor && unpaidBills.length > 0;

  return (
    <Modal title={bill ? `Record Payment — ${bill.billNo}` : isPageLevel ? 'Record Payment' : `Record Payment to ${distributorName}`} onClose={onClose} open size={showAllocationUI && allocationMode === 'Manual' ? 'xl' : 'md'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isPageLevel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Distributor</label>
              <Select value={selectedDistributor} onChange={(e) => { setSelectedDistributor(e.target.value); setSelectedInvoice(''); setAmount(0); }}>
                <option value="">Select distributor</option>
                {distributors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Invoice No. <span className="text-neutral-400 font-normal">(optional)</span></label>
              <Select value={selectedInvoice} onChange={(e) => handleInvoiceChange(e.target.value)} disabled={!selectedDistributor}>
                <option value="">— Auto-allocate (oldest first) —</option>
                {unpaidBills.map(b => {
                  const bPaid = b.payments.reduce((s, p) => s + p.amount, 0);
                  return <option key={b.id} value={b.id}>{b.billNo} — {formatCurrency(b.amount - bPaid)} due</option>;
                })}
              </Select>
            </div>
          </div>
        )}

        {bill && !isPageLevel && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
            <span className="text-sm text-blue-800">Remaining due on {bill.billNo}</span>
            <span className="font-bold text-blue-900">{formatCurrency(billDue)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
              <Input type="number" required min={1} value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="pl-7" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date</label>
            <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Payment Mode</label>
            <Select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Reference / UTR</label>
            <Input type="text" value={ref} onChange={e => setRef(e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Note <span className="text-neutral-400 font-normal">(optional)</span></label>
          <Input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." />
        </div>

        {showAllocationUI && (
          <div className="pt-4 border-t border-neutral-100">
            <h4 className="font-medium text-neutral-800 mb-3">Allocation Strategy</h4>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="alloc" checked={allocationMode === 'FIFO'} onChange={() => setAllocationMode('FIFO')} className="text-primary-600 focus:ring-primary-500" />
                Auto-allocate (oldest first)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="alloc" checked={allocationMode === 'Manual'} onChange={() => setAllocationMode('Manual')} className="text-primary-600 focus:ring-primary-500" />
                Split manually
              </label>
            </div>

            {allocationMode === 'Manual' && (
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 max-h-64 overflow-y-auto">
                <Table headers={['Bill No.', 'Bill Date', 'Amount', 'Due', 'Allocate']}>
                  {unpaidBills.map(b => {
                    const bPaid = b.payments.reduce((s, p) => s + p.amount, 0);
                    const bDue = b.amount - bPaid;
                    return (
                      <tr key={b.id}>
                        <td className="px-4 py-2 font-medium">{b.billNo}</td>
                        <td className="px-4 py-2 text-neutral-600">{b.billDate}</td>
                        <td className="px-4 py-2">{formatCurrency(b.amount)}</td>
                        <td className="px-4 py-2 text-danger-600 font-medium">{formatCurrency(bDue)}</td>
                        <td className="px-4 py-2">
                          <Input 
                            type="number" 
                            className="w-24 h-8 text-sm" 
                            max={bDue} 
                            min={0}
                            value={manualAllocations[b.id] || ''}
                            onChange={(e) => handleManualAllocationChange(b.id, Number(e.target.value))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </Table>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200">
                  <span className="text-sm font-medium text-neutral-600">Total Allocated: <span className={totalAllocated !== amount ? 'text-danger-600' : 'text-success-600'}>{formatCurrency(totalAllocated)}</span></span>
                  <span className="text-sm font-medium text-neutral-600">Remaining: <span className={amount - totalAllocated !== 0 ? 'text-danger-600' : 'text-success-600'}>{formatCurrency(amount - totalAllocated)}</span></span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={!amount || amount <= 0 || (isPageLevel && !selectedDistributor)} icon={<DollarSign className="w-4 h-4" />}>Confirm Payment</Button>
        </div>
      </form>
    </Modal>
  );
}

// ────────────────────────────────────────────────
// 3. Print Preview Modal
// ────────────────────────────────────────────────
export function PrintPreviewModal({ bill, onClose }: { bill: PurchaseBill; onClose: () => void }) {
  const paidAmt = bill.payments.reduce((s, p) => s + p.amount, 0);

  const handlePrint = () => {
    const printArea = document.getElementById('print-preview-content');
    if (!printArea) return;
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) return;
    w.document.write(`<html><head><title>${bill.billNo}</title><style>
      body { font-family: 'Inter', -apple-system, sans-serif; padding: 32px; color: #1a1a1a; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #e5e5e5; padding: 8px 12px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; }
      .total-row { font-weight: 700; background: #f9fafb; }
      h2 { margin: 0; }
    </style></head><body>${printArea.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <Modal title="Bill Preview" onClose={onClose} size="lg" open>
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-200">
        <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>Print</Button>
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>Download PDF</Button>
        <Button variant="outline" size="sm" icon={<Share2 className="w-4 h-4" />}>Share</Button>
      </div>

      <div id="print-preview-content" className="bg-white p-6 border border-neutral-200 rounded-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Purchase Bill</h2>
            <p className="text-sm text-neutral-500 mt-1">Bill No: <span className="font-semibold text-neutral-800">{bill.billNo}</span></p>
          </div>
          <div className="text-right text-sm">
            <p className="text-neutral-500">Bill Date: <span className="font-medium text-neutral-800">{bill.billDate}</span></p>
            <p className="text-neutral-500 mt-1">Entry Date: <span className="font-medium text-neutral-800">{bill.entryDate}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-neutral-50 rounded-lg">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Distributor</p>
            <p className="text-sm font-semibold text-neutral-800">{bill.distributor}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Entry By</p>
            <p className="text-sm font-medium text-neutral-700">{bill.entryBy}</p>
          </div>
        </div>

        {bill.items.length > 0 && (
          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Item</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Batch</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Expiry</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-neutral-500 uppercase">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-neutral-500 uppercase">Price</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-neutral-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bill.items.map((item, i) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-neutral-500">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-neutral-800">{item.name}</td>
                  <td className="px-3 py-2 text-neutral-600">{item.batch}</td>
                  <td className="px-3 py-2 text-neutral-600">{item.expiry}</td>
                  <td className="px-3 py-2 text-right">{item.qty}{item.free > 0 ? ` (+${item.free})` : ''}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.purchasePrice)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Amount</span>
              <span className="font-bold text-neutral-900">{formatCurrency(bill.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Amount Paid</span>
              <span className="font-medium text-success-600">{formatCurrency(paidAmt)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-700">Balance Due</span>
              <span className="font-bold text-neutral-900">{formatCurrency(bill.amount - paidAmt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ────────────────────────────────────────────────
// 4. Delete Confirm Modal (Draft bills)
// ────────────────────────────────────────────────
export function DeleteConfirmModal({ bill, onClose, onConfirm }: { bill: PurchaseBill; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Delete Draft Bill" onClose={onClose} size="sm" open>
      <div className="space-y-4">
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-sm text-danger-800 font-medium">This draft will be permanently deleted and cannot be recovered.</p>
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Bill No.</span>
            <span className="font-medium text-neutral-800">{bill.billNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Distributor</span>
            <span className="font-medium text-neutral-800">{bill.distributor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Amount</span>
            <span className="font-semibold text-neutral-800">{formatCurrency(bill.amount)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} icon={<Trash2 className="w-4 h-4" />}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}

// ────────────────────────────────────────────────
// 5. Void Confirm Modal (Finalized bills)
// ────────────────────────────────────────────────
export function VoidConfirmModal({ bill, onClose, onConfirm }: { bill: PurchaseBill; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');

  return (
    <Modal title="Void Bill" onClose={onClose} size="sm" open>
      <div className="space-y-4">
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg text-sm text-warning-800">
          Voiding this bill reverses its effect on the distributor's balance. This action is recorded permanently in the bill's logs.
        </div>

        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Bill No.</span>
            <span className="font-medium text-neutral-800">{bill.billNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Distributor</span>
            <span className="font-medium text-neutral-800">{bill.distributor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Amount</span>
            <span className="font-semibold text-neutral-800">{formatCurrency(bill.amount)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Reason for voiding <span className="text-danger-500">*</span></label>
          <textarea
            className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
            rows={3}
            placeholder="e.g. Duplicate entry, incorrect amount..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => onConfirm(reason)} disabled={!reason.trim()} icon={<Ban className="w-4 h-4" />}>Void Bill</Button>
        </div>
      </div>
    </Modal>
  );
}
