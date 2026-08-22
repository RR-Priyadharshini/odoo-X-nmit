import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Phone, MapPin, Briefcase, Users, LineChart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: 'Software Engineer',
    department: 'Engineering',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        designation: formData.designation,
        department: formData.department,
        phone: formData.phone || '+91 98000 00000',
        address: formData.address || 'Bengaluru, India'
      });
      navigate('/employee/my-day');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'block w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-df-text placeholder-df-muted/70 focus:outline-hidden focus:ring-2 focus:ring-df-lime/60 focus:border-df-lime/40 transition-all';
  const labelClass = 'block text-[11px] font-medium uppercase tracking-wider text-df-muted mb-1.5';

  return (
    <div className="min-h-screen w-full bg-df-bg text-df-text font-sans flex">
      {/* LEFT — Brand / story panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-df-bg-2">
        <svg
          className="absolute inset-0 w-full h-full opacity-70"
          viewBox="0 0 800 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dfLine2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C7F33A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C7F33A" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="dfGlow2" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#C7F33A" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#C7F33A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="900" fill="url(#dfGlow2)" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M -50 ${620 + i * 34} C 200 ${560 + i * 30}, 400 ${740 + i * 28}, 850 ${600 + i * 32}`}
              stroke="url(#dfLine2)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </svg>

        <div className="relative z-10 flex items-center gap-2.5 df-fade-in">
          <div className="w-8 h-8 rounded-lg bg-df-lime flex items-center justify-center text-df-ink font-bold text-sm font-display">
            D
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-df-text">Dayflow</span>
        </div>

        <div className="relative z-10 max-w-md df-fade-up" style={{ animationDelay: '80ms' }}>
          <h1 className="font-display text-4xl xl:text-[2.75rem] leading-[1.12] font-medium text-df-text">
            Start managing your
            <br />
            <span className="text-df-lime">workday smarter.</span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-df-muted max-w-sm">
            Create your employee profile and join a workspace built around people, presence, and performance.
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

      {/* RIGHT — Registration form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 sm:px-10 relative">
        <div className="absolute inset-0 lg:hidden bg-df-bg-2" />
        <div className="w-full max-w-xl relative z-10 df-fade-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-df-lime flex items-center justify-center text-df-ink font-bold text-sm font-display">
              D
            </div>
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-df-text">Dayflow</span>
          </div>

          <div className="df-glass-dark rounded-[20px] p-7 sm:p-9 shadow-2xl shadow-black/40">
            <h2 className="font-display text-2xl font-medium text-df-text">Create your account</h2>
            <p className="mt-1.5 text-sm text-df-muted">Start managing your workday smarter</p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-df-danger/10 border border-df-danger/30 text-df-danger text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Vikram Seth"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Work Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="vikram@dayflow.com"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password (min 8 chars) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={inputClass + ' appearance-none'}
                    >
                      <option className="bg-df-bg-2" value="Engineering">Engineering</option>
                      <option className="bg-df-bg-2" value="Design">Design</option>
                      <option className="bg-df-bg-2" value="Sales">Sales</option>
                      <option className="bg-df-bg-2" value="Human Resources">Human Resources</option>
                      <option className="bg-df-bg-2" value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Designation</label>
                  <input
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    className="block w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-df-text placeholder-df-muted/70 focus:outline-hidden focus:ring-2 focus:ring-df-lime/60 focus:border-df-lime/40 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Location / Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-df-muted">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Bengaluru, Karnataka"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-df-ink bg-df-lime hover:bg-df-lime-2 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-df-bg focus:ring-df-lime transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-df-lime/10"
                >
                  <span>{loading ? 'Creating account…' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-df-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-df-lime hover:text-df-lime-2">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
