import { useState } from 'react';
import { Plus, Edit2, Check, X, Shield, Users, Building, Receipt } from 'lucide-react';
import { planTiers, coupons } from '../data';
import { Button } from '@/components/ui';

export function PlanCatalog() {
  const [activeTab, setActiveTab] = useState<'plans' | 'coupons'>('plans');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Plans & Billing</h1>
        <Button icon={<Plus className="w-4 h-4" />}>
          {activeTab === 'plans' ? 'Create Plan' : 'Create Coupon'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#2a2e37]">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'plans' ? 'border-primary-500 text-primary-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'coupons' ? 'border-primary-500 text-primary-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Coupons & Discounts
        </button>
      </div>

      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {planTiers.map(plan => (
            <div key={plan.id} className="bg-[#1c1f26] border border-[#2a2e37] rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#2a2e37] bg-[#16191f]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <button className="text-neutral-500 hover:text-primary-400"><Edit2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                  <span className="text-neutral-500 text-sm">/{plan.billingCycle.toLowerCase()}</span>
                </div>
                {!plan.isActive && <span className="inline-block mt-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded uppercase font-bold">Archived</span>}
              </div>
              
              <div className="p-6 flex-1 bg-[#1c1f26]">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Building className="w-4 h-4 text-neutral-500" />
                    {plan.maxBranches === -1 ? 'Unlimited branches' : `Up to ${plan.maxBranches} branch${plan.maxBranches > 1 ? 'es' : ''}`}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Users className="w-4 h-4 text-neutral-500" />
                    {plan.maxStaff === -1 ? 'Unlimited staff accounts' : `Up to ${plan.maxStaff} staff accounts`}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Receipt className="w-4 h-4 text-neutral-500" />
                    {plan.maxBillsPerMonth === -1 ? 'Unlimited bills' : `Up to ${plan.maxBillsPerMonth.toLocaleString()} bills/month`}
                  </div>
                </div>

                <div className="w-full h-px bg-[#2a2e37] mb-4"></div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Included Features</h4>
                <ul className="space-y-2.5">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl overflow-hidden animate-fade-in">
           <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e37]">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-[#20242c]">
                    <td className="px-6 py-4 font-mono text-white font-bold">{coupon.code}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{coupon.discountPercent}% OFF</td>
                    <td className="px-6 py-4 text-neutral-300">
                      {coupon.usedCount} / {coupon.usageLimit === -1 ? '∞' : coupon.usageLimit}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                       {coupon.isActive ? 
                         <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium">Active</span> :
                         <span className="px-2 py-1 bg-[#2a2e37] text-neutral-400 rounded text-xs font-medium">Inactive</span>
                       }
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-neutral-500 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
