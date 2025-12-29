'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type LoginState = 'idle' | 'submitting' | 'success' | 'error';

const FEATURES = [
  'Dispatch, riders, and routes in one place',
  'Real-time map with live status and ETAs',
  'API keys for integrations and webhooks',
  'Role-based access for managers and agents',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState<LoginState>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('saved_email');
      if (savedEmail) setEmail(savedEmail);
    }
  }, [rememberMe]);

  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem('saved_email', email);
    }
  }, [email, rememberMe]);

  const formDisabled = state === 'submitting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setState('submitting');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.');
        setState('error');
        return;
      }

      if (data.data?.api_key) {
        localStorage.setItem('api_key', data.data.api_key);
        localStorage.setItem('company_id', data.data.id);
        localStorage.setItem('company_name', data.data.name);
      }

      setState('success');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setState('error');
    }
  };

  const submitLabel = useMemo(() => {
    if (state === 'submitting') return 'Signing in...';
    if (state === 'success') return 'Redirecting...';
    return 'Sign In';
  }, [state]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,204,170,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_25%),radial-gradient(circle_at_50%_70%,rgba(14,165,233,0.1),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-teal-200 ring-1 ring-white/10">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500 font-semibold text-slate-950">T</span>
            Tookan Control Center
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Sign in to manage deliveries and live operations
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Access the dispatcher console, monitor riders on the live map, manage tasks, and control integrations with API keys and webhooks.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-200 ring-1 ring-white/10">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500 text-sm font-semibold text-slate-950">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-3xl bg-white/5 p-8 shadow-2xl shadow-teal-500/10 ring-1 ring-white/10 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Welcome back</p>
                <h2 className="text-2xl font-semibold">Sign in to dashboard</h2>
              </div>
              <Link
                href="/signup"
                className="text-sm font-medium text-teal-200 transition hover:text-teal-100"
              >
                Create account
              </Link>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  disabled={formDisabled}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-50 placeholder-slate-500 outline-none transition focus:border-teal-300/60 focus:ring-2 focus:ring-teal-400/30 disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={formDisabled}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-50 placeholder-slate-500 outline-none transition focus:border-teal-300/60 focus:ring-2 focus:ring-teal-400/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-teal-400 focus:ring-teal-300"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-teal-200 hover:text-teal-100">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={formDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 px-4 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-teal-500/30 transition hover:scale-[1.01] hover:shadow-teal-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === 'submitting' && (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-70" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )}
                {submitLabel}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <span>Need an account?</span>
              <Link href="/signup" className="font-semibold text-teal-200 hover:text-teal-100">
                Create one
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              By signing in, you agree to the Tookan Terms and Privacy Policy. API keys are issued per company; keep them secret and rotate if compromised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
