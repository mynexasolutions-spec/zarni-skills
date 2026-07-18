import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';

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
        navigate(role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/student');
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
      <div className="min-h-screen flex items-center justify-center p-4 pt-28 lg:pt-24 relative overflow-hidden bg-slate-50">
      
      {/* Ambient decorative blobs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT: Brand panel (desktop only) */}
        <div className="hidden lg:flex flex-col justify-between relative p-10 bg-gradient-to-br from-primary via-primary to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}>
          </div>
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-[90px] pointer-events-none"></div>

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
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Sign in to continue your courses, track your progress, and grow your affiliate earnings.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 pt-10 border-t border-white/15">
            <div>
              <p className="text-white font-black text-xl leading-none">10K+</p>
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mt-1">Students</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-white font-black text-xl leading-none">500+</p>
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mt-1">Courses</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-white font-black text-xl leading-none">4.9★</p>
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mt-1">Rating</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Login form */}
        <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1.5">Sign in to your Zarni Skills account to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-155 text-red-650 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition"
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
              <Link to="/forgot-password" style={{ color: 'var(--color-primary)' }} className="font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 overflow-hidden"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)' }} className="font-bold hover:underline">Sign up for free</Link>
          </p>
        </div>

      </div>
    </div>
    </>
  );
}
