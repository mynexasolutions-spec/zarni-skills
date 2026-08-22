import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserCog, Briefcase, ShoppingCart, IndianRupee, Clock, Landmark,
  FileText, Layers, BookOpen, Share2, Wallet, ArrowRight, Sparkles, ShieldCheck,
  TrendingUp, ArrowUpRight, Activity, Search, Filter, RefreshCw,
  Receipt, Percent, PiggyBank, Gift, Crown, CheckCircle2, Hourglass,
  X, Mail, Phone, MapPin, Calendar, User as UserIcon, UserPlus
} from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

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
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #1c0e18 40%, #3b0717 80%, #4c0519 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin"></div>
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
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
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
                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard-data');
      setStats(response.data.stats || {});
      setRecentOrders(response.data.recent_orders || []);
    } catch (err) {
      console.error('Error fetching admin dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-rose-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading system matrix...</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getAvatarBg = (name) => {
    const colors = [
      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'bg-rose-500/10 text-rose-500 border-rose-500/20',
      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const kpis = [
    { label: 'Total Students', value: stats.total_users ?? 0, icon: Users, color: 'from-blue-600 to-indigo-600' },
    { label: 'Regional Managers', value: stats.total_managers ?? 0, icon: UserCog, color: 'from-violet-600 to-purple-600' },
    { label: 'Team Members', value: stats.total_team_members ?? 0, icon: Briefcase, color: 'from-cyan-600 to-teal-600' },
    { label: 'Paid Orders', value: stats.total_orders ?? 0, icon: ShoppingCart, color: 'from-emerald-600 to-green-600' },
  ];

  const alerts = [
    { label: 'Pending Commissions', value: stats.pending_commissions ?? 0, icon: Clock, path: '/admin/commissions', tint: 'amber' },
    { label: 'Pending Withdrawals', value: stats.pending_withdrawals ?? 0, icon: Landmark, path: '/admin/withdrawals', tint: 'rose' },
  ];

  const money = (v) => `₹${(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const financeCards = [
    { label: 'Commissions Paid', value: money(stats.commissions_paid), icon: Wallet, color: 'from-emerald-500 to-green-600' },
    { label: 'Pending Balance', value: money(stats.pending_balance), icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'Wallet Balance', value: money(stats.wallet_balance), icon: PiggyBank, color: 'from-blue-500 to-indigo-600' },
    { label: 'Payout Requests', value: money(stats.payout_request_amount), sub: `${stats.pending_withdrawals ?? 0} pending`, icon: Landmark, color: 'from-rose-500 to-red-600' },
    { label: 'Including GST', value: money(stats.revenue_including_gst), icon: Receipt, color: 'from-indigo-500 to-violet-600' },
    { label: 'Without GST', value: money(stats.revenue_excluding_gst), icon: Receipt, color: 'from-teal-500 to-cyan-600' },
    { label: 'GST Amount', value: money(stats.gst_amount_total), icon: Percent, color: 'from-orange-500 to-amber-600' },
    { label: 'Total Commission', value: money(stats.total_commission_alltime), icon: Share2, color: 'from-purple-500 to-fuchsia-600' },
    { label: 'Total Reward', value: money(stats.total_reward), icon: Gift, color: 'from-pink-500 to-rose-600' },
    { label: 'Total Profit', value: money(stats.total_profit), icon: TrendingUp, color: 'from-green-600 to-emerald-700' },
    { label: 'Registration Form Income', value: money(stats.registration_form_income), sub: `${stats.registration_form_count ?? 0} registrations`, icon: UserPlus, color: 'from-pink-500 to-rose-600' },
    { label: `Paid To Referrers (${stats.registration_form_referrer_percent ?? 100}%)`, value: money(stats.registration_form_referrer_paid), icon: Users, color: 'from-emerald-500 to-teal-600' },
    { label: 'Kept By Platform', value: money(stats.registration_form_company_income), icon: Landmark, color: 'from-slate-500 to-slate-700' },
  ];

  const managerCards = [
    { label: 'Total Manager Income', value: money(stats.manager_income_total), icon: UserCog, color: 'from-violet-500 to-purple-600' },
    { label: `${stats.manager_override_l1_percent ?? 10}% Manager Income`, value: money(stats.manager_income_l1), icon: Percent, color: 'from-indigo-500 to-blue-600' },
    { label: `${stats.manager_override_l2_percent ?? 15}% Senior Manager Income`, value: money(stats.manager_income_l2), icon: Crown, color: 'from-amber-500 to-yellow-600' },
    { label: 'Paid Balance', value: money(stats.manager_income_paid), icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: 'Pending Income', value: money(stats.manager_income_pending), icon: Hourglass, color: 'from-rose-500 to-pink-600' },
  ];

  const quickLinks = [
    { label: 'KYC Verification', path: '/admin/kyc', icon: FileText, from: 'from-blue-500', to: 'to-indigo-600' },
    { label: 'Package Setup', path: '/admin/packages', icon: Layers, from: 'from-violet-500', to: 'to-purple-600' },
    { label: 'Manage Courses', path: '/admin/courses', icon: BookOpen, from: 'from-cyan-500', to: 'to-teal-600' },
    { label: 'Withdrawal Hub', path: '/admin/withdrawals', icon: Wallet, from: 'from-amber-500', to: 'to-orange-600' },
    { label: 'Commissions', path: '/admin/commissions', icon: Sparkles, from: 'from-emerald-500', to: 'to-green-600' },
    { label: 'Referrals Network', path: '/admin/referrals', icon: Share2, from: 'from-pink-500', to: 'to-fuchsia-600' },
  ];

  return (
    <div className="text-slate-800 space-y-8 pb-10">

      {/* Header section with System Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Console Center</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Server Online
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
            title="Reload data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Dashboard layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Hero & Revenue Card (Takes 2 Columns) */}
        <div className="relative overflow-hidden rounded-[2.2rem] p-6 sm:p-8 text-white lg:col-span-2 shadow-2xl flex flex-col justify-between min-h-[340px]"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #1c0e18 40%, #3b0717 80%, #4c0519 100%)' }}>
          
          {/* decorative interactive components */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-rose-500/20 rounded-full blur-[120px] pointer-events-none animate-blob"></div>
          <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-blob" style={{ animationDelay: '3s' }}></div>

          {/* Top Row: User welcome */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-rose-300 mb-4 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" /> Core Admin Panel
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Administrator'} 👋</h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md">Manage user operations, courses, packages, withdraw systems, and monitor live metrics.</p>
          </div>

          {/* Bottom Row: Premium Revenue Breakdown */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-8 border-t border-white/5 pt-6">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
                <TrendingUp className="w-3.5 h-3.5" /> Total Platform Revenue
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none flex items-center gap-1">
                <IndianRupee className="w-8 h-8 text-white/70 shrink-0" />
                <AnimatedNumber value={stats.total_revenue || 0} duration={1400} />
              </div>
              <p className="text-[11px] text-white/55 mt-2.5 flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{stats.total_orders ?? 0}</span> paid invoices overall
              </p>
            </div>

            {/* Sparkline Area chart mockup for premium aesthetics */}
            <div className="w-full h-24 relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <span>Revenue Curve</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +15.8%
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-14">
                <svg className="w-full h-full" viewBox="0 0 150 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,40 C20,32 40,38 60,20 C80,10 100,28 120,8 C140,0 150,5 150,5 L150,40 L0,40 Z" 
                    fill="url(#chartGlow)"
                  />
                  <path 
                    d="M0,40 C20,32 40,38 60,20 C80,10 100,28 120,8 C140,0 150,5 150,5" 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Attention Required column */}
        <div className="flex flex-col justify-between gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.2rem] p-6 shadow-xl text-white flex-1 flex flex-col justify-between min-h-[340px]">
            <div className="relative">
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" /> Critical Review items
              </h3>
              <p className="text-slate-400 text-xs mt-1">Actions requiring immediate attention to release system payouts.</p>
            </div>

            <div className="space-y-3.5 my-6">
              {alerts.map((a) => {
                const tints = {
                  amber: { border: 'border-amber-500/20 hover:border-amber-500/50', bg: 'bg-amber-500/5', icon: 'bg-amber-500/10 text-amber-400', text: 'text-amber-300', countBg: 'bg-amber-500 text-amber-950' },
                  rose: { border: 'border-rose-500/20 hover:border-rose-500/50', bg: 'bg-rose-500/5', icon: 'bg-rose-500/10 text-rose-400', text: 'text-rose-300', countBg: 'bg-rose-500 text-rose-950' },
                }[a.tint];
                const needsAttention = a.value > 0;
                return (
                  <Link
                    key={a.label}
                    to={a.path}
                    className={`group flex items-center gap-3.5 rounded-2xl p-3.5 border transition-all hover:bg-white/5 ${needsAttention ? `${tints.border} ${tints.bg}` : 'border-slate-800/60 bg-transparent'}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${needsAttention ? tints.icon : 'bg-slate-800 text-slate-600'}`}>
                      <a.icon className="w-5.5 h-5.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${needsAttention ? tints.text : 'text-slate-400'}`}>{a.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-extrabold tracking-tight tabular-nums">
                          <AnimatedNumber value={a.value} duration={900} />
                        </span>
                        {needsAttention && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${tints.countBg}`}>
                            ACTION
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>

            <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-3 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              All other micro-systems are operating normally.
            </div>
          </div>
        </div>

      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up border border-white/5`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* background details */}
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-[0.08] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 pointer-events-none">
              <kpi.icon className="w-32 h-32" strokeWidth={1} />
            </div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md mb-5">
                <kpi.icon className="w-5 h-5" />
              </div>
              <AnimatedNumber value={kpi.value} duration={1000} className="block text-3xl font-black leading-none tabular-nums tracking-tight" />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-rose-500" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Financial Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {financeCards.map((c, idx) => (
            <div
              key={c.label}
              className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                <c.icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-lg font-black text-slate-900 leading-none truncate">{c.value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-2">{c.label}</p>
              {c.sub && <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Manager Income Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-5 h-5 text-violet-500" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Manager Income</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {managerCards.map((c, idx) => (
            <div
              key={c.label}
              className="group relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up border border-white/5"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                <c.icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-lg font-black leading-none truncate">{c.value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mt-2">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links / Actions Section */}
      <div className="bg-white border border-slate-200/80 rounded-[2.2rem] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Layers className="w-5 h-5 text-rose-500" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Quick Operations Control</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link, idx) => (
            <Link
              key={link.path}
              to={link.path}
              className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${link.from} ${link.to} shadow-md group-hover:scale-105 transition-transform duration-300`}>
                <link.icon className="w-5.5 h-5.5" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 leading-tight transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-200/80 rounded-[2.2rem] p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50">
              <ShoppingCart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Recent Live Invoices</h3>
              <p className="text-slate-400 text-xs">Real-time payment transactions across courses and packages.</p>
            </div>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group bg-rose-50 hover:bg-rose-100/60 px-3.5 py-2 rounded-xl transition-all">
            See All Orders <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile cards view (highly polished) */}
        <div className="sm:hidden space-y-3">
          {recentOrders.map((o, idx) => (
            <div key={o.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}>
              <div className="flex items-center gap-3 mb-2.5">
                <button type="button" onClick={() => openMemberProfile(o.buyer_id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(o.buyer_name)}`}>
                    {getInitials(o.buyer_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{o.buyer_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{o.item_name}</p>
                  </div>
                </button>
                <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                  o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : o.payment_status === 'failed' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>{o.payment_status}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400">{o.created_at}</span>
                <span className="font-extrabold text-slate-900">₹{o.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-xs">No orders recorded yet.</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="pb-3.5 pl-2">Buyer Account</th>
                <th className="pb-3.5">Purchased Item</th>
                <th className="pb-3.5 text-right">Invoiced Amount</th>
                <th className="pb-3.5 text-center">Status</th>
                <th className="pb-3.5 pr-2 text-right">Transaction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors duration-150">
                  <td className="py-3.5 pl-2">
                    <button type="button" onClick={() => openMemberProfile(o.buyer_id)} className="flex items-center gap-3 text-left">
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(o.buyer_name)}`}>
                        {getInitials(o.buyer_name)}
                      </div>
                      <span className="font-bold text-slate-800 leading-tight hover:text-rose-600 transition-colors">{o.buyer_name}</span>
                    </button>
                  </td>
                  <td className="py-3.5 font-medium text-slate-500 truncate max-w-[240px]" title={o.item_name}>
                    {o.item_name}
                  </td>
                  <td className="py-3.5 text-right font-black text-slate-800">
                    ₹{o.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                      o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : o.payment_status === 'failed' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>{o.payment_status}</span>
                  </td>
                  <td className="py-3.5 pr-2 text-right text-slate-400 text-xs">{o.created_at}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">No orders recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserProfileModal
        member={profileModal}
        loading={profileLoading}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}
