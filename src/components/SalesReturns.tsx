import { useState, useMemo } from 'react';
import { Package, Plus, Search, Filter, History, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, Badge, Button, Table, PageHeader, Modal, Input, Select, EmptyState } from '@/components/ui';
import { salesReturns, salesBills, formatCurrency } from '@/data';
import type { SalesReturn, SalesReturnReason, ReturnStatus } from '@/types';

export function SalesReturns() {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    return salesReturns.filter(r => 
      r.patient.toLowerCase().includes(search.toLowerCase()) || 
      r.itemName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by patient or item..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
          />
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowNew(true)}>New Return</Button>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8" />} title="No returns found" subtitle="There are no sales returns matching your search." />
        ) : (
          <Table headers={['Date', 'Patient', 'Item', 'Qty', 'Reason', 'Refund Method', 'Amount', 'Status', 'Actions']}>
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 text-sm text-neutral-600">{r.createdDate}</td>
                <td className="px-4 py-3 text-sm font-medium text-neutral-800">{r.patient}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  <p>{r.itemName}</p>
                  <p className="text-xs text-neutral-400">Batch: {r.batch}</p>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-neutral-700">{r.returnQty}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{r.reason}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{r.refundMethod}</td>
                <td className="px-4 py-3 text-sm font-medium text-neutral-800">{formatCurrency(r.refundAmount)}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge color={r.status === 'Draft' ? 'gray' : r.status === 'Saved' ? 'amber' : 'green'}>{r.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-xs">View</button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {showNew && <NewSalesReturnModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewSalesReturnModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="New Sales Return" size="lg">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input label="Original Bill No. (Optional)" placeholder="e.g. INV-2024-001" />
        <Input label="Patient Name" placeholder="Search patient..." />
        
        <div className="col-span-2">
          <Input label="Item Name" placeholder="Search item..." />
        </div>
        
        <Input label="Batch" placeholder="Batch No." />
        <Input label="Return Qty" type="number" defaultValue="1" />
        
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1.5">Reason for Return</span>
          <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
            <option>Wrong Item</option>
            <option>Customer Dissatisfaction</option>
            <option>Adverse Reaction</option>
            <option>Doctor Changed Prescription</option>
            <option>Billing Error</option>
            <option>Damaged</option>
          </select>
        </label>
        
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1.5">Refund Method</span>
          <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
            <option>Cash Refund</option>
            <option>Store Credit</option>
            <option>Exchange</option>
          </select>
        </label>
      </div>

      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2 mb-6">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          Unopened and undamaged stock will be added back to Inventory automatically upon processing.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="outline" onClick={onClose}>Save as Draft</Button>
        <Button onClick={onClose}>Process Return</Button>
      </div>
    </Modal>
  );
}
