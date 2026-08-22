import React, { useEffect, useState } from 'react';
import { Users, Search, Coins, TrendingUp, DollarSign, X, Mail, Phone, MapPin, Calendar, User as UserIcon, Share2 } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm ring-2 ring-indigo-500/10">
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
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #7c3aed 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
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
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
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
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
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

export default function AdminUsersEarnings() {
  const [rows, setRows] = useState([]);
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
        const res = await api.get('/admin/users-earnings');
        setRows(res.data.users || []);
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-indigo-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Student Earnings...</p>
      </div>
    );
  }

  const filtered = rows.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalAllTime = rows.reduce((sum, r) => sum + (r.alltime || 0), 0);

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <Coins className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Student Earnings Ledger</h2>
            <p className="text-xs text-slate-400 font-semibold">Real-time commission breakdown for every affiliate student</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {rows.length} total students
        </span>
      </div>

      {/* Top Stat & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-lg border border-white/10 transition-all">
          <TrendingUp className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-100/90 mb-1.5">Aggregated Student Earnings</p>
          <div className="flex items-baseline">
            <span className="text-xl font-bold mr-0.5 text-indigo-200">₹</span>
            <AnimatedNumber value={totalAllTime} duration={1200} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name or email address..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto admin-scrollbar">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Today</th>
                <th className="px-6 py-4 text-right">7 Days</th>
                <th className="px-6 py-4 text-right">30 Days</th>
                <th className="px-6 py-4 text-right pr-6">All Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <button type="button" onClick={() => openMemberProfile(r.id)} className="flex items-center gap-3 text-left">
                      <Avatar name={r.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{r.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{r.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200/40">
                      {r.role || 'Student'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-700 tabular-nums">₹{r.today.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-700 tabular-nums">₹{r['7days'].toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-700 tabular-nums">₹{r['30days'].toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3.5 text-right pr-6 font-black text-emerald-600 text-base tabular-nums">₹{r.alltime.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">No student records found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {filtered.map((r, idx) => (
          <div key={r.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => openMemberProfile(r.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                <Avatar name={r.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 leading-tight truncate">{r.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{r.email}</p>
                </div>
              </button>
              <div className="text-right shrink-0">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">All Time</span>
                <span className="font-black text-base text-emerald-600 tabular-nums">₹{r.alltime.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center bg-slate-50/50 rounded-xl p-2.5">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Today</p>
                <p className="text-xs font-black text-slate-800 tabular-nums mt-0.5">₹{r.today.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">7 Days</p>
                <p className="text-xs font-black text-slate-800 tabular-nums mt-0.5">₹{r['7days'].toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">30 Days</p>
                <p className="text-xs font-black text-slate-800 tabular-nums mt-0.5">₹{r['30days'].toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400 font-semibold">No student records found matching your search.</div>
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
