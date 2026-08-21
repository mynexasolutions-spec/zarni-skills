import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X, ShieldCheck, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mirrors the server's rule, so the button can't submit something the API
  // is going to reject anyway.
  const longEnough = password.length >= 6;
  const matches = password.length > 0 && password === confirmPassword;
  const canSubmit = longEnough && matches && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', { token, password });
      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2200);
      } else {
        setError(response.data?.message || 'Could not reset your password.');
      }
    } catch (err) {
      // Never fake a success here: an expired or already-used link comes back
      // as a 400, and telling the user it worked would leave them locked out
      // wondering why the new password doesn't log them in.
      setError(err.response?.data?.message || 'Could not reset your password. Please request a fresh link.');
    } finally {
      setSubmitting(false);
    }
  };

  const Rule = ({ ok, children }) => (
    <li className={`flex items-center gap-2 text-[11px] font-semibold transition-colors ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${ok ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        {ok ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} /> : <X className="w-2.5 h-2.5 text-slate-400" strokeWidth={3.5} />}
      </span>
      {children}
    </li>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-14 relative overflow-hidden">
        {/* Soft light wash — enough colour to not read as a blank page */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-blue-400/15 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-violet-400/15 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 0.7px, transparent 0.7px)', backgroundSize: '22px 22px' }}></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white border border-slate-200/80 rounded-[2rem] shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)] overflow-hidden">
            <span className="block h-[3px] bg-gradient-to-r from-blue-600 via-violet-600 to-amber-400"></span>

            <div className="p-7 sm:p-9">
              {!token ? (
                /* No token at all — usually a hand-typed or truncated URL */
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="font-heading text-xl font-black text-slate-900">This link looks incomplete</h2>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 max-w-xs mx-auto">
                    Open the reset link straight from your email, or request a new one.
                  </p>
                  <Link to="/forgot-password"
                    className="inline-flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-600/25 hover:-translate-y-0.5 transition-all">
                    Request a new link <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : success ? (
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <span className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-lg animate-pulse"></span>
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                  <h2 className="font-heading text-xl font-black text-slate-900">Password updated</h2>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
                    You can log in with your new password now. Taking you to the login page…
                  </p>
                  <Link to="/login"
                    className="inline-flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 transition-all">
                    Go to login <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-7">
                    <div className="relative w-16 h-16 mx-auto mb-5">
                      <span className="absolute inset-0 rounded-2xl bg-blue-400/25 blur-lg"></span>
                      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                        <Lock className="w-7 h-7 text-white" strokeWidth={2.2} />
                      </div>
                    </div>
                    <h2 className="font-heading text-2xl font-black text-slate-900">Set a new password</h2>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 max-w-xs mx-auto">
                      Choose a password you haven't used before. This link works once.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-relaxed">{error}</p>
                          <Link to="/forgot-password" className="text-[11px] font-black underline underline-offset-2 hover:text-red-700">
                            Request a new link
                          </Link>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={show ? 'text' : 'password'}
                          required
                          autoFocus
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white hover:bg-slate-50 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShow((v) => !v)}
                          aria-label={show ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                      <input
                        type={show ? 'text' : 'password'}
                        required
                        placeholder="Re-enter it"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white hover:bg-slate-50 transition-all"
                      />
                    </div>

                    {/* Live checks, so nothing is rejected only after submitting */}
                    <ul className="space-y-1.5 pt-0.5">
                      <Rule ok={longEnough}>At least 6 characters</Rule>
                      <Rule ok={matches}>Both passwords match</Rule>
                    </ul>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="group relative overflow-hidden w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest ring-1 ring-inset ring-white/25 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {canSubmit && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                      {submitting
                        ? <><Loader2 className="w-4 h-4 relative animate-spin" /> <span className="relative">Updating…</span></>
                        : <><ShieldCheck className="w-4 h-4 relative" /> <span className="relative">Update Password</span></>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] font-semibold text-slate-400 mt-5">
            Remembered it? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-black">Back to login</Link>
          </p>
        </div>
      </div>
    </>
  );
}
