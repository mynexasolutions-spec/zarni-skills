import React, { useEffect, useState } from 'react';
import { Share2, Users, UserCheck, ShieldCheck, Mail, Calendar, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ r }) {
  const initials = r.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return r.profile_image_url ? (
    <img src={r.profile_image_url} alt={r.name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-pink-500/20" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white text-xs font-black flex items-center justify-center shrink-0 ring-2 ring-pink-500/20">
      {initials}
    </div>
  );
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [totalReferred, setTotalReferred] = useState(0);
  const [totalReferrers, setTotalReferrers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await api.get('/admin/referrals');
        setReferrals(response.data.referrals || []);
        setTotalReferred(response.data.total_referred || 0);
        setTotalReferrers(response.data.total_referrers || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-pink-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading referral nodes...</p>
      </div>
    );
  }

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
          <Share2 className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Referrals Registry</h2>
          <p className="text-xs text-slate-400 font-semibold">Track affiliate marketing signups and verification status</p>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg border border-white/5 transition-all">
          <Users className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10">
            <AnimatedNumber value={totalReferred} duration={1000} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Referred Accounts</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg border border-white/5 transition-all">
          <UserCheck className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10">
            <AnimatedNumber value={totalReferrers} duration={1000} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Active Promoters</p>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Referred Member</th>
                <th className="px-6 py-4">Invited By</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-center pr-6">Sales Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {referrals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar r={r} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight">{r.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    {r.referrer_name || 'Direct / Organic'}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs">{r.created_at}</td>
                  <td className="px-6 py-3.5 text-center pr-6">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                      r.is_paid 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>{r.is_paid ? 'Paid Invoice' : 'Unpaid Lead'}</span>
                  </td>
                </tr>
              ))}
              {referrals.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-400 font-semibold">No referrals recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards view */}
      <div className="lg:hidden space-y-4">
        {referrals.map((r, idx) => (
          <div key={r.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar r={r} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{r.email}</p>
                </div>
              </div>
              <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                r.is_paid ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'
              }`}>{r.is_paid ? 'Paid' : 'Unpaid'}</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Referred by</span>
              <span className="font-bold text-blue-600">{r.referrer_name || 'Direct Sign-up'}</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400">Date Joined</span>
              <span className="text-slate-600 font-medium">{r.created_at}</span>
            </div>
          </div>
        ))}
        {referrals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 font-semibold">No referrals recorded yet.</div>
        )}
      </div>
    </div>
  );
}
