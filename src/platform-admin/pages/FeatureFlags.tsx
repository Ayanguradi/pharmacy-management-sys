import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { featureFlags } from '../data';

export function FeatureFlags() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
      </div>

      <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
         <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
              <tr>
                <th className="px-6 py-4">Feature Name</th>
                <th className="px-6 py-4">Default by Plan</th>
                <th className="px-6 py-4">Overrides</th>
                <th className="px-6 py-4 text-center">New Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {featureFlags.map(flag => (
                <tr key={flag.id} className="hover:bg-[#20242c]">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{flag.name}</div>
                    <div className="text-xs text-neutral-500 mt-1">{flag.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       {Object.entries(flag.defaultStatePerPlan).map(([plan, enabled]) => (
                         <span key={plan} className={`px-2 py-1 border rounded text-[10px] font-bold uppercase tracking-wider ${
                           enabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#2a2e37] text-neutral-500 border-neutral-600/50'
                         }`}>
                           {plan.replace('plan-', '')}
                         </span>
                       ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {flag.tenantOverrides.length > 0 ? (
                      <span className="text-primary-400 font-medium cursor-pointer hover:underline">{flag.tenantOverrides.length} tenants</span>
                    ) : (
                      <span className="text-neutral-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {flag.isNew ? <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-bold uppercase tracking-wider">Yes</span> : <span className="text-neutral-500">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
