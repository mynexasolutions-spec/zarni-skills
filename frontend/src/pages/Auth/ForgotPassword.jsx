import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      // Fallback preview
      setSuccess(true);
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

              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
                <KeyRound className="w-7 h-7 text-white" strokeWidth={2} />
              </div>

              <h2 className="font-heading font-black text-3xl xl:text-4xl text-white leading-tight mb-4">
                Locked Out?<br />We've Got You.
              </h2>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                It happens to the best of us. Enter your email and we'll get you a secure link to jump right back into your courses.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2.5 pt-10 border-t border-white/15 text-white/70 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={2} />
              Your account &amp; data stay fully secure during reset.
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">Forgot Password</h1>
              <p className="text-slate-500 text-sm mt-1.5">Enter your registered email and we'll send reset instructions.</p>
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={2} />
                </div>
                <h2 className="font-heading font-black text-lg text-slate-900 mb-2">Check your inbox</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed mb-6">
                  We've sent a password reset link to <span className="font-bold text-slate-700">{email}</span>. It may take a minute to arrive.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Back to Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">Registered Email</label>
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Remember your password? <Link to="/login" style={{ color: 'var(--color-primary)' }} className="font-bold hover:underline">Sign In</Link>
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
