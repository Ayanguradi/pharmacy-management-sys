import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { supportTickets } from '../data';
import type { TicketStatus, TicketPriority } from '../types';

export function SupportTickets() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');

  const filtered = supportTickets.filter(t => {
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.tenantName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
      </div>

      <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
        <div className="p-4 border-b border-[#2a2e37] flex flex-wrap gap-4 items-center bg-[#16191f]">
          <div className="relative w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
             <input
               type="text"
               placeholder="Search tickets or tenants..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-[#0f1115] border border-[#2a2e37] rounded-lg text-sm text-white focus:border-primary-500 outline-none"
             />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-[#0f1115] border border-[#2a2e37] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting on Tenant">Waiting on Tenant</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
              <tr>
                <th className="px-6 py-4 font-semibold">Subject & Tenant</th>
                <th className="px-6 py-4 font-semibold">Priority & Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Age / Updated</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {filtered.map(ticket => (
                <tr key={ticket.id} className="hover:bg-[#20242c] transition-colors group cursor-pointer" onClick={() => navigate(`/platform-control/tickets/${ticket.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{ticket.subject}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{ticket.tenantName}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={ticket.priority} />
                     </div>
                     <span className="text-xs text-neutral-400">{ticket.category}</span>
                  </td>
                  <td className="px-6 py-4">
                     <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-neutral-300">{new Date(ticket.updatedAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-primary-400 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const colors = {
    'Critical': 'bg-red-500/10 text-red-400 border-red-500/20',
    'High': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Medium': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Low': 'bg-[#2a2e37] text-neutral-300 border-neutral-600/50',
  };
  return (
    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${colors[priority]}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const colors = {
    'Open': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Waiting on Tenant': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Resolved': 'bg-[#2a2e37] text-neutral-300 border-neutral-600/50',
    'Closed': 'bg-[#16191f] text-neutral-500 border-neutral-800',
  };
  return (
    <span className={`px-2 py-0.5 border rounded-full text-[11px] font-bold uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
}
