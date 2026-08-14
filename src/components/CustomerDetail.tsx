import { useState, useMemo } from 'react';
import { 
  Phone, MessageCircle, DollarSign, Plus, Edit3, 
  MapPin, Clock, Activity, Users, Package, FileText, ArrowUpDown, ArrowLeft
} from 'lucide-react';
import { Card, Badge, Button, Tabs, Table, StatCard, Select } from '@/components/ui';
import { customers, salesBills, formatCurrency } from '@/data';
import { BarChart, HBarChart } from '@/components/charts';
import type { View, SalesBill } from '@/types';

const tabs = [
  { id: 'history', label: 'Sales History', icon: <FileText className="w-4 h-4" /> },
  { id: 'ledger', label: 'Dues Ledger', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'reminders', label: 'Refill Reminders', icon: <Clock className="w-4 h-4" /> },
  { id: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
  { id: 'returns', label: 'Returns', icon: <Package className="w-4 h-4" /> },
];

interface Props {
  customerId: string;
  onNavigate: (v: View, id?: string) => void;
}

export function CustomerDetail({ customerId, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState('history');
  
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return <div>Customer not found</div>;

  const cbills = salesBills.filter(b => b.patient === customer.name || b.mobile === customer.mobile);
  const totalSpend = cbills.reduce((sum, b) => sum + b.amount, 0);
  const totalDues = cbills.reduce((sum, b) => sum + b.due, 0);
  const lastPurchase = cbills.length > 0 ? cbills.sort((a,b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())[0].billDate : 'N/A';

  return (
    <div className="space-y-4">
      {/* PERSISTENT HEADER */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-neutral-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => onNavigate('customers')} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors mr-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-neutral-900">{customer.name}</h1>
              {customer.familyGroupId && <Badge color="blue">Family Group</Badge>}
              <Badge color={customer.whatsappConsent ? 'green' : 'gray'}>
                {customer.whatsappConsent ? 'WhatsApp Opted In' : 'WhatsApp Opted Out'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 mb-4">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-neutral-400" /> {customer.mobile}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-neutral-400" /> {customer.city}</span>
              {customer.doctors && customer.doctors.map(d => (
                <span key={d} className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-xs font-medium">Doc: {d}</span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<Phone className="w-4 h-4" />}>Call</Button>
              <Button variant="outline" size="sm" icon={<MessageCircle className="w-4 h-4 text-green-600" />} disabled={!customer.whatsappConsent}>WhatsApp</Button>
              <Button variant="outline" size="sm" icon={<DollarSign className="w-4 h-4" />}>Record Payment</Button>
              <Button size="sm" icon={<Plus className="w-4 h-4" />}>New Sale</Button>
            </div>
          </div>

          <div className="flex gap-3 text-center self-stretch md:self-auto bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
            <div className="px-3">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Total Spend</p>
              <p className="text-lg font-bold text-neutral-800">{formatCurrency(totalSpend)}</p>
            </div>
            <div className="w-px bg-neutral-100" />
            <div className="px-3">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Bills</p>
              <p className="text-lg font-bold text-neutral-800">{cbills.length}</p>
            </div>
            <div className="w-px bg-neutral-100" />
            <div className="px-3">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">Dues</p>
              <p className={`text-lg font-bold ${totalDues > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totalDues)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </Card>

      {/* TABS CONTENT */}
      {activeTab === 'history' && (
        <Card>
          <Table headers={['Bill No.', 'Date', 'Items', 'Amount', 'Due', 'Status']}>
            {cbills.map(b => (
              <tr key={b.id} className="hover:bg-neutral-50 cursor-pointer">
                <td className="px-4 py-3 font-medium text-primary-600 hover:underline">{b.billNo}</td>
                <td className="px-4 py-3 text-neutral-600">{b.billDate}</td>
                <td className="px-4 py-3 text-neutral-600 text-xs">
                  {b.items.map(i => i.name).join(', ').substring(0, 30)}...
                </td>
                <td className="px-4 py-3 font-semibold text-neutral-800">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3">{b.due > 0 ? <span className="text-red-600 font-medium">{formatCurrency(b.due)}</span> : '-'}</td>
                <td className="px-4 py-3">
                  <Badge color={b.due === 0 ? 'green' : 'amber'}>{b.due === 0 ? 'Cleared' : 'Due'}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {activeTab === 'ledger' && (
        <Card className="p-6 text-center text-neutral-500">
          <DollarSign className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
          <p>Dues Ledger feature coming soon.</p>
        </Card>
      )}

      {activeTab === 'reminders' && (
        <Card>
          <Table headers={['Item', 'Last Purchase', 'Computed Next Refill', 'Status', 'Actions']}>
            <tr className="hover:bg-neutral-50">
              <td className="px-4 py-3 font-medium text-neutral-800">Metformin 500mg</td>
              <td className="px-4 py-3 text-neutral-600">Aug 03, 2024</td>
              <td className="px-4 py-3 font-medium text-primary-600">Sep 02, 2024</td>
              <td className="px-4 py-3"><Badge color="blue">Upcoming</Badge></td>
              <td className="px-4 py-3"><Button size="sm" variant="outline" icon={<MessageCircle className="w-4 h-4" />}>Send Now</Button></td>
            </tr>
          </Table>
        </Card>
      )}

      {activeTab === 'family' && (
        <div className="space-y-4">
          {customer.familyGroupId ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {customers.filter(c => c.familyGroupId === customer.familyGroupId).map(fc => (
                <Card key={fc.id} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-neutral-800">{fc.name}</h3>
                    <Badge color="blue">{fc.familyRelationship}</Badge>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">{fc.mobile}</p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => onNavigate('customer-detail', fc.id)}>View Profile</Button>
                </Card>
              ))}
              <Card className="p-4 border-dashed border-2 border-neutral-200 flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-50 cursor-pointer">
                <Plus className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Link Family Member</span>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center text-neutral-500">
              <Users className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
              <p className="mb-4">This customer is not part of a family group.</p>
              <Button>Create Family Group</Button>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'returns' && (
        <Card className="p-6 text-center text-neutral-500">
          <Package className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
          <p>No returns recorded for this customer.</p>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">Purchase Trend</h3>
            <BarChart data={[{ label: 'Aug 1', value: 200 }, { label: 'Aug 2', value: 800 }, { label: 'Aug 3', value: 0 }, { label: 'Aug 4', value: 450 }]} height={240} color="#1b80f5" />
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">Most Purchased Items</h3>
            <HBarChart data={[{ label: 'Metformin', value: 1200, color: '#1b80f5' }, { label: 'Vitamin C', value: 400, color: '#12c983' }]} formatter={formatCurrency} />
          </Card>
        </div>
      )}
    </div>
  );
}
