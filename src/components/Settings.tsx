import {
  Settings, Building2, Users, Upload, Gift, Share2, Clock,
  AlertTriangle, Package, FileSpreadsheet, Plus, Trash2,
} from 'lucide-react';
import { Card, Badge, Button, PageHeader, Input } from '@/components/ui';

export function SettingsView() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your pharmacy profile, staff, and system configuration" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pharmacy Profile */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary-500" /> Pharmacy Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Pharmacy Name" defaultValue="Apollo Pharmacy" />
            <Input label="Owner Name" defaultValue="Dr. Rajesh Kumar" />
            <Input label="GSTIN" defaultValue="27APOLO1234P1Z5" />
            <Input label="Drug License No." defaultValue="MH/CL/123/2024" />
            <Input label="Phone" defaultValue="98765 43210" />
            <Input label="Email" defaultValue="admin@apollo.pharmacy" />
            <div className="md:col-span-2">
              <Input label="Address" defaultValue="123 MG Road, Bandra West, Mumbai 400050" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Refer & Earn */}
        <Card className="p-5">
          <div className="rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 p-5 text-white">
            <Gift className="w-8 h-8 mb-3" />
            <h3 className="font-bold text-lg">Refer & Earn</h3>
            <p className="text-sm text-accent-100 mt-1">Invite pharmacy friends and earn 3 months free per referral.</p>
            <div className="mt-4 p-3 bg-white/15 backdrop-blur rounded-lg flex items-center justify-between">
              <span className="text-sm font-mono">APOLLO-REF-8X42</span>
              <button className="p-1.5 hover:bg-white/20 rounded"><Share2 className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-accent-100">Referrals joined</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-accent-100">Months earned</span>
              <span className="font-bold">6</span>
            </div>
          </div>
        </Card>

        {/* Staff Management */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" /> Staff Members
            </h3>
            <Button size="sm" variant="outline" icon={<Plus className="w-4 h-4" />}>Add Staff</Button>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Rahul Sharma', role: 'Pharmacist', phone: '9820012345', sales: 2140 },
              { name: 'Priya Singh', role: 'Cashier', phone: '9811122334', sales: 1380 },
              { name: 'Amit Patel', role: 'Assistant', phone: '9988776655', sales: 860 },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{s.name}</p>
                    <p className="text-xs text-neutral-400">{s.role} · {s.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500">{s.sales > 0 && `₹${s.sales.toLocaleString('en-IN')} sales`}</span>
                  <Badge color="blue">Active</Badge>
                  <button className="p-1.5 text-neutral-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Automation */}
        <Card className="p-5">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary-500" /> Automation
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Auto low-stock → PO', desc: 'Add to PO when below min', icon: <Package className="w-4 h-4" />, enabled: true },
              { label: 'Expiry return list', desc: 'Auto-generate return list', icon: <Clock className="w-4 h-4" />, enabled: true },
              { label: 'Refill reminders', desc: 'WhatsApp patient reminders', icon: <AlertTriangle className="w-4 h-4" />, enabled: false },
            ].map((a) => (
              <div key={a.label} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">{a.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{a.label}</p>
                    <p className="text-xs text-neutral-400">{a.desc}</p>
                  </div>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${a.enabled ? 'bg-accent-500' : 'bg-neutral-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${a.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Migration */}
        <Card className="lg:col-span-3 p-5">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary-500" /> Data Migration
          </h3>
          <p className="text-sm text-neutral-500 mb-4">Import existing pharmacy data from a CSV or Excel file. We'll guide you through column mapping.</p>
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all">
            <FileSpreadsheet className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <p className="font-medium text-neutral-700">Upload your data file</p>
            <p className="text-sm text-neutral-400 mt-1">CSV or Excel — up to 10,000 rows</p>
            <Button variant="outline" className="mt-4" icon={<Upload className="w-4 h-4" />}>Choose File</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
