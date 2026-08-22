import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Loader2, Sun, CalendarDays, CalendarRange, Infinity as InfinityIcon, X, Mail, Phone, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const PERIODS = [
  { key: 'today', label: 'Today', Icon: Sun },
  { key: '7days', label: '7 Days', Icon: CalendarDays },
  { key: '30days', label: '30 Days', Icon: CalendarRange },
  { key: 'alltime', label: 'All Time', Icon: InfinityIcon },
];

const RANK_STYLE = {
  0: {
    badge: 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-400/50',
    card: 'bg-gradient-to-r from-amber-50 via-amber-50/60 to-white border-amber-200 shadow-amber-200/40',
    ring: 'ring-2 ring-amber-300',
  },
  1: {
    badge: 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-400/50',
    card: 'bg-gradient-to-r from-slate-50 via-slate-50/60 to-white border-slate-200 shadow-slate-200/40',
    ring: 'ring-2 ring-slate-300',
  },
  2: {
    badge: 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-400/50',
    card: 'bg-gradient-to-r from-orange-50 via-orange-50/60 to-white border-orange-200 shadow-orange-200/40',
    ring: 'ring-2 ring-orange-300',
  },
};

function Avatar({ row, size = 'w-10 h-10', ring = '' }) {
  const initials = row.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return row.profile_image_url ? (
    <img src={row.profile_image_url} alt={row.name} className={`${size} rounded-full object-cover shrink-0 ${ring}`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black flex items-center justify-center shrink-0 ${ring}`}>
      {initials}
    </div>
  );
}

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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1.5">
              <Calendar className="w-3.5 h-3.5" /> Joined {member.created_at}
            </p>

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

export default function ManagerLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [period, setPeriod] = useState('alltime');
  const [profileModal, setProfileModal] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const openMemberProfile = async (memberId) => {
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
    const fetchLeaderboard = async () => {
      try {
        setTabLoading(true);
        const response = await api.get(`/manager/leaderboard?period=${period}`);
        setLeaderboard(response.data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching manager leaderboard', err);
      } finally {
        setLoading(false);
        setTabLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight">Team Leaderboard</h2>
          <p className="text-xs text-slate-400 font-medium">Top performers in your team</p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 flex-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                period === p.key
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 -translate-y-0.5'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:-translate-y-0.5'
              }`}
            >
              <p.Icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          ))}
        </div>
        {tabLoading && <Loader2 className="w-4 h-4 text-violet-600 animate-spin shrink-0" />}
      </div>

      {/* Ranked list */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 sm:p-6 shadow-sm">
        <div className="space-y-2 sm:space-y-2.5">
          {leaderboard.map((row, idx) => {
            const style = RANK_STYLE[idx];
            return (
              <button
                type="button"
                key={row.id}
                onClick={() => openMemberProfile(row.id)}
                className={`group w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl transition-all animate-fade-in-up text-left hover:-translate-y-0.5 ${
                  style ? `border ${style.card} shadow-sm hover:shadow-md` : 'hover:bg-slate-50'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 ${
                  style ? `shadow-md ${style.badge}` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {idx === 0 ? <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" /> : idx + 1}
                </span>
                <Avatar
                  row={row}
                  size={idx < 3 ? 'w-11 h-11 sm:w-12 sm:h-12' : 'w-9 h-9 sm:w-10 sm:h-10'}
                  ring={style?.ring || ''}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-slate-900 leading-snug break-words group-hover:text-violet-600 transition-colors ${idx < 3 ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                    {row.name}
                  </p>
                  {idx < 3 && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                      {idx === 0 ? '🏆 Top Earner' : `Rank #${idx + 1}`}
                    </p>
                  )}
                </div>
                <AnimatedNumber
                  value={row.earnings}
                  prefix="₹"
                  duration={1000}
                  className={`font-black text-slate-900 shrink-0 whitespace-nowrap tabular-nums ${idx < 3 ? 'text-sm sm:text-lg' : 'text-xs sm:text-sm'}`}
                />
              </button>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium px-6">No earnings in your team yet for this period.</p>
          </div>
        )}
      </div>

      <MemberProfileModal
        member={profileModal}
        loading={profileLoading}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}
