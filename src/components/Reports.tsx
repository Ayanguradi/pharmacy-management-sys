import { useState, useMemo, useEffect } from 'react';
import {
  FileBarChart, Search, Star, Clock, Calendar, Download, Mail, Printer, HelpCircle,
  Plus, CheckSquare, Square, X, ChevronRight, Settings2, Trash2, ArrowLeft, GripVertical
} from 'lucide-react';
import { reportTemplates, savedRecipientLists, reportSchedules } from '@/data';
import type { ReportTemplate, ReportCategory, ReportSchedule } from '@/types';
import { Button, Card, Badge, Modal, Input } from '@/components/ui';
import { format } from 'date-fns';

interface ReportsProps {
  selectedBranchId: string;
}

const TABS: ReportCategory[] | 'Starred' | 'Recently Viewed'[] = [
  'Starred', 'Recently Viewed', 'Sales', 'Stock', 'Purchase', 
  'Payments', 'GST', 'Party', 'Order', 'Staff & Expenses', 'Custom Reports'
];

export function Reports({ selectedBranchId }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<string>('Starred');
  const [search, setSearch] = useState('');
  const [starredIds, setStarredIds] = useState<Set<string>>(() => new Set(reportTemplates.filter(r => r.isStarred).map(r => r.id)));
  const [recentlyViewed, setRecentlyViewed] = useState<{id: string, viewedAt: number}[]>([]);
  const [viewingReport, setViewingReport] = useState<ReportTemplate | null>(null);
  const [buildingReport, setBuildingReport] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStarred = new Set(starredIds);
    if (newStarred.has(id)) {
      newStarred.delete(id);
    } else {
      newStarred.add(id);
    }
    setStarredIds(newStarred);
  };

  const handleViewReport = (report: ReportTemplate) => {
    setViewingReport(report);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== report.id);
      return [{ id: report.id, viewedAt: Date.now() }, ...filtered].slice(0, 8);
    });
  };

  if (buildingReport) {
    return <ReportBuilder onBack={() => setBuildingReport(false)} onSave={() => setBuildingReport(false)} />;
  }

  if (viewingReport) {
    return (
      <>
        <ReportViewer 
          report={viewingReport} 
          selectedBranchId={selectedBranchId}
          onBack={() => setViewingReport(null)}
          onExport={() => setExportModalOpen(true)}
          onSchedule={() => setScheduleModalOpen(true)}
        />
        <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} onPrint={() => alert('Opening print preview...')} />
        <ScheduleModal open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} report={viewingReport} />
      </>
    );
  }

  // Filter reports for the list
  const visibleReports = useMemo(() => {
    let list = reportTemplates;

    if (activeTab === 'Starred') {
      list = list.filter(r => starredIds.has(r.id));
    } else if (activeTab === 'Recently Viewed') {
      const recentIds = recentlyViewed.map(rv => rv.id);
      list = list.filter(r => recentIds.includes(r.id)).sort((a, b) => {
         const aTime = recentlyViewed.find(rv => rv.id === a.id)?.viewedAt || 0;
         const bTime = recentlyViewed.find(rv => rv.id === b.id)?.viewedAt || 0;
         return bTime - aTime;
      });
    } else if (activeTab === 'Custom Reports') {
      list = list.filter(r => r.isCustom);
    } else {
      list = list.filter(r => r.category === activeTab);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }

    return list;
  }, [activeTab, search, starredIds, recentlyViewed]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Business Reports</h1>
          <p className="text-neutral-500 text-sm mt-1">View, filter, and export reports across every module.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1.5 transition-colors">
            <HelpCircle className="w-4 h-4" /> How to View Reports?
          </button>
          <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors" title="Scheduled Reports">
             <Clock className="w-5 h-5" />
             {reportSchedules.length > 0 && (
               <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white" />
             )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-neutral-200">
        {(TABS as string[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-700' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={`Search in ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        {activeTab === 'Custom Reports' && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setBuildingReport(true)}>New Custom Report</Button>
        )}
      </div>

      {/* List */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {visibleReports.map(report => (
            <div 
              key={report.id} 
              onClick={() => handleViewReport(report)}
              className="flex items-center gap-4 p-4 hover:bg-neutral-50 cursor-pointer transition-colors group"
            >
              <button 
                onClick={(e) => toggleStar(report.id, e)}
                className={`p-1.5 rounded-lg transition-colors ${starredIds.has(report.id) ? 'text-amber-400 hover:bg-amber-50' : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'}`}
              >
                <Star className={`w-5 h-5 ${starredIds.has(report.id) ? 'fill-current' : ''}`} />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-neutral-900 truncate">{report.name}</h3>
                  {activeTab === 'Starred' || activeTab === 'Recently Viewed' ? (
                    <Badge color="gray">{report.category}</Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span className="truncate">{report.description}</span>
                  {report.availableFilters.length > 0 && (
                    <span className="flex items-center gap-1 text-primary-600 font-medium">
                      <Settings2 className="w-3 h-3" />
                      Filter by: {report.availableFilters.map(f => f.label).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              
              {activeTab === 'Recently Viewed' && (
                <div className="text-xs text-neutral-400 whitespace-nowrap hidden sm:block">
                  Viewed recently
                </div>
              )}
              
              <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 transition-colors" />
            </div>
          ))}

          {visibleReports.length === 0 && (
            <div className="p-12 text-center text-neutral-400">
              <FileBarChart className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="font-medium text-neutral-600">No reports found.</p>
              <p className="text-sm mt-1">Try adjusting your search or switching tabs.</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Modals placed here for when they are triggered from ReportViewer later, though they'll actually be inside ReportViewer for scope, or hoisted here. Let's hoist for cleanliness if needed, but better inside Viewer. */}
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function FilterPanel({ filters, applied, onApply, onClose }: any) {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(applied);

  // Keyboard shortcut to apply
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        onApply(localFilters);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localFilters, onApply, onClose]);

  return (
    <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden animate-fade-in">
      <div className="p-3 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
        <h4 className="font-semibold text-neutral-800 text-sm">Filters</h4>
        <div className="flex gap-2 text-xs">
          <button className="text-neutral-500 hover:text-neutral-900" onClick={() => setLocalFilters({})}>Clear</button>
        </div>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto space-y-4">
        {filters.length === 0 && <p className="text-sm text-neutral-400">No filters available for this report.</p>}
        {filters.map((f: any) => (
          <div key={f.id} className="space-y-2">
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">{f.label}</label>
            {f.type === 'date-range' ? (
              <select 
                className="w-full text-sm border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={localFilters[f.id] || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, [f.id]: e.target.value })}
              >
                <option value="">Any Date</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="custom">Custom Range...</option>
              </select>
            ) : f.type === 'multi-select' ? (
              <div className="border border-neutral-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
                {/* Searchable checkbox list placeholder */}
                <div className="relative mb-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                  <input type="text" placeholder="Search..." className="w-full pl-7 pr-2 py-1 text-xs border border-neutral-200 rounded bg-neutral-50" />
                </div>
                {['Option A', 'Option B', 'Option C'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" className="rounded border-neutral-300 text-primary-600" /> {opt}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
        <span className="text-xs text-neutral-400">Press <kbd className="font-mono bg-white px-1 border rounded shadow-sm">F2</kbd> to apply</span>
        <Button size="sm" onClick={() => onApply(localFilters)}>Apply Filters</Button>
      </div>
    </div>
  );
}

function ReportViewer({ report, selectedBranchId, onBack, onExport, onSchedule }: any) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const totalPages = 3; // Mock pagination

  return (
    <div className="space-y-4">
      {/* Viewer Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </button>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-neutral-900">{report.name}</h2>
             {report.isCustom && <Badge color="purple">Custom</Badge>}
          </div>
          <p className="text-sm text-neutral-500 mt-1">{report.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Button variant="outline" icon={<Settings2 className="w-4 h-4" />} onClick={() => setFilterOpen(!filterOpen)}>
              Filters {Object.keys(appliedFilters).length > 0 && <span className="ml-1 w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs">{Object.keys(appliedFilters).length}</span>}
            </Button>
            {filterOpen && (
              <FilterPanel 
                filters={report.availableFilters} 
                applied={appliedFilters} 
                onApply={(f: any) => { setAppliedFilters(f); setFilterOpen(false); }} 
                onClose={() => setFilterOpen(false)} 
              />
            )}
          </div>
          <Button variant="outline" onClick={onSchedule} icon={<Clock className="w-4 h-4" />}>Schedule</Button>
          <Button onClick={onExport} icon={<Download className="w-4 h-4" />}>Export / Print</Button>
        </div>
      </div>

      {/* Data Preview */}
      <Card className="p-0 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-xs font-semibold sticky top-0">
              <tr>
                {selectedBranchId === 'all' && <th className="px-6 py-3 whitespace-nowrap">Branch</th>}
                {(report.columns?.length ? report.columns : [{id: 'col1', label: 'Sample Column'}]).map((col: any) => (
                  <th key={col.id} className="px-6 py-3 whitespace-nowrap">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {/* Mock Rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
                <tr key={row} className="hover:bg-neutral-50">
                  {selectedBranchId === 'all' && <td className="px-6 py-3 font-medium text-neutral-700">Andheri Branch</td>}
                  {(report.columns?.length ? report.columns : [{id: 'col1'}]).map((col: any) => (
                    <td key={col.id} className="px-6 py-3 text-neutral-600">Sample Data {row}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
           <span className="text-sm text-neutral-500">Showing 1 to 10 of 30 entries</span>
           <div className="flex gap-1">
             <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-neutral-300 rounded bg-white text-sm disabled:opacity-50 hover:bg-neutral-50">Prev</button>
             <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-neutral-300 rounded bg-white text-sm disabled:opacity-50 hover:bg-neutral-50">Next</button>
           </div>
        </div>
      </Card>

      <ExportModal open={true} onClose={() => {}} /> {/* Hoisted dynamically in parent later, this is just for reference structure, but wait, let's put modals in parent */}
    </div>
  );
}

function ExportModal({ open, onClose, onPrint }: any) {
  if (!open) return null;
  const [mode, setMode] = useState<'select' | 'email'>('select');

  return (
    <Modal open={open} onClose={onClose} title={mode === 'select' ? "Export Report" : "Send via Email"} maxWidth="md">
      {mode === 'select' ? (
        <div className="space-y-2">
          <ExportOption icon={<Download className="w-5 h-5 text-blue-600" />} title="To PDF Format" desc="Download as a formatted, read-only PDF document." onClick={() => onClose()} />
          <ExportOption icon={<Download className="w-5 h-5 text-green-600" />} title="To XLS Format" desc="Download as an Excel spreadsheet for data analysis." onClick={() => onClose()} />
          <ExportOption icon={<Mail className="w-5 h-5 text-purple-600" />} title="Send via Email" desc="Email the report directly to staff or management." onClick={() => setMode('email')} />
          <ExportOption icon={<Printer className="w-5 h-5 text-neutral-600" />} title="Print Report" desc="Open print preview to print directly." onClick={onPrint} />
          
          <div className="pt-4 mt-4 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-400">
            <span>To Select — <kbd className="font-mono">Arrow Keys</kbd></span>
            <span>To Open — <kbd className="font-mono">Enter</kbd></span>
            <span>Close — <kbd className="font-mono">Esc</kbd></span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setMode('select')} className="text-sm text-neutral-500 hover:text-neutral-900 mb-2 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back</button>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">To</label>
            <div className="relative">
              <input type="text" placeholder="Search saved lists or type email..." className="w-full pl-3 pr-10 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-800 text-xs font-medium">Save List</button>
            </div>
            {/* Quick select pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {savedRecipientLists.map(list => (
                <button key={list.id} className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700 rounded-full transition-colors">{list.name}</button>
              ))}
            </div>
          </div>
          
          <Input label="Subject" defaultValue="Business Report attached from MediCore" />
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Message (optional)</label>
            <textarea rows={3} className="w-full p-3 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" placeholder="Add a note..."></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button icon={<Mail className="w-4 h-4" />}>Send Email</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ExportOption({ icon, title, desc, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-start gap-4 p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group">
      <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900">{title}</h4>
        <p className="text-sm text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function ScheduleModal({ open, onClose, report }: any) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Schedule: ${report?.name || 'Report'}`} maxWidth="md">
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg text-sm flex gap-2">
          <Clock className="w-5 h-5 shrink-0" />
          <p>This report will run automatically using the <strong>currently applied filters</strong> (e.g. "This Month") at the time of execution.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Frequency</label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Format</label>
            <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option>PDF Document</option>
              <option>Excel (XLS)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Send To (Saved Lists)</label>
          <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select a recipient group...</option>
            {savedRecipientLists.map(list => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button icon={<CheckSquare className="w-4 h-4" />}>Save Schedule</Button>
        </div>
      </div>
    </Modal>
  );
}

function ReportBuilder({ onBack, onSave }: any) {
  const [step, setStep] = useState(1);
  const [report, setReport] = useState({
    name: '',
    dataSource: '',
    columns: [] as string[],
    filters: [] as string[],
    groupBy: ''
  });

  const dataSources = ['Sales', 'Purchases', 'Inventory', 'Distributors', 'Customers', 'Staff', 'Expenses'];
  const mockColumns = ['Date', 'Bill No', 'Patient/Distributor Name', 'Amount', 'Item Name', 'Quantity', 'Status', 'Branch'];
  const mockFilters = ['Date Range', 'Category', 'Distributor', 'Customer', 'Branch'];

  const toggleSelection = (list: string[], item: string, setList: (v: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </button>
          <h2 className="text-2xl font-bold text-neutral-900">Custom Report Builder</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={onSave} disabled={!report.name || !report.dataSource || report.columns.length === 0}>Save Report</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Wizard Steps */}
        <div className="w-full md:w-64 shrink-0 space-y-2 flex md:block overflow-x-auto">
          {[
            { s: 1, title: 'Data Source', desc: 'Select base module' },
            { s: 2, title: 'Columns', desc: 'Select data fields' },
            { s: 3, title: 'Filters', desc: 'Add filter controls' },
            { s: 4, title: 'Grouping & Save', desc: 'Finalize report' }
          ].map(st => (
            <div 
              key={st.s} 
              onClick={() => setStep(st.s)}
              className={`p-3 rounded-xl border cursor-pointer transition-all whitespace-nowrap md:whitespace-normal flex-1 md:flex-none min-w-[150px] ${step === st.s ? 'border-primary-500 bg-primary-50 shadow-sm' : step < st.s ? 'border-neutral-200 opacity-60' : 'border-neutral-200 bg-white hover:border-primary-300'}`}
            >
              <div className="text-xs font-bold text-primary-600 mb-0.5">Step {st.s}</div>
              <div className="font-semibold text-neutral-900 text-sm">{st.title}</div>
              <div className="text-xs text-neutral-500 hidden md:block">{st.desc}</div>
            </div>
          ))}
        </div>

        {/* Wizard Content */}
        <Card className="flex-1 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b border-neutral-100 pb-2">Select Data Source</h3>
              <div className="grid grid-cols-2 gap-3">
                {dataSources.map(ds => (
                  <button 
                    key={ds}
                    onClick={() => { setReport({ ...report, dataSource: ds }); setStep(2); }}
                    className={`p-4 border rounded-xl text-left transition-colors ${report.dataSource === ds ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-primary-300'}`}
                  >
                    <div className="font-semibold text-neutral-900">{ds}</div>
                    <div className="text-xs text-neutral-500 mt-1">Base data from {ds.toLowerCase()} module</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b border-neutral-100 pb-2">Select Columns</h3>
              <p className="text-sm text-neutral-500 mb-4">Choose which fields to display in the report table.</p>
              <div className="space-y-2">
                {mockColumns.map(col => (
                  <label key={col} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${report.columns.includes(col) ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab" />
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-primary-600 w-4 h-4"
                      checked={report.columns.includes(col)}
                      onChange={() => toggleSelection(report.columns, col, (v) => setReport({...report, columns: v}))}
                    />
                    <span className="font-medium text-sm text-neutral-700">{col}</span>
                  </label>
                ))}
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={() => setStep(3)} disabled={report.columns.length === 0}>Next Step</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b border-neutral-100 pb-2">Select Filters</h3>
              <p className="text-sm text-neutral-500 mb-4">Choose which filters will be available when running this report.</p>
              <div className="grid grid-cols-2 gap-3">
                {mockFilters.map(f => (
                  <label key={f} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${report.filters.includes(f) ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    <input 
                      type="checkbox" 
                      className="rounded border-neutral-300 text-primary-600 w-4 h-4"
                      checked={report.filters.includes(f)}
                      onChange={() => toggleSelection(report.filters, f, (v) => setReport({...report, filters: v}))}
                    />
                    <span className="font-medium text-sm text-neutral-700">{f}</span>
                  </label>
                ))}
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={() => setStep(4)}>Next Step</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-semibold border-b border-neutral-100 pb-2">Finalize Report</h3>
              
              <Input 
                label="Report Name" 
                placeholder="e.g. Monthly Sales by Item" 
                value={report.name} 
                onChange={(e) => setReport({...report, name: e.target.value})} 
              />
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Group By (Optional)</label>
                <select 
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-primary-500"
                  value={report.groupBy}
                  onChange={(e) => setReport({...report, groupBy: e.target.value})}
                >
                  <option value="">None (Flat List)</option>
                  {report.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-xs text-neutral-500 mt-1">Select a column to subtotal your data by.</p>
              </div>

              {/* Mini Preview */}
              <div className="mt-8 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                <div className="p-3 border-b border-neutral-200 bg-white flex justify-between">
                  <span className="text-sm font-semibold text-neutral-700">Preview: {report.name || 'Untitled Report'}</span>
                  <span className="text-xs text-primary-600 font-medium">{report.dataSource || 'No source'}</span>
                </div>
                <div className="p-4 text-xs text-neutral-500">
                  <div className="mb-2"><strong>Columns:</strong> {report.columns.join(', ') || 'None selected'}</div>
                  <div className="mb-2"><strong>Filters:</strong> {report.filters.join(', ') || 'None selected'}</div>
                  <div><strong>Grouping:</strong> {report.groupBy || 'None'}</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
