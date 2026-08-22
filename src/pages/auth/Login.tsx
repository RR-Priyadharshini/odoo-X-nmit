import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Users, LineChart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Login: React.FC = () => {
  const [roleMode, setRoleMode] = useState<'employee' | 'admin'>('employee');
  const [email, setEmail] = useState('employee@dayflow.com');
  const [password, setPassword] = useState('Employee@123');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (roleMode === 'admin') {
      setEmail('admin@dayflow.com');
      setPassword('Admin@123');
    } else {
      setEmail('employee@dayflow.com');
      setPassword('Employee@123');
    }
  }, [roleMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.role === 'admin') {
        navigate('/admin/pulse');
      } else {
        navigate('/employee/my-day');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-df-bg text-df-text font-sans flex">
      {/* LEFT — Brand / story panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-df-bg-2">
        {/* Ambient background flow */}
        <svg
          className="absolute inset-0 w-full h-full opacity-70"
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dfLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C7F33A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C7F33A" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="dfGlow" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#C7F33A" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#C7F33A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="900" fill="url(#dfGlow)" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M -50 ${620 + i * 34} C 200 ${560 + i * 30}, 400 ${740 + i * 28}, 850 ${600 + i * 32}`}
              stroke="url(#dfLine)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </svg>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5 df-fade-in">
          <div className="w-8 h-8 rounded-lg bg-df-lime flex items-center justify-center text-df-ink font-bold text-sm font-display">
            D
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-df-text">Dayflow</span>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 max-w-md df-fade-up" style={{ animationDelay: '80ms' }}>
          <h1 className="font-display text-4xl xl:text-[2.75rem] leading-[1.12] font-medium text-df-text">
            Workforce
            <br />
            <span className="text-df-lime">Operating System</span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-df-muted max-w-sm">
            Everything your workforce needs, in one flow.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-df-glass border border-df-glass-border flex items-center justify-center">
                <Users className="w-4 h-4 text-df-lime" />
              </div>
              <div>
                <div className="text-sm font-medium text-df-text">People First</div>
                <div className="text-xs text-df-muted mt-0.5">Empower your people and build a stronger culture.</div>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-df-glass border border-df-glass-border flex items-center justify-center">
                <LineChart className="w-4 h-4 text-df-lime" />
              </div>
              <div>
                <div className="text-sm font-medium text-df-text">Smart Insights</div>
                <div className="text-xs text-df-muted mt-0.5">Turn data into decisions that drive impact.</div>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-df-glass border border-df-glass-border flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-df-lime" />
              </div>
              <div>
                <div className="text-sm font-medium text-df-text">Secure &amp; Reliable</div>
                <div className="text-xs text-df-muted mt-0.5">Enterprise-grade security you can trust.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-df-muted/70">© {new Date().getFullYear()} Dayflow. Every workday, aligned.</div>
      </div>

      {/* RIGHT — Auth form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10 relative">
        <div className="absolute inset-0 lg:hidden bg-df-bg-2" />
        <div className="w-full max-w-sm relative z-10 df-fade-up">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-df-lime flex items-center justify-center text-df-ink font-bold text-sm font-display">
                D
              </div>
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-df-text">Dayflow</span>
            </div>
          </div>

          <div className="df-glass-dark rounded-[20px] p-7 sm:p-9 shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="mb-6">
              <h2 className="font-display text-2xl font-medium text-df-text">Welcome back</h2>
              <p className="mt-1.5 text-sm text-df-muted">Sign in to continue to your workspace.</p>
            </div>

            {/* Role Selector Pill */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-df-muted mb-2">
                Sign in as
              </label>
              <div className="flex items-center rounded-xl bg-white/[0.04] p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setRoleMode('employee')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    roleMode === 'employee' 
                    ? 'bg-df-lime text-df-ink shadow-md font-bold' 
                    : 'text-df-muted hover:text-df-text'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setRoleMode('admin')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    roleMode === 'admin' 
                    ? 'bg-df-lime text-df-ink shadow-md font-bold' 
                    : 'text-df-muted hover:text-df-text'
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-df-danger/10 border border-df-danger/30 text-df-danger text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-df-muted mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dayflow.com"
                    className="block w-full pl-10 pr-3.5 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-df-text placeholder-df-muted/70 focus:outline-hidden focus:ring-2 focus:ring-df-lime/60 focus:border-df-lime/40 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-df-muted">
                    Password
                  </label>
                  <button type="button" className="text-[11px] font-medium text-df-lime/90 hover:text-df-lime transition-colors cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-df-text placeholder-df-muted/70 focus:outline-hidden focus:ring-2 focus:ring-df-lime/60 focus:border-df-lime/40 transition-all"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm accent-[#C7F33A] cursor-pointer"
                />
                <span className="text-xs text-df-muted">Remember me</span>
              </label>

              <button
                id="btn-sign-in"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-df-ink bg-df-lime hover:bg-df-lime-2 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-df-bg focus:ring-df-lime transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-df-lime/10 mt-2"
              >
                <span>{loading ? 'Logging in…' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-df-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-df-lime hover:text-df-text transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
