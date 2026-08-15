import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Building, CreditCard, Ticket, ShieldAlert, LogIn, Activity, AlertTriangle, FileText } from 'lucide-react';
import { tenants, invoices, supportTickets } from '../data';
import { StatusBadge } from './TenantList';
import { Button } from '@/components/ui';

export function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'health' | 'tickets'>('overview');

  const tenant = tenants.find(t => t.id === id);
  
  if (!tenant) return <div className="text-white p-8">Tenant not found</div>;

  const tenantInvoices = invoices.filter(i => i.tenantId === id);
  const tenantTickets = supportTickets.filter(t => t.tenantId === id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/platform-control/tenants')} className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Pharmacies
          </button>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold text-white tracking-tight">{tenant.pharmacyName}</h1>
             <StatusBadge status={tenant.status} />
          </div>
          <p className="text-neutral-400 text-sm mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {tenant.city}, {tenant.state} 
            <span className="text-neutral-600">|</span> 
            ID: <span className="font-mono text-neutral-500">{tenant.id}</span>
          </p>
        </div>

        <div className="flex gap-2">
           <Button variant="outline" className="border-[#2a2e37] text-neutral-300 hover:bg-[#2a2e37] hover:text-white" icon={<LogIn className="w-4 h-4" />}>
             Impersonate
           </Button>
           <Button variant="danger" className="bg-[#7f1d1d]/20 text-red-400 border border-red-500/20 hover:bg-[#7f1d1d]/40" icon={<ShieldAlert className="w-4 h-4" />}>
             Suspend
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2a2e37] overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: <Building className="w-4 h-4" /> },
          { id: 'billing', label: 'Subscription & Billing', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'health', label: 'Usage & Health', icon: <Activity className="w-4 h-4" /> },
          { id: 'tickets', label: `Support Tickets (${tenantTickets.length})`, icon: <Ticket className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary-500 text-primary-400' 
                : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:border-[#2a2e37]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Business Profile</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Owner Name</p>
                      <p className="text-neutral-200 font-medium flex items-center gap-2"><User className="w-4 h-4 text-neutral-500" /> {tenant.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Contact</p>
                      <p className="text-neutral-200 font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-neutral-500" /> {tenant.ownerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-neutral-200 font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-neutral-500" /> {tenant.ownerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">GSTIN</p>
                      <p className="text-neutral-200 font-medium font-mono">{tenant.gstin || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
                  <div className="flex items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2a2e37]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary-400">{tenant.plan}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#2a2e37] text-neutral-300 rounded uppercase">{tenant.billingCycle}</span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        Next renewal: <span className="text-neutral-300 font-medium">{tenant.nextRenewalDate || 'N/A'}</span>
                      </p>
                    </div>
                    <Button variant="outline" className="border-[#2a2e37] text-neutral-300" onClick={() => setActiveTab('billing')}>Manage</Button>
                  </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-6">
                   <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Usage Stats</h3>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-neutral-300">Branches</span>
                       <span className="font-bold text-white">{tenant.branchCount}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-neutral-300">Staff Accounts</span>
                       <span className="font-bold text-white">{tenant.staffCount}</span>
                     </div>
                     <div className="w-full h-px bg-[#2a2e37]"></div>
                     <div className="flex justify-between items-center">
                       <span className="text-neutral-300">Monthly Bills</span>
                       <span className="font-bold text-white">{tenant.monthlyBillVolume.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-neutral-300">Monthly Sales (₹)</span>
                       <span className="font-bold text-white">{(tenant.monthlySalesValue / 100000).toFixed(1)}L</span>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Billing Overview</h3>
                <p className="text-sm text-neutral-400 mt-1">Payment Method: <span className={tenant.paymentMethodStatus === 'Active' ? 'text-emerald-400' : 'text-red-400'}>{tenant.paymentMethodStatus}</span></p>
              </div>
              <Button variant="outline" className="border-[#2a2e37] text-neutral-300">Manual Plan Override</Button>
            </div>

            <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a2e37]">
                <h3 className="font-semibold text-white">Invoice History</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2e37]">
                  {tenantInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-[#20242c]">
                      <td className="px-6 py-3 text-neutral-300">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-white font-medium">₹{inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-3 text-neutral-400">{inv.planName}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button className="text-primary-400 hover:text-primary-300"><FileText className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {tenantInvoices.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">No invoices found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl p-8 text-center text-neutral-400">
             <Activity className="w-12 h-12 mx-auto mb-4 text-[#2a2e37]" />
             <p>Activity trend charts and computed health score details will appear here.</p>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-[#1c1f26] border border-[#2a2e37] rounded-xl overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-400 uppercase bg-[#0f1115] border-b border-[#2a2e37]">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2e37]">
                  {tenantTickets.map(tkt => (
                    <tr key={tkt.id} className="hover:bg-[#20242c] cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{tkt.subject}</div>
                        <div className="text-xs text-neutral-500 mt-1 truncate max-w-md">{tkt.messages[0]?.content}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{tkt.category}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#2a2e37] text-neutral-300 rounded text-xs font-medium">
                          {tkt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{new Date(tkt.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {tenantTickets.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No support tickets found for this pharmacy.</td></tr>
                  )}
                </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
}
