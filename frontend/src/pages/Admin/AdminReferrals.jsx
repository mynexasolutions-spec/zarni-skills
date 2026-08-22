import React, { useEffect, useState } from 'react';
import { Share2, Users, UserCheck, ShieldCheck, Mail, Calendar, ArrowRight, X, Phone, MapPin, User as UserIcon } from 'lucide-react';
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

function UserProfileModal({ member, loading, onClose }) {
  if (member === null) return null;
  const initials = member.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'ZS';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="p-8 pb-16 text-white relative"
          style={{ background: 'linear-gradient(135deg, #4a044e 0%, #831843 55%, #db2777 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
          </div>
        ) : (
          <div className="px-6 pb-6 -mt-14 relative">
            {member.profile_image_url ? (
              <img
                src={member.profile_image_url}
                alt={member.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg bg-slate-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-600 to-fuchsia-700 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
                {initials}
              </div>
            )}
            <h3 className="mt-4 text-xl font-heading font-black text-slate-900">{member.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-slate-100 text-slate-600 capitalize">
                {member.role}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                member.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>{member.is_active ? 'Active' : 'Inactive'}</span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Joined {member.created_at}
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 truncate">{member.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700">{member.phone || 'N/A'}</span>
              </div>
              {member.address && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{member.address}</span>
                </div>
              )}
              {(member.age || member.gender) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <UserIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">
                    {[member.age ? `${member.age} yrs` : null, member.gender].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
              {member.referral_code && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 font-mono">{member.referral_code}</span>
                </div>
              )}
              {(member.bio || member.about) && (
                <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">About</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{member.bio || member.about}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [totalReferred, setTotalReferred] = useState(0);
  const [totalReferrers, setTotalReferrers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileModal, setProfileModal] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const openMemberProfile = async (memberId) => {
    if (!memberId) return;
    setProfileLoading(true);
    setProfileModal({});
    try {
      const response = await api.get(`/admin/users/${memberId}`);
      setProfileModal(response.data.user);
    } catch (err) {
      console.error('Error fetching member profile', err);
      setProfileModal(null);
    } finally {
      setProfileLoading(false);
    }
  };

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
                    <button type="button" onClick={() => openMemberProfile(r.id)} className="flex items-center gap-3 text-left">
                      <Avatar r={r} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight hover:text-pink-600 transition-colors">{r.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{r.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-blue-600">
                    {r.referrer_id ? (
                      <button type="button" onClick={() => openMemberProfile(r.referrer_id)} className="hover:text-blue-700 transition-colors">
                        {r.referrer_name}
                      </button>
                    ) : (
                      'Direct / Organic'
                    )}
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
              <button type="button" onClick={() => openMemberProfile(r.id)} className="flex items-center gap-3 min-w-0 text-left">
                <Avatar r={r} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{r.email}</p>
                </div>
              </button>
              <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                r.is_paid ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'
              }`}>{r.is_paid ? 'Paid' : 'Unpaid'}</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Referred by</span>
              {r.referrer_id ? (
                <button type="button" onClick={() => openMemberProfile(r.referrer_id)} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  {r.referrer_name}
                </button>
              ) : (
                <span className="font-bold text-blue-600">Direct Sign-up</span>
              )}
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

      <UserProfileModal
        member={profileModal}
        loading={profileLoading}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}
