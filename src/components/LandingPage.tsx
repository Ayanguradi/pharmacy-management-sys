import { useState, useEffect, useRef } from 'react';
import { 
  Pill, ArrowRight, Play, Shield, CheckCircle2, ChevronRight, Menu, X,
  BarChart3, GitCompareArrows, ShieldCheck, Truck, Zap, Phone, Mail, MapPin,
  Store, Building2, Layers, Stethoscope, Star
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

// ─── Sticky Nav ──────────────────────────────────────────────────
function Nav({ onLogin, onSignup, scrolled }: { onLogin: () => void; onSignup: () => void; scrolled: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-neutral-200/60' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Pill className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-neutral-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>MediCore</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[['Features', 'features'], ['Pharmacy Types', 'pharmacy-types'], ['Pricing', 'pricing'], ['Resources', 'how-it-works']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} className={`text-sm font-medium transition-colors ${scrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-neutral-700 hover:text-neutral-900'}`}>{label}</button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-semibold text-neutral-700 hover:text-primary-700 transition-colors">Log In</button>
          <button onClick={onSignup} className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 shadow-sm hover:shadow-md transition-all">Sign Up Free</button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            {[['Features', 'features'], ['Pharmacy Types', 'pharmacy-types'], ['Pricing', 'pricing'], ['How it Works', 'how-it-works']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm font-medium text-neutral-700 py-2">{label}</button>
            ))}
            <hr className="border-neutral-200" />
            <button onClick={() => { setMobileOpen(false); onLogin(); }} className="block w-full text-left text-sm font-semibold text-neutral-700 py-2">Log In</button>
            <button onClick={() => { setMobileOpen(false); onSignup(); }} className="w-full px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg">Sign Up Free</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ────────────────────────────────────────────────
function Hero({ onSignup }: { onSignup: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice || prefersReducedMotion || windowWidth < 768) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const parallax = (depth: number) => {
    if (isTouchDevice || prefersReducedMotion) return {};
    return {
      transform: `translate(${mousePos.x * depth}px, ${mousePos.y * depth}px)`,
      transition: 'transform 0.15s ease-out',
    };
  };

  const isInteractive = !isTouchDevice && !prefersReducedMotion && windowWidth >= 768;

  return (
    <section ref={containerRef} onMouseMove={isInteractive ? handleMouseMove : undefined} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary-200/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent-200/15 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] bg-primary-300/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left – copy */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-xs font-semibold text-primary-700 mb-6">
            <Zap className="w-3.5 h-3.5" /> Now with AI-Assisted Sales Counter
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-neutral-900 leading-[1.1] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Run Your Pharmacy<br />Without the Guesswork
          </h1>
          <p className="text-lg text-neutral-600 mt-6 leading-relaxed max-w-lg">
            PO reconciliation, distributor price comparison, and compliance tracking — all in one place. Know exactly what arrived, what's due, and what needs your attention.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
            <button onClick={onSignup} className="group px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="flex items-center gap-2.5 px-5 py-3 border border-neutral-300 rounded-xl text-neutral-700 font-semibold hover:border-primary-300 hover:bg-primary-50/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center"><Play className="w-4 h-4 text-primary-700 ml-0.5" /></div>
              Watch Demo
            </button>
          </div>
          <div className="flex items-center gap-5 mt-8 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-600" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-600" /> No credit card</span>
          </div>
        </div>

        {/* Right – 3D dashboard screenshot */}
        <div className="relative hidden lg:block">
          {/* Main screenshot card */}
          <div 
            className="relative rounded-2xl border border-neutral-200/80 bg-white shadow-[0_8px_30px_-6px_rgba(15,23,42,0.12),0_20px_60px_-10px_rgba(15,23,42,0.08),0_40px_90px_-20px_rgba(15,23,42,0.05)] overflow-hidden"
            style={{
              transform: `perspective(1200px) rotateY(${-8 + mousePos.x * 2}deg) rotateX(${4 + mousePos.y * -2}deg)`,
              transition: isTouchDevice || prefersReducedMotion ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Fake browser bar */}
            <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger-400" />
                <div className="w-3 h-3 rounded-full bg-warning-400" />
                <div className="w-3 h-3 rounded-full bg-accent-400" />
              </div>
              <div className="flex-1 mx-8 bg-white rounded-md px-3 py-1 text-xs text-neutral-400 border border-neutral-200">app.medicore.in/dashboard</div>
            </div>
            {/* Dashboard preview */}
            <div className="bg-neutral-100 p-3">
              <div className="bg-white rounded-xl p-4 shadow-card space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white"><Pill className="w-4 h-4" /></div>
                  <span className="font-bold text-sm text-neutral-800">MediCore Dashboard</span>
                </div>
                {/* Stat row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Today's Sales", value: '₹24,180', color: 'text-primary-700 bg-primary-50' },
                    { label: 'Low Stock', value: '7 items', color: 'text-warning-700 bg-warning-50' },
                    { label: 'Dues', value: '₹1.2L', color: 'text-danger-700 bg-danger-50' },
                    { label: 'Bills Today', value: '34', color: 'text-accent-700 bg-accent-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-lg p-2.5 ${s.color}`}>
                      <p className="text-[9px] font-semibold uppercase opacity-70">{s.label}</p>
                      <p className="text-sm font-bold mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="bg-neutral-50 rounded-lg p-3 h-28 flex items-end justify-between gap-1">
                  {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary-400/70 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat card 1 */}
          <div 
            className="absolute -top-4 -right-8 bg-white rounded-xl p-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] border border-neutral-200/60 z-10"
            style={parallax(-6)}
          >
            <p className="text-[10px] font-semibold text-neutral-500 uppercase">Today's Sales</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-neutral-900">₹24,180</span>
              <span className="text-xs font-semibold text-accent-600">↑12%</span>
            </div>
          </div>

          {/* Floating stat card 2 */}
          <div 
            className="absolute -bottom-6 -left-10 bg-white rounded-xl p-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] border border-neutral-200/60 z-10"
            style={parallax(8)}
          >
            <p className="text-[10px] font-semibold text-neutral-500 uppercase">Fulfillment Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-neutral-900">87%</span>
              <span className="text-xs font-semibold text-primary-600">MediSupply</span>
            </div>
          </div>

          {/* Floating stat card 3 */}
          <div 
            className="absolute top-1/2 -left-14 bg-white rounded-xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] border border-neutral-200/60 z-10"
            style={parallax(-4)}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent-100 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-accent-700" /></div>
              <div>
                <p className="text-[10px] text-neutral-500 font-medium">Compliance</p>
                <p className="text-xs font-bold text-accent-700">All Clear</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile dashboard visual – flat, no 3D */}
        <div className="lg:hidden bg-white rounded-2xl border border-neutral-200 shadow-card-hover overflow-hidden">
          <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-400" />
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {[
              { label: "Today's Sales", value: '₹24,180', sub: '↑12%' },
              { label: 'Fulfillment', value: '87%', sub: 'MediSupply' },
            ].map(s => (
              <div key={s.label} className="bg-neutral-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-neutral-500 uppercase">{s.label}</p>
                <p className="text-lg font-bold text-neutral-900 mt-1">{s.value} <span className="text-xs font-medium text-accent-600">{s.sub}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Strip ─────────────────────────────────────────────────
function TrustStrip() {
  const badges = [
    { icon: <Shield className="w-4 h-4" />, text: 'GST-Ready Billing' },
    { icon: <MapPin className="w-4 h-4" />, text: 'Data Hosted in India' },
    { icon: <ShieldCheck className="w-4 h-4" />, text: 'Bank-Grade Encryption' },
    { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Schedule H1 Compliant' },
  ];
  return (
    <section className="py-8 border-y border-neutral-200 bg-neutral-50/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {badges.map(b => (
            <div key={b.text} className="flex items-center gap-2 text-neutral-500">
              <span className="text-primary-500">{b.icon}</span>
              <span className="text-sm font-medium">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pharmacy Type Segmentation ──────────────────────────────────
function PharmacyTypes() {
  const types = [
    { icon: <Store className="w-7 h-7" />, title: 'Retail Pharmacy', desc: '1–2 locations, small team', color: 'bg-primary-50 text-primary-600' },
    { icon: <Building2 className="w-7 h-7" />, title: 'Pharmacy Chain', desc: '3+ locations, centralized ops', color: 'bg-accent-50 text-accent-600' },
    { icon: <Layers className="w-7 h-7" />, title: 'Large-Volume Pharmacy', desc: 'High throughput, bulk billing', color: 'bg-warning-50 text-warning-600' },
    { icon: <Stethoscope className="w-7 h-7" />, title: 'Clinical Pharmacy', desc: 'Hospital-attached, compliance-heavy', color: 'bg-danger-50 text-danger-600' },
  ];
  return (
    <section id="pharmacy-types" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Built for Every Kind of Pharmacy</h2>
          <p className="text-neutral-500 mt-4">Whether you're a single storefront or a growing chain, MediCore adapts to how you work.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {types.map(t => (
            <div key={t.title} className="group p-6 rounded-2xl border border-neutral-200 hover:border-primary-200 hover:shadow-card-hover transition-all cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl ${t.color} flex items-center justify-center mb-5`}>{t.icon}</div>
              <h3 className="font-bold text-neutral-800 text-lg mb-1">{t.title}</h3>
              <p className="text-sm text-neutral-500 mb-4">{t.desc}</p>
              <span className="text-sm font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">See how it fits <ChevronRight className="w-4 h-4" /></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Highlights ──────────────────────────────────────────
function Features() {
  const features = [
    {
      title: 'Compare Prices Across Distributors',
      desc: "See who offers the best price and fulfillment score for every item — side by side. Stop overpaying because you didn't check.",
      bullets: ['Lowest price highlighted', 'Best-value recommendation', 'Historical pricing trends'],
      visual: 'compare',
    },
    {
      title: 'Catch Every Delivery Mismatch',
      desc: 'Know instantly if what arrived matches what you ordered. PO reconciliation flags quantity, batch, and pricing discrepancies before you finalize.',
      bullets: ['Auto-match PO to bill', 'Line-item diff view', 'One-click acceptance'],
      visual: 'reconciliation',
    },
    {
      title: 'Compliance, Not an Afterthought',
      desc: 'Drug license renewal, GSTR-3B filing deadlines, Schedule H1 register — tracked on your dashboard, not buried in a settings page.',
      bullets: ['License expiry alerts', 'GST filing tracker', 'Audit-ready records'],
      visual: 'compliance',
    },
    {
      title: 'Know Which Distributor Actually Delivers',
      desc: 'Fulfillment scores let you pick distributors who ship on time and ship complete, not just whoever quotes lowest.',
      bullets: ['Completion rate', 'On-time delivery %', 'Dispute history'],
      visual: 'fulfillment',
    },
  ];

  const miniVisuals: Record<string, React.ReactNode> = {
    compare: (
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-card space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Price Comparison</p>
        {[
          { name: 'MediSupply', price: '₹18.00', tag: 'Best Value', tagColor: 'bg-primary-100 text-primary-700' },
          { name: 'PharmaCorp', price: '₹17.50', tag: 'Lowest', tagColor: 'bg-accent-100 text-accent-700' },
          { name: 'Alkem Dist.', price: '₹19.00', tag: '', tagColor: '' },
        ].map(d => (
          <div key={d.name} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="text-sm font-medium text-neutral-700">{d.name}</span>
            <div className="flex items-center gap-2">
              {d.tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.tagColor}`}>{d.tag}</span>}
              <span className="text-sm font-bold text-neutral-900">{d.price}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    reconciliation: (
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-card">
        <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">PO Reconciliation</p>
        <div className="space-y-2">
          {[
            { item: 'Paracetamol 500mg', ordered: 100, received: 100, match: true },
            { item: 'Azithromycin', ordered: 50, received: 45, match: false },
          ].map(r => (
            <div key={r.item} className={`p-2.5 rounded-lg border ${r.match ? 'border-accent-200 bg-accent-50/50' : 'border-warning-200 bg-warning-50/50'}`}>
              <p className="text-sm font-medium text-neutral-800">{r.item}</p>
              <div className="flex gap-4 mt-1 text-xs">
                <span className="text-neutral-500">Ordered: <b>{r.ordered}</b></span>
                <span className={r.match ? 'text-accent-700' : 'text-warning-700'}>Received: <b>{r.received}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    compliance: (
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-card">
        <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Compliance Tracker</p>
        <div className="space-y-2.5">
          {[
            { label: 'Drug License Renewal', status: 'Due in 45 days', color: 'text-warning-700 bg-warning-50 border-warning-200' },
            { label: 'GSTR-3B Filing', status: 'On time', color: 'text-accent-700 bg-accent-50 border-accent-200' },
            { label: 'Schedule H1 Register', status: 'Updated', color: 'text-accent-700 bg-accent-50 border-accent-200' },
          ].map(c => (
            <div key={c.label} className={`p-2.5 rounded-lg border ${c.color}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{c.label}</span>
                <span className="text-xs font-bold">{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    fulfillment: (
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-card">
        <p className="text-xs font-semibold text-neutral-500 uppercase mb-3">Distributor Scores</p>
        <div className="space-y-3">
          {[
            { name: 'MediSupply', comp: 98, onTime: 95 },
            { name: 'PharmaCorp', comp: 85, onTime: 82 },
          ].map(d => (
            <div key={d.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">{d.name}</span>
                <span className="text-xs font-bold text-primary-700">{Math.round((d.comp + d.onTime) / 2)}%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(d.comp + d.onTime) / 2}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <section id="features" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Features That Actually Differentiate</h2>
          <p className="text-neutral-500 mt-4">Not another "inventory + billing" checklist. These are the tools you won't find in other pharmacy software.</p>
        </div>

        <div className="space-y-20">
          {features.map((f, idx) => (
            <div key={f.title} className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-16`}>
              {/* Text side */}
              <div className="flex-1 max-w-lg">
                <h3 className="text-2xl font-bold text-neutral-900 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">{f.desc}</p>
                <ul className="space-y-2.5">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-accent-600 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visual side */}
              <div className="flex-1 w-full max-w-md">
                {miniVisuals[f.visual]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '1', title: 'Set up your pharmacy profile', desc: 'Add your business details, license info, and GST configuration in under 5 minutes.' },
    { num: '2', title: 'Add your inventory & distributors', desc: 'Import via CSV or add manually. We auto-suggest packaging and pricing.' },
    { num: '3', title: 'Start billing — we handle the rest', desc: 'Smart billing, auto stock updates, compliance tracking, and analytics from day one.' },
  ];
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Up and Running in 3 Steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div key={s.num} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-neutral-200" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary-500/20 mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.num}</div>
                <h3 className="font-bold text-neutral-800 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 max-w-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof ────────────────────────────────────────────────
function SocialProof() {
  const testimonials = [
    { name: 'Apollo Pharmacy, Bandra', owner: 'Dr. Rajesh Kumar', quote: 'The distributor price comparison alone saved us ₹12,000 in the first month. We were overpaying on 30% of our regular orders.', metric: '₹12K/mo saved' },
    { name: 'LifeCare Medicals, Pune', owner: 'Anita Deshmukh', quote: 'PO reconciliation catches mismatches we used to miss entirely. Last month it flagged 4 short-deliveries before we paid.', metric: '4 errors caught' },
    { name: 'MedPlus Outlet, Hyderabad', owner: 'Suresh Reddy', quote: 'My billing time dropped dramatically. The refill reminder system brought back 15 customers who would have gone elsewhere.', metric: '40% faster billing' },
  ];
  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>What Pharmacy Owners Say</h2>
          <p className="text-sm text-neutral-400 mt-2 italic">Early adopter feedback — published with permission.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-card-hover transition-shadow">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-warning-400 fill-warning-400" />)}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="pt-4 border-t border-neutral-100 flex justify-between items-end">
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{t.owner}</p>
                  <p className="text-xs text-neutral-500">{t.name}</p>
                </div>
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">{t.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────
function Pricing({ onSignup }: { onSignup: () => void }) {
  const plans = [
    {
      name: 'Starter', price: '₹499', period: '/month', desc: 'For single-store pharmacies getting started.',
      features: ['1 store location', 'Up to 2,000 bills/mo', '2 staff accounts', 'Basic reports', 'WhatsApp billing'],
      popular: false,
    },
    {
      name: 'Growth', price: '₹999', period: '/month', desc: 'For growing pharmacies that need more power.',
      features: ['Up to 3 locations', 'Up to 5,000 bills/mo', '5 staff accounts', 'Advanced analytics', 'PO reconciliation', 'Distributor comparison', 'Priority support'],
      popular: true,
    },
    {
      name: 'Chain', price: '₹2,499', period: '/month', desc: 'For pharmacy chains with centralized operations.',
      features: ['Unlimited locations', 'Unlimited bills', 'Unlimited staff', 'All Growth features', 'API access', 'Dedicated account manager', 'Custom integrations'],
      popular: false,
    },
  ];
  return (
    <section id="pricing" className="py-20 bg-white mb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Simple, Transparent Pricing</h2>
          <p className="text-neutral-500 mt-4">All plans include a 14-day free trial. No credit card required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
          {plans.map(p => (
            <div key={p.name} className={`relative rounded-2xl p-6 border-2 flex flex-col ${p.popular ? 'border-primary-500 shadow-xl shadow-primary-500/10 bg-white md:-mt-4 md:pb-10' : 'border-neutral-200 bg-white'}`}>
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">Most Popular</div>
              )}
              <h3 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.price}</span>
                <span className="text-neutral-500 text-sm">{p.period}</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2 mb-6">{p.desc}</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-accent-600 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onSignup}
                className={`w-full py-3 font-semibold rounded-xl transition-all ${p.popular ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'}`}
              >
                Start Free Trial
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────
function FinalCTA({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-400 rounded-full blur-[80px]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Ready to Run a Sharper Pharmacy?</h2>
        <p className="text-primary-100 mt-4 text-lg">Join pharmacies that stopped guessing and started knowing.</p>
        <button onClick={onSignup} className="mt-8 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 shadow-xl hover:shadow-2xl transition-all text-lg">
          Start Free Trial
        </button>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────
function Footer() {
  const columns = [
    { title: 'Product', links: ['Features', 'Pricing', 'Pharmacy Types', 'Changelog'] },
    { title: 'Company', links: ['About', 'Contact', 'Careers'] },
    { title: 'Support', links: ['Help Center', 'FAQs', 'Status'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
  ];
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>MediCore</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">Cloud-based pharmacy management built for modern Indian pharmacies.</p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> hello@medicore.in</div>
              <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5" /> 123 MG Road, Bandra West, Mumbai 400050</div>
            </div>
          </div>
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wide">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">© 2026 MediCore Pharmacy Solutions Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* Social icons placeholder — add when accounts exist */}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Landing Page Composition ───────────────────────────────
export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Nav onLogin={onLogin} onSignup={onSignup} scrolled={scrolled} />
      <Hero onSignup={onSignup} />
      <TrustStrip />
      <PharmacyTypes />
      <Features />
      <HowItWorks />
      <SocialProof />
      <Pricing onSignup={onSignup} />
      <FinalCTA onSignup={onSignup} />
      <Footer />
    </div>
  );
}
