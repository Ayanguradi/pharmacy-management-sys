import { useState, useMemo } from 'react';
import {
  TrendingUp, ShoppingCart, AlertTriangle, DollarSign, Package,
  Plus, ArrowRight, Users, Zap, Clock, IndianRupee, UserPlus, UserCheck, Calendar, ChevronDown, Box
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { AreaChart, Sparkline, DonutChart } from '@/components/charts';
import {
  weeklySales, inventoryItems, pendingPOs, distributors,
  formatCurrency,
} from '@/data';
import type { View } from '@/types';

export function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  // Global Date Filter
  const [dateRange, setDateRange] = useState('Today');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Stock Value
  const stockValue = useMemo(() => {
    return inventoryItems.reduce(
      (acc, item) => {
        acc.mrp += item.mrp * item.stock;
        acc.sales += item.salePrice * item.stock;
        acc.purchase += item.purchasePrice * item.stock;
        return acc;
      },
      { mrp: 0, sales: 0, purchase: 0 }
    );
  }, []);

  const customers = {
    total: 1240,
    new: 45,
    repeated: 1195,
    avgValue: 380,
  };

  // Expiry Data
  const [activeExpiryTab, setActiveExpiryTab] = useState<'expiring' | 'expired'>('expiring');
  const expiryData = useMemo(() => {
    const now = new Date();
    const expiring = inventoryItems.filter(item => {
      const exp = new Date(item.expiry);
      const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 180;
    }).slice(0, 5);
    
    const expired = [
      { name: 'Aspirin 75mg', category: 'Antiplatelet', stock: 8, expiry: '2023-10' },
      { name: 'Cough Syrup', category: 'Syrup', stock: 12, expiry: '2024-01' }
    ];
    return { expiring, expired };
  }, []);

  // Moving Products
  const [activeMovingTab, setActiveMovingTab] = useState<'slow' | 'fast'>('slow');
  const movingData = useMemo(() => {
    const slow = inventoryItems.slice().sort((a, b) => a.stock - b.stock).slice(0, 5).map(i => ({
      name: i.name, company: 'Generic', sold: Math.floor(Math.random() * 5), stock: i.stock, lastSold: '14 days ago'
    }));
    const fast = inventoryItems.slice().sort((a, b) => b.stock - a.stock).slice(0, 5).map(i => ({
      name: i.name, company: 'Brand', sold: Math.floor(Math.random() * 100) + 20, stock: i.stock, lastSold: 'Today'
    }));
    return { slow, fast };
  }, []);

  // Payments Due
  const [paymentsTab, setPaymentsTab] = useState<'customer' | 'distributor'>('distributor');
  const paymentsData = {
    distributor: distributors.filter(d => d.balance > 0).slice(0, 4).map(d => ({ name: d.name, amount: d.balance })),
    customer: [
      { name: 'Ramesh Patel', amount: 450 },
      { name: 'Sita Devi', amount: 1200 },
      { name: 'Kiran Rao', amount: 890 }
    ]
  };

  // Staff Tab
  const [staffTab, setStaffTab] = useState<'sales' | 'purchase'>('sales');

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Welcome back — here's what's happening at Apollo Pharmacy today.</p>
        </div>
        
        {/* Global Date Range Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-3 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-primary-300 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-primary-500" />
            {dateRange}
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>
          
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 py-2">
              {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'].map(range => (
                <button
                  key={range}
                  onClick={() => { setDateRange(range); setShowDatePicker(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${dateRange === range ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700 hover:bg-neutral-50'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Quick Actions Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'New Sale', icon: <TrendingUp className="w-5 h-5" />, view: 'sales' as View, color: 'bg-blue-50 text-blue-600' },
          { label: 'Purchases', icon: <ShoppingCart className="w-5 h-5" />, view: 'purchases' as View, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Distributors', icon: <Users className="w-5 h-5" />, view: 'distributors' as View, color: 'bg-amber-50 text-amber-600' },
          { label: 'Reports', icon: <DollarSign className="w-5 h-5" />, view: 'reports' as View, color: 'bg-red-50 text-red-600' },
          { label: 'Inventory', icon: <Package className="w-5 h-5" />, view: 'inventory' as View, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Offers', icon: <Zap className="w-5 h-5" />, view: 'offers' as View, color: 'bg-pink-50 text-pink-600' },
        ].map((action) => (
          <button key={action.label} onClick={() => onNavigate(action.view)} className="w-full">
            <Card hover className="p-4 flex flex-col items-center justify-center gap-3 h-full transition-all hover:border-primary-300 hover:shadow-md">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>{action.icon}</div>
              <span className="text-sm font-semibold text-neutral-700">{action.label}</span>
            </Card>
          </button>
        ))}
      </div>

      {/* Row 2: Urgent Attention & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Attractive Stock Value (Moved to Row 2, Col 1) */}
        <Card className="p-6 shadow-sm border-0 bg-gradient-to-br from-indigo-900 to-indigo-700 text-white relative overflow-hidden h-full flex flex-col">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-indigo-100 mb-8 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-300"/> Total Stock Value
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">MRP Total</span>
                <span className="text-xl font-bold text-white">{formatCurrency(stockValue.mrp)}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 pl-3">
                <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Sales Price</span>
                <span className="text-base font-semibold text-emerald-300">{formatCurrency(stockValue.sales)}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 pl-3">
                <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Purchase Price</span>
                <span className="text-base font-semibold text-blue-300">{formatCurrency(stockValue.purchase)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Purchase Orders (Pending POs) (Moved to Row 2, Col 2) */}
        <Card className="p-0 overflow-hidden shadow-sm flex flex-col h-full border border-neutral-200">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
            <h3 className="font-bold text-neutral-800 flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-500" /> PurchaseOrder
            </h3>
            <button onClick={() => onNavigate('purchases')} className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-5 flex-1 bg-white space-y-5">
            {pendingPOs.slice(0,3).map((po) => (
              <div key={po.poNo} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">{po.poNo}</p>
                  <p className="text-xs text-neutral-400 font-medium">{po.distributor}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  po.status === 'Received' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {po.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payments Due (Moved to Row 2, Col 3) */}
        <Card className="p-0 overflow-hidden shadow-sm flex flex-col h-full border border-neutral-200">
          <div className="p-5 border-b border-neutral-100 bg-white">
            <h3 className="font-bold text-neutral-800 mb-4">Payments Due</h3>
            <div className="flex bg-neutral-100/70 p-1 rounded-lg">
              <button 
                className={`flex-1 text-xs font-semibold py-2 rounded-md transition-all ${paymentsTab === 'customer' ? 'bg-white shadow text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => setPaymentsTab('customer')}
              >Customer Due</button>
              <button 
                className={`flex-1 text-xs font-semibold py-2 rounded-md transition-all ${paymentsTab === 'distributor' ? 'bg-white shadow text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => setPaymentsTab('distributor')}
              >Distributor Due</button>
            </div>
          </div>
          <div className="p-5 flex-1 bg-neutral-50/30">
            <div className="space-y-4">
              {(paymentsTab === 'customer' ? paymentsData.customer : paymentsData.distributor).map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${paymentsTab === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{p.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">{paymentsTab === 'customer' ? 'To Receive' : 'To Pay'}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${paymentsTab === 'customer' ? 'text-emerald-600' : 'text-danger-600'}`}>
                    {paymentsTab === 'distributor' ? '-' : '+'}{formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
              {paymentsData[paymentsTab].length === 0 && <p className="text-sm text-neutral-400 text-center py-4">No dues pending.</p>}
            </div>
          </div>
        </Card>

      </div>

      {/* Row 3: Performance & Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Weekly Sales Trend (New AreaChart) */}
        <Card className="lg:col-span-2 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-800">Weekly Sales Trend</h3>
            <Badge color="green" className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3"/> Live</span>
            </Badge>
          </div>
          <div className="flex-1 min-h-[240px]">
             {/* <AreaChart data={weeklySales.map((d) => ({ label: d.day, value: d.sales, secondary: d.purchases }))} height={240} /> */}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <span className="flex items-center gap-2 text-sm font-medium text-indigo-500">
              <span className="w-3 h-3 border-2 border-indigo-500 rounded-full bg-white"/> Purchases
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-500">
              <span className="w-3 h-3 border-2 border-emerald-500 rounded-full bg-white"/> Sales
            </span>
          </div>
        </Card>

        {/* Small Profit Chart / Stats */}
        <Card className="p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">Profit <span className="text-xs text-neutral-400 font-normal">Today</span></h3>
            <span className="text-emerald-500 font-bold">-</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-black text-neutral-900 tracking-tight">₹297.73</span>
            </div>
            <p className="text-xs font-medium text-neutral-400">from ₹0.00 yesterday</p>
          </div>
          
          <div className="mt-auto pt-6 relative z-10">
             <div className="mb-4">
               {/* Fixed Sparkline mapping */}
               {/* <Sparkline data={[120, 150, 140, 200, 180, 263]} color="#5b50f7" height={40}/> */}
             </div>
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div><span className="text-xs font-medium text-neutral-600">Net Profit: <strong className="text-neutral-800">263</strong></span></div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span className="text-xs font-medium text-neutral-600">Average: <strong className="text-neutral-800">149</strong></span></div>
             </div>
          </div>
        </Card>
      </div>

      {/* Row 4: Inventory Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Moving Products */}
        <Card className="lg:col-span-2 p-0 overflow-hidden shadow-sm border border-neutral-200 flex flex-col h-full">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div className="flex gap-2 bg-neutral-100/70 p-1 rounded-lg">
              <button 
                className={`text-xs font-semibold px-4 py-1.5 rounded-md transition-all ${activeMovingTab === 'slow' ? 'bg-white shadow text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => setActiveMovingTab('slow')}
              >Slow Moving</button>
              <button 
                className={`text-xs font-semibold px-4 py-1.5 rounded-md transition-all ${activeMovingTab === 'fast' ? 'bg-white shadow text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => setActiveMovingTab('fast')}
              >Fast Moving</button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50/50 text-neutral-400 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Qty Sold</th>
                  <th className="px-6 py-4">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(activeMovingTab === 'slow' ? movingData.slow : movingData.fast).map((item, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-neutral-700">{item.name}</td>
                    <td className="px-6 py-4 text-neutral-500 font-medium">{item.company}</td>
                    <td className="px-6 py-4 font-bold text-neutral-700">{item.sold}</td>
                    <td className="px-6 py-4">
                      <Badge color={item.stock < 50 ? 'red' : 'green'}>{item.stock} left</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expiry Items (Moved to Row 4, Col 3) */}
        <Card className="p-0 overflow-hidden shadow-sm border border-neutral-200 flex flex-col h-full">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div className="flex gap-2 bg-neutral-100/70 p-1 rounded-lg">
              <button 
                className={`text-xs font-semibold px-4 py-1.5 flex items-center gap-2 rounded-md transition-all ${activeExpiryTab === 'expiring' ? 'bg-white shadow text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => setActiveExpiryTab('expiring')}
              >
                Expiring <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px]">{expiryData.expiring.length}</span>
              </button>
              <button 
                className={`text-xs font-semibold px-4 py-1.5 flex items-center gap-2 rounded-md transition-all ${activeExpiryTab === 'expired' ? 'bg-white shadow text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                onClick={() => setActiveExpiryTab('expired')}
              >
                Expired <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px]">{expiryData.expired.length}</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-50/50 text-neutral-400 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3 text-right">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {(activeExpiryTab === 'expiring' ? expiryData.expiring : expiryData.expired).slice(0,3).map((item, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-neutral-700">{item.name}</p>
                      <p className="text-[11px] text-neutral-400 font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${activeExpiryTab === 'expired' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {new Date(item.expiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Row 5: Team & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customers */}
        <Card className="p-6 shadow-sm flex flex-col h-full border border-neutral-200">
          <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
             <Users className="w-5 h-5 text-blue-500"/> Customer Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex flex-col justify-center">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Total</p>
              <p className="font-black text-2xl text-neutral-800">{customers.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col justify-center">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">New</p>
              <p className="font-black text-2xl text-emerald-700">{customers.new}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex flex-col justify-center">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Repeated</p>
              <p className="font-black text-2xl text-blue-700">{customers.repeated}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col justify-center">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Avg Order</p>
              <p className="font-black text-2xl text-amber-700">₹{customers.avgValue}</p>
            </div>
          </div>
        </Card>

        {/* Staff Overview */}
        <Card className="p-6 shadow-sm flex flex-col h-full border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800">Staff Performance</h3>
          </div>
          <div className="flex gap-2 border-b border-neutral-100 mb-4">
            <button 
              className={`text-xs pb-2 font-bold border-b-2 transition-all ${staffTab === 'sales' ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              onClick={() => setStaffTab('sales')}
            >Sales Team</button>
            <button 
              className={`text-xs pb-2 font-bold border-b-2 transition-all ${staffTab === 'purchase' ? 'border-primary-500 text-primary-700' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
              onClick={() => setStaffTab('purchase')}
            >Purchase Team</button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart
              segments={[
                { label: 'Rahul', value: staffTab === 'sales' ? 12 : 3, color: '#10b981' },
                { label: 'Priya', value: staffTab === 'sales' ? 8 : 5, color: '#3b82f6' },
                { label: 'Amit', value: staffTab === 'sales' ? 5 : 2, color: '#f59e0b' },
              ]}
              height={180}
            />
          </div>
        </Card>

      </div>
    </div>
  );
}
