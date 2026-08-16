import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, MapPin, Calendar, 
  Clock, Shield, ArrowLeft, MoreVertical, CreditCard, ChevronDown, CheckCircle2, AlertCircle, XCircle,
  BarChart3, ArrowUpDown, ArrowUp, ArrowDown, X, Eye, Edit, KeyRound, UserX, Info
} from 'lucide-react';
import { staffMembers, expenses, leaveRequests, roleTemplates, salesRecords, salesBills, purchaseBills, branches, formatCurrency } from '@/data';
import type { View, StaffMember, Expense, PermissionLevel } from '@/types';
import { StatCard, Button, Badge, Card, Select, Modal } from '@/components/ui';

interface StaffManagementProps {
  view: View;
  onNavigate: (view: View) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Never';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
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
  const [pageTab, setPageTab] = useState<'list' | 'analytics'>('list');
  const activeCount = staffMembers.filter(s => s.employmentStatus === 'Active').length;
  const leaveCount = staffMembers.filter(s => s.employmentStatus === 'On Leave').length;
  const payrollDue = staffMembers.some(s => s.payrollHistory?.some(p => p.status === 'Pending')) ? 1 : 0;

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [branchFilters, setBranchFilters] = useState<string[]>([]);

  // Kebab menu
  const [kebabOpen, setKebabOpen] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(null);
  const kebabRef = useRef<HTMLDivElement>(null);

  // Close kebab on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) {
        setKebabOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    return staffMembers.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.role.toLowerCase().includes(q) && !s.mobile.includes(q)) return false;
      }
      if (roleFilter !== 'all' && s.role !== roleFilter) return false;
      if (statusFilters.length > 0 && !statusFilters.includes(s.employmentStatus || 'Active')) return false;
      if (branchFilters.length > 0 && s.assignedBranchId && !branchFilters.includes(s.assignedBranchId)) return false;
      return true;
    });
  }, [search, roleFilter, statusFilters, branchFilters]);

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Management</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage team, attendance, and payroll</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Page-level tabs */}
          <div className="bg-neutral-100 p-1 rounded-lg flex items-center">
            <button onClick={() => setPageTab('list')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${pageTab === 'list' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
              <Users className="w-4 h-4 inline mr-1.5" />Staff List
            </button>
            <button onClick={() => setPageTab('analytics')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${pageTab === 'analytics' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
              <BarChart3 className="w-4 h-4 inline mr-1.5" />Analytics
            </button>
          </div>
          <Button icon={<UserPlus className="w-4 h-4" />}>Add Staff Member</Button>
        </div>
      </div>

      {pageTab === 'analytics' ? (
        <StaffAnalytics />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Active Staff" value={activeCount.toString()} icon={<Users className="w-5 h-5" />} color="blue" />
            <StatCard label="On Leave Today" value={leaveCount.toString()} icon={<Calendar className="w-5 h-5" />} color="amber" />
            <StatCard label="Pending Payrolls" value={payrollDue.toString()} icon={<CreditCard className="w-5 h-5" />} color={payrollDue > 0 ? "red" : "green"} />
          </div>

          {/* Pending Leave Requests */}
          {pendingLeaves.length > 0 && (
            <Card className="p-0 overflow-hidden border-amber-200 shadow-sm">
              <div className="p-4 border-b border-amber-200 bg-amber-50 flex justify-between items-center">
                <h3 className="font-bold text-amber-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-600" /> Pending Leave Requests</h3>
                <Badge color="amber">{pendingLeaves.length} Pending</Badge>
              </div>
              <div className="divide-y divide-neutral-100">
                {pendingLeaves.map(leave => {
                  const staffName = staffMembers.find(s => s.id === leave.staffId)?.name || 'Unknown';
                  return (
                    <div key={leave.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-neutral-50 transition-colors">
                      <div>
                        <div className="font-semibold text-neutral-900">{staffName} <span className="text-neutral-500 font-normal text-sm ml-2">({leave.type})</span></div>
                        <div className="text-sm text-neutral-600 mt-1">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                        {leave.reason && <div className="text-xs text-neutral-500 mt-1 italic">"{leave.reason}"</div>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" icon={<XCircle className="w-4 h-4" />}>Reject</Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<CheckCircle2 className="w-4 h-4" />}>Approve</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between bg-neutral-50/50">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff by name, role, or phone..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Assistant">Assistant</option>
                  <option value="Accountant">Accountant</option>
                </Select>
                <Button variant="outline" icon={<Filter className="w-4 h-4" />} onClick={() => setShowFilters(!showFilters)}>
                  Filters {(statusFilters.length + branchFilters.length) > 0 && <Badge color="blue">{statusFilters.length + branchFilters.length}</Badge>}
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="p-4 border-b border-neutral-200 bg-neutral-50 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Status</h4>
                    <div className="space-y-2">
                      {['Active', 'On Leave', 'Inactive', 'Terminated'].map(status => (
                        <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={statusFilters.includes(status)} 
                            onChange={() => setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])}
                            className="w-4 h-4 text-primary-600 rounded border-neutral-300"
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Branch</h4>
                    <div className="space-y-2">
                      {branches.map(b => (
                        <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={branchFilters.includes(b.id)} 
                            onChange={() => setBranchFilters(prev => prev.includes(b.id) ? prev.filter(s => s !== b.id) : [...prev, b.id])}
                            className="w-4 h-4 text-primary-600 rounded border-neutral-300"
                          />
                          {b.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-200">
                  <Button size="sm" onClick={() => { setStatusFilters([]); setBranchFilters([]); }}>Clear All</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowFilters(false)}>Close</Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Staff Member</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Login</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => onSelect(s)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{s.name}</div>
                            <div className="text-xs text-neutral-500">ID: {s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color="blue">{s.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-700">{s.mobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={s.employmentStatus === 'Active' ? 'green' : s.employmentStatus === 'On Leave' ? 'amber' : 'gray'}>
                          {s.employmentStatus || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className={`text-sm ${s.lastLoginAt ? 'text-neutral-600' : 'text-neutral-400 italic'}`}
                          title={s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : 'Never logged in'}
                        >
                          {formatRelativeTime(s.lastLoginAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative" ref={kebabOpen === s.id ? kebabRef : undefined}>
                        <button 
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors" 
                          onClick={(e) => { e.stopPropagation(); setKebabOpen(kebabOpen === s.id ? null : s.id); }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {kebabOpen === s.id && (
                          <div className="absolute right-6 top-12 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 min-w-[180px] animate-fade-in">
                            <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-neutral-50 text-neutral-700" onClick={(e) => { e.stopPropagation(); setKebabOpen(null); onSelect(s); }}>
                              <Eye className="w-4 h-4 text-neutral-400" /> View Profile
                            </button>
                            <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-neutral-50 text-neutral-700" onClick={(e) => { e.stopPropagation(); setKebabOpen(null); }}>
                              <Edit className="w-4 h-4 text-neutral-400" /> Edit
                            </button>
                            <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-neutral-50 text-neutral-700" onClick={(e) => { e.stopPropagation(); setKebabOpen(null); }}>
                              <KeyRound className="w-4 h-4 text-neutral-400" /> Reset Login PIN
                            </button>
                            <div className="border-t border-neutral-100 my-1" />
                            <button className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 hover:bg-red-50 text-red-600" onClick={(e) => { e.stopPropagation(); setKebabOpen(null); setDeactivateTarget(s); }}>
                              <UserX className="w-4 h-4" /> Deactivate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">No staff members match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Deactivate Confirm Modal */}
          <Modal open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} title="Deactivate Staff Member" size="sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                <div className="text-sm text-red-800">
                  Are you sure you want to deactivate <strong>{deactivateTarget?.name}</strong>? They will lose login access immediately.
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setDeactivateTarget(null)}>Cancel</Button>
                <Button variant="danger" icon={<UserX className="w-4 h-4" />} onClick={() => setDeactivateTarget(null)}>Deactivate</Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

// ─── Staff Analytics ────────────────────────────────────────────────────────
type SortField = 'name' | 'sales' | 'bills' | 'avgBill' | 'purchaseBills' | 'attendance' | 'lateClockins' | 'leaveDays' | 'payroll' | 'revenuePerPayroll';
type SortDir = 'asc' | 'desc';

interface StaffMetric {
  staff: StaffMember;
  sales: number;
  bills: number;
  avgBill: number;
  purchaseBills: number;
  attendance: number;
  lateClockins: number;
  leaveDays: number;
  payroll: number;
  revenuePerPayroll: number | null;
}

const SHIFT_START = '09:00'; // Default configured shift start

function StaffAnalytics() {
  const [sortField, setSortField] = useState<SortField>('sales');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-neutral-300" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-600" /> : <ArrowDown className="w-3 h-3 text-primary-600" />;
  };

  const metrics: StaffMetric[] = useMemo(() => {
    return staffMembers.map(s => {
      const mySales = salesRecords.filter(r => r.staff === s.name.split(' ')[0]);
      const sales = mySales.reduce((sum, r) => sum + r.amount, 0);
      const myBills = salesBills.filter(b => b.entryBy === s.name.split(' ')[0] && b.status === 'Finalized');
      const bills = myBills.length;
      const avgBill = bills > 0 ? sales / bills : 0;
      const myPurchaseBills = purchaseBills.filter(b => b.entryBy === s.name.split(' ')[0] && b.status === 'Finalized');
      const presentDays = s.attendance?.filter(a => a.status === 'Present').length || 0;
      const workingDays = s.attendance?.filter(a => a.status !== 'Holiday').length || 1;
      const attendance = Math.round((presentDays / workingDays) * 100);
      const lateClockins = s.attendance?.filter(a => a.clockInTime && a.clockInTime > SHIFT_START).length || 0;
      const myLeaves = leaveRequests.filter(l => l.staffId === s.id && l.status === 'Approved');
      const leaveDays = myLeaves.reduce((sum, l) => {
        const start = new Date(l.startDate); const end = new Date(l.endDate);
        return sum + Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
      }, 0);
      const payroll = s.payrollHistory?.reduce((sum, p) => sum + p.computedPay, 0) || 0;
      const isSalesRole = ['Pharmacist', 'Cashier', 'Owner', 'Manager'].includes(s.role);
      const revenuePerPayroll = isSalesRole && payroll > 0 ? Math.round((sales / payroll) * 100) / 100 : null;

      return { staff: s, sales, bills, avgBill, purchaseBills: myPurchaseBills.length, attendance, lateClockins, leaveDays, payroll, revenuePerPayroll };
    });
  }, []);

  const sorted = useMemo(() => {
    return [...metrics].sort((a, b) => {
      let va: number, vb: number;
      if (sortField === 'name') {
        return sortDir === 'asc' ? a.staff.name.localeCompare(b.staff.name) : b.staff.name.localeCompare(a.staff.name);
      }
      if (sortField === 'revenuePerPayroll') {
        va = a.revenuePerPayroll ?? -1; vb = b.revenuePerPayroll ?? -1;
      } else {
        va = a[sortField] as number; vb = b[sortField] as number;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [metrics, sortField, sortDir]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareData = compareIds.length === 2 ? compareIds.map(id => metrics.find(m => m.staff.id === id)!).filter(Boolean) : [];

  // Leaderboard data for the currently sorted metric
  const leaderboardMax = sorted.length > 0 ? Math.max(...sorted.map(m => {
    if (sortField === 'name') return m.sales;
    if (sortField === 'revenuePerPayroll') return m.revenuePerPayroll ?? 0;
    return m[sortField] as number;
  }), 1) : 1;

  const getMetricValue = (m: StaffMetric): number => {
    if (sortField === 'name') return m.sales;
    if (sortField === 'revenuePerPayroll') return m.revenuePerPayroll ?? 0;
    return m[sortField] as number;
  };

  const getMetricLabel = (field: SortField): string => {
    const labels: Record<SortField, string> = {
      name: 'Name', sales: 'Total Sales (₹)', bills: 'Bills Processed', avgBill: 'Avg Bill Value (₹)',
      purchaseBills: 'Purchase Bills', attendance: 'Attendance %', lateClockins: 'Late Clock-Ins',
      leaveDays: 'Leave Days', payroll: 'Payroll Cost (₹)', revenuePerPayroll: 'Revenue/Payroll ₹'
    };
    return labels[field];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Staff Performance Comparison</h2>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Info className="w-3.5 h-3.5" /> Data from all available records
        </div>
      </div>

      {/* Compare Mode */}
      {compareData.length === 2 && (
        <Card className="p-6 border-primary-200 bg-primary-50/30 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900">Side-by-Side Comparison</h3>
            <button onClick={() => setCompareIds([])} className="text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {compareData.map(m => (
              <div key={m.staff.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">{m.staff.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold text-neutral-900">{m.staff.name}</div>
                    <div className="text-xs text-neutral-500">{m.staff.role}</div>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-neutral-500">Total Sales</span><span className="font-semibold">{formatCurrency(m.sales)}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Bills Processed</span><span className="font-semibold">{m.bills}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Avg Bill Value</span><span className="font-semibold">{formatCurrency(Math.round(m.avgBill))}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Purchase Bills</span><span className="font-semibold">{m.purchaseBills}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Attendance</span><span className="font-semibold">{m.attendance}%</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Late Clock-Ins</span><span className="font-semibold">{m.lateClockins}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Leave Days</span><span className="font-semibold">{m.leaveDays}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Payroll Cost</span><span className="font-semibold">{formatCurrency(m.payroll)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="text-neutral-500">Revenue/Payroll</span><span className="font-bold text-primary-700">{m.revenuePerPayroll !== null ? `${m.revenuePerPayroll.toFixed(2)}x` : 'N/A'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Leaderboard Bar Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary-500" /> Leaderboard — {getMetricLabel(sortField)}
        </h3>
        <div className="space-y-3">
          {sorted.slice(0, 5).map((m, i) => {
            const val = getMetricValue(m);
            const pct = leaderboardMax > 0 ? (val / leaderboardMax) * 100 : 0;
            const colors = ['bg-primary-500', 'bg-primary-400', 'bg-primary-300', 'bg-primary-200', 'bg-primary-100'];
            return (
              <div key={m.staff.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-neutral-400 w-5 text-right">#{i + 1}</span>
                <span className="text-sm font-medium text-neutral-800 w-28 truncate">{m.staff.name}</span>
                <div className="flex-1 h-7 bg-neutral-100 rounded-lg overflow-hidden relative">
                  <div className={`h-full rounded-lg transition-all duration-500 ${colors[i] || colors[4]}`} style={{ width: `${Math.max(pct, 3)}%` }} />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-700">
                    {sortField === 'attendance' ? `${val}%` : sortField === 'revenuePerPayroll' ? `${val.toFixed(2)}x` : ['sales', 'avgBill', 'payroll'].includes(sortField) ? formatCurrency(val) : val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-3 py-3 w-10"></th>
                {([
                  ['name', 'Staff'],
                  ['sales', 'Total Sales (₹)'],
                  ['bills', 'Bills'],
                  ['avgBill', 'Avg Bill (₹)'],
                  ['purchaseBills', 'Purch. Bills'],
                  ['attendance', 'Attend. %'],
                  ['lateClockins', 'Late'],
                  ['leaveDays', 'Leave Days'],
                  ['payroll', 'Payroll (₹)'],
                  ['revenuePerPayroll', 'Rev/Payroll'],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th key={field} className="px-4 py-3 cursor-pointer hover:text-neutral-700 select-none whitespace-nowrap" onClick={() => toggleSort(field)}>
                    <span className="flex items-center gap-1">{label} <SortIcon field={field} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sorted.map(m => (
                <tr key={m.staff.id} className={`hover:bg-neutral-50 transition-colors ${compareIds.includes(m.staff.id) ? 'bg-primary-50' : ''}`}>
                  <td className="px-3 py-3">
                    <input 
                      type="checkbox" 
                      checked={compareIds.includes(m.staff.id)} 
                      onChange={() => toggleCompare(m.staff.id)} 
                      className="w-4 h-4 text-primary-600 rounded border-neutral-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{m.staff.name.charAt(0)}</div>
                      <div>
                        <div className="text-sm">{m.staff.name}</div>
                        <div className="text-xs text-neutral-400">{m.staff.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{formatCurrency(m.sales)}</td>
                  <td className="px-4 py-3">{m.bills}</td>
                  <td className="px-4 py-3">{formatCurrency(Math.round(m.avgBill))}</td>
                  <td className="px-4 py-3">{m.purchaseBills}</td>
                  <td className="px-4 py-3">
                    <span className={m.attendance >= 90 ? 'text-green-600 font-medium' : m.attendance >= 70 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
                      {m.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={m.lateClockins > 0 ? 'text-amber-600 font-medium' : 'text-neutral-500'}>{m.lateClockins}</span>
                  </td>
                  <td className="px-4 py-3">{m.leaveDays}</td>
                  <td className="px-4 py-3">{formatCurrency(m.payroll)}</td>
                  <td className="px-4 py-3">
                    {m.revenuePerPayroll !== null 
                      ? <span className={`font-bold ${m.revenuePerPayroll >= 1 ? 'text-green-600' : 'text-amber-600'}`}>{m.revenuePerPayroll.toFixed(2)}x</span>
                      : <span className="text-neutral-400 italic">N/A</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {compareIds.length === 1 && (
          <div className="p-3 bg-primary-50 text-center text-sm text-primary-700 border-t">
            Select one more staff member to compare side-by-side
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Staff Detail ───────────────────────────────────────────────────────────
function StaffDetail({ staff, onBack }: { staff: StaffMember, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'profile'|'attendance'|'salary'|'performance'|'permissions'>('profile');

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
                  {staff.lastLoginAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1" title={new Date(staff.lastLoginAt).toLocaleString()}>
                        <Clock className="w-3.5 h-3.5" /> Last login: {formatRelativeTime(staff.lastLoginAt)}
                      </span>
                    </>
                  )}
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
              { id: 'permissions', label: 'Access & Permissions' },
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
          {activeTab === 'permissions' && <PermissionsTab staff={staff} />}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

function PermissionsTab({ staff }: { staff: StaffMember }) {
  const template = roleTemplates.find(rt => rt.role === staff.role) || roleTemplates[0];
  const [overrides, setOverrides] = useState<Record<string, PermissionLevel>>(staff.permissionOverrides || {});

  const modules = [
    'dashboard', 'purchases', 'sales', 'customers', 'distributors', 
    'inventory', 'reports', 'offers', 'settings', 'staff', 'expenses', 
    'branch-transfers', 'stock-audit'
  ];

  const handleOverride = (module: string, level: PermissionLevel) => {
    if (template.permissions[module] === level) {
      const newOverrides = { ...overrides };
      delete newOverrides[module];
      setOverrides(newOverrides);
    } else {
      setOverrides({ ...overrides, [module]: level });
    }
  };

  const handleReset = () => setOverrides({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
         <div>
            <div className="text-sm font-semibold text-neutral-900">Role Template: <span className="text-primary-600">{template.role}</span></div>
            <p className="text-xs text-neutral-500 mt-1">Overrides take effect on the staff member's next login.</p>
         </div>
         <Button variant="outline" onClick={handleReset} disabled={Object.keys(overrides).length === 0}>Reset to Default</Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
           <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b">
              <tr>
                 <th className="px-6 py-4">Module</th>
                 <th className="px-6 py-4">Template Default</th>
                 <th className="px-6 py-4">Custom Access</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-neutral-100">
              {modules.map(mod => {
                 const defaultLevel = template.permissions[mod] || 'No Access';
                 const currentLevel = overrides[mod] || defaultLevel;
                 const isOverridden = !!overrides[mod];

                 return (
                   <tr key={mod} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900 capitalize">{mod.replace('-', ' ')}</td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                           defaultLevel === 'Full Access' ? 'bg-emerald-100 text-emerald-700' :
                           defaultLevel === 'View Only' ? 'bg-blue-100 text-blue-700' :
                           'bg-neutral-100 text-neutral-600'
                         }`}>
                           {defaultLevel}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <Select 
                             value={currentLevel} 
                             onChange={(e) => handleOverride(mod, e.target.value as PermissionLevel)}
                             className={isOverridden ? "border-amber-400 bg-amber-50 text-amber-900" : ""}
                           >
                              <option value="Full Access">Full Access</option>
                              <option value="View Only">View Only</option>
                              <option value="No Access">No Access</option>
                           </Select>
                           {isOverridden && <Badge color="amber">Overridden</Badge>}
                         </div>
                      </td>
                   </tr>
                 );
              })}
           </tbody>
        </table>
      </div>
      
      <div className="flex justify-end">
         <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<CheckCircle2 className="w-4 h-4" />}>Save Permissions</Button>
      </div>
    </div>
  );
}

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
           <div className="flex justify-between items-center text-sm">
             <span className="text-neutral-600">Last Login</span>
             <span className="text-neutral-700 font-medium" title={staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString() : undefined}>
               {formatRelativeTime(staff.lastLoginAt)}
             </span>
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
               <tr>
                 <th className="px-4 py-2 text-neutral-500 font-medium">Date</th>
                 <th className="px-4 py-2 text-neutral-500 font-medium">Status</th>
                 <th className="px-4 py-2 text-neutral-500 font-medium">Clock In</th>
                 <th className="px-4 py-2 text-neutral-500 font-medium">Clock Out</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-neutral-100">
                {staff.attendance.map((a, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">{a.date}</td>
                    <td className="px-4 py-3">
                      <Badge color={a.status === 'Present' ? 'green' : a.status === 'Leave' ? 'amber' : a.status === 'Holiday' ? 'blue' : 'red'}>{a.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {a.clockInTime ? (
                        <span className={a.clockInTime > SHIFT_START ? 'text-amber-600 font-medium' : 'text-neutral-700'}>
                          {a.clockInTime} {a.clockInTime > SHIFT_START && '(Late)'}
                        </span>
                      ) : <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{a.clockOutTime || <span className="text-neutral-400">—</span>}</td>
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
