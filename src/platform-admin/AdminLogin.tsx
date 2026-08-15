import { useState } from 'react';
import { Pill, Shield, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setStep('2fa');
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">MediCore Platform</h1>
          <p className="text-neutral-400 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl border-neutral-800 bg-neutral-800/50 backdrop-blur">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-2 text-primary-400 pb-4 border-b border-neutral-700">
                <Shield className="w-5 h-5" />
                <h2 className="font-semibold">Super Admin Access</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-600"
                  placeholder="admin@medicore.in"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-neutral-600"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full py-3 mt-4 justify-between group">
                Continue to 2FA
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-5 animate-fade-in">
               <div className="flex items-center gap-2 mb-2 text-primary-400 pb-4 border-b border-neutral-700">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-semibold">Two-Factor Authentication</h2>
              </div>
              
              <div className="text-center py-4">
                <Lock className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <div>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-mono"
                  placeholder="000000"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <Button type="submit" className="w-full py-3">Verify & Log In</Button>
                <button type="button" onClick={() => setStep('credentials')} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
