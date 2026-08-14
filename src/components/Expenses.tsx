import { useState } from 'react';
import { 
  Receipt, Plus, Filter, Search, Download, ChevronRight, CheckCircle2, 
  TrendingUp, BarChart3, AlertCircle, TrendingDown, IndianRupee, PieChart
} from 'lucide-react';
import { expenses, salesRecords } from '@/data';
import type { Expense } from '@/types';
import { Card, StatCard, Badge, Button, Select } from '@/components/ui';

export function Expenses() {
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Expenses & Accounting</h1>
          <p className="text-neutral-500 text-sm mt-1">Track operational costs and salaries</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-neutral-100 p-1 rounded-lg flex items-center mr-2">
            <button 
              onClick={() => setActiveTab('list')} 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'list' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Expense List
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Analytics
            </button>
          </div>
          <Button icon={<Plus className="w-4 h-4" />}>Add Expense</Button>
        </div>
      </div>

      {activeTab === 'list' ? <ExpensesList /> : <ExpensesAnalytics />}
    </div>
  );
}

// ─── Expenses List ─────────────────────────────────────────────────────────
function ExpensesList() {
  const currentMonthExpenses = expenses.filter(e => e.status === 'Finalized').reduce((sum, e) => sum + e.amount, 0);
  const pendingDrafts = expenses.filter(e => e.status === 'Draft').length;
  
  const totalSales = salesRecords.reduce((sum, r) => sum + r.amount, 0);
  const expenseRatio = totalSales > 0 ? ((currentMonthExpenses / totalSales) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Expenses (Aug 2026)" value={`₹${currentMonthExpenses.toLocaleString()}`} icon={<IndianRupee className="w-5 h-5" />} color="rose" />
        <StatCard label="Pending Drafts" value={pendingDrafts} icon={<AlertCircle className="w-5 h-5" />} color={pendingDrafts > 0 ? "amber" : "gray"} />
        <StatCard label="Expense-to-Sales Ratio" value={`${expenseRatio}%`} icon={<TrendingDown className="w-5 h-5" />} color="blue" />
      </div>

      {/* Drafts Alert Strip */}
      {pendingDrafts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">You have {pendingDrafts} pending recurring draft(s)</h3>
              <p className="text-amber-700 text-sm">Review and finalize recurring expenses generated for this month.</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white hover:bg-amber-50 border-amber-300 text-amber-700">Review Drafts</Button>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between bg-neutral-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by payee or category..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select>
              <option value="all">All Categories</option>
              <option value="Rent">Rent</option>
              <option value="Salaries">Salaries</option>
              <option value="Electricity">Electricity</option>
            </Select>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>Filters</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Payee & Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-neutral-500">{exp.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{exp.payee}</div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                       {exp.category}
                       {exp.isRecurring && <Badge color="purple">Recurring</Badge>}
                       {exp.category === 'Salaries' && <Badge color="gray">System Generated</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-neutral-900">
                    ₹{exp.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{exp.paymentMode}</td>
                  <td className="px-6 py-4">
                    <Badge color={exp.status === 'Finalized' ? 'green' : 'amber'}>{exp.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {exp.status === 'Draft' && (
                      <Button size="sm" variant="outline" className="h-8">Finalize</Button>
                    )}
                    {exp.category !== 'Salaries' && (
                       <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
                    )}
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

// ─── Expenses Analytics ────────────────────────────────────────────────────
function ExpensesAnalytics() {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Category Breakdown (Donut equivalent representation) */}
         <Card title="Expenses by Category (This Month)">
           <div className="space-y-4 mt-4">
             {[
               { cat: 'Rent', val: 45000, color: 'bg-blue-500', pct: 51 },
               { cat: 'Salaries', val: 30500, color: 'bg-emerald-500', pct: 35 },
               { cat: 'Electricity', val: 8400, color: 'bg-amber-500', pct: 10 },
               { cat: 'Maintenance', val: 2500, color: 'bg-rose-500', pct: 4 }
             ].map(item => (
               <div key={item.cat}>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="font-medium text-neutral-700">{item.cat}</span>
                   <span className="text-neutral-900 font-semibold">₹{item.val.toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-neutral-100 rounded-full h-2">
                   <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                 </div>
               </div>
             ))}
           </div>
         </Card>

         <Card title="Expense Ratio vs Revenue Trend">
            <div className="flex items-end justify-center h-48 gap-4 mt-6">
              {/* Mock Bar Chart */}
              {[
                { m: 'Mar', r: 168000, e: 65000 },
                { m: 'Apr', r: 155000, e: 66000 },
                { m: 'May', r: 192000, e: 65000 },
                { m: 'Jun', r: 178000, e: 82000 }, // Hiring
                { m: 'Jul', r: 215000, e: 84000 },
                { m: 'Aug', r: 198000, e: 86400 },
              ].map(d => (
                 <div key={d.m} className="flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-neutral-900 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                      Rev: ₹{(d.r/1000).toFixed(0)}k | Exp: ₹{(d.e/1000).toFixed(0)}k
                    </div>
                    <div className="flex gap-1 items-end h-32">
                      <div className="w-3 bg-primary-200 rounded-t-sm" style={{ height: `${(d.r / 250000) * 100}%` }} />
                      <div className="w-3 bg-rose-400 rounded-t-sm" style={{ height: `${(d.e / 250000) * 100}%` }} />
                    </div>
                    <div className="text-xs text-neutral-500">{d.m}</div>
                 </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs text-neutral-500">
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary-200 rounded-sm"/> Revenue</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded-sm"/> Expenses</div>
            </div>
         </Card>
       </div>
    </div>
  );
}
