import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Tag, Plus, Calendar, Edit3, Trash2, Copy, Search, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { Card, Badge, Button, PageHeader, StatCard, EmptyState, Select, Modal, Input } from '@/components/ui';
import { offers, inventoryItems, formatCurrency } from '@/data';
import type { Offer, InventoryItem } from '@/types';

// Helper for margin color
const getMarginStatus = (offerPrice: number, purchasePrice: number) => {
  if (offerPrice > purchasePrice) return 'text-green-600 bg-green-50 border-green-200';
  if (offerPrice === purchasePrice) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    'Analgesic': 'bg-blue-500',
    'Antibiotic': 'bg-orange-500',
    'Antihistamine': 'bg-purple-500',
    'Supplement': 'bg-green-500',
    'Antidiabetic': 'bg-teal-500',
    'PPI': 'bg-yellow-500',
  };
  return map[category] || 'bg-neutral-500';
};

export function Offers() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [cloneSource, setCloneSource] = useState<Offer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Offer | null>(null);

  // Local state for offers to allow mock deletion/updates
  const [localOffers, setLocalOffers] = useState<Offer[]>(offers);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDiscount, setFilterDiscount] = useState('');
  const [sortCol, setSortCol] = useState('newest');

  // KPI Metrics
  const activeCount = localOffers.filter(o => o.status === 'Active').length;
  const upcomingCount = localOffers.filter(o => o.status === 'Upcoming').length;
  const expiredCount = localOffers.filter(o => o.status === 'Expired').length;
  const totalRevenue = localOffers.reduce((sum, o) => sum + o.revenue, 0);

  // Suggested Offers (expiring soon)
  const suggestedItems = useMemo(() => {
    // arbitrary logic for "expiring soon" in mock data (e.g. before 2026)
    return inventoryItems.filter(i => i.stock > 0 && i.expiry < '2026-01').slice(0, 3);
  }, []);

  const categories = Array.from(new Set(inventoryItems.map(i => i.category)));

  const filteredOffers = useMemo(() => {
    return localOffers.filter(o => {
      if (search && !o.productName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterCategory && o.category !== filterCategory) return false;

      const discPct = ((o.originalPrice - o.offerPrice) / o.originalPrice) * 100;
      if (filterDiscount === '0-10' && discPct > 10) return false;
      if (filterDiscount === '10-25' && (discPct <= 10 || discPct > 25)) return false;
      if (filterDiscount === '25+' && discPct <= 25) return false;

      return true;
    }).sort((a, b) => {
      if (sortCol === 'newest') return b.id.localeCompare(a.id);
      if (sortCol === 'ending') {
        if (a.status !== 'Active') return 1;
        if (b.status !== 'Active') return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      if (sortCol === 'discount') {
        const dA = ((a.originalPrice - a.offerPrice) / a.originalPrice);
        const dB = ((b.originalPrice - b.offerPrice) / b.originalPrice);
        return dB - dA;
      }
      if (sortCol === 'redeemed') return b.redemptions - a.redemptions;
      return 0;
    });
  }, [localOffers, search, filterStatus, filterCategory, filterDiscount, sortCol]);

  const handleDelete = () => {
    if (deleteConfirm) {
      setLocalOffers(prev => prev.filter(o => o.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Offers & Promotions"
        subtitle="Manage discounts, seasonal sales, and stock-clearing promotions"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Create Offer</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Offers" value={activeCount} icon={<Tag className="w-5 h-5" />} color="blue" />
        <StatCard label="Upcoming" value={upcomingCount} icon={<Calendar className="w-5 h-5" />} color="amber" />
        <StatCard label="Expired" value={expiredCount} icon={<Clock className="w-5 h-5" />} color="red" />
        <StatCard label="Revenue from Offers" value={formatCurrency(totalRevenue)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
      </div>

      {suggestedItems.length > 0 && (
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Suggested: Clear Expiring Stock</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedItems.map(item => (
              <div key={item.id} className="bg-white border border-amber-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-medium text-neutral-800 text-sm">{item.name}</p>
                  <p className="text-xs text-amber-700">Exp: {item.expiry} • {item.stock} in stock</p>
                </div>
                <Button size="sm" variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => {
                  setCloneSource(null);
                  setEditingOffer(null);
                  // Setup initial pre-fill state for CreateOfferModal (not strictly tied via state here, but we can pass item)
                  // For simplicity in this mock, we just open the modal. A real implementation would pass initialValues.
                  setShowAdd(true);
                }}>
                  Create Offer
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-neutral-200 shadow-sm">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-32">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expired">Expired</option>
            <option value="Draft">Draft</option>
          </Select>
          <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-36">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={filterDiscount} onChange={e => setFilterDiscount(e.target.value)} className="w-36">
            <option value="">All Discounts</option>
            <option value="0-10">0 - 10%</option>
            <option value="10-25">10% - 25%</option>
            <option value="25+">25%+</option>
          </Select>
          <Select value={sortCol} onChange={e => setSortCol(e.target.value)} className="w-40 ml-auto">
            <option value="newest">Newest First</option>
            <option value="ending">Ending Soonest</option>
            <option value="discount">Discount (High-Low)</option>
            <option value="redeemed">Most Redeemed</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.map((offer) => {
          const invItem = inventoryItems.find(i => i.id === offer.productId);
          const active = offer.status === 'Active';
          const upcoming = offer.status === 'Upcoming';
          const draft = offer.status === 'Draft';
          const savings = offer.originalPrice - offer.offerPrice;
          const savingsPct = Math.round((savings / offer.originalPrice) * 100);

          let badgeColor = 'gray';
          if (active) badgeColor = 'green';
          if (upcoming) badgeColor = 'amber';
          if (draft) badgeColor = 'blue';

          const marginClass = invItem ? getMarginStatus(offer.offerPrice, invItem.purchasePrice) : 'text-neutral-500 bg-neutral-100';

          return (
            <Card key={offer.id} hover className="overflow-hidden flex flex-col">
              <div className={`h-1.5 ${getCategoryColor(offer.category)}`} />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge color={badgeColor as any} className="mb-2">{offer.status}</Badge>
                    <h3 className="font-bold text-neutral-800 text-lg leading-tight">{offer.productName}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{offer.category} • {offer.applicableCustomers}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 mb-4 text-xs text-neutral-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {offer.startDate} to {offer.endDate}
                </div>

                <div className="mt-auto">
                  <div className="flex items-end justify-between bg-neutral-50 p-3 rounded-lg border border-neutral-100 mb-3">
                    <div>
                      <p className="text-xs text-neutral-400 line-through mb-0.5">{formatCurrency(offer.originalPrice)}</p>
                      <p className="text-xl font-bold text-neutral-900">{formatCurrency(offer.offerPrice)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge color="green" size="md">-{savingsPct}%</Badge>
                      {invItem && (
                        <div className={`text-[10px] px-1.5 py-0.5 rounded border ${marginClass} flex items-center gap-1`} title={`Purchase price: ${formatCurrency(invItem.purchasePrice)}`}>
                          {offer.offerPrice > invItem.purchasePrice ? 'Profitable' : 'Loss-Making'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-4 px-1">
                    <span>Redeemed {offer.redemptions} times</span>
                    <span className="font-medium text-neutral-700">{formatCurrency(offer.revenue)} revenue</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingOffer(offer)} icon={<Edit3 className="w-4 h-4" />}>Edit</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setCloneSource(offer); setShowAdd(true); }} icon={<Copy className="w-4 h-4" />}>Clone</Button>
                    <button onClick={() => setDeleteConfirm(offer)} className="p-2 border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredOffers.length === 0 && (
          <Card className="col-span-full p-8 text-center">
            <EmptyState icon={<Tag className="w-8 h-8" />} title="No offers found" subtitle="Try adjusting your search or filters." />
          </Card>
        )}
      </div>

      {(showAdd || editingOffer) && (
        <CreateOfferModal
          offer={editingOffer || cloneSource || null}
          isClone={!!cloneSource}
          onClose={() => { setShowAdd(false); setEditingOffer(null); setCloneSource(null); }}
        />
      )}

      {deleteConfirm && (
        <Modal open onClose={() => setDeleteConfirm(null)} title="Delete Offer" size="sm">
          <div className="p-2">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 text-lg">Delete {deleteConfirm.productName} offer?</h4>
                <p className="text-sm text-neutral-500 mt-1">This action cannot be undone. Any future redemptions will be stopped.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleDelete}>Delete Offer</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CreateOfferModal({ offer, isClone, onClose }: { offer: Offer | null, isClone: boolean, onClose: () => void }) {
  const [productId, setProductId] = useState(offer?.productId || '');
  const [offerPrice, setOfferPrice] = useState<string>(offer ? String(offer.offerPrice) : '');
  const [startDate, setStartDate] = useState((offer && !isClone) ? offer.startDate : '');
  const [endDate, setEndDate] = useState((offer && !isClone) ? offer.endDate : '');
  const [applicableCustomers, setApplicableCustomers] = useState(offer?.applicableCustomers || 'All Customers');

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedItem = inventoryItems.find(i => i.id === productId);
  const originalPrice = selectedItem?.salePrice || 0; // Or MRP, using salePrice for realistic discount
  const parsedOfferPrice = parseFloat(offerPrice) || 0;

  const discountPct = originalPrice > 0 ? Math.round(((originalPrice - parsedOfferPrice) / originalPrice) * 100) : 0;
  const marginDiff = selectedItem ? (parsedOfferPrice - selectedItem.purchasePrice) : 0;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return inventoryItems.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return inventoryItems.filter(i => i.name.toLowerCase().includes(q) || i.composition?.toLowerCase().includes(q)).slice(0, 20);
  }, [searchQuery]);

  return (
    <Modal open onClose={onClose} title={offer && !isClone ? "Edit Offer" : "Create Offer"} size="md">
      <div className="space-y-5 mb-2">

        {/* Searchable Product Dropdown Component Mock */}
        <div className="relative z-20">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={selectedItem ? selectedItem.name : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setProductId(''); // clear selection if typing
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {showDropdown && !selectedItem && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 shadow-lg rounded-lg max-h-60 overflow-y-auto z-30">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0"
                  onClick={() => {
                    setProductId(item.id);
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                >
                  <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Stock: {item.stock} • Sale Rate: {formatCurrency(item.salePrice)}</p>
                </div>
              ))}
            </div>
          )}
          {selectedItem && (
            <div className="mt-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-500">Current Sale Price</p>
                <p className="font-semibold text-neutral-800">{formatCurrency(originalPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">In Stock</p>
                <p className={`font-semibold ${selectedItem.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{selectedItem.stock} packs</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Offer Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
              <input
                type="number"
                className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                value={offerPrice}
                onChange={e => setOfferPrice(e.target.value)}
                disabled={!selectedItem}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Discount</label>
            <div className="h-[38px] px-3 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center font-semibold text-neutral-700">
              {selectedItem && parsedOfferPrice > 0 ? `${discountPct}% OFF` : '-'}
            </div>
          </div>
        </div>

        {selectedItem && parsedOfferPrice > 0 && (
          <div className={`p-3 rounded-lg border text-sm ${marginDiff >= 0 ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <div className="flex items-start gap-2">
              {marginDiff >= 0 ? <CheckCircle2 className="w-4 h-4 mt-0.5" /> : <AlertTriangle className="w-4 h-4 mt-0.5" />}
              <div>
                <p className="font-semibold">{marginDiff >= 0 ? 'Profitable Offer' : 'Loss-Making Offer Warning'}</p>
                <p className="text-xs mt-0.5 opacity-90">
                  {marginDiff >= 0
                    ? `Offer price is ₹${marginDiff.toFixed(2)} above purchase cost.`
                    : `This price is below purchase cost — you'll lose ₹${Math.abs(marginDiff).toFixed(2)} per pack sold.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" />
          </div>
        </div>

        {startDate && endDate && startDate > endDate && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> End Date must be after Start Date.</p>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Applicable Customers</label>
          <select
            value={applicableCustomers}
            onChange={e => setApplicableCustomers(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option>All Customers</option>
            <option>New Customers Only</option>
            <option>Regular Customers Only</option>
          </select>
        </div>

      </div>
      <div className="flex justify-between mt-8 border-t border-neutral-100 pt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Save as Draft</Button>
          <Button onClick={onClose} disabled={!selectedItem || !offerPrice || !startDate || !endDate || startDate > endDate}>
            Publish Offer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
