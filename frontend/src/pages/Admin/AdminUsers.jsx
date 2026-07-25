import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Users, GraduationCap, UserCog, Briefcase, ShieldCheck, Power, ChevronDown, Loader2, Search, X, Wallet, Clock, Share2, ShoppingBag, BadgeCheck, User, Calendar, Mail, Phone, Tag } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const ROLE_TABS = [
  { key: '', label: 'All Users' },
  { key: 'student', label: 'Students' },
  { key: 'manager', label: 'Managers' },
  { key: 'team_member', label: 'Team' },
  { key: 'admin', label: 'Admins' },
];

const ROLE_META = {
  student: { label: 'Student', badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', ring: 'ring-blue-500/20', grad: 'from-blue-500 to-indigo-600', activeBg: 'bg-blue-600' },
  manager: { label: 'Manager', badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', ring: 'ring-purple-500/20', grad: 'from-violet-500 to-purple-600', activeBg: 'bg-purple-600' },
  team_member: { label: 'Team', badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', ring: 'ring-cyan-500/20', grad: 'from-cyan-500 to-teal-600', activeBg: 'bg-teal-600' },
  admin: { label: 'Admin', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', ring: 'ring-rose-500/20', grad: 'from-rose-500 to-red-600', activeBg: 'bg-rose-600' },
};

function Avatar({ u }) {
  const initials = u.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  const meta = ROLE_META[u.role] || ROLE_META.student;
  return (
    <div className={`relative shrink-0 rounded-full ring-2 ${meta.ring} transition-all duration-300 group-hover/user:scale-105`}>
      {u.profile_image_url ? (
        <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${meta.grad} text-white text-xs font-black flex items-center justify-center`}>
          {initials}
        </div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${u.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-white ${u.is_active ? 'animate-pulse' : ''}`}></span>
      </span>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async (role) => {
    try {
      const response = await api.get('/admin/users', { params: { role } });
      setUsers(response.data.users || []);
      setRoleCounts(response.data.role_counts || {});
    } catch (err) {
      console.error('Error fetching admin users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers(roleFilter);
  }, [roleFilter]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.referral_code?.toLowerCase().includes(q));
  }, [users, search]);

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      const response = await api.post(`/admin/users/${id}/toggle`);
      if (response.data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: response.data.is_active } : u));
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setBusyId(null);
    }
  };

  const openDetail = async (id) => {
    setDetail({ loading: true });
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/users/${id}`);
      setDetail(response.data);
    } catch (err) {
      console.error('Error fetching user detail', err);
      setDetail(null);
      alert('Failed to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    setBusyId(id);
    try {
      const response = await api.post(`/admin/users/${id}/set-role`, { role });
      if (response.data.success) {
        fetchUsers(roleFilter);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-rose-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Retrieving roster database...</p>
      </div>
    );
  }

  const kpis = [
    { key: 'student', label: 'Students', icon: GraduationCap, color: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-500/10 hover:shadow-blue-500/25', ring: 'ring-blue-500' },
    { key: 'manager', label: 'Managers', icon: UserCog, color: 'from-violet-600 to-purple-600', glow: 'shadow-purple-500/10 hover:shadow-purple-500/25', ring: 'ring-purple-500' },
    { key: 'team_member', label: 'Team Members', icon: Briefcase, color: 'from-cyan-600 to-teal-600', glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/25', ring: 'ring-cyan-500' },
    { key: 'admin', label: 'Admins', icon: ShieldCheck, color: 'from-rose-600 to-red-600', glow: 'shadow-rose-500/10 hover:shadow-rose-500/25', ring: 'ring-rose-500' },
  ];

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Accounts Directory</h2>
            <p className="text-xs text-slate-400 font-semibold">{roleCounts.all ?? 0} active credentials registered</p>
          </div>
        </div>
      </div>

      {/* KPI Tiles / Clickable Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const active = roleFilter === kpi.key;
          return (
            <button
              key={kpi.key}
              onClick={() => setRoleFilter(active ? '' : kpi.key)}
              className={`group relative overflow-hidden text-left rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.glow} border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] animate-fade-in-up ${active ? `ring-4 ${kpi.ring} ring-offset-4 ring-offset-slate-50` : ''}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* watermark icon background */}
              <kpi.icon className="absolute -right-5 -bottom-5 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" strokeWidth={1} />
              
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center mb-3.5 backdrop-blur-md">
                  <kpi.icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex items-baseline gap-1">
                  <AnimatedNumber value={roleCounts[kpi.key] ?? 0} duration={900} className="text-3xl font-black leading-none tracking-tight tabular-nums" />
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">{kpi.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar: filter tabs + search controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {ROLE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 transition-all ${
                roleFilter === tab.key 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 border border-rose-600' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${roleFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'}`}>{roleCounts[tab.key || 'all'] ?? 0}</span>
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Query name, email, credentials..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded-md transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop table view */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">User profile</th>
                <th className="px-6 py-4">Platform Revenue</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Security Level</th>
                <th className="px-6 py-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <button onClick={() => openDetail(u.id)} className="flex items-center gap-3 group/user text-left focus:outline-none">
                      <Avatar u={u} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight group-hover:text-rose-600 transition-colors">{u.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-3.5 font-black text-slate-800">
                    ₹{(u.total_earnings || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs">
                    {u.created_at}
                  </td>
                  <td className="px-6 py-3.5">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-500 font-extrabold text-[9px] uppercase tracking-wider rounded-lg border border-rose-500/20">
                        <ShieldCheck className="w-3 h-3" /> System Admin
                      </span>
                    ) : (
                      <div className="relative inline-block">
                        <select
                          value={u.role}
                          disabled={busyId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`appearance-none pl-3 pr-7 py-1.5 font-black text-[9px] uppercase tracking-wider rounded-lg border focus:ring-4 focus:ring-rose-500/10 cursor-pointer ${(ROLE_META[u.role] || ROLE_META.student).badge}`}
                        >
                          <option value="student">Student</option>
                          <option value="manager">Manager</option>
                          <option value="team_member">Team Member</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right pr-6">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={busyId === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                          u.is_active 
                            ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-500/20'
                        }`}
                      >
                        {busyId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                        {u.is_active ? 'Freeze' : 'Unfreeze'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 font-semibold">
                    {search ? `No credentials match query "${search}".` : 'No database records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards view */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((u, idx) => (
          <div key={u.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-3 w-full justify-between">
              <button onClick={() => openDetail(u.id)} className="flex items-center gap-3 text-left focus:outline-none min-w-0">
                <Avatar u={u} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</p>
                </div>
              </button>
              <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                u.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'
              }`}>{u.is_active ? 'Active' : 'Frozen'}</span>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Total Earnings</span>
              <span className="font-black text-slate-800">₹{(u.total_earnings || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400">Date Joined</span>
              <span className="text-slate-600 font-medium">{u.created_at}</span>
            </div>
            
            {/* Mobile actions row */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              {u.role === 'admin' ? (
                <span className="flex-1 text-center py-2 bg-rose-500/10 text-rose-500 font-extrabold text-[9px] uppercase tracking-wider rounded-xl border border-rose-500/20">System Admin</span>
              ) : (
                <div className="relative flex-1">
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={`w-full appearance-none px-3 py-2 pr-7 font-black text-[9px] uppercase tracking-wider rounded-xl border focus:ring-4 focus:ring-rose-500/10 ${(ROLE_META[u.role] || ROLE_META.student).badge}`}
                  >
                    <option value="student">Student</option>
                    <option value="manager">Manager</option>
                    <option value="team_member">Team Member</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                </div>
              )}
              {u.role !== 'admin' && (
                <button
                  onClick={() => handleToggle(u.id)}
                  disabled={busyId === u.id}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border ${
                    u.is_active ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  }`}
                >
                  {busyId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                  {u.is_active ? 'Freeze' : 'Unfreeze'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 font-semibold">
            {search ? `No credentials match query "${search}".` : 'No database records found.'}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {detail && createPortal(
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.2rem] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in border border-slate-100" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #09090b 0%, #1e0e18 50%, #3b0717 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <User className="w-5.5 h-5.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black tracking-tight truncate">{detail.user?.name || 'Account Detail'}</h3>
                  <p className="text-[10px] font-semibold text-slate-400 truncate">{detail.user?.email || 'System Database'}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all shrink-0 hover:scale-105">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Scrollable body */}
            <div className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6 bg-slate-50/55">
              {detailLoading ? (
                <div className="py-20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
              ) : !detail.user ? (
                <div className="py-20 text-center text-slate-400 font-semibold">User records unavailable.</div>
              ) : (
                <>
                  {/* Account overview section */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${(ROLE_META[detail.user.role] || ROLE_META.student).badge}`}>
                        {(ROLE_META[detail.user.role] || ROLE_META.student).label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${detail.user.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'}`}>
                        {detail.user.is_active ? 'Active' : 'Frozen'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-500 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Joined: <strong className="text-slate-700">{detail.user.created_at}</strong></span>
                      </div>
                      {detail.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>Mobile: <strong className="text-slate-700">{detail.user.phone}</strong></span>
                        </div>
                      )}
                      {detail.user.referrer_name && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span>Invited By: <strong className="text-rose-600">{detail.user.referrer_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial metrics breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-md border border-emerald-500/10">
                      <Wallet className="w-4.5 h-4.5 mb-2 text-white/80" />
                      <p className="text-xl font-black leading-none tracking-tight">₹{(detail.user.total_earnings || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-2">Aggregate Payout</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md border border-indigo-500/10">
                      <ShoppingBag className="w-4.5 h-4.5 mb-2 text-white/80" />
                      <p className="text-xl font-black leading-none tracking-tight">₹{(detail.user.available_balance || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-2">Available Balance</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md border border-amber-500/10">
                      <Clock className="w-4.5 h-4.5 mb-2 text-white/80" />
                      <p className="text-xl font-black leading-none tracking-tight">₹{(detail.user.pending_earnings || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mt-2">Pending Transit</p>
                    </div>
                  </div>

                  {/* Identity Verification status */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-rose-500" /> Identity verification (KYC)</p>
                    {detail.kyc ? (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3">
                        <span className="text-xs font-bold text-slate-700">{detail.kyc.full_name || detail.user.name}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          detail.kyc.status === 'approved' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : detail.kyc.status === 'rejected' 
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>{detail.kyc.status}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-200/40 rounded-xl px-4 py-3 text-center">No identity files submitted to system.</p>
                    )}
                  </div>

                  {/* Purchase order list */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-rose-500" /> Platform invoices ({detail.orders?.length || 0})</p>
                    {detail.orders?.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                        {detail.orders.map(o => (
                          <div key={o.id} className="px-4 py-3 text-xs hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-700 leading-tight">{o.item_name}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{o.created_at}</p>
                              </div>
                              <div className="text-right shrink-0 ml-3">
                                <p className="font-black text-slate-800">₹{o.amount_paid.toLocaleString('en-IN')}</p>
                                <span className={`inline-block text-[9px] font-black uppercase mt-0.5 ${o.payment_status === 'paid' ? 'text-emerald-600' : o.payment_status === 'failed' ? 'text-rose-500' : 'text-amber-500'}`}>{o.payment_status}</span>
                              </div>
                            </div>
                            {o.extra_info && (o.extra_info.city || o.extra_info.profession) && (
                              <p className="text-slate-400 mt-1.5 text-[10px] bg-slate-50 px-2 py-1 rounded">
                                {[o.extra_info.city, o.extra_info.profession].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-200/40 rounded-xl px-4 py-3 text-center">No purchases recorded.</p>
                    )}
                  </div>

                  {/* Invited referrals */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Share2 className="w-4 h-4 text-rose-500" /> Network tree referrals ({detail.referrals?.length || 0})</p>
                    {detail.referrals?.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                        {detail.referrals.map(r => (
                          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs hover:bg-slate-50/50 transition-colors">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-700 leading-tight">{r.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{r.email}</p>
                            </div>
                            <span className="text-slate-400 text-[10px] shrink-0 font-medium">{r.created_at}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-200/40 rounded-xl px-4 py-3 text-center">No referrals registered.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
