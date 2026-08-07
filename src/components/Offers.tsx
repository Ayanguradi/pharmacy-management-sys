import { useState } from 'react';
import { Tag, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, Badge, Button, PageHeader, Modal, Input, Select, EmptyState } from '@/components/ui';
import { offers, inventoryItems, formatCurrency } from '@/data';
import type { Offer } from '@/types';

export function Offers() {
  const [showAdd, setShowAdd] = useState(false);
  const [offersList] = useState<Offer[]>(offers);

  const today = '2024-08-04';
  const isActive = (o: Offer) => o.startDate <= today && o.endDate >= today;

  return (
    <div>
      <PageHeader
        title="Offers"
        subtitle="Create and manage promotional pricing"
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Offer</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offersList.map((offer) => {
          const active = isActive(offer);
          const savings = offer.originalPrice - offer.offerPrice;
          const savingsPct = Math.round((savings / offer.originalPrice) * 100);
          return (
            <Card key={offer.id} hover className="overflow-hidden">
              <div className={`h-1.5 ${active ? 'bg-gradient-to-r from-accent-400 to-accent-600' : 'bg-neutral-200'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-accent-50 text-accent-600' : 'bg-neutral-100 text-neutral-400'}`}>
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-800">{offer.product}</p>
                      <p className="text-xs text-neutral-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{offer.startDate} → {offer.endDate}</p>
                    </div>
                  </div>
                  <Badge color={active ? 'green' : 'gray'}>{active ? 'Active' : 'Expired'}</Badge>
                </div>

                <div className="flex items-end gap-3 mt-4">
                  <div>
                    <p className="text-xs text-neutral-400">Original</p>
                    <p className="text-lg font-medium text-neutral-400 line-through">{formatCurrency(offer.originalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Offer Price</p>
                    <p className="text-2xl font-bold text-accent-600">{formatCurrency(offer.offerPrice)}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge color="green" size="md">-{savingsPct}%</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-sm text-neutral-500">You save <span className="font-semibold text-accent-600">{formatCurrency(savings)}</span></p>
                </div>
              </div>
            </Card>
          );
        })}

        {offersList.length === 0 && (
          <Card className="col-span-full">
            <EmptyState icon={<Tag className="w-7 h-7" />} title="No offers yet" subtitle="Create your first promotional offer to attract more customers." />
          </Card>
        )}
      </div>

      {showAdd && <AddOfferModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddOfferModal({ onClose }: { onClose: () => void }) {
  const [product, setProduct] = useState('');
  const [originalPrice, setOriginalPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);

  const selected = inventoryItems.find((i) => i.name === product);
  const previewSavings = originalPrice - offerPrice;

  return (
    <Modal open onClose={onClose} title="Add Offer" size="md">
      <div className="space-y-4">
        <Select label="Product" value={product} onChange={(e) => {
          setProduct(e.target.value);
          const item = inventoryItems.find((i) => i.name === e.target.value);
          if (item) setOriginalPrice(item.mrp);
        }}>
          <option value="">Select a product...</option>
          {inventoryItems.map((i) => <option key={i.id} value={i.name}>{i.name}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" defaultValue="2024-08-04" />
          <Input label="End Date" type="date" defaultValue="2024-08-31" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Original Price (₹)" type="number" value={originalPrice || ''} onChange={(e) => setOriginalPrice(+e.target.value)} />
          <Input label="Offer Price (₹)" type="number" value={offerPrice || ''} onChange={(e) => setOfferPrice(+e.target.value)} />
        </div>

        {/* Live preview */}
        {originalPrice > 0 && offerPrice > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-200">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <span className="text-lg text-neutral-400 line-through">{formatCurrency(originalPrice)}</span>
              <span className="text-2xl font-bold text-accent-600">{formatCurrency(offerPrice)}</span>
              <Badge color="green" size="md">-{Math.round((previewSavings / originalPrice) * 100)}%</Badge>
            </div>
            {selected && <p className="text-sm text-neutral-500 mt-2">{selected.name}</p>}
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={<CheckCircle2 className="w-4 h-4" />} onClick={onClose}>Create Offer</Button>
        </div>
      </div>
    </Modal>
  );
}
