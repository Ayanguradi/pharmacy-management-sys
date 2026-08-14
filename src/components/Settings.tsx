import { useState, useEffect, useMemo } from 'react';
import {
  Settings, Building2, Users, Upload, Gift, Share2, Clock, AlertTriangle, 
  Package, FileSpreadsheet, Plus, Trash2, Smartphone, ShieldCheck, Printer, 
  FileEdit, Menu, ChevronRight, Save, LayoutGrid, CheckCircle2, ChevronDown, Check
} from 'lucide-react';
import { Card, Badge, Button, PageHeader, Input, Select } from '@/components/ui';
import { staffMembers, salesRecords, purchaseBills, salesBills } from '@/data';

const SETTINGS_GROUPS = [
  {
    label: 'BUSINESS',
    items: [
      { id: 'business-profile', label: 'Business Profile', desc: 'Manage your pharmacy contact and legal details' },
      { id: 'staff-devices', label: 'Staff & Devices', desc: 'Manage team access and connected devices' },
    ]
  },
  {
    label: 'CONFIGURATION',
    items: [
      { id: 'sale-settings', label: 'Sale Settings', desc: 'Configure defaults for billing' },
      { id: 'purchase-settings', label: 'Purchase Settings', desc: 'Configure defaults for inbound inventory' },
      { id: 'automation', label: 'Automation', desc: 'Enable smart workflows and triggers', badge: 'NEW' },
      { id: 'prefix-sequences', label: 'Prefix & Sequences', desc: 'Customize document numbering rules' },
    ]
  },
  {
    label: 'PLANS & BILLING',
    items: [
      { id: 'plans-pricing', label: 'Plans & Pricing', desc: 'Manage your subscription and usage limits' },
      { id: 'refer-earn', label: 'Refer & Earn', desc: 'Invite friends and earn free months' },
    ]
  },
  {
    label: 'UTILITIES',
    items: [
      { id: 'integrations', label: 'Integrations', desc: 'Connect third-party apps and services' },
      { id: 'data-migration', label: 'Data Migration', desc: 'Import existing data from CSV/Excel' },
      { id: 'bulk-edit', label: 'Bulk Edit Bills', desc: 'Batch update draft documents' },
      { id: 'barcode-labels', label: 'Print Barcode Labels', desc: 'Generate printable item stickers' },
    ]
  }
];

const FLATTENED_ITEMS = SETTINGS_GROUPS.flatMap(g => g.items);

export function SettingsView() {
  const [activeId, setActiveId] = useState('business-profile');
  const [isDirty, setIsDirty] = useState(false);
  
  const activeItem = FLATTENED_ITEMS.find(i => i.id === activeId) || FLATTENED_ITEMS[0];
  const activeIndex = FLATTENED_ITEMS.findIndex(i => i.id === activeId);

  // Ctrl+S Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty]);

  const handleNav = (newId: string) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Do you want to leave without saving?')) {
        return;
      }
    }
    setIsDirty(false);
    setActiveId(newId);
  };

  const handleSave = () => {
    // In a real app, dispatch to API
    setIsDirty(false);
    alert('Settings saved successfully!');
  };

  const renderContent = () => {
    switch (activeId) {
      case 'business-profile': return <BusinessProfileSection onChange={() => setIsDirty(true)} />;
      case 'staff-devices': return <StaffDevicesSection onChange={() => setIsDirty(true)} />;
      case 'sale-settings': return <SaleSettingsSection onChange={() => setIsDirty(true)} />;
      case 'purchase-settings': return <PurchaseSettingsSection onChange={() => setIsDirty(true)} />;
      case 'automation': return <AutomationSection onChange={() => setIsDirty(true)} />;
      case 'prefix-sequences': return <PrefixSequencesSection onChange={() => setIsDirty(true)} />;
      case 'plans-pricing': return <PlansPricingSection />;
      case 'refer-earn': return <ReferEarnSection />;
      case 'integrations': return <IntegrationsSection />;
      case 'data-migration': return <DataMigrationSection />;
      case 'bulk-edit': return <BulkEditSection />;
      case 'barcode-labels': return <BarcodeLabelsSection />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Mobile Nav */}
      <div className="lg:hidden mb-4">
        <label className="text-xs font-semibold text-neutral-500 mb-1 block">Navigate Settings</label>
        <Select value={activeId} onChange={(e) => handleNav(e.target.value)} className="w-full">
          {SETTINGS_GROUPS.map(g => (
            <optgroup key={g.label} label={g.label}>
              {g.items.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </optgroup>
          ))}
        </Select>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[260px] shrink-0 border-r border-neutral-200 pr-4">
          <div className="sticky top-20 space-y-6">
            {SETTINGS_GROUPS.map((group, gIdx) => (
              <div key={group.label}>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-3">{group.label}</h4>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeId === item.id 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      {item.label}
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-accent-100 text-accent-700 uppercase">{item.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
                {gIdx < SETTINGS_GROUPS.length - 1 && <div className="h-px bg-neutral-100 mt-6" />}
              </div>
            ))}
          </div>
        </aside>

        {/* Detail Panel */}
        <div className="flex-1 flex flex-col max-w-4xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">{activeItem.label}</h2>
            <p className="text-neutral-500">{activeItem.desc}</p>
          </div>
          
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Persistent Footer */}
          <div className="mt-8 pt-4 border-t border-neutral-200 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => handleNav(FLATTENED_ITEMS[activeIndex - 1].id)}
              disabled={activeIndex === 0}
            >
              ← Prev
            </Button>

            {['business-profile', 'staff-devices', 'sale-settings', 'purchase-settings', 'automation', 'prefix-sequences'].includes(activeId) && (
              <div className="flex items-center gap-3">
                {isDirty && <span className="text-sm font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Unsaved changes</span>}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 hidden sm:inline">Ctrl+S to save</span>
                  <Button onClick={handleSave} icon={<Save className="w-4 h-4"/>}>Save Changes</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Section Components
// ----------------------------------------------------------------------------

function BusinessProfileSection({ onChange }: { onChange: () => void }) {
  const [tab, setTab] = useState('Basic');
  const tabs = ['Basic', 'License', 'Taxation', 'Location', 'Timings'];

  const handleChange = () => onChange();

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex overflow-x-auto border-b border-neutral-200 hide-scrollbar">
        {tabs.map(t => (
          <button 
            key={t}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="p-5">
        {tab === 'Basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Pharmacy Name" defaultValue="Apollo Pharmacy" onChange={handleChange} />
            <Input label="Owner Name" defaultValue="Dr. Rajesh Kumar" onChange={handleChange} />
            <Input label="Phone" defaultValue="98765 43210" onChange={handleChange} />
            <Input label="Email" defaultValue="admin@apollo.pharmacy" onChange={handleChange} />
            <div className="md:col-span-2">
              <Input label="Contact Address" defaultValue="123 MG Road, Bandra West, Mumbai 400050" onChange={handleChange} />
            </div>
          </div>
        )}
        {tab === 'License' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Drug License No." defaultValue="MH/CL/123/2024" onChange={handleChange} />
            <div />
            <Input label="Issue Date" type="date" defaultValue="2024-01-10" onChange={handleChange} />
            <Input label="Expiry Date" type="date" defaultValue="2026-01-09" onChange={handleChange} />
            <div className="md:col-span-2 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <p>This expiry date is actively monitored on your Dashboard's Compliance Tracker.</p>
            </div>
          </div>
        )}
        {tab === 'Taxation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Entity Type" onChange={handleChange}>
                <option>Proprietorship</option>
                <option>Partnership</option>
                <option>Private Limited</option>
              </Select>
              <Input label="Business PAN" defaultValue="ABCDE1234F" onChange={handleChange} />
              <Input label="GSTIN" defaultValue="27ABCDE1234F1Z5" onChange={handleChange} />
              <Input label="Trade Name on GST" defaultValue="Apollo Pharmacy" onChange={handleChange} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="nongst" className="rounded text-primary-600 w-4 h-4" onChange={handleChange}/>
              <label htmlFor="nongst" className="text-sm font-medium text-neutral-700">Non-GST registered</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="comp" className="rounded text-primary-600 w-4 h-4" onChange={handleChange}/>
              <label htmlFor="comp" className="text-sm font-medium text-neutral-700">Under Composition Scheme</label>
            </div>
          </div>
        )}
        {tab === 'Location' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input label="Pharmacy Address (If different from contact)" defaultValue="" placeholder="Same as Contact Address" onChange={handleChange} />
            </div>
            <Input label="Serviceable Delivery Radius (km)" type="number" defaultValue="5" onChange={handleChange} />
            <Select label="Timezone" onChange={handleChange}>
              <option>Asia/Kolkata (IST)</option>
              <option>UTC</option>
            </Select>
          </div>
        )}
        {tab === 'Timings' && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-500 mb-2">Set your store operating hours. This is used for Dashboard greetings and shift context.</p>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-28 text-sm font-medium text-neutral-700">{day}</div>
                <Input type="time" defaultValue="09:00" className="w-32" onChange={handleChange} />
                <span className="text-neutral-400">to</span>
                <Input type="time" defaultValue={day === 'Sunday' ? '14:00' : '22:00'} className="w-32" onChange={handleChange} />
                <div className="flex items-center gap-2 ml-4">
                  <input type="checkbox" id={`closed-${day}`} className="rounded text-primary-600 w-4 h-4" onChange={handleChange}/>
                  <label htmlFor={`closed-${day}`} className="text-sm text-neutral-600">Closed</label>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StaffDevicesSection({ onChange }: { onChange: () => void }) {
  // Aggregate sales
  const staffWithSales = staffMembers.map(staff => {
    const sales = salesRecords.filter(r => r.staff === staff.name).reduce((sum, r) => sum + r.amount, 0);
    return { ...staff, sales };
  });

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2"><Users className="w-5 h-5 text-primary-500"/> Team Members</h3>
          <Button size="sm" icon={<Plus className="w-4 h-4"/>}>Add Staff</Button>
        </div>
        <div className="divide-y divide-neutral-100">
          {staffWithSales.map(s => (
            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{s.name}</p>
                  <p className="text-xs text-neutral-500">{s.role} • {s.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-800">₹{s.sales.toLocaleString()}</p>
                  <p className="text-[10px] text-neutral-400 uppercase">Period Sales</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={s.active} onChange={onChange} />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <button className="p-2 text-neutral-400 hover:text-danger-600 transition-colors rounded-lg hover:bg-danger-50"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
         <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <h3 className="font-semibold text-neutral-800 flex items-center gap-2"><Smartphone className="w-5 h-5 text-primary-500"/> Connected Devices</h3>
        </div>
        <div className="divide-y divide-neutral-100 p-4 space-y-3">
          <div className="flex justify-between items-center border border-neutral-200 p-3 rounded-lg">
            <div>
              <p className="font-medium text-sm text-neutral-800">Desktop Chrome (Windows)</p>
              <p className="text-xs text-neutral-500">IP: 192.168.1.45 • Last active: Just now</p>
            </div>
            <Badge color="green">Current Session</Badge>
          </div>
          <div className="flex justify-between items-center border border-neutral-200 p-3 rounded-lg">
            <div>
              <p className="font-medium text-sm text-neutral-800">Mobile Safari (iPhone)</p>
              <p className="text-xs text-neutral-500">IP: 112.19.44.1 • Last active: 2 hours ago</p>
            </div>
            <Button size="sm" variant="outline" className="text-danger-600 border-danger-200 hover:bg-danger-50">Revoke</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SaleSettingsSection({ onChange }: { onChange: () => void }) {
  return (
    <Card className="p-5 max-w-2xl space-y-5">
      <Select label="Default GST Rate for New Items" onChange={onChange}>
        <option>12%</option>
        <option>5%</option>
        <option>18%</option>
        <option>0%</option>
      </Select>
      
      <div>
        <label className="text-sm font-medium text-neutral-700 block mb-2">Accepted Payment Modes</label>
        <div className="flex gap-4">
          {['Cash', 'UPI', 'Card', 'Credit'].map(mode => (
            <div key={mode} className="flex items-center gap-2">
              <input type="checkbox" id={`pm-${mode}`} defaultChecked className="rounded text-primary-600 w-4 h-4" onChange={onChange}/>
              <label htmlFor={`pm-${mode}`} className="text-sm text-neutral-700">{mode}</label>
            </div>
          ))}
        </div>
      </div>

      <Select label="Default Customer Type (Walk-ins)" onChange={onChange}>
        <option>Retail</option>
        <option>Wholesale</option>
      </Select>

      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div>
          <p className="font-medium text-sm text-neutral-800">Enable Split Payments</p>
          <p className="text-xs text-neutral-500">Allow settling one bill with multiple payment methods (e.g., Cash + UPI).</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked onChange={onChange} />
          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      <Input label="Receipt Footer Text" defaultValue="Thank you for visiting Apollo Pharmacy! Wish you a speedy recovery." onChange={onChange} />
    </Card>
  );
}

function PurchaseSettingsSection({ onChange }: { onChange: () => void }) {
  return (
    <Card className="p-5 max-w-2xl space-y-5">
      <Select label="Default Payment Terms" onChange={onChange}>
        <option>Net 30</option>
        <option>Net 15</option>
        <option>Net 45</option>
        <option>Due on Receipt</option>
      </Select>
      
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <Input 
          label="Default Low-Stock Threshold" 
          type="number" 
          defaultValue="10" 
          onChange={onChange} 
        />
        <p className="text-xs text-neutral-500 mt-2">
          Items dropping below this stock level will be auto-suggested for Purchase Orders.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div>
          <p className="font-medium text-sm text-neutral-800">Assume GST inclusive for new distributors</p>
          <p className="text-xs text-neutral-500">If checked, entered purchase prices are treated as inclusive of GST by default.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" onChange={onChange} />
          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>
    </Card>
  );
}

function AutomationSection({ onChange }: { onChange: () => void }) {
  const automations = [
    { id: 'po', label: 'Auto low-stock → PO', desc: 'Wire directly to Suggested POs when stock hits minimum.', icon: <Package className="w-5 h-5"/>, enabled: true, conf: 'Thresholds' },
    { id: 'exp', label: 'Expiry return list', desc: 'Auto-generate return list for items nearing expiry.', icon: <Clock className="w-5 h-5"/>, enabled: true, conf: 'Lead Time' },
    { id: 'refill', label: 'Refill reminders', desc: 'Queue automated WhatsApp reminders based on dosage.', icon: <AlertTriangle className="w-5 h-5"/>, enabled: false, conf: 'Lead Time' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {automations.map(a => (
        <Card key={a.id} className={`p-5 border-2 transition-colors ${a.enabled ? 'border-primary-200 bg-primary-50/10' : 'border-neutral-200'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${a.enabled ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'}`}>
              {a.icon}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={a.enabled} onChange={onChange} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <h3 className="font-bold text-neutral-800 mb-1">{a.label}</h3>
          <p className="text-sm text-neutral-500 mb-4 h-10">{a.desc}</p>
          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">Configure {a.conf} →</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PrefixSequencesSection({ onChange }: { onChange: () => void }) {
  const docs = [
    { key: 'Sales Bills', prefix: 'SAL-', start: '0001', reset: 'Yearly' },
    { key: 'Purchase Bills', prefix: 'PUR-', start: '0001', reset: 'Yearly' },
    { key: 'Purchase Orders', prefix: 'PO-', start: '001', reset: 'Monthly' },
    { key: 'Purchase Returns', prefix: 'PR-', start: '001', reset: 'Yearly' },
    { key: 'Sales Returns', prefix: 'SR-', start: '001', reset: 'Yearly' },
  ];

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Document</th>
            <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Prefix</th>
            <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Starting No.</th>
            <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Reset Freq</th>
            <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Live Preview</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {docs.map(d => (
            <tr key={d.key} className="hover:bg-neutral-50">
              <td className="px-4 py-4 font-medium text-neutral-800 text-sm">{d.key}</td>
              <td className="px-4 py-2"><Input defaultValue={d.prefix} className="w-24 text-sm" onChange={onChange}/></td>
              <td className="px-4 py-2"><Input defaultValue={d.start} className="w-24 text-sm" onChange={onChange}/></td>
              <td className="px-4 py-2">
                <Select defaultValue={d.reset} className="w-28 text-sm" onChange={onChange}>
                  <option>Never</option>
                  <option>Yearly</option>
                  <option>Monthly</option>
                </Select>
              </td>
              <td className="px-4 py-4 font-mono text-sm text-neutral-500 bg-neutral-50">{d.prefix}{d.reset === 'Yearly' ? '2026-' : d.reset === 'Monthly' ? '2608-' : ''}{d.start}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function PlansPricingSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6 border-primary-200 bg-primary-50/30">
        <div className="flex justify-between items-start">
          <div>
            <Badge color="blue" className="mb-2">Current Plan</Badge>
            <h3 className="text-2xl font-bold text-neutral-900">Professional <span className="text-sm font-normal text-neutral-500">/ ₹999/mo</span></h3>
            <p className="text-sm text-neutral-600 mt-1">Renews on Oct 14, 2026.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Change Plan</Button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-primary-100 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-neutral-700">Bills this month</span>
              <span className="text-neutral-500">1,240 / 5,000</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-primary-100">
              <div className="h-full bg-primary-500" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-neutral-700">Staff Accounts</span>
              <span className="text-neutral-500">4 / 5</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-primary-100">
              <div className="h-full bg-primary-500" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReferEarnSection() {
  return (
    <div className="max-w-2xl">
      <Card className="p-6 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 text-white shadow-xl shadow-accent-900/10 border-0">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Refer & Earn</h3>
            <p className="text-accent-100 mt-1">Invite pharmacy friends. They get 1 month free, and you earn 3 months free per successful activation.</p>
            
            <div className="mt-6 p-1 pl-4 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-between border border-white/20">
              <span className="font-mono text-lg font-bold tracking-wider">APOLLO-REF-8X42</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-accent-700 rounded-lg font-bold hover:bg-accent-50 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
              <div>
                <p className="text-accent-200 text-sm font-medium mb-1">Referrals joined</p>
                <p className="text-3xl font-black">2</p>
              </div>
              <div>
                <p className="text-accent-200 text-sm font-medium mb-1">Months earned</p>
                <p className="text-3xl font-black">6</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <h4 className="font-bold text-neutral-800 mt-8 mb-4">Referral History</h4>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Pharmacy Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Date Joined</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            <tr>
              <td className="px-4 py-3 font-medium">Om Sai Medicals</td>
              <td className="px-4 py-3 text-neutral-500">Aug 10, 2026</td>
              <td className="px-4 py-3"><Badge color="green">Reward Added</Badge></td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">LifeCare Pharma</td>
              <td className="px-4 py-3 text-neutral-500">Jul 22, 2026</td>
              <td className="px-4 py-3"><Badge color="green">Reward Added</Badge></td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function IntegrationsSection() {
  const integrations = [
    { name: 'WhatsApp Business API', desc: 'Send bills and refill reminders automatically.', connected: true, icon: <MessageCircleIcon /> },
    { name: 'Dunzo Delivery', desc: 'Create delivery tasks directly from sales.', connected: false, icon: <TruckIcon /> },
    { name: 'Tally Prime', desc: 'Sync daily accounting ledgers automatically.', connected: true, icon: <CalculatorIcon /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {integrations.map(i => (
        <Card key={i.name} className="p-5 flex flex-col hover:border-primary-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i.connected ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-400'}`}>
              {i.icon}
            </div>
            {i.connected ? <Badge color="green">Connected</Badge> : <Badge color="gray">Not Connected</Badge>}
          </div>
          <h3 className="font-bold text-neutral-800 mb-1">{i.name}</h3>
          <p className="text-sm text-neutral-500 mb-6 flex-1">{i.desc}</p>
          {i.connected ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Settings</Button>
              <Button variant="outline" className="text-danger-600 hover:bg-danger-50 border-danger-200">Disconnect</Button>
            </div>
          ) : (
            <Button className="w-full">Connect</Button>
          )}
        </Card>
      ))}
    </div>
  );
}

function DataMigrationSection() {
  return (
    <div className="max-w-2xl">
      <Card className="p-8 text-center border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-primary-500">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-2">Upload your data file</h3>
        <p className="text-neutral-500 mb-6 max-w-sm mx-auto">Import Inventory, Customers, or Distributors from CSV or Excel formats (up to 10,000 rows).</p>
        <Button size="lg" icon={<Upload className="w-5 h-5"/>}>Select File</Button>
        <p className="text-xs text-neutral-400 mt-4">You will be able to map columns in the next step.</p>
      </Card>
    </div>
  );
}

function BulkEditSection() {
  const drafts = purchaseBills.filter(b => b.status === 'Draft').slice(0, 3); // using mock subset

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
         <p className="text-sm text-neutral-500">Showing <span className="font-bold text-neutral-700">{drafts.length}</span> editable Draft bills.</p>
         <Button size="sm" icon={<FileEdit className="w-4 h-4"/>}>Apply Bulk Changes</Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-neutral-300" /></th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Document</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Party</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Entry By</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Bill Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {drafts.map(d => (
              <tr key={d.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-neutral-300" /></td>
                <td className="px-4 py-3 font-medium text-primary-600">{d.billNo}</td>
                <td className="px-4 py-3">
                  <Select defaultValue={d.distributor} className="w-48 text-sm py-1.5 h-auto">
                    <option>{d.distributor}</option>
                    <option>MediSupply Distributors</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Select defaultValue={d.entryBy} className="w-32 text-sm py-1.5 h-auto">
                    <option>{d.entryBy}</option>
                    <option>Rahul Sharma</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Input type="date" defaultValue={d.billDate} className="text-sm py-1.5 h-auto w-36"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BarcodeLabelsSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-5">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input label="Search Inventory Items to Print" placeholder="Type item name..." />
          </div>
          <Button>Add to Print List</Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
          <h3 className="font-semibold text-neutral-800">Selected Items</h3>
          <p className="text-sm text-neutral-500">2 items (15 labels total)</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase">
              <th className="px-4 py-2 font-semibold">Item Name</th>
              <th className="px-4 py-2 font-semibold">Batch</th>
              <th className="px-4 py-2 font-semibold w-24">Qty to Print</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            <tr>
              <td className="px-4 py-3 font-medium text-neutral-800">Paracetamol 500mg</td>
              <td className="px-4 py-3 text-neutral-500">PC2401</td>
              <td className="px-4 py-3"><Input type="number" defaultValue="10" className="py-1 h-auto text-sm" /></td>
              <td className="px-4 py-3 text-right"><button className="text-danger-600 hover:text-danger-700 p-1"><Trash2 className="w-4 h-4"/></button></td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-neutral-800">Azithromycin 500mg</td>
              <td className="px-4 py-3 text-neutral-500">AZ2402</td>
              <td className="px-4 py-3"><Input type="number" defaultValue="5" className="py-1 h-auto text-sm" /></td>
              <td className="px-4 py-3 text-right"><button className="text-danger-600 hover:text-danger-700 p-1"><Trash2 className="w-4 h-4"/></button></td>
            </tr>
          </tbody>
        </table>
      </Card>

      <div className="flex justify-end gap-3">
        <Select className="w-48" defaultValue="A4">
          <option value="A4">Standard A4 Sheet</option>
          <option value="Thermal">Thermal Roll (50x25mm)</option>
        </Select>
        <Button icon={<Printer className="w-4 h-4"/>}>Generate PDF Preview</Button>
      </div>
    </div>
  );
}

// Mock Icons
function MessageCircleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
}
function TruckIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
}
function CalculatorIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line></svg>;
}
