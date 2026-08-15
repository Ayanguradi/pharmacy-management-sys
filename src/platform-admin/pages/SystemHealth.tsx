import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { backgroundJobs, dataMigrationRequests } from '../data';

export function SystemHealth() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">System Health</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Background Jobs */}
         <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
            <div className="p-4 border-b border-[#2a2e37] bg-[#16191f]">
               <h3 className="font-semibold text-white">Background Automations</h3>
            </div>
            <div className="divide-y divide-[#2a2e37]">
               {backgroundJobs.map(job => (
                 <div key={job.id} className="p-4 hover:bg-[#20242c]">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-white flex items-center gap-2">
                         {job.lastRunStatus === 'Success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                         {job.name}
                       </h4>
                       <span className="text-xs font-medium text-neutral-500 bg-[#2a2e37] px-2 py-1 rounded">{job.frequency}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3">{job.description}</p>
                    <div className="flex gap-4 text-xs">
                       <span className="text-neutral-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last run: {new Date(job.lastRunTime).toLocaleString()}</span>
                       <span className="text-neutral-500">Affected Tenants: {job.affectedTenants}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Data Migrations */}
         <div className="bg-[#1c1f26] rounded-xl border border-[#2a2e37] overflow-hidden">
            <div className="p-4 border-b border-[#2a2e37] bg-[#16191f]">
               <h3 className="font-semibold text-white">Tenant Data Migrations</h3>
            </div>
            <div className="divide-y divide-[#2a2e37]">
               {dataMigrationRequests.map(req => (
                 <div key={req.id} className="p-4 hover:bg-[#20242c]">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h4 className="font-semibold text-white">{req.tenantName}</h4>
                          <p className="text-sm font-mono text-neutral-400 mt-0.5">{req.fileName}</p>
                       </div>
                       <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                         req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                         req.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                         req.status === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                         'bg-[#2a2e37] text-neutral-400'
                       }`}>
                         {req.status}
                       </span>
                    </div>
                    
                    {req.status === 'Processing' && (
                       <div className="mt-4 mb-2">
                          <div className="flex justify-between text-xs text-neutral-400 mb-1">
                             <span>Processing...</span>
                             <span>{req.recordsProcessed} / {req.recordsTotal}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#2a2e37] rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: `${(req.recordsProcessed! / req.recordsTotal!) * 100}%` }}></div>
                          </div>
                       </div>
                    )}
                    
                    {req.errorMessage && (
                       <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                          {req.errorMessage}
                       </div>
                    )}
                    
                    <div className="mt-3 text-xs text-neutral-500">Submitted: {new Date(req.submittedAt).toLocaleString()}</div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
