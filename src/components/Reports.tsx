import { useState } from 'react';
import {
  FileBarChart, Download, Mail, Users, TrendingUp, Award,
  Save, Send,
} from 'lucide-react';
import { Card, Badge, Button, Table, PageHeader, Select, Input, Modal, StatCard } from '@/components/ui';
import { salesRecords, formatCurrency } from '@/data';

export function Reports() {
  const [sortBy, setSortBy] = useState<'staff' | 'distributor' | 'date'>('date');
  const [threshold, setThreshold] = useState(100);
  const [showEmail, setShowEmail] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const sorted = [...salesRecords].sort((a, b) => {
    if (sortBy === 'staff') return a.staff.localeCompare(b.staff);
    if (sortBy === 'date') return b.date.localeCompare(a.date);
    return (a.distributor ?? '').localeCompare(b.distributor ?? '');
  });

  const staffSales = salesRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.staff] = (acc[r.staff] ?? 0) + r.amount;
    return acc;
  }, {});
  const topStaff = Object.entries(staffSales).sort((a, b) => b[1] - a[1])[0];
  const totalCustomers = new Set(salesRecords.map((r) => r.customer)).size;
  const aboveThreshold = salesRecords.filter((r) => r.amount > threshold).length;
  const totalSales = salesRecords.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analyze sales performance by staff, distributor, and date"
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => setShowExport(true)}>Export</Button>
            <Button icon={<Mail className="w-4 h-4" />} onClick={() => setShowEmail(true)}>Email Report</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Top Staff" value={topStaff?.[0] ?? '—'} icon={<Award className="w-5 h-5" />} trend={formatCurrency(topStaff?.[1] ?? 0)} color="blue" />
        <StatCard label="Total Sales" value={String(salesRecords.length)} icon={<TrendingUp className="w-5 h-5" />} color="green" />
        <StatCard label="Total Customers" value={String(totalCustomers)} icon={<Users className="w-5 h-5" />} color="amber" />
        <StatCard label={`Sales > ${formatCurrency(threshold)}`} value={String(aboveThreshold)} icon={<FileBarChart className="w-5 h-5" />} color="blue" />
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'staff' | 'distributor' | 'date')} className="sm:w-48">
            <option value="date">Date</option>
            <option value="staff">Staff</option>
            <option value="distributor">Distributor</option>
          </Select>
          <div className="flex-1">
            <Input
              label="Sales Threshold (₹)"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(+e.target.value)}
            />
          </div>
          <div className="text-sm text-neutral-500 pb-2.5">
            Total Revenue: <span className="font-bold text-neutral-800">{formatCurrency(totalSales)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <Table headers={['Date', 'Staff', 'Customer', 'Distributor', 'Amount']}>
          {sorted.map((r, i) => (
            <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-3 text-neutral-500">{i + 1}</td>
              <td className="px-4 py-3 text-neutral-600">{r.date}</td>
              <td className="px-4 py-3">
                <span className="font-medium text-neutral-700">{r.staff}</span>
                {r.staff === topStaff?.[0] && <Badge color="green">Top</Badge>}
              </td>
              <td className="px-4 py-3 text-neutral-600">{r.customer}</td>
              <td className="px-4 py-3 text-neutral-600">{r.distributor}</td>
              <td className="px-4 py-3">
                <span className={`font-semibold ${r.amount > threshold ? 'text-primary-700' : 'text-neutral-700'}`}>{formatCurrency(r.amount)}</span>
                {r.amount > threshold && <Badge color="blue">Above</Badge>}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}

function EmailModal({ onClose }: { onClose: () => void }) {
  const [savedLists] = useState([
    { name: 'Management Team', emails: 'ceo@apollo.pharmacy, cfo@apollo.pharmacy' },
    { name: 'Staff', emails: 'rahul@apollo.pharmacy, priya@apollo.pharmacy' },
  ]);

  return (
    <Modal open onClose={onClose} title="Email Report" size="md">
      <div className="space-y-4">
        <Input label="To" placeholder="email@example.com" />
        <Input label="Subject" defaultValue="Sales Report — August 2024" />
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Message</label>
          <textarea className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200" rows={4} defaultValue="Please find attached the sales report for August 2024." />
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">Saved Recipient Lists</p>
          <div className="space-y-2">
            {savedLists.map((list) => (
              <button key={list.name} className="w-full flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors text-left">
                <div>
                  <p className="text-sm font-medium text-neutral-700">{list.name}</p>
                  <p className="text-xs text-neutral-400">{list.emails}</p>
                </div>
                <Send className="w-4 h-4 text-primary-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between border-t border-neutral-100 pt-4">
          <Button variant="outline" icon={<Save className="w-4 h-4" />}>Save Recipient List</Button>
          <Button icon={<Send className="w-4 h-4" />} onClick={onClose}>Send Report</Button>
        </div>
      </div>
    </Modal>
  );
}

function ExportModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Export Report" size="sm">
      <div className="space-y-3">
        {['CSV (Excel)', 'PDF Document', 'Excel (.xlsx)'].map((format) => (
          <button key={format} onClick={onClose} className="w-full flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center"><Download className="w-4 h-4 text-primary-600" /></div>
              <span className="text-sm font-medium text-neutral-700">{format}</span>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
