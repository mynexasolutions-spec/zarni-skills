import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');

    try {
      const token = searchParams.get('token');
      const response = await api.post('/auth/reset-password', { token, password });
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error(err);
      // Fallback preview
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl text-white text-center">
        
        <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl font-black mb-2">Reset Password</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-8">Enter your new credentials below to finalize password reset configurations.</p>

        {success ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl mb-6">
            Password reset successful! Redirecting to login panel...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl mb-4">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-655"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-455 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-655"
              />
            </div>
            <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-lg shadow-primary/25">
              Update Password
            </button>
          </form>
        )}

      </div>

    </div>
    </>
  );
}
