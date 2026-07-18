import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Check, UserCircle, ShieldCheck, Link2 } from 'lucide-react';
import api from '../../utils/api';

export default function Profile() {
  const { user, checkAuthStatus } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await api.put('/student/profile', { name, phone });
      if (response.data.success) {
        setMsg({ type: 'success', text: 'Profile details updated successfully!' });
        await checkAuthStatus();
      } else {
        setMsg({ type: 'error', text: response.data.message || 'Update failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error saving profile details.' });
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-white mb-8"
        style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 45%, #2563eb 100%)' }}>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-blue-300 to-indigo-300 opacity-70 blur-[3px]"></div>
            <div className="relative w-20 h-20 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 flex items-center justify-center">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white">{initials || <UserCircle className="w-10 h-10" />}</span>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black truncate">{user?.name}</h1>
            <p className="text-slate-300 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> {user?.role}
              </span>
              {user?.referral_code && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-wider font-mono">
                  <Link2 className="w-3 h-3" /> {user.referral_code}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black mb-6">Profile Settings</h2>

        {msg.text && (
          <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {msg.type === 'success' && <Check className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email (non-editable)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
