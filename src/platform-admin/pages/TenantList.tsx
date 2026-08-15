import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users, Receipt, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { tenants } from '../data';
import type { Tenant } from '../types';

export function TenantList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // KPI logic
  const total = tenants.length;
  const activePaid = tenants.filter(t => t.status === 'Active' && t.plan !== 'Trial').length;
  const activeTrials = tenants.filter(t => t.status === 'Trial').length;
  const atRisk = tenants.filter(t => t.healthScore === 'At Risk' || t.status === 'Past Due').length;
  const churned = tenants.filter(t => t.status === 'Churned').length;

  // Filtered List
  const filtered = tenants.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search && !t.pharmacyName.toLowerCase().includes(search.toLowerCase()) && !t.ownerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Pharmacies (Tenants)</h1>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Total Pharmacies" value={total} icon={<Building2 />} color="blue" />
        <KPICard title="Active Paid" value={activePaid} icon={<Receipt />} color="green" />
        <KPICard title="Active Trials" value={activeTrials} icon={<Users />} color="purple" />
        <KPICard title="At Risk / Past Due" value={atRisk} icon={<AlertTriangle />} color="amber" />
        <KPICard title="Churned (MTD)" value={churned} icon={<XCircle />} color="red" />
      </div>

      {/* Filters & Table */}
      <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
        <div className="p-4 border-b border-[#2a2e37] flex flex-wrap gap-4 items-center justify-between bg-[#16191f]">
          <div className="relative w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
             <input
               type="text"
               placeholder="Search pharmacy or owner..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-[#0f1115] border border-[#2a2e37] rounded-lg text-sm text-white focus:border-primary-500 outline-none"
             />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f1115] border border-[#2a2e37] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Past Due">Past Due</option>
            <option value="Suspended">Suspended</option>
            <option value="Churned">Churned</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
              <tr>
                <th className="px-6 py-4 font-semibold">Pharmacy</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status & Health</th>
                <th className="px-6 py-4 font-semibold text-center">Branches</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {filtered.map(tenant => (
                <tr key={tenant.id} className="hover:bg-[#20242c] transition-colors group cursor-pointer" onClick={() => navigate(`/platform-control/tenants/${tenant.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{tenant.pharmacyName}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{tenant.city}, {tenant.state}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-300">{tenant.ownerName}</div>
                    <div className="text-xs text-neutral-500">{tenant.ownerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#2a2e37] text-neutral-300 rounded text-xs font-medium">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <StatusBadge status={tenant.status} />
                       {tenant.healthScore === 'At Risk' && <span className="w-2 h-2 rounded-full bg-amber-500" title="At Risk"></span>}
                       {tenant.healthScore === 'Churning' && <span className="w-2 h-2 rounded-full bg-red-500" title="Churning"></span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-neutral-300">{tenant.branchCount}</td>
                  <td className="px-6 py-4">
                     <div className="text-neutral-300">Active: {new Date(tenant.lastActiveDate).toLocaleDateString()}</div>
                     <div className="text-xs text-neutral-500">Joined: {new Date(tenant.signupDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-primary-400 transition-colors" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                    No pharmacies found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: any) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  };
  return (
    <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white leading-tight">{value}</div>
        <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{title}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Trial': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Past Due': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Suspended': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Churned': 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  };
  return (
    <span className={`px-2 py-0.5 border rounded-full text-[11px] font-bold uppercase tracking-wider ${colors[status] || colors['Active']}`}>
      {status}
    </span>
  );
}
