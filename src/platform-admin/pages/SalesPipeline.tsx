import { useState } from 'react';
import { Target, Users, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
import { leads } from '../data';
import type { LeadStatus } from '../types';

export function SalesPipeline() {
  const [filterStage, setFilterStage] = useState<LeadStatus | 'All'>('All');

  const filteredLeads = leads.filter(l => filterStage === 'All' || l.status === filterStage);

  const stages: LeadStatus[] = ['New', 'Contacted', 'Demo Scheduled', 'Trial Started', 'Converted', 'Lost'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
      </div>

      {/* Funnel Overview */}
      <div className="flex bg-[#1c1f26] border border-[#2a2e37] rounded-xl overflow-x-auto divide-x divide-[#2a2e37]">
         {stages.map(stage => {
            const count = leads.filter(l => l.status === stage).length;
            return (
              <div 
                key={stage} 
                className={`flex-1 p-4 min-w-[120px] cursor-pointer hover:bg-[#20242c] transition-colors ${filterStage === stage ? 'bg-[#20242c]' : ''}`}
                onClick={() => setFilterStage(stage)}
              >
                 <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{stage}</div>
                 <div className="text-2xl font-bold text-white">{count}</div>
              </div>
            );
         })}
         <div 
            className={`flex-1 p-4 min-w-[120px] cursor-pointer hover:bg-[#20242c] transition-colors ${filterStage === 'All' ? 'bg-[#20242c]' : ''}`}
            onClick={() => setFilterStage('All')}
          >
             <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Total</div>
             <div className="text-2xl font-bold text-primary-400">{leads.length}</div>
          </div>
      </div>

      {/* Leads Board (Kanban-style or List depending on view, going with List for simplicity) */}
      <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
         <div className="p-4 border-b border-[#2a2e37] bg-[#16191f]">
            <h3 className="font-semibold text-white">{filterStage === 'All' ? 'All Leads' : `${filterStage} Leads`}</h3>
         </div>
         <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead Details</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Source & Assignee</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-[#20242c] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{lead.pharmacyName}</div>
                    <div className="text-xs text-neutral-500 mt-1">{lead.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-300 font-medium">{lead.contactName}</div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.contactPhone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.contactEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <StatusBadge status={lead.status} />
                     <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(lead.updatedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-neutral-300">{lead.source}</div>
                     <div className="text-xs text-neutral-500 mt-1">Rep: {lead.assignedTo || 'Unassigned'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-primary-400 transition-colors" />
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No leads found in this stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const colors: Record<LeadStatus, string> = {
    'New': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Contacted': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Demo Scheduled': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Trial Started': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Converted': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Lost': 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  };
  return (
    <span className={`px-2 py-0.5 border rounded-full text-[11px] font-bold uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
}
