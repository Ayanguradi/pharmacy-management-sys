import { useState } from 'react';
import { Pill, Phone, Lock, ArrowRight, CheckCircle2, TrendingUp, Users, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">MediCore</p>
              <p className="text-sm text-primary-200">Pharmacy Management Suite</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight">Run your pharmacy<br />smarter, not harder.</h1>
              <p className="text-primary-200 mt-4 text-lg max-w-md">Cloud-based inventory, billing, and analytics built for modern pharmacies. Start free in under 2 minutes.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: <TrendingUp className="w-5 h-5" />, text: 'Real-time sales & purchase tracking' },
                { icon: <Users className="w-5 h-5" />, text: 'Distributor management with dues tracking' },
                { icon: <ShieldCheck className="w-5 h-5" />, text: 'GST-compliant billing & reports' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">{f.icon}</div>
                  <span className="text-primary-100">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-primary-200">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-400" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-400" /> No credit card</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-800">MediCore</p>
              <p className="text-xs text-neutral-400">Pharmacy Suite</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-neutral-800">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-neutral-500 mt-1.5 text-sm">
            {mode === 'signin' ? 'Sign in to manage your pharmacy' : 'Start your 14-day free trial today'}
          </p>

          {mode === 'signup' && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-accent-600 shrink-0" />
              <p className="text-sm text-accent-700">Free for 14 days — full access, no card required.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="e.g. Apollo Pharmacy"
                  className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                />
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-600">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  Remember me
                </label>
                <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">Forgot password?</button>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 shadow-sm hover:shadow transition-all"
            >
              {mode === 'signin' ? 'Sign In' : 'Start Free Trial'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
