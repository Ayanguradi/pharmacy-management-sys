import React, { useState } from 'react';
import { Package, Search, Plus, Filter, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Card, Badge, Button, Table, SearchBar, Select, EmptyState, StatCard } from '@/components/ui';
import { pendingPOs, suggestedPOs, formatCurrency } from '@/data';
import type { PurchaseOrder, View } from '@/types';
import { DateRangePicker, DateRange } from '@/components/ui/DateRangePicker';

interface PurchaseOrdersProps {
  onNavigateWithState: (v: View, state?: any) => void;
}

export function PurchaseOrders({ onNavigateWithState }: PurchaseOrdersProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [distributorFilter, setDistributorFilter] = useState('all');
  const [placedViaFilter, setPlacedViaFilter] = useState('all');
  
  const defaultRange = { 
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
    endDate: new Date() 
  };
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange);
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'age', direction: 'desc' });
  const [localPOs, setLocalPOs] = useState<PurchaseOrder[]>(pendingPOs as PurchaseOrder[]);
  const [localSuggestions, setLocalSuggestions] = useState(suggestedPOs);

  const today = new Date('2024-08-08');

  // KPI Calculations
  const openPOsCount = localPOs.filter(p => p.status === 'Pending' || p.status === 'Partially Received').length;
  const pendingValue = localPOs
    .filter(p => p.status === 'Pending' || p.status === 'Partially Received')
    .reduce((acc, po) => acc + (po.items * 250), 0); // Mock est value
  const overduePOsCount = localPOs.filter(p => {
    return (p.status === 'Pending' || p.status === 'Partially Received') && new Date(p.expected_delivery_date) < today;
  }).length;
  
  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleApproveSuggested = (id: string) => {
    const sug = localSuggestions.find(s => s.id === id);
    if (!sug) return;
    
    const newPO: PurchaseOrder = {
      poNo: `PO-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      distributor: sug.distributor,
      items: 1,
      date: '08 Aug 2024',
      expected_delivery_date: '2024-08-10',
      placed_via: 'Manual',
      status: 'Pending',
      linked_bill_ids: []
    };
    
    setLocalPOs([newPO, ...localPOs]);
    setLocalSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const filteredPOs = localPOs.filter(po => {
    const matchSearch = po.poNo.toLowerCase().includes(search.toLowerCase()) || 
                        po.distributor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchDistributor = distributorFilter === 'all' || po.distributor === distributorFilter;
    const matchVia = placedViaFilter === 'all' || po.placed_via === placedViaFilter;
    
    // In a real app we'd parse po.date to Date and filter by dateRange, mocking here for simplicity
    
    return matchSearch && matchStatus && matchDistributor && matchVia;
  }).sort((a, b) => {
    // Mock sort logic for age
    if (sortConfig.key === 'age') {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      
      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open POs" value={openPOsCount.toString()} icon={<Package className="w-5 h-5" />} color="blue" />
        <StatCard label="Pending Value" value={formatCurrency(pendingValue)} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatCard label="Overdue POs" value={overduePOsCount.toString()} icon={<AlertCircle className="w-5 h-5" />} color="red" />
        <StatCard label="Avg Fulfillment Time" value="2.4 days" icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
      </div>

      {/* Suggested POs */}
      {localSuggestions.length > 0 && (
        <Card className="p-5 border-l-4 border-l-primary-500">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Suggested Purchase Orders
            <Badge color="blue" size="sm">{localSuggestions.length} new items below min-stock</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localSuggestions.map(sug => (
              <div key={sug.id} className="bg-neutral-50 rounded-lg p-4 flex items-center justify-between border border-neutral-200">
                <div>
                  <p className="font-medium text-neutral-800">{sug.item}</p>
                  <p className="text-sm text-neutral-500">{sug.distributor}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-danger-600 font-medium">Stock: {sug.stock} (Min: {sug.minStock})</span>
                    <span className="text-primary-600 font-medium">Suggested Qty: {sug.suggestedQty}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleApproveSuggested(sug.id)}>Approve & send</Button>
                  <Button size="sm" variant="ghost" onClick={() => setLocalSuggestions(prev => prev.filter(s => s.id !== sug.id))}>Dismiss</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters & Actions */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search PO No. or Distributor..." />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40">
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
          <Select value={placedViaFilter} onChange={e => setPlacedViaFilter(e.target.value)} className="w-40">
            <option value="all">All Channels</option>
            <option value="Manual">Manual</option>
            <option value="IVR call">IVR call</option>
            <option value="WhatsApp">WhatsApp</option>
          </Select>
          <DateRangePicker value={dateRange} onChange={setDateRange} className="w-64" />
          <Button icon={<Plus className="w-4 h-4" />}>Create PO</Button>
        </div>
      </Card>

      {/* Main Table */}
      <Card>
        {filteredPOs.length === 0 ? (
          <EmptyState 
            icon={<Package className="w-8 h-8" />} 
            title="No Purchase Orders found" 
            subtitle="Create your first Purchase Order to restock inventory, or check the Suggested POs section above." 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('poNo')}>PO No.</th>
                  <th className="px-4 py-3">Distributor</th>
                  <th className="px-4 py-3">Placed On</th>
                  <th className="px-4 py-3">Expected By</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Est. Value</th>
                  <th className="px-4 py-3">Placed Via</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Linked Bills</th>
                  <th className="px-4 py-3 cursor-pointer hover:bg-neutral-100" onClick={() => handleSort('age')}>
                    Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPOs.map((po) => {
                  const isOverdue = (po.status === 'Pending' || po.status === 'Partially Received') && new Date(po.expected_delivery_date) < today;
                  const poDate = new Date(po.date);
                  const ageDays = Math.floor((today.getTime() - poDate.getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <tr key={po.poNo} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-800">{po.poNo}</td>
                      <td className="px-4 py-3 text-neutral-600">{po.distributor}</td>
                      <td className="px-4 py-3 text-neutral-600">{po.date}</td>
                      <td className="px-4 py-3 text-neutral-600">{new Date(po.expected_delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{po.items}</td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-700">{formatCurrency(po.items * 250)}</td>
                      <td className="px-4 py-3 text-neutral-600">{po.placed_via}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge color={po.status === 'Received' ? 'green' : po.status === 'Partially Received' ? 'blue' : po.status === 'Cancelled' ? 'gray' : 'amber'}>
                            {po.status}
                          </Badge>
                          {isOverdue && <Badge color="red">Overdue</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {po.linked_bill_ids.length > 0 ? (
                          <button 
                            className="text-primary-600 hover:underline text-xs font-medium bg-primary-50 px-2 py-1 rounded"
                            onClick={() => onNavigateWithState('purchases', { po: po.poNo })}
                          >
                            {po.linked_bill_ids.length} bill{po.linked_bill_ids.length > 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span className="text-neutral-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {ageDays} days
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {po.status === 'Pending' && (
                            <>
                              <Button size="sm" variant="ghost">Edit</Button>
                              <Button size="sm" variant="ghost" className="text-danger-600">Cancel</Button>
                            </>
                          )}
                          {(po.status === 'Partially Received' || po.status === 'Received') && (
                            <Button size="sm" variant="outline">Compare</Button>
                          )}
                          <Button size="sm" variant="ghost">View</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// Ensure you export TrendingUp from lucide-react above
import { TrendingUp } from 'lucide-react';
