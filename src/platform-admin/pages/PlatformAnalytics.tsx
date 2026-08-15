import { BarChart3, Users, IndianRupee, TrendingUp } from 'lucide-react';
import { tenants } from '../data';
import { Card } from '@/components/ui';

export function PlatformAnalytics() {
  const activeTenants = tenants.filter(t => t.status === 'Active' || t.status === 'Trial');
  const totalBills = activeTenants.reduce((acc, t) => acc + t.monthlyBillVolume, 0);
  const totalGMV = activeTenants.reduce((acc, t) => acc + t.monthlySalesValue, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Active Pharmacies" value={activeTenants.length} icon={<Users className="w-5 h-5 text-blue-400" />} />
        <KPICard title="Monthly Bills Processed" value={(totalBills / 1000).toFixed(1) + 'K'} icon={<BarChart3 className="w-5 h-5 text-purple-400" />} />
        <KPICard title="Monthly GMV Processed" value={'₹' + (totalGMV / 10000000).toFixed(2) + ' Cr'} icon={<IndianRupee className="w-5 h-5 text-emerald-400" />} />
        <KPICard title="Platform MRR" value="₹1.25 L" icon={<TrendingUp className="w-5 h-5 text-amber-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Charts */}
        <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-6 h-96 flex flex-col items-center justify-center text-neutral-500">
           <BarChart3 className="w-12 h-12 mb-4 text-[#2a2e37]" />
           <p className="font-medium text-neutral-400">MRR Growth Trend</p>
           <p className="text-sm mt-1">Chart component integration here</p>
        </div>
        
        <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-6 h-96 flex flex-col items-center justify-center text-neutral-500">
           <TrendingUp className="w-12 h-12 mb-4 text-[#2a2e37]" />
           <p className="font-medium text-neutral-400">Trial-to-Paid Conversion</p>
           <p className="text-sm mt-1">Chart component integration here</p>
        </div>
      </div>
      
      {/* Feature Adoption Table */}
      <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
        <div className="p-4 border-b border-[#2a2e37] bg-[#16191f]">
          <h3 className="font-semibold text-white">Feature Adoption</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
            <tr>
              <th className="px-6 py-4">Feature Module</th>
              <th className="px-6 py-4">Adoption Rate</th>
              <th className="px-6 py-4">Active Tenants Using</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e37]">
            <tr className="hover:bg-[#20242c]">
              <td className="px-6 py-4 text-white font-medium">PO Reconciliation</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-neutral-300 w-10">45%</span>
                  <div className="w-32 h-2 bg-[#2a2e37] rounded-full overflow-hidden">
                     <div className="h-full bg-primary-500 w-[45%]"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-neutral-400">18 / 40 eligible</td>
            </tr>
            <tr className="hover:bg-[#20242c]">
              <td className="px-6 py-4 text-white font-medium">Staff Leaves & Payroll</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-neutral-300 w-10">22%</span>
                  <div className="w-32 h-2 bg-[#2a2e37] rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500 w-[22%]"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-neutral-400">9 / 40 eligible</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }: any) {
  return (
    <Card className="bg-[#1c1f26] border-[#2a2e37] p-5 shadow-none">
      <div className="flex items-start justify-between">
         <div>
           <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">{title}</p>
           <h4 className="text-2xl font-bold text-white">{value}</h4>
         </div>
         <div className="p-2 bg-[#0f1115] rounded-lg border border-[#2a2e37]">{icon}</div>
      </div>
    </Card>
  );
}
