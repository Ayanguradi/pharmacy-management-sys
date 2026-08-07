import { useState } from 'react';
import {
  Plus, Edit3, Trash2,
} from 'lucide-react';
import { Card, Badge, Button, Table, SearchBar, PageHeader, Modal, Input, Select } from '@/components/ui';
import { inventoryItems, formatCurrency } from '@/data';
import type { InventoryItem, View } from '@/types';

interface InventoryProps {
  onNavigateWithState?: (view: View, state?: any) => void;
}

export function Inventory({ onNavigateWithState }: InventoryProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring'>('all');
  const [category, setCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const categories = [...new Set(inventoryItems.map((i) => i.category))];

  const filtered = inventoryItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.batch.toLowerCase().includes(search.toLowerCase()) ||
      item.rack.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || item.category === category;
    const matchFilter = filter === 'all' ||
      (filter === 'low' && item.stock <= item.minStock) ||
      (filter === 'expiring' && item.expiry <= '2025-12');
    return matchSearch && matchCategory && matchFilter;
  });

  const stockBadge = (item: InventoryItem) => {
    if (item.stock <= item.minStock * 0.5) return <Badge color="red">Critical</Badge>;
    if (item.stock <= item.minStock) return <Badge color="amber">Low</Badge>;
    return <Badge color="green">In Stock</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Item master with stock levels, pricing, and rack locations"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Item</Button>}
      />

      {/* Quick filter stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button onClick={() => setFilter('all')} className={`p-4 rounded-xl border transition-all ${filter === 'all' ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
          <p className="text-2xl font-bold text-neutral-800">{inventoryItems.length}</p>
          <p className="text-sm text-neutral-500">Total Items</p>
        </button>
        <button onClick={() => setFilter('low')} className={`p-4 rounded-xl border transition-all ${filter === 'low' ? 'border-warning-300 bg-warning-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
          <p className="text-2xl font-bold text-warning-600">{inventoryItems.filter((i) => i.stock <= i.minStock).length}</p>
          <p className="text-sm text-neutral-500">Low Stock</p>
        </button>
        <button onClick={() => setFilter('expiring')} className={`p-4 rounded-xl border transition-all ${filter === 'expiring' ? 'border-danger-300 bg-danger-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
          <p className="text-2xl font-bold text-danger-600">{inventoryItems.filter((i) => i.expiry <= '2025-12').length}</p>
          <p className="text-sm text-neutral-500">Expiring Soon</p>
        </button>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by name, batch, or rack..." /></div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
      </Card>

      <Card>
        <Table headers={['Item', 'Category', 'Batch', 'Stock', 'MRP', 'Sale Price', 'Rack', 'Expiry', 'Flags', 'Actions']}>
          {filtered.map((item) => (
            <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-3 font-medium text-neutral-700">{item.name}</td>
              <td className="px-4 py-3 text-neutral-600">{item.category}</td>
              <td className="px-4 py-3 text-neutral-600">{item.batch}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${item.stock <= item.minStock ? 'text-danger-600' : 'text-neutral-700'}`}>{item.stock}</span>
                  {stockBadge(item)}
                </div>
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatCurrency(item.mrp)}</td>
              <td className="px-4 py-3 text-neutral-600">{formatCurrency(item.salePrice)}</td>
              <td className="px-4 py-3"><span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">{item.rack}</span></td>
              <td className="px-4 py-3 text-neutral-600">{item.expiry}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {item.generic && <Badge color="blue">Generic</Badge>}
                  {item.ownBrand && <Badge color="green">Own Brand</Badge>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => {
                    const today = new Date('2024-08-07');
                    const expDate = new Date(item.expiry + '-01');
                    const diffDays = Math.ceil(Math.abs(expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    let reason = 'Expired';
                    if (diffDays > 0 && diffDays <= 90) reason = 'Near-expiry';
                    else if (diffDays > 90) reason = 'Non-moving';
                    
                    onNavigateWithState?.('purchase-returns', {
                      itemName: item.name,
                      batch: item.batch,
                      returnPrice: item.purchasePrice,
                      reason
                    });
                  }} className="text-xs font-medium text-primary-600 hover:bg-primary-50 px-2 py-1 rounded border border-primary-200">Return</button>
                  <button onClick={() => setEditItem(item)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {showAdd && <ItemModal onClose={() => setShowAdd(false)} />}
      {editItem && <ItemModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  );
}

function ItemModal({ item, onClose }: { item?: InventoryItem; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Item' : 'Add Item'} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Item Name" defaultValue={item?.name} placeholder="e.g. Paracetamol 500mg" />
        <Input label="Category" defaultValue={item?.category} placeholder="e.g. Analgesic" />
        <Input label="Batch" defaultValue={item?.batch} placeholder="PC2401" />
        <Input label="Expiry" type="text" defaultValue={item?.expiry} placeholder="YYYY-MM" />
        <Input label="MRP" type="number" defaultValue={item?.mrp} />
        <Input label="Purchase Price" type="number" defaultValue={item?.purchasePrice} />
        <Input label="Sale Price" type="number" defaultValue={item?.salePrice} />
        <Input label="Discount %" type="number" defaultValue={item?.discount} />
        <Input label="Stock" type="number" defaultValue={item?.stock} />
        <Input label="Min Stock" type="number" defaultValue={item?.minStock} />
        <Input label="Max Stock" type="number" defaultValue={item?.maxStock} />
        <Input label="Rack / Bin" defaultValue={item?.rack} placeholder="A-01" />
        <Input label="Location" defaultValue={item?.location} placeholder="Shelf A" />
        <div className="flex items-end gap-4 pb-1">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" defaultChecked={item?.generic} className="w-4 h-4 rounded border-neutral-300 text-primary-600" /> Generic Drug
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" defaultChecked={item?.ownBrand} className="w-4 h-4 rounded border-neutral-300 text-primary-600" /> Own Brand
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 mt-5">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>{item ? 'Save Changes' : 'Add Item'}</Button>
      </div>
    </Modal>
  );
}
