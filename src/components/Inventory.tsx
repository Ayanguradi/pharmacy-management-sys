import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, Trash2, Search, Filter, ArrowUpDown, Tag, AlertTriangle, Clock,
  MapPin, ShoppingCart, Activity, RefreshCw, Layers, ArrowLeft,
  ChevronDown, Check, X, Edit2
} from 'lucide-react';
import { Card, Badge, Button, Table, PageHeader, Modal, Input, Tabs } from '@/components/ui';
import { inventoryItems, formatCurrency, purchaseBills, salesBills } from '@/data';
import type { InventoryItem, View } from '@/types';
import { ComparePricesPanel } from '@/components/ComparePricesPanel';

interface InventoryProps {
  onNavigateWithState?: (view: View, state?: any) => void;
}

export function Inventory({ onNavigateWithState }: InventoryProps) {
  // Search
  const [searchScope, setSearchScope] = useState('Product'); // Product, Company, Location
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterExpiry, setFilterExpiry] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterForm, setFilterForm] = useState<string[]>([]);
  const [filterFlags, setFilterFlags] = useState<string[]>([]);

  // Sort
  const [sortBy, setSortBy] = useState('Latest Added First');

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState('batches');
  const [showAdd, setShowAdd] = useState(false);

  // Filter Popover state
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Sort Popover state
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setShowFilter(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setShowSort(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [...new Set(inventoryItems.map((i) => i.category))];
  const forms = ['Tablet', 'Syrup', 'Capsule', 'Injection', 'Ointment', 'Drops', 'Cream', 'Powder', 'Other'];

  const getExpiryDays = (expiry: string) => Math.ceil((new Date(expiry + '-01').getTime() - new Date('2024-08-07').getTime()) / (1000 * 60 * 60 * 24));

  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // 1. Scoped Search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (searchScope === 'Product' && !item.name.toLowerCase().includes(q) && !item.composition?.toLowerCase().includes(q)) return false;
        if (searchScope === 'Company' && !item.manufacturer?.toLowerCase().includes(q)) return false;
        if (searchScope === 'Location' && !item.rack?.toLowerCase().includes(q) && !item.location?.toLowerCase().includes(q)) return false;
      }

      // 2. Status
      if (filterStatus.length > 0) {
        const isOutOfStock = item.stock === 0;
        const isLowStock = item.stock > 0 && item.stock <= item.minStock;
        const isInStock = item.stock > item.minStock;
        const noLocation = !item.rack && !item.location;

        const matchesStatus =
          (filterStatus.includes('Out of Stock') && isOutOfStock) ||
          (filterStatus.includes('Low Stock') && isLowStock) ||
          (filterStatus.includes('In Stock') && isInStock) ||
          (filterStatus.includes('No Location Assigned') && noLocation);

        if (!matchesStatus) return false;
      }

      // 3. Expiry
      if (filterExpiry.length > 0) {
        const days = getExpiryDays(item.expiry);
        const isExpired = days <= 0;
        const exp1M = days > 0 && days <= 30;
        const exp3M = days > 30 && days <= 90;
        const exp6M = days > 90 && days <= 180;

        const matchesExp =
          (filterExpiry.includes('Expired') && isExpired) ||
          (filterExpiry.includes('Expiring in 1 Month') && exp1M) ||
          (filterExpiry.includes('Expiring in 3 Months') && exp3M) ||
          (filterExpiry.includes('Expiring in 6 Months') && exp6M);

        if (!matchesExp) return false;
      }

      // 4. Category
      if (filterCategory.length > 0 && !filterCategory.includes(item.category)) return false;

      // 5. Form
      if (filterForm.length > 0 && (!item.form || !filterForm.includes(item.form))) return false;

      // 6. Flags
      if (filterFlags.length > 0) {
        if (filterFlags.includes('Generic') && !item.generic) return false;
        if (filterFlags.includes('Own Brand') && !item.ownBrand) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'Latest Added First': return a.id.localeCompare(b.id);
        case 'Product Name – A to Z': return a.name.localeCompare(b.name);
        case 'Product Name – Z to A': return b.name.localeCompare(a.name);
        case 'Stock Qty – High to Low': return b.stock - a.stock;
        case 'Stock Qty – Low to High': return a.stock - b.stock;
        case 'Expiry – First to Last': return a.expiry.localeCompare(b.expiry);
        case 'Expiry – Last to First': return b.expiry.localeCompare(a.expiry);
        default: return 0;
      }
    });
  }, [debouncedSearch, searchScope, filterStatus, filterExpiry, filterCategory, filterForm, filterFlags, sortBy]);

  const selectedItem = inventoryItems.find(i => i.id === selectedItemId);

  // KPIs
  const totalItems = inventoryItems.length;
  const totalLowStock = inventoryItems.filter(i => i.stock <= i.minStock).length;
  const expiringCount = inventoryItems.filter(i => i.expiry <= '2025-12').length;
  const totalStockValue = inventoryItems.reduce((sum, item) => sum + (item.stock * item.salePrice), 0);

  const getExpiryColor = (expiry: string) => {
    const days = getExpiryDays(expiry);
    if (days < 30) return 'bg-red-500';
    if (days < 90) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { label: 'Out of Stock', color: 'red' };
    if (item.stock <= item.minStock) return { label: 'Low Stock', color: 'amber' };
    return { label: 'In Stock', color: 'green' };
  };

  const activeFilterCount = filterStatus.length + filterExpiry.length + filterCategory.length + filterForm.length + filterFlags.length;

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <PageHeader
        title="Inventory"
        subtitle="Master catalog, batch tracking, and stock movement"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Item</Button>}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
        <Card className="p-4 flex flex-col justify-center">
          <p className="text-2xl font-bold text-neutral-800">{totalItems}</p>
          <p className="text-sm text-neutral-500">Total Items</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center border-l-4 border-l-amber-500">
          <p className="text-2xl font-bold text-amber-600">{totalLowStock}</p>
          <p className="text-sm text-neutral-500">Low / Out of Stock</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center border-l-4 border-l-red-500">
          <p className="text-2xl font-bold text-red-600">{expiringCount}</p>
          <p className="text-sm text-neutral-500">Expiring Soon</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center border-l-4 border-l-green-500 bg-primary-50/30">
          <p className="text-2xl font-bold text-primary-700">{formatCurrency(totalStockValue)}</p>
          <p className="text-sm text-neutral-500">Total Stock Value</p>
        </Card>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">

        {/* LEFT PANEL - Master List */}
        <Card className="w-[35%] flex flex-col overflow-hidden shrink-0 border-neutral-200">
          <div className="p-3 border-b border-neutral-100 bg-neutral-50/50 space-y-3 shrink-0">

            {/* Control Rows: Filter/Sort, then Search */}
            <div className="flex flex-col gap-2">
              {/* Row 1: Filter & Sort */}
              <div className="flex gap-2 h-[38px]">
                {/* Filter By */}
                <div className="relative flex-1" ref={filterRef}>
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={`flex w-full items-center justify-between h-full px-3 text-sm font-medium border rounded-lg transition-colors ${activeFilterCount > 0
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] font-semibold">
                      <Filter className="w-4 h-4" />
                      <span>Filter By</span>
                      {activeFilterCount > 0 && <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full normal-case font-bold">{activeFilterCount}</span>}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {showFilter && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-[320px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 flex flex-col max-h-[400px] overflow-hidden">
                      <div className="p-3 border-b border-neutral-100 bg-neutral-50 font-semibold text-sm text-neutral-800 flex justify-between items-center">
                        Filters
                        <button onClick={() => setShowFilter(false)} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">

                        <FilterGroup title="Stock Status" options={['In Stock', 'Low Stock', 'Out of Stock', 'No Location Assigned']} state={filterStatus} setState={setFilterStatus} />
                        <FilterGroup title="Expiry Status" options={['Expired', 'Expiring in 1 Month', 'Expiring in 3 Months', 'Expiring in 6 Months']} state={filterExpiry} setState={setFilterExpiry} />
                        <FilterGroup title="Category" options={categories} state={filterCategory} setState={setFilterCategory} />
                        <FilterGroup title="Form" options={forms} state={filterForm} setState={setFilterForm} />
                        <FilterGroup title="Flags" options={['Generic', 'Own Brand']} state={filterFlags} setState={setFilterFlags} />

                      </div>
                      <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
                        <button
                          onClick={() => {
                            setFilterStatus([]); setFilterExpiry([]); setFilterCategory([]); setFilterForm([]); setFilterFlags([]);
                          }}
                          className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
                        >
                          Clear all
                        </button>
                        <Button size="sm" onClick={() => setShowFilter(false)}>Apply</Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort By */}
                <div className="relative flex-1" ref={sortRef}>
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex w-full items-center justify-between h-full px-3 text-sm font-medium bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 uppercase tracking-wide text-[11px] font-semibold">
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Sort By</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {showSort && (
                    <div className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2">
                      {[
                        'Latest Added First',
                        'Product Name – A to Z',
                        'Product Name – Z to A',
                        'Stock Qty – High to Low',
                        'Stock Qty – Low to High',
                        'Expiry – First to Last',
                        'Expiry – Last to First'
                      ].map(option => (
                        <label key={option} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 cursor-pointer">
                          <input
                            type="radio"
                            name="sort"
                            checked={sortBy === option}
                            onChange={() => { setSortBy(option); setShowSort(false); }}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                          />
                          <span className="text-sm text-neutral-700 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Scoped Search */}
              <div className="flex h-[38px] border border-neutral-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-500 transition-colors">
                <select
                  className="bg-neutral-50 border-r border-neutral-300 px-3 py-1.5 text-xs text-neutral-800 outline-none cursor-pointer hover:bg-neutral-100 uppercase tracking-wide font-medium"
                  value={searchScope}
                  onChange={(e) => setSearchScope(e.target.value)}
                >
                  <option value="Product">Product</option>
                  <option value="Company">Company</option>
                  <option value="Location">Location</option>
                </select>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    placeholder="Search for Pharma Products"
                    className="w-full h-full pl-3 pr-10 text-sm outline-none bg-transparent"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredItems.map(item => {
              const status = getStockStatus(item);
              const isSelected = selectedItemId === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'border-transparent hover:bg-neutral-50 hover:border-neutral-200'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold text-neutral-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-neutral-500">
                          {item.manufacturer || item.category}
                          {item.form && ` • ${item.form}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-800 text-sm">{formatCurrency(item.mrp)}</p>
                        <p className="text-[10px] text-neutral-400">MRP</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <Badge color={status.color as any} className="text-[10px] px-1.5 py-0">{status.label}</Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-neutral-700">
                          {item.pack_size && item.pack_size > 0 ?
                            `${Math.floor(item.stock / item.pack_size)}p, ${item.stock % item.pack_size}${item.sale_unit ? ` ${item.sale_unit.charAt(0).toLowerCase()}` : 'u'}`
                            : `${item.stock} packs`}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getExpiryColor(item.expiry)}`} title={`Nearest expiry: ${item.expiry}`} />
                      </div>
                    </div>
                  </button>
                  {/* Inline Edit Icon */}
                  <button
                    onClick={(e) => { e.stopPropagation(); /* edit logic */ }}
                    className={`absolute top-2 right-2 p-1.5 rounded text-neutral-400 hover:text-primary-600 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-sm">
                No items match your filters.
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT PANEL - Detail View */}
        <Card className="w-[65%] flex flex-col overflow-hidden border-neutral-200 bg-white">
          {selectedItem ? (
            <ItemDetailPanel item={selectedItem} detailTab={detailTab} setDetailTab={setDetailTab} onNavigateWithState={onNavigateWithState} setSelectedItemId={setSelectedItemId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <Layers className="w-12 h-12 mb-3 text-neutral-200" />
              <p className="text-lg font-medium text-neutral-500">Select an item</p>
              <p className="text-sm">Choose an item from the list to view its details, batches, and history.</p>
            </div>
          )}
        </Card>
      </div>

      {showAdd && <ItemModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

// Checkbox Group Component for Filter Popover
function FilterGroup({ title, options, state, setState }: { title: string, options: string[], state: string[], setState: (val: string[]) => void }) {
  const toggle = (opt: string) => {
    if (state.includes(opt)) setState(state.filter(o => o !== opt));
    else setState([...state, opt]);
  };
  return (
    <div>
      <h4 className="font-medium text-neutral-800 mb-2">{title}</h4>
      <div className="space-y-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${state.includes(opt) ? 'bg-primary-600 border-primary-600' : 'bg-white border-neutral-300 group-hover:border-primary-400'}`}>
              {state.includes(opt) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-neutral-600 group-hover:text-neutral-900">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}


function ItemDetailPanel({ item, detailTab, setDetailTab, onNavigateWithState, setSelectedItemId }: { item: InventoryItem, detailTab: string, setDetailTab: (t: string) => void, onNavigateWithState?: any, setSelectedItemId: (id: string) => void }) {
  const marginPct = ((item.salePrice - item.purchasePrice) / item.salePrice) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-neutral-100 bg-neutral-50/30 shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-neutral-800">{item.name}</h2>
              {item.generic && <Badge color="blue">Generic</Badge>}
              {item.ownBrand && <Badge color="green">Own Brand</Badge>}
            </div>
            <p className="text-sm text-neutral-600 mb-1">
              {item.manufacturer || 'Unknown Manufacturer'} • {item.category}
              {item.form && ` • ${item.form}`}
            </p>
            {item.composition && (
              <p className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md inline-block">
                {item.composition}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" icon={<ShoppingCart className="w-4 h-4" />} onClick={() => setDetailTab('distributor')}>Order Now</Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-6">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Total Stock</p>
            <p className={`text-lg font-bold ${item.stock <= item.minStock ? 'text-red-600' : 'text-neutral-800'}`}>
              {item.pack_size && item.pack_size > 0 ? (
                <span className="flex flex-col">
                  <span>{Math.floor(item.stock / item.pack_size)} <span className="text-sm font-normal text-neutral-500">packs,</span> {item.stock % item.pack_size} <span className="text-sm font-normal text-neutral-500">{item.sale_unit || 'packs'}</span></span>
                </span>
              ) : (
                <span>{item.stock} <span className="text-sm font-normal text-neutral-500">packs</span></span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">MRP</p>
            <p className="text-lg font-semibold text-neutral-800">{formatCurrency(item.mrp)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Sale Rate</p>
            <p className="text-lg font-semibold text-neutral-800">{formatCurrency(item.salePrice)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Margin</p>
            <p className="text-lg font-bold text-green-600">{marginPct.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Location</p>
            <div className="flex items-center gap-1 text-sm font-medium text-neutral-800">
              <MapPin className="w-3 h-3 text-neutral-400" />
              {item.rack} / {item.location}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 border-b border-neutral-100 shrink-0">
        <Tabs
          tabs={[
            { id: 'batches', label: 'Batches' },
            { id: 'purchases', label: 'Purchases' },
            { id: 'sales', label: 'Sales' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'substitute', label: 'Substitute' },
            { id: 'distributor', label: 'Distributor' },
          ]}
          activeTab={detailTab}
          onChange={setDetailTab}
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-neutral-50/20">
        {detailTab === 'batches' && <BatchesTab item={item} onNavigateWithState={onNavigateWithState} />}
        {detailTab === 'purchases' && <PurchasesTab item={item} />}
        {detailTab === 'sales' && <SalesTab item={item} />}
        {detailTab === 'timeline' && <TimelineTab item={item} />}
        {detailTab === 'substitute' && <SubstituteTab item={item} setSelectedItemId={setSelectedItemId} />}
        {detailTab === 'distributor' && <DistributorTab item={item} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// TAB COMPONENTS
// ----------------------------------------------------------------------

function BatchesTab({ item, onNavigateWithState }: { item: InventoryItem, onNavigateWithState?: any }) {
  const [showZero, setShowZero] = useState(false);

  const batches = [
    { no: item.batch, pack: '1x10', expiry: item.expiry, mrp: item.mrp, pur: item.purchasePrice, net: item.purchasePrice, sale: item.salePrice, stock: item.stock },
    { no: item.batch.replace('1', '2'), pack: '1x10', expiry: '2024-09', mrp: item.mrp, pur: item.purchasePrice * 0.95, net: item.purchasePrice * 0.95, sale: item.salePrice, stock: 0 },
  ];

  const visible = showZero ? batches : batches.filter(b => b.stock > 0);
  const getExpiryDays = (expiry: string) => Math.ceil((new Date(expiry + '-01').getTime() - new Date('2024-08-07').getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
          <input type="checkbox" checked={showZero} onChange={e => setShowZero(e.target.checked)} className="rounded border-neutral-300" />
          Show Zero Qty Batches
        </label>
        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add New Batch</Button>
      </div>

      <Card className="overflow-hidden border border-neutral-200">
        <Table headers={['Batch No.', 'Pack', 'Expiry', 'MRP', 'Purchase', 'Sale', 'Margin', 'Stock', 'Action']}>
          {visible.map((b, i) => {
            const margin = ((b.sale - b.pur) / b.sale) * 100;
            const days = getExpiryDays(b.expiry);
            const expStyle = days < 30 ? 'text-red-700 bg-red-50 font-bold' : days < 90 ? 'text-amber-700 bg-amber-50 font-medium' : 'text-neutral-700';

            return (
              <tr key={i} className={`hover:bg-neutral-50 ${b.stock === 0 ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3 font-medium text-neutral-800">{b.no}</td>
                <td className="px-4 py-3 text-neutral-600">{b.pack}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md text-xs ${expStyle}`}>{b.expiry}</span></td>
                <td className="px-4 py-3 text-neutral-600">{formatCurrency(b.mrp)}</td>
                <td className="px-4 py-3 text-neutral-600">{formatCurrency(b.pur)}</td>
                <td className="px-4 py-3 font-medium text-neutral-800">{formatCurrency(b.sale)}</td>
                <td className="px-4 py-3 text-green-600 font-medium">{margin.toFixed(1)}%</td>
                <td className="px-4 py-3 font-bold text-neutral-800">
                  {item.pack_size && item.pack_size > 0 ? (
                    <span className="flex flex-col">
                      <span>{Math.floor(b.stock / item.pack_size)} packs, {b.stock % item.pack_size} {item.sale_unit || 'packs'}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">({b.stock} total {item.sale_unit}s)</span>
                    </span>
                  ) : (
                    <span>{b.stock} packs</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => {
                    let reason = 'Expired';
                    if (days > 0 && days <= 90) reason = 'Near-expiry';
                    else if (days > 90) reason = 'Non-moving';
                    onNavigateWithState?.('purchase-returns', { itemName: item.name, batch: b.no, returnPrice: b.pur, reason });
                  }} className="text-xs font-medium text-primary-600 hover:bg-primary-50 px-2 py-1 rounded border border-primary-200 transition-colors">Return</button>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}

function PurchasesTab({ item }: { item: InventoryItem }) {
  const [page, setPage] = useState(1);
  const rows = purchaseBills.flatMap(pb => pb.items.filter(i => i.name === item.name).map(i => ({
    date: pb.billDate,
    distributor: pb.distributor,
    batch: i.batch,
    qty: i.qty,
    rate: i.purchasePrice,
    billNo: pb.billNo
  })));

  const totalPages = Math.ceil(rows.length / 10);
  const visible = rows.slice((page - 1) * 10, page * 10);

  if (rows.length === 0) return <div className="text-center py-10 text-neutral-500">No purchase history found for this item.</div>;

  return (
    <Card className="overflow-hidden border-neutral-200">
      <Table headers={['Date', 'Distributor', 'Bill No.', 'Batch', 'Qty', 'Rate']}>
        {visible.map((r, i) => (
          <tr key={i} className="hover:bg-neutral-50">
            <td className="px-4 py-3 text-neutral-600">{r.date}</td>
            <td className="px-4 py-3 font-medium text-neutral-700">{r.distributor}</td>
            <td className="px-4 py-3 text-blue-600 hover:underline cursor-pointer">{r.billNo}</td>
            <td className="px-4 py-3 text-neutral-600">{r.batch}</td>
            <td className="px-4 py-3 font-medium text-neutral-800">{r.qty}</td>
            <td className="px-4 py-3 text-neutral-800">{formatCurrency(r.rate)}</td>
          </tr>
        ))}
      </Table>
      {totalPages > 1 && (
        <div className="p-4 border-t border-neutral-100 flex justify-between items-center">
          <span className="text-sm text-neutral-500">Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, rows.length)} of {rows.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SalesTab({ item }: { item: InventoryItem }) {
  const [page, setPage] = useState(1);
  const rows = salesBills.flatMap(sb => sb.items.filter(i => i.name === item.name).map(i => ({
    date: sb.billDate,
    customer: sb.patient,
    billNo: sb.billNo,
    qty: i.qty,
    price: (i.amount / i.qty)
  })));

  const totalPages = Math.ceil(rows.length / 10);
  const visible = rows.slice((page - 1) * 10, page * 10);

  if (rows.length === 0) return <div className="text-center py-10 text-neutral-500">No sales history found for this item.</div>;

  return (
    <Card className="overflow-hidden border-neutral-200">
      <Table headers={['Date', 'Customer', 'Bill No.', 'Qty Sold', 'Sale Price']}>
        {visible.map((r, i) => (
          <tr key={i} className="hover:bg-neutral-50">
            <td className="px-4 py-3 text-neutral-600">{r.date}</td>
            <td className="px-4 py-3 font-medium text-neutral-700">{r.customer}</td>
            <td className="px-4 py-3 text-blue-600 hover:underline cursor-pointer">{r.billNo}</td>
            <td className="px-4 py-3 font-medium text-neutral-800">{r.qty}</td>
            <td className="px-4 py-3 text-neutral-800">{formatCurrency(r.price)}</td>
          </tr>
        ))}
      </Table>
      {totalPages > 1 && (
        <div className="p-4 border-t border-neutral-100 flex justify-between items-center">
          <span className="text-sm text-neutral-500">Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, rows.length)} of {rows.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function TimelineTab({ item }: { item: InventoryItem }) {
  const events: any[] = [];
  purchaseBills.forEach(pb => {
    pb.items.filter(i => i.name === item.name).forEach(i => {
      events.push({ date: pb.billDate, type: 'Purchase', desc: `Purchased ${i.qty} packs from ${pb.distributor}`, amount: formatCurrency(i.amount), icon: ShoppingCart, color: 'text-blue-600 bg-blue-50 border-blue-200' });
    });
  });
  salesBills.forEach(sb => {
    sb.items.filter(i => i.name === item.name).forEach(i => {
      events.push({ date: sb.billDate, type: 'Sale', desc: `Sold ${i.qty} packs to ${sb.patient}`, amount: formatCurrency(i.amount), icon: Activity, color: 'text-green-600 bg-green-50 border-green-200' });
    });
  });
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) return <div className="text-center py-10 text-neutral-500">No timeline events found.</div>;

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
      {events.map((e, i) => {
        const Icon = e.icon;
        return (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${e.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-neutral-500 uppercase">{e.date}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.color}`}>{e.type}</span>
              </div>
              <p className="text-sm text-neutral-700 mt-2">{e.desc}</p>
              <p className="text-sm font-semibold text-neutral-800 mt-1">{e.amount}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubstituteTab({ item, setSelectedItemId }: { item: InventoryItem, setSelectedItemId: (id: string) => void }) {
  if (!item.composition) return <div className="text-center py-10 text-neutral-500">No composition defined for this item to find substitutes.</div>;

  const substitutes = inventoryItems.filter(i => i.composition === item.composition && i.id !== item.id);

  if (substitutes.length === 0) return <div className="text-center py-10 text-neutral-500">No substitutes found for {item.composition}.</div>;

  return (
    <Card className="overflow-hidden border-neutral-200">
      <div className="p-4 border-b border-neutral-100 bg-primary-50/30">
        <p className="text-sm text-primary-800 font-medium">Showing alternatives for <span className="font-bold">{item.composition}</span></p>
      </div>
      <Table headers={['Brand Name', 'Manufacturer', 'Stock', 'MRP', 'Margin', 'Action']}>
        {substitutes.map(sub => {
          const margin = ((sub.salePrice - sub.purchasePrice) / sub.salePrice) * 100;
          return (
            <tr key={sub.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium text-neutral-800">
                {sub.name}
                {sub.generic && <Badge color="blue" className="ml-2 scale-90">Generic</Badge>}
                {sub.ownBrand && <Badge color="green" className="ml-2 scale-90">Own Brand</Badge>}
              </td>
              <td className="px-4 py-3 text-neutral-600">{sub.manufacturer || sub.category}</td>
              <td className="px-4 py-3">
                <span className={`font-semibold ${sub.stock <= sub.minStock ? 'text-red-600' : 'text-neutral-700'}`}>{sub.stock}</span>
              </td>
              <td className="px-4 py-3 text-neutral-800">{formatCurrency(sub.mrp)}</td>
              <td className="px-4 py-3 text-green-600 font-medium">{margin.toFixed(1)}%</td>
              <td className="px-4 py-3">
                <Button size="sm" variant="outline" onClick={() => setSelectedItemId(sub.id)}>View</Button>
              </td>
            </tr>
          );
        })}
      </Table>
    </Card>
  );
}

function DistributorTab({ item }: { item: InventoryItem }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div>
          <h4 className="font-semibold text-blue-900">Need more stock?</h4>
          <p className="text-sm text-blue-700">Compare recent purchase rates and order directly from the best distributor.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" icon={<ShoppingCart className="w-4 h-4" />}>Order Now</Button>
      </div>
      <ComparePricesPanel initialSearch={item.name} />
    </div>
  );
}

// ----------------------------------------------------------------------
// MODALS
// ----------------------------------------------------------------------

function ItemModal({ item, onClose }: { item?: InventoryItem; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Item' : 'Add Item'} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Item Name" defaultValue={item?.name} placeholder="e.g. Paracetamol 500mg" />
        <Input label="Composition (Salt)" defaultValue={item?.composition} placeholder="e.g. Paracetamol" />
        <Input label="Manufacturer" defaultValue={item?.manufacturer} placeholder="e.g. Cipla" />
        <Input label="Category" defaultValue={item?.category} placeholder="e.g. Analgesic" />

        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1.5">Form</span>
          <select className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors" defaultValue={item?.form || ''}>
            <option value="">Select form...</option>
            {['Tablet', 'Syrup', 'Capsule', 'Injection', 'Ointment', 'Drops', 'Cream', 'Powder', 'Other'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>

        <Input label="Batch" defaultValue={item?.batch} placeholder="PC2401" />
        <Input label="Expiry" type="text" defaultValue={item?.expiry} placeholder="YYYY-MM" />

        {/* NEW PACKAGING FIELDS */}
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1.5">Purchase pack</span>
          <select className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors" defaultValue={item?.purchase_unit || ''}>
            <option value="">Select pack...</option>
            {['Strip', 'Box', 'Bottle', 'Tube', 'Vial', 'Loose', 'Other'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
        <Input label="Pack Size (Sale packs per pack)" type="number" defaultValue={item?.pack_size} placeholder="e.g. 10" />
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1.5">Sale pack</span>
          <select className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors" defaultValue={item?.sale_unit || ''}>
            <option value="">Select pack...</option>
            {['Tablet', 'Capsule', 'ml', 'Bottle', 'Tube', 'Vial', 'pack'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>

        <Input label="MRP (per Purchase pack)" type="number" defaultValue={item?.mrp} />
        <Input label="Purchase Price (per Purchase pack)" type="number" defaultValue={item?.purchasePrice} />
        <Input label="Sale Price (per Sale pack)" type="number" defaultValue={item?.salePrice} />
        <Input label="Discount %" type="number" defaultValue={item?.discount} />
        <Input label="Stock (in Sale packs)" type="number" defaultValue={item?.stock} />
        <Input label="Min Stock (in Sale packs)" type="number" defaultValue={item?.minStock} />
        <Input label="Rack / Bin" defaultValue={item?.rack} placeholder="A-01" />
        <Input label="Location" defaultValue={item?.location} placeholder="Shelf A" />
        <div className="flex flex-col gap-2 pt-1 md:col-span-2 md:flex-row md:items-end md:gap-6 border-t border-neutral-100 mt-2">
          <label className="flex items-center gap-2 text-sm text-neutral-700 font-medium bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100 cursor-pointer">
            <input type="checkbox" defaultChecked={item?.generic} className="w-4 h-4 rounded border-blue-300 text-blue-600" /> Generic Drug
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 font-medium bg-green-50/50 px-3 py-2 rounded-lg border border-green-100 cursor-pointer">
            <input type="checkbox" defaultChecked={item?.ownBrand} className="w-4 h-4 rounded border-green-300 text-green-600" /> Own Brand
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
