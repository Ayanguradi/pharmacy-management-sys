import { useState } from 'react';
import { User, Clock, Calendar as CalendarIcon, FileText, CheckCircle, XCircle, ChevronRight, Lock, Bell, AlertTriangle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { staff, leaveRequests, notices } from '@/data';

export function MySpace() {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'leaves' | 'payslips' | 'performance'>('attendance');
  
  // Mock current user - in a real app this comes from auth context
  const currentUser = staff[0]; 
  const myLeaves = leaveRequests.filter(l => l.staffId === currentUser.id);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Notices Banner */}
      {notices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Company Notices
          </div>
          <div className="space-y-3">
            {notices.map(notice => (
              <div key={notice.id} className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-neutral-800">{notice.title}</h4>
                  <span className="text-xs text-neutral-500">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-neutral-600">{notice.content}</p>
                <div className="text-xs font-medium text-neutral-400 mt-2">— {notice.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-neutral-900">My Space</h1>
           <p className="text-neutral-500 text-sm">Manage your profile, attendance, and leaves.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-neutral-900">{currentUser.name}</div>
            <div className="text-xs text-neutral-500">{currentUser.role}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {[
          { id: 'attendance', label: 'My Attendance', icon: <Clock className="w-4 h-4" /> },
          { id: 'leaves', label: 'My Leaves', icon: <CalendarIcon className="w-4 h-4" /> },
          { id: 'payslips', label: 'My Payslips', icon: <FileText className="w-4 h-4" /> },
          { id: 'performance', label: 'My Performance', icon: <CheckCircle className="w-4 h-4" /> },
          { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-neutral-900">Today's Attendance</h3>
                    <div className="text-lg font-mono font-medium text-neutral-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center p-8 bg-neutral-50 border border-neutral-100 rounded-xl">
                    <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">Clock In Now</Button>
                    <span className="text-neutral-400">or</span>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto" disabled>Clock Out</Button>
                  </div>
                  <p className="text-center text-sm text-neutral-500 mt-4">You have not clocked in today yet.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Leave Balances</h3>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Casual</div>
                        <div className="text-2xl font-bold text-blue-900">4 <span className="text-sm font-medium text-blue-600">/ 8</span></div>
                     </div>
                     <div className="p-4 rounded-xl border border-amber-100 bg-amber-50">
                        <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Sick</div>
                        <div className="text-2xl font-bold text-amber-900">2 <span className="text-sm font-medium text-amber-600">/ 6</span></div>
                     </div>
                     <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Earned</div>
                        <div className="text-2xl font-bold text-purple-900">12 <span className="text-sm font-medium text-purple-600">/ 15</span></div>
                     </div>
                  </div>
                </Card>
             </div>
             
             <div className="space-y-6">
               <Card className="p-6">
                 <h3 className="font-bold text-neutral-900 mb-4">August 2026</h3>
                 {/* Placeholder for calendar */}
                 <div className="aspect-square bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-400">
                    Calendar View
                 </div>
                 <div className="mt-4 space-y-2 text-sm">
                   <div className="flex justify-between"><span className="text-neutral-500">Present</span><span className="font-bold">12 Days</span></div>
                   <div className="flex justify-between"><span className="text-neutral-500">Absent</span><span className="font-bold text-red-600">0 Days</span></div>
                   <div className="flex justify-between"><span className="text-neutral-500">Half Day</span><span className="font-bold text-amber-600">1 Day</span></div>
                 </div>
               </Card>
             </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-neutral-900">Leave History</h3>
              <Button icon={<CalendarIcon className="w-4 h-4" />}>Apply for Leave</Button>
            </div>
            
            <Card className="overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {myLeaves.map(leave => (
                    <tr key={leave.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{leave.type}</td>
                      <td className="px-6 py-4 text-neutral-600 truncate max-w-[200px]">{leave.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                        {leave.status === 'Rejected' && leave.approverNote && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {leave.approverNote}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {myLeaves.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-neutral-500">No leave requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'payslips' && (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Net Pay</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    { period: 'July 2026', pay: 45000, status: 'Paid' },
                    { period: 'June 2026', pay: 45000, status: 'Paid' },
                    { period: 'May 2026', pay: 42000, status: 'Paid' },
                  ].map((slip, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">{slip.period}</td>
                      <td className="px-6 py-4 text-neutral-900">₹{slip.pay.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          {slip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary-600 hover:text-primary-700 font-medium">Download PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-3xl">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 border-b pb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Full Name</div>
                  <div className="text-neutral-900 font-medium">{currentUser.name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Role</div>
                  <div className="text-neutral-900 font-medium">{currentUser.role}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Phone Number</div>
                  <div className="text-neutral-900 font-medium">{currentUser.phone}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Joining Date</div>
                  <div className="text-neutral-900 font-medium">{new Date(currentUser.joiningDate).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="p-4 bg-neutral-50 border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-900">Change PIN / Password</h4>
                  <p className="text-sm text-neutral-500">Update your login credentials securely.</p>
                </div>
                <Button variant="outline" icon={<Lock className="w-4 h-4" />}>Update</Button>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="text-center py-12 text-neutral-500">
             <CheckCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
             <p>Performance metrics will appear here based on your role.</p>
          </div>
        )}
      </div>
    </div>
  );
}
