import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Wallet, Clock, TrendingUp, Layers, Receipt, ShieldCheck, X, Mail, Phone, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

export default function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [totals, setTotals] = useState({ total_earned: 0, available_balance: 0, pending_earnings: 0, active_total: 0, passive_total: 0 });
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  const openBuyerProfile = async (buyerId) => {
    if (!buyerId) return;
    setProfileLoading(true);
    setProfileModal({});
    try {
      const response = await api.get(`/student/commissions/buyer/${buyerId}`);
      setProfileModal(response.data.user);
    } catch (err) {
      console.error('Error fetching buyer profile', err);
      setProfileModal(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await api.get('/student/commissions');
        setCommissions(response.data.commissions || []);
        setTotals({
          total_earned: response.data.total_earned || 0,
          available_balance: response.data.available_balance || 0,
          pending_earnings: response.data.pending_earnings || 0,
          active_total: response.data.active_total || 0,
          passive_total: response.data.passive_total || 0,
        });
      } catch (err) {
        console.error('Error fetching commissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Commission Ledger...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Earned', value: totals.total_earned, icon: CheckCircle2, from: '#10b981', to: '#059669', shadow: 'rgba(16,185,129,0.3)' },
    { label: 'Available Balance', value: totals.available_balance, icon: Wallet, from: '#2563eb', to: '#1d4ed8', shadow: 'rgba(37,99,235,0.3)' },
    { label: 'Pending', value: totals.pending_earnings, icon: Clock, from: '#f59e0b', to: '#d97706', shadow: 'rgba(245,158,11,0.3)' },
    { label: 'Active Income (L1)', value: totals.active_total, icon: TrendingUp, from: '#06b6d4', to: '#0891b2', shadow: 'rgba(6,182,212,0.3)' },
    { label: 'Passive Income (L2)', value: totals.passive_total, icon: Layers, from: '#8b5cf6', to: '#7c3aed', shadow: 'rgba(139,92,246,0.3)' },
  ];

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <div>
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute -inset-1.5 rounded-3xl bg-amber-400/40 blur-md animate-pulse"></div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-xl backdrop-blur-md">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2 backdrop-blur-md">
                  <Receipt className="w-3.5 h-3.5" /> Commission Ledger
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-black leading-tight tracking-tight text-white">
                  My Commission Breakdown
                </h1>
                <p className="text-blue-100/80 text-xs sm:text-sm font-medium mt-1">
                  {commissions.length} commission record{commissions.length !== 1 ? 's' : ''} generated from active & passive referrals.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Auto-Calculated</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIS STRIP ─────────────────────────────────────────────────── */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="group relative rounded-3xl p-5 text-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg border border-white/20"
              style={{
                background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                boxShadow: `0 10px 24px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
              }}
            >
              <kpi.icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              <kpi.icon className="relative w-5 h-5 mb-2.5 text-white/90 transition-transform duration-300 group-hover:scale-110" />
              <AnimatedNumber value={kpi.value} prefix="₹" className="relative block text-xl sm:text-2xl font-heading font-black leading-none tabular-nums text-white" />
              <p className="relative text-[10px] font-black uppercase tracking-widest text-white/80 mt-2">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMMISSION RECORDS TABLE (VISIBLE ON ALL SCREENS) ─────────────────────────── */}
      <div>
        <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-5 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="relative flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="flex items-center gap-3 font-heading font-black text-lg text-slate-900">
              <span className="relative w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center">
                <span className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md animate-pulse"></span>
                <Receipt className="relative w-4.5 h-4.5 text-blue-600" />
              </span>
              Commission Records
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0">
              {commissions.length} Total
            </span>
          </div>

          {/* Mobile View (Card List) */}
          <div className="md:hidden space-y-3.5">
            {commissions.map((c, idx) => {
              const initials = c.buyer_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
              const palette = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-purple-500 to-fuchsia-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600'];
              const isPositive = c.status === 'approved' || c.status === 'paid';
              const statusBadge = c.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' : c.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
              return (
                <div key={c.id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => openBuyerProfile(c.buyer_id)}
                      className="flex items-center gap-3 min-w-0 text-left group/buyer"
                    >
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${palette[idx % palette.length]} text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/buyer:scale-105`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-black text-slate-900 text-sm truncate group-hover/buyer:text-blue-600 transition-colors">{c.buyer_name}</p>
                        <p className="text-[11px] font-semibold text-slate-500 truncate">{c.item_name}</p>
                      </div>
                    </button>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border shrink-0 ${statusBadge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'paid' ? 'bg-emerald-500' : c.status === 'approved' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                      {c.status}
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">L{c.level}</span>
                      <span className="text-slate-400 font-bold text-[11px]">{c.created_at}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-black mr-1.5">Earned</span>
                      <span className={`font-heading font-black text-base tabular-nums ${isPositive ? 'text-emerald-600' : 'text-amber-500'}`}>
                        ₹{c.commission_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {commissions.length === 0 && (
              <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-2 text-blue-500">
                  <Receipt className="w-6 h-6" />
                </div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No commissions earned yet</p>
              </div>
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block relative overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                  <th className="py-3.5 px-4 rounded-l-2xl">Referred Member</th>
                  <th className="py-3.5 px-4">Package / Item</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4 text-right">Sale Amount</th>
                  <th className="py-3.5 px-4 text-right">Commission</th>
                  <th className="py-3.5 px-4 rounded-r-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c, idx) => {
                  const initials = c.buyer_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  const palette = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-purple-500 to-fuchsia-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600'];
                  const isPositive = c.status === 'approved' || c.status === 'paid';
                  const statusBadge = c.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' : c.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                  return (
                    <tr key={c.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => openBuyerProfile(c.buyer_id)}
                          className="flex items-center gap-3 text-left group/buyer"
                        >
                          <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${palette[idx % palette.length]} text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                            {initials}
                          </div>
                          <span className="font-heading font-black text-slate-900 group-hover/buyer:text-blue-600 transition-colors">{c.buyer_name}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">{c.item_name}</td>
                      <td className="py-4 px-4 font-bold text-slate-400 text-xs">{c.created_at}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">L{c.level}</span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-700 tabular-nums">₹{c.sale_amount.toLocaleString('en-IN')}</td>
                      <td className={`py-4 px-4 text-right font-heading font-black text-base tabular-nums ${isPositive ? 'text-emerald-600' : 'text-amber-500'}`}>
                        ₹{c.commission_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusBadge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'paid' ? 'bg-emerald-500' : c.status === 'approved' ? 'bg-blue-500' : 'bg-amber-500 animate-pulse'}`}></span>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {commissions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="w-14 h-14 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center mb-3 text-blue-500">
                        <Receipt className="w-7 h-7" />
                      </div>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No commissions earned yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── BUYER PROFILE MODAL ─────────────────────────────────────────── */}
      {profileModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setProfileModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProfileModal(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className="p-8 pb-16 text-white relative"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            {profileLoading || !profileModal.id ? (
              <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
              </div>
            ) : (
                <div className="px-6 pb-6 -mt-14 relative">
                  <img
                    src={profileModal.profile_image_url}
                    alt={profileModal.name}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg bg-slate-100"
                  />
                  <h3 className="mt-4 text-xl font-heading font-black text-slate-900">{profileModal.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" /> Joined {profileModal.created_at}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 truncate">{profileModal.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">{profileModal.phone || 'N/A'}</span>
                    </div>
                    {profileModal.address && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">{profileModal.address}</span>
                      </div>
                    )}
                    {(profileModal.age || profileModal.gender) && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <UserIcon className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">
                          {[profileModal.age ? `${profileModal.age} yrs` : null, profileModal.gender].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    )}
                    {(profileModal.bio || profileModal.about) && (
                      <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">About</p>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{profileModal.bio || profileModal.about}</p>
                      </div>
                    )}
                  </div>
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

