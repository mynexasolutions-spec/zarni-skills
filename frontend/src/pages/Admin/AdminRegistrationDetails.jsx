import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, ShieldCheck, Mail, Phone, User, Users, Clock, Tag, X, MapPin, Calendar, Share2 } from 'lucide-react';
import api from '../../utils/api';

const ROLE_COLORS = {
  admin: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
  manager: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
  team_member: 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20',
  student: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
};

function Avatar({ name, role }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  const roleColor = ROLE_COLORS[role] || 'from-slate-500 to-slate-700';
  
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0 ring-2 ring-slate-200/50">
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
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-slate-300 border-t-slate-700 animate-spin"></div>
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
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
                {initials}
              </div>
            )}
            <h3 className="mt-4 text-xl font-heading font-black text-slate-900">{member.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`inline-flex px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${ROLE_COLORS[member.role] || 'bg-slate-100 text-slate-600'}`}>
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
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
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
                  <User className="w-4 h-4 text-purple-500 shrink-0" />
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

export default function AdminRegistrationDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/registration-details');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-slate-700"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-slate-600 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading registration rolls...</p>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-800/20 shrink-0">
            <ClipboardList className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Registration Ledger</h2>
            <p className="text-xs text-slate-400 font-semibold">Audit trace logs of users and referral chain mappings</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {users.length} accounts recorded
        </span>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter ledger by name, email, phone link..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200/80 text-sm focus:outline-none focus:ring-4 focus:ring-slate-800/5 focus:border-slate-800 transition-all bg-white hover:bg-slate-50 focus:bg-white"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] admin-scrollbar">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4 pl-6">Registered Account</th>
                <th className="px-6 py-4">Phone contact</th>
                <th className="px-6 py-4">System Tier</th>
                <th className="px-6 py-4">Promo code</th>
                <th className="px-6 py-4">Referred by</th>
                <th className="px-6 py-4 pr-6 text-right">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5 pl-6">
                    <button type="button" onClick={() => openMemberProfile(u.id)} className="flex items-center gap-3 text-left">
                      <Avatar name={u.name} role={u.role} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight hover:text-slate-600 transition-colors">{u.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{u.phone || '—'}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-500 font-bold tracking-wider">{u.referral_code}</td>
                  <td className="px-6 py-3.5 font-bold text-rose-600">
                    {u.referred_by_id ? (
                      <button type="button" onClick={() => openMemberProfile(u.referred_by_id)} className="hover:text-rose-700 transition-colors">
                        {u.referred_by_name}
                      </button>
                    ) : (
                      'Direct signup'
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right pr-6 text-slate-400 text-xs">{u.created_at}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">No users matching search filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-4">
        {filtered.map((u, idx) => (
          <div key={u.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-3 justify-between">
              <button type="button" onClick={() => openMemberProfile(u.id)} className="flex items-center gap-3 min-w-0 text-left">
                <Avatar name={u.name} role={u.role} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</p>
                </div>
              </button>
              <span className={`shrink-0 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Phone contact</p><p className="text-slate-700 font-medium">{u.phone || '—'}</p></div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Referred By</p>
                {u.referred_by_id ? (
                  <button type="button" onClick={() => openMemberProfile(u.referred_by_id)} className="text-rose-600 font-bold truncate hover:text-rose-700 transition-colors block">
                    {u.referred_by_name}
                  </button>
                ) : (
                  <p className="text-rose-600 font-bold truncate">Direct Sign-up</p>
                )}
              </div>
              <div className="col-span-2 mt-1.5"><p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Registration Date</p><p className="text-slate-600 font-medium">{u.created_at}</p></div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 font-semibold">No records found.</div>
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
