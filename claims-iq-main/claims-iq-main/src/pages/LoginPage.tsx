import { useState } from 'react';
import { Brain, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { login } from '@/api';

interface Props {
  onLogin: (email: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('adjuster@claimsiq.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { email: e2 } = await login(email, password);
      onLogin(e2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-900 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #2f5fa8 0%, transparent 40%), radial-gradient(circle at 80% 70%, #3b82f6 0%, transparent 35%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 shadow-lg">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ClaimsIQ</h1>
            <p className="text-xs text-navy-300">Intelligent Claims Processing</p>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Process claims faster with AI-assisted review.
          </h2>
          <p className="mt-4 max-w-md text-navy-200">
            Track claims through every stage, surface cited evidence, and approve with
            confidence — all in one intelligent dashboard.
          </p>
          <div className="mt-8 flex gap-6">
            {[
              { label: 'Avg. faster review', value: '3.2×' },
              { label: 'Claims tracked', value: '12K+' },
              { label: 'Accuracy', value: '99.1%' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-accent-400">{s.value}</p>
                <p className="text-xs text-navy-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-navy-400">© 2026 ClaimsIQ. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500">
              <Brain size={22} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">ClaimsIQ</h1>
          </div>

          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-1.5 text-sm text-navy-300">Sign in to your claims dashboard.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy-200">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-navy-700 bg-navy-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-navy-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy-200">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-navy-700 bg-navy-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-navy-500 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-300 ring-1 ring-red-500/20 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-400 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-navy-800/60 px-3.5 py-3 text-xs text-navy-300">
            <ShieldCheck size={14} className="text-accent-400" />
            Demo mode — any valid email and password will sign you in.
          </div>
        </div>
      </div>
    </div>
  );
}
