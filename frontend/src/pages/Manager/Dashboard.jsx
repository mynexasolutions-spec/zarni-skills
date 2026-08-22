import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users, IndianRupee, TrendingUp, Wallet, Clock, ArrowRight, Sparkles,
  Copy, Check, Percent, Briefcase, X, Mail, Phone, MapPin, Calendar, User as UserIcon, Crown
} from 'lucide-react';
import api from '../../utils/api';

function MemberProfileModal({ member, loading, onClose }) {
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
          style={{ background: 'linear-gradient(135deg, #1e0b28 0%, #4c1d95 50%, #7c3aed 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin"></div>
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
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-purple-600 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
                {initials}
              </div>
            )}
            <h3 className="mt-4 text-xl font-heading font-black text-slate-900">{member.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {member.role === 'manager' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-50 text-amber-700">
                  <Crown className="w-2.5 h-2.5" /> Manager
                </span>
              )}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Joined {member.created_at}
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-violet-500 shrink-0" />
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

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const openMemberProfile = async (memberId) => {
    if (!memberId) return;
    setProfileLoading(true);
    setProfileModal({});
    try {
      const response = await api.get(`/manager/all-users/profile/${memberId}`);
      setProfileModal(response.data.user);
    } catch (err) {
      console.error('Error fetching member profile', err);
      setProfileModal(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/manager/dashboard-data');
        setData(response.data || {});
      } catch (err) {
        console.error('Error fetching manager dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const refLink = `${window.location.origin}/register?ref=${data.referral_code || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const kpis = [
    { label: 'Your Team', value: data.total_team ?? 0, sub: `${data.active_team ?? 0} active`, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Team Revenue', value: `₹${(data.team_revenue || 0).toLocaleString('en-IN')}`, sub: 'total from team purchases', icon: TrendingUp, color: 'from-blue-500 to-indigo-600' },
    { label: `Team Override (${data.manager_override_percent ?? 10}%)`, value: `₹${(data.manager_override_amount || 0).toLocaleString('en-IN')}`, sub: 'earned from team sales', icon: Percent, color: 'from-fuchsia-500 to-pink-600' },
    { label: `Senior Override (${data.senior_override_percent ?? 15}%)`, value: `₹${(data.senior_override_amount || 0).toLocaleString('en-IN')}`, sub: `from ${data.sub_manager_count ?? 0} sub-manager${(data.sub_manager_count ?? 0) === 1 ? '' : 's'}`, icon: Percent, color: 'from-purple-600 to-indigo-700' },
    { label: 'All-Time Earnings', value: `₹${(data.all_time_earnings || 0).toLocaleString('en-IN')}`, sub: 'approved commissions', icon: IndianRupee, color: 'from-emerald-500 to-green-600' },
    { label: 'Available Balance', value: `₹${(data.available_balance || 0).toLocaleString('en-IN')}`, sub: `₹${(data.pending_earnings || 0).toLocaleString('en-IN')} pending`, icon: Wallet, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 text-white mb-6"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '22px 22px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-violet-500/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-violet-200 mb-4">
              <Briefcase className="w-3.5 h-3.5" /> Manager Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-2">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-300 text-sm">{user?.email}</p>
          </div>

          {/* Commission rate spotlight */}
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl px-6 py-5 min-w-[220px]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">
              <Percent className="w-3.5 h-3.5" /> Your Commission Rate
            </div>
            {data.manager_commission_percent ? (
              <p className="text-3xl sm:text-4xl font-black leading-none">{data.manager_commission_percent}%</p>
            ) : (
              <p className="text-sm text-white/70 font-medium">Not set — contact admin</p>
            )}
            <p className="text-[11px] text-white/60 mt-2">on every sale from your team</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <kpi.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" strokeWidth={1.5} />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black leading-none">{kpi.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-2">{kpi.label}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Recent Commissions */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Recent Commissions
            </h3>
            <Link to="/manager/commissions" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {(data.recent_commissions || []).length > 0 ? (
            <div className="divide-y divide-slate-50">
              {data.recent_commissions.map(c => (
                <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                  <button type="button" onClick={() => openMemberProfile(c.buyer_id)} className="text-left">
                    <p className="text-sm font-bold text-slate-800 hover:text-violet-600 transition-colors">From {c.buyer_name}</p>
                    <p className="text-xs text-slate-400">{c.created_at}</p>
                  </button>
                  <div className="text-right">
                    <p className={`text-sm font-black ${c.status === 'approved' || c.status === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      ₹{c.commission_amount.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      c.status === 'approved' || c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-slate-400">No commissions yet.</p>
          )}
        </div>

        {/* Recent Team */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" /> Recent Team Members
            </h3>
            <Link to="/manager/team" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {(data.recent_team || []).length > 0 ? (
            <div className="divide-y divide-slate-50">
              {data.recent_team.map(m => {
                const initial = m.name?.[0]?.toUpperCase() || '?';
                return (
                  <div key={m.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                    <button type="button" onClick={() => openMemberProfile(m.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate hover:text-violet-600 transition-colors">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.created_at}</p>
                      </div>
                    </button>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-slate-400">No team members yet. Share your referral link to grow your team.</p>
          )}
        </div>
      </div>

      {/* Referral link banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' }}>
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-black text-lg mb-1">Your Referral Link</h3>
            <p className="text-violet-100 text-sm">Share this link to grow your team and earn commissions</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur">
            <code className="text-sm font-mono text-white truncate max-w-[220px] sm:max-w-xs">{refLink}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 ml-2 px-3 py-1.5 bg-white text-violet-700 text-xs font-bold rounded-lg hover:bg-violet-50 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <MemberProfileModal
        member={profileModal}
        loading={profileLoading}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}
