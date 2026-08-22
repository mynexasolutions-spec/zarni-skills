import React, { useEffect, useState, useMemo } from 'react';
import { Network, Users, Loader2, UserCheck, Sparkles, GitBranch, Copy, Check, Crown, Clock, CheckCircle2, Search, Filter, Share2, ShieldCheck, ArrowUpRight, Award, ChevronRight, X, Mail, Phone, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

const AVATAR_GRADIENTS = [
  'from-blue-600 via-indigo-600 to-blue-700',
  'from-emerald-500 via-teal-600 to-emerald-700',
  'from-purple-600 via-indigo-600 to-purple-700',
  'from-amber-500 via-orange-600 to-amber-700',
  'from-pink-500 via-rose-600 to-pink-700'
];

function initialsOf(name) {
  return name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'ZS';
}

function StatusBadge({ status }) {
  const isPaid = status === 'Paid';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-sm ${
      isPaid
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
      {isPaid ? 'Active Member' : 'Pending Enrollment'}
    </span>
  );
}

function ReferralCode({ code, copied, onCopy }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onCopy(code); }}
      className="group/code inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200/80 font-mono text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
      title="Click to copy referral code"
    >
      <span>{code}</span>
      {copied === code ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" strokeWidth={2.5} />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover/code:text-blue-600 transition-colors" strokeWidth={2} />
      )}
    </button>
  );
}

function MemberProfileModal({ member, loading, onClose }) {
  if (member === null) return null;
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
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
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
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
                {initialsOf(member.name)}
              </div>
            )}
            <h3 className="mt-4 text-xl font-heading font-black text-slate-900">{member.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {member.created_at}
            </p>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
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

export default function MyTeam() {
  const [stats, setStats] = useState({ l1_total: 0, l1_active: 0, l2_total: 0, l2_active: 0 });
  const [level1, setLevel1] = useState([]);
  const [level2, setLevel2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending'
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'LEVEL1' | 'LEVEL2'
  const [profileModal, setProfileModal] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(3);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const openMemberProfile = async (memberId) => {
    setProfileLoading(true);
    setProfileModal({});
    try {
      const response = await api.get(`/student/my-team/profile/${memberId}`);
      setProfileModal(response.data.user);
    } catch (err) {
      console.error('Error fetching member profile', err);
      setProfileModal(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/student/my-team');
        setStats(response.data.stats || {});
        setLevel1(response.data.level1 || []);
        setLevel2(response.data.level2 || []);
      } catch (err) {
        console.error('Error fetching team:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const filteredLevel1 = useMemo(() => {
    return level1.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.referral_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [level1, searchTerm, statusFilter]);

  const filteredLevel2 = useMemo(() => {
    return level2.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.referred_by?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [level2, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Downline Network...</p>
        </div>
      </div>
    );
  }

  const totalMembers = (stats.l1_total || 0) + (stats.l2_total || 0);
  const totalActive = (stats.l1_active || 0) + (stats.l2_active || 0);

  const topReferrerId = level1.reduce((best, u) => (
    u.level2_count > 0 && (!best || u.level2_count > best.level2_count) ? u : best
  ), null)?.id;

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT NETWORK HERO ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 text-slate-900 shadow-2xl shadow-blue-200/40 border border-blue-100 group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #eef4ff 55%, #e0ebff 100%)' }}
        >
          {/* Ambient Blur Bursts */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-400/15 rounded-full blur-[130px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                <Network className="w-7 h-7 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 border border-blue-200 text-blue-700 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Affiliate Network
                </span>
                <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-slate-900">My Team Network</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Track your direct sponsors and multi-level indirect team growth</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white border border-blue-200/80 rounded-2xl p-3.5 shadow-sm min-w-[130px] text-center">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Earners</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalActive}</p>
              </div>
            </div>

          </div>
        </div>
      </Reveal>

      {/* ── LEVEL SUMMARY METRIC CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <Reveal variant="fade-up" delay={100}>
          <div 
            onClick={() => setActiveTab('LEVEL1')}
            className={`cursor-pointer bg-white border p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
              activeTab === 'LEVEL1' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-slate-200/90'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
                Level 1
              </span>
            </div>

            <div className="mt-5">
              <h3 className="font-heading font-black text-lg text-slate-900">Direct Referrals</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.l1_active || 0}</span>
                <span className="text-xs font-bold text-slate-400">Active</span>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5} /> Active Direct Earners
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal variant="fade-up" delay={150}>
          <div 
            onClick={() => setActiveTab('LEVEL2')}
            className={`cursor-pointer bg-white border p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
              activeTab === 'LEVEL2' ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200/90'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <GitBranch className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-full">
                Level 2
              </span>
            </div>

            <div className="mt-5">
              <h3 className="font-heading font-black text-lg text-slate-900">Indirect Referrals</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.l2_active || 0}</span>
                <span className="text-xs font-bold text-slate-400">Active</span>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" strokeWidth={2.5} /> Active Tier 2 Earners
              </p>
            </div>
          </div>
        </Reveal>

      </div>

      {/* ── SEARCH & TAB TOGGLE CONTROLS ───────────────────────────────────────── */}
      <Reveal variant="fade-up" delay={200}>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team member name or code..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-2xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-1.5 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all text-center whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Team
            </button>

            <button
              onClick={() => setActiveTab('LEVEL1')}
              className={`px-1.5 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'LEVEL1'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3 h-3 shrink-0 hidden xs:inline-block" />
              <span>L1 ({filteredLevel1.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('LEVEL2')}
              className={`px-1.5 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'LEVEL2'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GitBranch className="w-3 h-3 shrink-0 hidden xs:inline-block" />
              <span>L2 ({filteredLevel2.length})</span>
            </button>
          </div>

        </div>
      </Reveal>

      {/* ── DIRECT REFERRALS (LEVEL 1) TABLE SECTION ───────────────────────────────────────── */}
      {(activeTab === 'ALL' || activeTab === 'LEVEL1') && (
        <Reveal variant="fade-up" delay={250}>
          <section className="bg-white border border-slate-200/90 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white text-slate-900 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative overflow-hidden border-b border-blue-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[90px] pointer-events-none"></div>

              <div className="flex items-center gap-3 sm:gap-4 relative z-10 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                  <Users className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-black text-base sm:text-xl text-slate-900 tracking-tight leading-snug">Direct Referrals (Level 1)</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-normal">Students enrolled directly using your referral link</p>
                </div>
              </div>

              <div className="relative z-10 self-start sm:self-auto">
                <span className="inline-flex items-center bg-white border border-blue-200 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-black text-blue-700 shrink-0 shadow-sm">
                  {filteredLevel1.length} Direct Members
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {filteredLevel1.length > 0 ? (
                <>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-400 text-xs font-black uppercase tracking-widest px-4">
                          <th className="pb-3 px-4">Student</th>
                          <th className="pb-3 px-4">Referral Code</th>
                          <th className="pb-3 px-4">Joined Date</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 px-4 text-right">Level 2 Team</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {filteredLevel1.map((u, idx) => (
                          <tr key={u.id} className="group bg-slate-50/60 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/40 border border-slate-200/80 hover:border-blue-300 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
                            <td className="py-4 px-4 font-bold text-slate-900 rounded-l-2xl">
                              <button type="button" onClick={() => openMemberProfile(u.id)} className="flex items-center gap-3.5 text-left group/person">
                                <div className="relative shrink-0">
                                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} text-white text-xs font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    {initialsOf(u.name)}
                                  </div>
                                  {u.id === topReferrerId && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md" title="Top Referrer">
                                      <Crown className="w-3 h-3 text-slate-900" strokeWidth={3} />
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-heading font-black text-slate-900 text-sm group-hover:text-blue-600 group-hover/person:text-blue-600 transition-colors">{u.name}</p>
                                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">Direct Sponsor Payout</p>
                                </div>
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <ReferralCode code={u.referral_code} copied={copiedCode} onCopy={copyCode} />
                            </td>
                            <td className="py-4 px-4 text-xs font-bold text-slate-500">{u.joined_at}</td>
                            <td className="py-4 px-4"><StatusBadge status={u.status} /></td>
                            <td className="py-4 px-4 text-right rounded-r-2xl">
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-violet-700 bg-violet-50 border border-violet-200 px-3.5 py-1.5 rounded-full shadow-sm">
                                <GitBranch className="w-3.5 h-3.5 text-violet-600" strokeWidth={2.5} /> {u.level2_count} Members
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="sm:hidden space-y-4">
                    {filteredLevel1.map((u, idx) => (
                      <div key={u.id} className="bg-slate-50/90 border border-slate-200/90 p-4 sm:p-5 rounded-3xl space-y-3.5 shadow-sm">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <button type="button" onClick={() => openMemberProfile(u.id)} className="flex items-center gap-3 min-w-0 text-left">
                              <div className="relative shrink-0">
                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} text-white text-xs font-black flex items-center justify-center shadow-md`}>
                                  {initialsOf(u.name)}
                                </div>
                                {u.id === topReferrerId && (
                                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md">
                                    <Crown className="w-3 h-3 text-slate-900" strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-heading font-black text-slate-900 text-sm leading-snug break-words">{u.name}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">Direct Sponsor Payout</p>
                              </div>
                            </button>
                            <div className="shrink-0 self-start">
                              <StatusBadge status={u.status} />
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/80 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Referral Code</span>
                            <ReferralCode code={u.referral_code} copied={copiedCode} onCopy={copyCode} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Joined Date</span>
                            <span className="text-slate-800 font-extrabold">{u.joined_at}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Level 2 Team</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
                              <GitBranch className="w-3 h-3 text-violet-600" /> {u.level2_count} Members
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs font-black uppercase tracking-wider">
                  No Direct Referrals found matching search criteria.
                </div>
              )}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── INDIRECT REFERRALS (LEVEL 2) TABLE SECTION ───────────────────────────────────────── */}
      {(activeTab === 'ALL' || activeTab === 'LEVEL2') && (
        <Reveal variant="fade-up" delay={300}>
          <section className="bg-white border border-slate-200/90 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white text-slate-900 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative overflow-hidden border-b border-indigo-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-[90px] pointer-events-none"></div>

              <div className="flex items-center gap-3 sm:gap-4 relative z-10 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
                  <GitBranch className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-black text-base sm:text-xl text-slate-900 tracking-tight leading-snug">Indirect Referrals (Level 2)</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-normal">Students referred by your Level 1 direct team</p>
                </div>
              </div>

              <div className="relative z-10 self-start sm:self-auto">
                <span className="inline-flex items-center bg-white border border-indigo-200 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-black text-indigo-700 shrink-0 shadow-sm">
                  {filteredLevel2.length} Indirect Members
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-8">
              {filteredLevel2.length > 0 ? (
                <>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-400 text-xs font-black uppercase tracking-widest px-4">
                          <th className="pb-3 px-4">Student Name</th>
                          <th className="pb-3 px-4">Referred By (Level 1)</th>
                          <th className="pb-3 px-4">Referral Code</th>
                          <th className="pb-3 px-4">Joined Date</th>
                          <th className="pb-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {filteredLevel2.map((u, idx) => (
                          <tr key={u.id} className="group bg-slate-50/60 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-purple-50/40 border border-slate-200/80 hover:border-indigo-300 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
                            <td className="py-4 px-4 font-bold text-slate-900 rounded-l-2xl">
                              <button type="button" onClick={() => openMemberProfile(u.id)} className="flex items-center gap-3.5 text-left">
                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} text-white text-xs font-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                  {initialsOf(u.name)}
                                </div>
                                <div>
                                  <p className="font-heading font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{u.name}</p>
                                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Level 2 Payout</p>
                                </div>
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full shadow-sm">
                                <Users className="w-3.5 h-3.5 text-indigo-500" strokeWidth={2.5} /> {u.referred_by}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <ReferralCode code={u.referral_code} copied={copiedCode} onCopy={copyCode} />
                            </td>
                            <td className="py-4 px-4 text-xs font-bold text-slate-400">{u.joined_at}</td>
                            <td className="py-4 px-4 text-right rounded-r-2xl"><StatusBadge status={u.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="sm:hidden space-y-4 pb-1">
                    {filteredLevel2.map((u, idx) => (
                      <div key={u.id} className="bg-slate-50/90 border border-slate-200/90 p-4 sm:p-5 rounded-2xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <button type="button" onClick={() => openMemberProfile(u.id)} className="flex items-center gap-3 min-w-0 text-left">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} text-white text-xs font-black flex items-center justify-center shadow-md shrink-0`}>
                              {initialsOf(u.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-heading font-black text-slate-900 text-sm leading-snug break-words">{u.name}</p>
                              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Level 2 Payout</p>
                            </div>
                          </button>
                          <div className="shrink-0 self-start">
                            <StatusBadge status={u.status} />
                          </div>
                        </div>
                        <div className="pt-2.5 border-t border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Referred By</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                              <Users className="w-3 h-3 text-indigo-500" /> {u.referred_by}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Referral Code</span>
                            <ReferralCode code={u.referral_code} copied={copiedCode} onCopy={copyCode} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">Joined Date</span>
                            <span className="text-slate-800 font-extrabold">{u.joined_at}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-black uppercase tracking-wider">
                No Indirect Referrals found matching search criteria.
              </div>
            )}
          </div>
        </section>
      </Reveal>
    )}

      <MemberProfileModal
        member={profileModal}
        loading={profileLoading}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}

