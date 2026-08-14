import { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, MapPin, Calendar, 
  Clock, Shield, ArrowLeft, MoreVertical, CreditCard, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { staffMembers, expenses } from '@/data';
import type { View, StaffMember, Expense } from '@/types';
import { StatCard, Button, Badge, Card, Select } from '@/components/ui';

interface StaffManagementProps {
  view: View;
  onNavigate: (view: View) => void;
}

export function StaffManagement({ view, onNavigate }: StaffManagementProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  if (view === 'staff-detail' && selectedStaff) {
    return <StaffDetail staff={selectedStaff} onBack={() => { setSelectedStaff(null); onNavigate('staff'); }} />;
  }

  return <StaffList onSelect={(s) => { setSelectedStaff(s); onNavigate('staff-detail'); }} />;
}

// ─── Staff List ─────────────────────────────────────────────────────────────
function StaffList({ onSelect }: { onSelect: (s: StaffMember) => void }) {
  const activeCount = staffMembers.filter(s => s.employmentStatus === 'Active').length;
  const leaveCount = staffMembers.filter(s => s.employmentStatus === 'On Leave').length;
  const payrollDue = staffMembers.some(s => s.payrollHistory?.some(p => p.status === 'Pending')) ? 1 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Management</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage team, attendance, and payroll</p>
        </div>
        <Button icon={<UserPlus className="w-4 h-4" />}>Add Staff Member</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Active Staff" value={activeCount} icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label="On Leave Today" value={leaveCount} icon={<Calendar className="w-5 h-5" />} color="amber" />
        <StatCard label="Pending Payrolls" value={payrollDue} icon={<CreditCard className="w-5 h-5" />} color={payrollDue > 0 ? "rose" : "green"} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between bg-neutral-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search staff by name or role..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select>
              <option value="all">All Roles</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Cashier">Cashier</option>
              <option value="Assistant">Assistant</option>
            </Select>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>Filters</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Staff Member</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {staffMembers.map(staff => (
                <tr key={staff.id} className="hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => onSelect(staff)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{staff.name}</div>
                        <div className="text-xs text-neutral-500">ID: {staff.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="blue">{staff.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-700">{staff.mobile}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={staff.employmentStatus === 'Active' ? 'green' : staff.employmentStatus === 'On Leave' ? 'amber' : 'gray'}>
                      {staff.employmentStatus || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Staff Detail ───────────────────────────────────────────────────────────
function StaffDetail({ staff, onBack }: { staff: StaffMember, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'profile'|'attendance'|'salary'|'performance'>('profile');

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Staff
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 flex items-center justify-center text-2xl font-bold border border-primary-100">
                {staff.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  {staff.name}
                  {staff.employmentStatus === 'Active' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                  <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> {staff.role}</span>
                  <span>•</span>
                  <span>Joined {staff.joiningDate || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" icon={<CheckCircle2 className="w-4 h-4" />}>Mark Attendance</Button>
              <Button>Edit Profile</Button>
            </div>
          </div>

          <div className="flex gap-6 mt-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'profile', label: 'Profile & Details' },
              { id: 'attendance', label: 'Attendance & Leaves' },
              { id: 'salary', label: 'Salary & Payroll' },
              { id: 'performance', label: 'Performance' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === t.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'profile' && <ProfileTab staff={staff} />}
          {activeTab === 'attendance' && <AttendanceTab staff={staff} />}
          {activeTab === 'salary' && <SalaryTab staff={staff} />}
          {activeTab === 'performance' && (
             <div className="flex items-center justify-center h-64 text-neutral-400">Performance module integrated with Sales Analytics.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

function ProfileTab({ staff }: { staff: StaffMember }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Contact Information">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-neutral-400" />
            <div>
              <div className="text-neutral-500 text-xs">Mobile</div>
              <div className="font-medium">{staff.mobile}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-neutral-400" />
            <div>
              <div className="text-neutral-500 text-xs">Email</div>
              <div className="font-medium">{staff.email || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <div>
              <div className="text-neutral-500 text-xs">Address</div>
              <div className="font-medium">{staff.address || '—'}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Emergency Contact">
        {staff.emergencyContact ? (
          <div className="space-y-4">
            <div className="text-sm">
              <div className="text-neutral-500 text-xs">Name</div>
              <div className="font-medium">{staff.emergencyContact.name}</div>
            </div>
            <div className="text-sm">
              <div className="text-neutral-500 text-xs">Contact Number</div>
              <div className="font-medium">{staff.emergencyContact.number}</div>
            </div>
          </div>
        ) : <p className="text-sm text-neutral-500">Not provided</p>}
      </Card>
      
      <Card title="System Access">
         <div className="space-y-4">
           <div className="flex justify-between items-center text-sm">
             <span className="text-neutral-600">Login Access</span>
             <Badge color={staff.active ? 'green' : 'gray'}>{staff.active ? 'Enabled' : 'Disabled'}</Badge>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-neutral-600">Role & Permissions</span>
             <Badge color="blue">{staff.role}</Badge>
           </div>
         </div>
      </Card>
    </div>
  );
}

function AttendanceTab({ staff }: { staff: StaffMember }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {staff.leaveBalances?.map((l, i) => (
          <Card key={i} className="p-4">
            <div className="text-sm font-semibold text-neutral-600 mb-2">{l.type} Leave</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-neutral-900">{l.allotted - l.used}</span>
              <span className="text-neutral-500 mb-1">/ {l.allotted} remaining</span>
            </div>
            <div className="w-full bg-neutral-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: `${(l.used / l.allotted) * 100}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Card title="Recent Attendance">
        {staff.attendance && staff.attendance.length > 0 ? (
          <table className="w-full text-sm text-left">
             <thead className="bg-neutral-50">
               <tr><th className="px-4 py-2 text-neutral-500 font-medium">Date</th><th className="px-4 py-2 text-neutral-500 font-medium">Status</th></tr>
             </thead>
             <tbody className="divide-y divide-neutral-100">
                {staff.attendance.map((a, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">{a.date}</td>
                    <td className="px-4 py-3">
                      <Badge color={a.status === 'Present' ? 'green' : a.status === 'Leave' ? 'amber' : a.status === 'Holiday' ? 'blue' : 'rose'}>{a.status}</Badge>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        ) : (
          <p className="text-sm text-neutral-500">No attendance records found.</p>
        )}
      </Card>
    </div>
  );
}

function SalaryTab({ staff }: { staff: StaffMember }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Payroll History" action={<Button size="sm">Run Payroll</Button>}>
          {staff.payrollHistory && staff.payrollHistory.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 font-medium text-neutral-500">Period</th>
                  <th className="px-4 py-2 text-right font-medium text-neutral-500">Net Pay</th>
                  <th className="px-4 py-2 font-medium text-neutral-500">Status</th>
                  <th className="px-4 py-2 text-right font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {staff.payrollHistory.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-neutral-900">{p.period}</td>
                    <td className="px-4 py-3 text-right">₹{p.computedPay.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge color={p.status === 'Paid' ? 'green' : 'amber'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <button className="text-primary-600 hover:text-primary-700 font-medium text-xs bg-primary-50 px-2 py-1 rounded">Payslip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-neutral-500">No payroll history found.</p>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Salary Structure">
          {staff.salaryStructure ? (
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm pb-2 border-b border-neutral-100">
                   <span className="text-neutral-500">Basic Pay</span>
                   <span className="font-semibold text-neutral-900">₹{staff.salaryStructure.basicPay.toLocaleString()}</span>
                </div>
                {staff.salaryStructure.allowances.map((a, i) => (
                   <div key={i} className="flex justify-between items-center text-sm pb-2 border-b border-neutral-100">
                     <span className="text-neutral-500">{a.name}</span>
                     <span className="text-green-600">+₹{a.amount.toLocaleString()}</span>
                   </div>
                ))}
                {staff.salaryStructure.deductions.map((d, i) => (
                   <div key={i} className="flex justify-between items-center text-sm pb-2 border-b border-neutral-100">
                     <span className="text-neutral-500">{d.name}</span>
                     <span className="text-rose-600">-₹{d.amount.toLocaleString()}</span>
                   </div>
                ))}
             </div>
          ) : <p className="text-sm text-neutral-500">Not configured</p>}
        </Card>

        <Card title="Bank Details">
          {staff.bankDetails ? (
            <div className="space-y-3">
               <div className="text-sm">
                 <div className="text-neutral-500 text-xs">Account Number</div>
                 <div className="font-medium tracking-wide">XXXX-XXXX-{staff.bankDetails.accountNumber.slice(-4)}</div>
               </div>
               <div className="text-sm">
                 <div className="text-neutral-500 text-xs">IFSC</div>
                 <div className="font-medium">{staff.bankDetails.ifsc}</div>
               </div>
            </div>
          ) : <p className="text-sm text-neutral-500">Not configured</p>}
        </Card>
      </div>
    </div>
  );
}
