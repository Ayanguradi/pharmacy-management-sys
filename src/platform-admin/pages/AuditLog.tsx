import { Search } from 'lucide-react';
import { auditLog } from '../data';

export function AuditLog() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Platform Audit Log</h1>
      </div>

      <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
         <div className="p-4 border-b border-[#2a2e37] flex flex-wrap gap-4 items-center bg-[#16191f]">
            <div className="relative w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
               <input type="text" placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 bg-[#0f1115] border border-[#2a2e37] rounded-lg text-sm text-white focus:border-primary-500 outline-none" />
            </div>
         </div>
         <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target / Tenant</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e37]">
              {auditLog.map(log => (
                <tr key={log.id} className="hover:bg-[#20242c]">
                  <td className="px-6 py-4 text-neutral-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-neutral-300 font-medium">{log.adminName}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 bg-[#2a2e37] text-neutral-300 rounded text-xs font-medium whitespace-nowrap">{log.actionType}</span>
                  </td>
                  <td className="px-6 py-4 text-primary-400 cursor-pointer hover:underline whitespace-nowrap">
                    {log.targetTenantName || '-'}
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-white">{log.details}</div>
                     {log.reason && <div className="text-xs text-neutral-500 mt-1">Reason: {log.reason}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
