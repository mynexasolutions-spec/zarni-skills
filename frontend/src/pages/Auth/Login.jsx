import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';

function CountUp({ end, decimals = 0, suffix = '', duration = 1400 }) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let start = null;
    let raf;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <>{value.toFixed(decimals)}{suffix}</>;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const role = result.user?.role;
        navigate(role === 'admin' ? '/admin' : '/student');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4 pt-28 lg:pt-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">

        {/* Animated ambient mesh */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 sm:w-[32rem] sm:h-[32rem] bg-primary/15 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none animate-blob"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-72 h-72 sm:w-[32rem] sm:h-[32rem] bg-indigo-400/15 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none animate-blob" style={{ animationDelay: '2.3s' }}></div>
        <div className="hidden sm:block absolute top-1/3 right-1/4 w-72 h-72 bg-fuchsia-400/10 rounded-full blur-[110px] pointer-events-none animate-blob" style={{ animationDelay: '4.6s' }}></div>
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
        </div>

        <div className="relative w-full max-w-4xl animate-fade-in-up">
          <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-br from-primary/20 via-slate-200 to-indigo-300/40 shadow-[0_20px_70px_-25px_rgba(43,128,240,0.35)]">
            <div className="rounded-[calc(2rem-1px)] bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-2">

              {/* LEFT: Brand panel (desktop only) */}
              <div className="hidden lg:flex flex-col justify-between relative p-10 bg-gradient-to-br from-primary via-primary to-indigo-800 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
                </div>
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/15 rounded-full blur-[90px] pointer-events-none animate-float"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/25 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '1.5s' }}></div>

                <div className="relative z-10">
                  <Link to="/" className="inline-flex items-center gap-2.5 mb-14">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-lg font-black text-primary">
                      ZS
                    </div>
                    <span className="font-heading font-black text-white text-lg">Zarni Skills</span>
                  </Link>

                  <h2 className="font-heading font-black text-3xl xl:text-4xl text-white leading-tight mb-4">
                    Learn Today.<br />Earn Tomorrow.
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed max-w-xs mb-8">
                    Sign in to continue your courses, track your progress, and grow your affiliate earnings.
                  </p>

                  {/* Floating feature cards */}
                  <div className="space-y-3 max-w-[240px]">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg animate-float" style={{ animationDelay: '0.4s' }}>
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold leading-tight">Track Your Growth</p>
                        <p className="text-white/60 text-[10px]">Real-time earnings dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg ml-6 animate-float" style={{ animationDelay: '1.1s' }}>
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold leading-tight">Instant Payouts</p>
                        <p className="text-white/60 text-[10px]">Withdraw anytime, anywhere</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-6 pt-10 border-t border-white/15">
                  <div>
                    <p className="text-white font-black text-xl leading-none"><CountUp end={10} suffix="K+" /></p>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mt-1">Students</p>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div>
                    <p className="text-white font-black text-xl leading-none"><CountUp end={500} suffix="+" /></p>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mt-1">Courses</p>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div>
                    <p className="text-white font-black text-xl leading-none"><CountUp end={4.9} decimals={1} suffix="★" /></p>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mt-1">Rating</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Login form */}
              <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                    <Sparkles className="w-3 h-3" /> Welcome back
                  </div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">Sign in to your account</h1>
                  <p className="text-slate-500 text-sm mt-1.5">Pick up right where you left off</p>
                </div>

                {error && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/40" />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-3.5 bg-gradient-to-r from-primary via-primary to-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"></span>
                    <span className="relative">{loading ? 'Signing In...' : 'Sign In'}</span>
                    <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Sign up for free</Link>
                </p>

                <div className="flex items-center justify-center gap-1.5 mt-6 text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> Secured with encrypted authentication
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
