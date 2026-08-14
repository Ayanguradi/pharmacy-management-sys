import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { formatCurrency } from '@/data';

// Mock data generation for items with 2+ distributors historically
export const mockHistory = [
  {
    item: 'Paracetamol 500mg', sources: [
      { dist: 'MediSupply Distributors', price: 18, fulfill: { comp: 98, onTime: 95 }, trend: 0 },
      { dist: 'PharmaCorp India', price: 17.5, fulfill: { comp: 85, onTime: 82 }, trend: -1 },
      { dist: 'Alkem Distributors', price: 19, fulfill: { comp: 99, onTime: 99 }, trend: 1 }
    ], mostUsed: 'MediSupply Distributors'
  },
  {
    item: 'Azithromycin 500mg', sources: [
      { dist: 'MediSupply Distributors', price: 90, fulfill: { comp: 98, onTime: 95 }, trend: 0 },
      { dist: 'Sun Pharma Depot', price: 85, fulfill: { comp: 90, onTime: 88 }, trend: -1 }
    ], mostUsed: 'Sun Pharma Depot'
  },
  {
    item: 'Cetirizine 10mg', sources: [
      { dist: 'Cipla Wholesale', price: 24, fulfill: { comp: 95, onTime: 90 }, trend: 1 },
      { dist: 'Alkem Distributors', price: 26, fulfill: { comp: 99, onTime: 99 }, trend: 0 },
      { dist: 'PharmaCorp India', price: 22, fulfill: { comp: 80, onTime: 75 }, trend: -1 }
    ], mostUsed: 'Cipla Wholesale'
  }
];

export function ComparePricesPanel({ onSelectDistributor, compact = false, preselectedItem = null }: { onSelectDistributor?: (item: string, dist: string, price: number) => void, compact?: boolean, preselectedItem?: string | null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'value'>('price');

  useEffect(() => {
    if (preselectedItem) {
      const match = mockHistory.find(h => h.item.toLowerCase() === preselectedItem.toLowerCase());
      if (match) setSelectedItem(match);
    }
  }, [preselectedItem]);

  const matches = searchTerm.length >= 2
    ? mockHistory.filter(h => h.item.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  useEffect(() => {
    setIsDropdownOpen(searchTerm.length >= 2 && !selectedItem);
  }, [searchTerm, selectedItem]);

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchTerm('');
  };

  if (!selectedItem && compact) return null;

  return (
    <Card className={`relative overflow-visible ${compact ? 'border-none shadow-none bg-transparent' : 'p-5 mb-4'}`}>
      {!selectedItem ? (
        <div>
          {!compact && (
            <>
              <h3 className="font-semibold text-neutral-800 mb-4">Compare Prices</h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search an item to compare prices across distributors..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSelectedItem(null); }}
                />

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 overflow-hidden">
                    {matches.length > 0 ? (
                      <ul className="max-h-64 overflow-y-auto">
                        {matches.map(m => (
                          <li
                            key={m.item}
                            className="px-4 py-3 hover:bg-neutral-50 cursor-pointer flex items-center justify-between border-b border-neutral-100 last:border-0"
                            onClick={() => handleSelect(m)}
                          >
                            <span className="font-medium text-neutral-800">{m.item}</span>
                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">{m.sources.length} distributors stock this</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-neutral-500 text-sm">
                        No items with 2+ distributors found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {!compact && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                  {selectedItem.item}
                  <Badge color="gray">{selectedItem.sources.length} sources</Badge>
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                  <button
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortBy === 'price' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
                    onClick={() => setSortBy('price')}
                  >
                    By Price
                  </button>
                  <button
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortBy === 'value' ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
                    onClick={() => setSortBy('value')}
                  >
                    By Value
                  </button>
                </div>
                <button onClick={handleClear} className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {(() => {
              const minPrice = Math.min(...selectedItem.sources.map((s: any) => s.price));
              const tolerancePrice = minPrice * 1.05; // 5% tolerance
              const valueCandidates = selectedItem.sources.filter((s: any) => s.price <= tolerancePrice);
              const bestValueDist = valueCandidates.reduce((best: any, current: any) =>
                (current.fulfill.comp + current.fulfill.onTime) > (best ? (best.fulfill.comp + best.fulfill.onTime) : 0) ? current : best
                , null);

              const sortedSources = [...selectedItem.sources].sort((a, b) => {
                if (sortBy === 'price') return a.price - b.price;
                const valA = (a.fulfill.comp + a.fulfill.onTime) / a.price;
                const valB = (b.fulfill.comp + b.fulfill.onTime) / b.price;
                return valB - valA;
              });

              const displaySources = compact ? sortedSources.slice(0, 3) : sortedSources;

              return displaySources.map((source: any) => {
                const isLowest = source.price === minPrice;
                const isBestValue = source.dist === bestValueDist?.dist;
                const mostUsedSource = selectedItem.sources.find((s: any) => s.dist === selectedItem.mostUsed);
                const delta = source.price - mostUsedSource.price;

                return (
                  <div key={source.dist} className={`min-w-[280px] w-[280px] snap-center bg-white border border-neutral-200 rounded-xl p-4 flex flex-col hover:border-primary-300 transition-colors shadow-sm ${compact ? 'scale-95 origin-top-left -ml-2 -mb-2' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-neutral-800 text-sm leading-tight flex-1 pr-2">{source.dist}</h4>
                      <div className="flex flex-col items-end gap-1">
                        {isLowest && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-100 px-1.5 py-0.5 rounded"><Tag className="w-3 h-3" /> Lowest Price</span>}
                        {isBestValue && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded"><ShieldCheck className="w-3 h-3" /> Best Value</span>}
                      </div>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-neutral-900">{formatCurrency(source.price)}</span>
                      <span className="text-xs text-neutral-500 mb-1">/ pack</span>

                      {source.dist !== selectedItem.mostUsed && (
                        <span className={`text-xs font-medium mb-1 ml-auto ${delta < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta < 0 ? `${formatCurrency(Math.abs(delta))} cheaper` : `${formatCurrency(delta)} more`}
                        </span>
                      )}
                      {source.dist === selectedItem.mostUsed && (
                        <span className="text-xs font-medium mb-1 ml-auto text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">Most Used</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-neutral-50 rounded p-2 text-center">
                        <p className="text-[10px] text-neutral-500 uppercase font-medium">Completeness</p>
                        <p className={`font-semibold text-sm ${source.fulfill.comp < 90 ? 'text-red-600' : 'text-neutral-800'}`}>{source.fulfill.comp}%</p>
                      </div>
                      <div className="bg-neutral-50 rounded p-2 text-center">
                        <p className="text-[10px] text-neutral-500 uppercase font-medium">On-Time</p>
                        <p className={`font-semibold text-sm ${source.fulfill.onTime < 90 ? 'text-red-600' : 'text-neutral-800'}`}>{source.fulfill.onTime}%</p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        {source.trend < 0 ? <TrendingDown className="w-3.5 h-3.5 text-green-500" /> : source.trend > 0 ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-neutral-400" />}
                        <span>Recent trend</span>
                      </div>
                      <Button
                        size="sm"
                        variant={isBestValue || (isLowest && !bestValueDist) ? 'primary' : 'outline'}
                        onClick={() => {
                          if (onSelectDistributor) onSelectDistributor(selectedItem.item, source.dist, source.price);
                          if (!compact) handleClear();
                        }}
                      >
                        Use for PO
                      </Button>
                    </div>
                  </div>
                );
              });
            })()}
            {compact && selectedItem.sources.length > 3 && (
              <div className="snap-center min-w-[140px] flex items-center justify-center p-4 scale-95 origin-top-left -ml-2 -mb-2">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  Compare {selectedItem.sources.length - 3} more
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
