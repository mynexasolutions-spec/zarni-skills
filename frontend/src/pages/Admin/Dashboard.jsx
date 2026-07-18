import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserCog, Briefcase, ShoppingCart, IndianRupee, Clock, Landmark,
  FileText, Layers, BookOpen, Share2, Wallet, ArrowRight, Sparkles, ShieldCheck,
  TrendingUp
} from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard-data');
        setStats(response.data.stats || {});
        setRecentOrders(response.data.recent_orders || []);
      } catch (err) {
        console.error('Error fetching admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const kpis = [
    { label: 'Students', value: stats.total_users ?? 0, icon: Users, color: 'from-blue-500 to-indigo-600', ring: 'group-hover:ring-blue-200' },
    { label: 'Managers', value: stats.total_managers ?? 0, icon: UserCog, color: 'from-violet-500 to-purple-600', ring: 'group-hover:ring-violet-200' },
    { label: 'Team Members', value: stats.total_team_members ?? 0, icon: Briefcase, color: 'from-cyan-500 to-teal-600', ring: 'group-hover:ring-cyan-200' },
    { label: 'Paid Orders', value: stats.total_orders ?? 0, icon: ShoppingCart, color: 'from-emerald-500 to-green-600', ring: 'group-hover:ring-emerald-200' },
  ];

  const alerts = [
    { label: 'Pending Commissions', value: stats.pending_commissions ?? 0, icon: Clock, path: '/admin/commissions', tint: 'amber' },
    { label: 'Pending Withdrawals', value: stats.pending_withdrawals ?? 0, icon: Landmark, path: '/admin/withdrawals', tint: 'rose' },
  ];

  const quickLinks = [
    { label: 'KYC Verification', path: '/admin/kyc', icon: FileText, from: 'from-blue-500', to: 'to-indigo-600' },
    { label: 'Packages', path: '/admin/packages', icon: Layers, from: 'from-violet-500', to: 'to-purple-600' },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen, from: 'from-cyan-500', to: 'to-teal-600' },
    { label: 'Withdrawals', path: '/admin/withdrawals', icon: Wallet, from: 'from-amber-500', to: 'to-orange-600' },
    { label: 'Commissions', path: '/admin/commissions', icon: Sparkles, from: 'from-emerald-500', to: 'to-green-600' },
    { label: 'All Referrals', path: '/admin/referrals', icon: Share2, from: 'from-pink-500', to: 'to-fuchsia-600' },
  ];

  return (
    <div className="text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 text-white mb-6"
        style={{ background: 'linear-gradient(135deg, #1c0b14 0%, #3d0d1e 55%, #7f1d1d 100%)' }}>
        {/* decorative dot grid */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '22px 22px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-red-500/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-red-200 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Control Panel
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-2">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-300 text-sm">{today}</p>
          </div>

          {/* Revenue spotlight */}
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl px-6 py-5 min-w-[220px]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">
              <TrendingUp className="w-3.5 h-3.5" /> Total Revenue
            </div>
            <p className="text-3xl sm:text-4xl font-black leading-none flex items-center gap-1">
              <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7 text-white/80" />
              {(stats.total_revenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-white/60 mt-2">{stats.total_orders ?? 0} paid orders all-time</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`group relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ring-2 ring-transparent ${kpi.ring} hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* watermark icon */}
            <kpi.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" strokeWidth={1.5} />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                <kpi.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black leading-none">{kpi.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-2">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attention needed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {alerts.map((a) => {
          const tints = {
            amber: { border: 'border-amber-200', bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-700', dot: 'bg-amber-500' },
            rose: { border: 'border-rose-200', bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', text: 'text-rose-700', dot: 'bg-rose-500' },
          }[a.tint];
          const needsAttention = a.value > 0;
          return (
            <Link
              key={a.label}
              to={a.path}
              className={`group flex items-center gap-4 rounded-3xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-md ${needsAttention ? `${tints.border} ${tints.bg}` : 'border-slate-100 bg-white'}`}
            >
              <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${needsAttention ? tints.icon : 'bg-slate-100 text-slate-400'}`}>
                <a.icon className="w-6 h-6" />
                {needsAttention && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${tints.dot} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${tints.dot}`}></span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-black text-slate-900 leading-none">{a.value}</p>
                <p className={`text-xs font-bold mt-1 ${needsAttention ? tints.text : 'text-slate-400'}`}>{a.label}</p>
              </div>
              {needsAttention ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:translate-x-0.5 transition-transform">
                  Review <ArrowRight className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">All clear</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="group bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${link.from} ${link.to} shadow-md group-hover:scale-110 transition-transform`}>
                <link.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-600" /> Recent Orders
          </h3>
          <Link to="/admin/orders" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {recentOrders.map(o => (
            <div key={o.id} className="border border-slate-100 rounded-2xl p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{o.buyer_name}</p>
                  <p className="text-xs text-slate-400 truncate">{o.item_name}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${
                  o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : o.payment_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>{o.payment_status}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-400">{o.created_at}</span>
                <span className="font-black text-slate-800">₹{o.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">No orders recorded yet.</div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Item</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold text-slate-800">{o.buyer_name}</td>
                  <td className="py-3.5">{o.item_name}</td>
                  <td className="py-3.5 font-semibold text-slate-800">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : o.payment_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{o.payment_status}</span>
                  </td>
                  <td className="py-3.5 text-slate-400">{o.created_at}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">No orders recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
