import React, { useEffect, useState, useMemo } from 'react';
import { Users, GraduationCap, UserCog, Briefcase, ShieldCheck, Power, ChevronDown, Loader2, Search, X, Wallet, Clock, Share2, ShoppingBag, BadgeCheck } from 'lucide-react';
import api from '../../utils/api';

const ROLE_TABS = [
  { key: '', label: 'All' },
  { key: 'student', label: 'Students' },
  { key: 'manager', label: 'Managers' },
  { key: 'team_member', label: 'Team Members' },
  { key: 'admin', label: 'Admins' },
];

const ROLE_META = {
  student: { label: 'Student', badge: 'bg-blue-50 text-blue-700', ring: 'ring-blue-100', grad: 'from-blue-500 to-indigo-600' },
  manager: { label: 'Manager', badge: 'bg-violet-50 text-violet-700', ring: 'ring-violet-100', grad: 'from-violet-500 to-purple-600' },
  team_member: { label: 'Team', badge: 'bg-cyan-50 text-cyan-700', ring: 'ring-cyan-100', grad: 'from-cyan-500 to-teal-600' },
  admin: { label: 'Admin', badge: 'bg-red-50 text-red-700', ring: 'ring-red-100', grad: 'from-red-500 to-rose-600' },
};

function Avatar({ u }) {
  const initials = u.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const meta = ROLE_META[u.role] || ROLE_META.student;
  return (
    <div className={`relative shrink-0 rounded-full ring-2 ${meta.ring}`}>
      {u.profile_image_url ? (
        <img src={u.profile_image_url} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${meta.grad} text-white text-xs font-black flex items-center justify-center`}>
          {initials}
        </div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${u.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const kpis = [
    { key: 'student', label: 'Students', icon: GraduationCap, color: 'from-blue-500 to-indigo-600', ring: 'ring-blue-200' },
    { key: 'manager', label: 'Managers', icon: UserCog, color: 'from-violet-500 to-purple-600', ring: 'ring-violet-200' },
    { key: 'team_member', label: 'Team Members', icon: Briefcase, color: 'from-cyan-500 to-teal-600', ring: 'ring-cyan-200' },
    { key: 'admin', label: 'Admins', icon: ShieldCheck, color: 'from-red-500 to-rose-600', ring: 'ring-red-200' },
  ];

  return (
    <div className="text-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight">Platform Users</h2>
          <p className="text-xs text-slate-400 font-medium">{roleCounts.all ?? 0} total accounts across all roles</p>
        </div>
      </div>

      {/* KPI tiles — clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, idx) => {
          const active = roleFilter === kpi.key;
          return (
            <button
              key={kpi.key}
              onClick={() => setRoleFilter(active ? '' : kpi.key)}
              className={`group relative overflow-hidden text-left rounded-3xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ring-2 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${active ? `${kpi.ring} ring-offset-2 ring-offset-slate-50` : 'ring-transparent'}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <kpi.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" strokeWidth={1.5} />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                  <kpi.icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black leading-none">{roleCounts[kpi.key] ?? 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-2">{kpi.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar: filter tabs + search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {ROLE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide shrink-0 transition-colors ${
                roleFilter === tab.key ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-200'
              }`}
            >
              {tab.label} ({roleCounts[tab.key || 'all'] ?? 0})
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, code..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(u.id)} className="flex items-center gap-3 group/user text-left">
                      <Avatar u={u} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate group-hover/user:text-red-600 transition-colors">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">₹{(u.total_earnings || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-400">{u.created_at}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[10px] uppercase rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <div className="relative inline-block">
                        <select
                          value={u.role}
                          disabled={busyId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`appearance-none pl-2.5 pr-7 py-1.5 font-bold text-[10px] uppercase rounded-full border-0 focus:ring-2 focus:ring-red-200 cursor-pointer ${(ROLE_META[u.role] || ROLE_META.student).badge}`}
                        >
                          <option value="student">Student</option>
                          <option value="manager">Manager</option>
                          <option value="team_member">Team Member</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={busyId === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors ${
                          u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {busyId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                    {search ? `No users match "${search}".` : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <button onClick={() => openDetail(u.id)} className="flex items-center gap-3 w-full text-left">
              <Avatar u={u} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{u.name}</p>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>{u.is_active ? 'Active' : 'Inactive'}</span>
            </button>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Earnings</span>
              <span className="font-semibold text-slate-700">₹{(u.total_earnings || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-slate-400">Joined</span>
              <span className="text-slate-600">{u.created_at}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {u.role === 'admin' ? (
                <span className="flex-1 text-center px-2.5 py-2 bg-red-50 text-red-700 font-bold text-[10px] uppercase rounded-xl">Admin</span>
              ) : (
                <div className="relative flex-1">
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className={`w-full appearance-none px-3 py-2 pr-7 font-bold text-[10px] uppercase rounded-xl border-0 focus:ring-2 focus:ring-red-200 ${(ROLE_META[u.role] || ROLE_META.student).badge}`}
                  >
                    <option value="student">Student</option>
                    <option value="manager">Manager</option>
                    <option value="team_member">Team Member</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                </div>
              )}
              {u.role !== 'admin' && (
                <button
                  onClick={() => handleToggle(u.id)}
                  disabled={busyId === u.id}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors ${
                    u.is_active ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {busyId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">
            {search ? `No users match "${search}".` : 'No users found.'}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{detail.user?.name || 'User Details'}</h3>
                  <p className="text-[11px] text-white/60 truncate">{detail.user?.email || 'Loading...'}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-7">
              {detailLoading ? (
                <div className="py-16 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
              ) : !detail.user ? (
                <div className="py-16 text-center text-slate-400 font-medium">Could not load this user's details.</div>
              ) : (
                <>
                  {/* Profile summary */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${(ROLE_META[detail.user.role] || ROLE_META.student).badge}`}>
                      {(ROLE_META[detail.user.role] || ROLE_META.student).label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${detail.user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {detail.user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">Joined {detail.user.created_at}</span>
                    {detail.user.phone && <span className="text-[11px] text-slate-400 font-semibold">· {detail.user.phone}</span>}
                    {detail.user.referrer_name && <span className="text-[11px] text-slate-400 font-semibold">· Referred by {detail.user.referrer_name}</span>}
                  </div>

                  {/* Earnings KPIs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md">
                      <Wallet className="w-4 h-4 mb-1.5 text-white/80" />
                      <p className="text-lg font-black leading-none">₹{(detail.user.total_earnings || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/75 mt-1">Total Earned</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
                      <ShoppingBag className="w-4 h-4 mb-1.5 text-white/80" />
                      <p className="text-lg font-black leading-none">₹{(detail.user.available_balance || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/75 mt-1">Available</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                      <Clock className="w-4 h-4 mb-1.5 text-white/80" />
                      <p className="text-lg font-black leading-none">₹{(detail.user.pending_earnings || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/75 mt-1">Pending</p>
                    </div>
                  </div>

                  {/* KYC status */}
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" /> KYC Status</p>
                    {detail.kyc ? (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <span className="text-xs font-bold text-slate-700">{detail.kyc.full_name || detail.user.name}</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          detail.kyc.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : detail.kyc.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                        }`}>{detail.kyc.status}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">No KYC submitted yet.</p>
                    )}
                  </div>

                  {/* Orders */}
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Order History ({detail.orders?.length || 0})</p>
                    {detail.orders?.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                        {detail.orders.map(o => (
                          <div key={o.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-700 truncate">{o.item_name}</p>
                              <p className="text-slate-400">{o.created_at}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-black text-slate-800">₹{o.amount_paid.toLocaleString('en-IN')}</p>
                              <span className={`text-[9px] font-black uppercase ${o.payment_status === 'paid' ? 'text-emerald-600' : o.payment_status === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>{o.payment_status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">No purchases yet.</p>
                    )}
                  </div>

                  {/* Referrals */}
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Direct Referrals ({detail.referrals?.length || 0})</p>
                    {detail.referrals?.length > 0 ? (
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                        {detail.referrals.map(r => (
                          <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-700 truncate">{r.name}</p>
                              <p className="text-slate-400 truncate">{r.email}</p>
                            </div>
                            <span className="text-slate-400 shrink-0 ml-3">{r.created_at}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">No referrals yet.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
