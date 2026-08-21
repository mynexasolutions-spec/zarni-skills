import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Crown, Flame, Loader2, Sun, CalendarDays, CalendarRange, Infinity as InfinityIcon, Coins, Star, Award } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const PERIODS = [
  { key: 'today', label: 'Today', Icon: Sun },
  { key: '7days', label: '7 Days', Icon: CalendarDays },
  { key: '30days', label: '30 Days', Icon: CalendarRange },
  { key: 'alltime', label: 'All Time', Icon: InfinityIcon },
];

// Gold / silver / bronze, expressed as an accent hue plus the deep tone its
// card fades into — same dark-glass language the wallet tiles use.
const MEDALS = [
  { accent: '#fbbf24', deep: '#3f2508', order: 'order-2', lift: '-translate-y-4 sm:-translate-y-8', pedestal: 'h-16 sm:h-24' },
  { accent: '#cbd5e1', deep: '#1e293b', order: 'order-1', lift: 'translate-y-1', pedestal: 'h-10 sm:h-16' },
  { accent: '#fb923c', deep: '#3b1a08', order: 'order-3', lift: 'translate-y-3', pedestal: 'h-7 sm:h-12' },
];

function Avatar({ row, size = 'w-16 h-16' }) {
  const initials = row.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="relative shrink-0 rounded-full transition-transform duration-500 group-hover:scale-105 overflow-hidden shadow-sm">
      {row.profile_image_url ? (
        <img src={row.profile_image_url} alt={row.name} className={`${size} rounded-full object-cover shrink-0`} />
      ) : (
        <div className={`${size} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center shrink-0`}>
          {initials}
        </div>
      )}
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [position, setPosition] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [period, setPeriod] = useState('alltime');
  const [barsVisible, setBarsVisible] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setTabLoading(true);
      setBarsVisible(false);
      const response = await api.get(`/student/leaderboard?period=${period}`);
      setLeaderboard(response.data.leaderboard || []);
      setPosition(response.data.leaderboard_position || 1);
    } catch (err) {
      console.error('Error fetching leaderboard lists', err);
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  useEffect(() => {
    if (loading || tabLoading) return;
    const t = setTimeout(() => setBarsVisible(true), 50);
    return () => clearTimeout(t);
  }, [loading, tabLoading, leaderboard]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-indigo-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Calculating rankings...</p>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const topEarnings = leaderboard[0]?.earnings || 1;
  const inTop10 = leaderboard.some(row => row.id === user?.id);
  const combinedEarnings = leaderboard.reduce((sum, row) => sum + (row.earnings || 0), 0);

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up pb-10">

      {/* Hero — aurora field behind a frosted glass panel */}
      <div className="relative">
        <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#070d20]"></div>
          <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-violet-600/70 blur-[75px] animate-blob"></div>
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-blue-600/70 blur-[75px] animate-blob" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-56 h-56 rounded-full bg-indigo-500/55 blur-[80px] animate-blob" style={{ animationDelay: '6s' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(7,13,32,0.6) 0%, rgba(7,13,32,0.2) 45%, rgba(7,13,32,0.8) 100%)' }}></div>
        </div>

        <div className="relative rounded-[2.2rem] p-6 sm:p-8 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(8,15,40,0.45)] overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-violet-200 backdrop-blur-md mb-3">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-violet-300"></span>
                </span>
                <Flame className="w-3.5 h-3.5" /> Active Rankings
              </div>
              <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight flex items-center justify-center sm:justify-start gap-2.5 bg-gradient-to-b from-white via-white to-amber-100 bg-clip-text text-transparent">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 shrink-0 drop-shadow-[0_0_14px_rgba(251,191,36,0.5)]" />
                Commission Leaders
              </h1>
              <p className="text-blue-100/60 text-xs sm:text-sm font-medium mt-2">Climb the ranks and compete with other students</p>
            </div>

            <div className="relative shrink-0 px-8 py-4 rounded-2xl text-center bg-white/10 border border-white/20 backdrop-blur-md min-w-[150px] shadow-inner">
              <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent"></span>
              <p className="text-[9px] text-blue-100/60 font-black uppercase tracking-[0.22em] mb-1.5">Your rank</p>
              <AnimatedNumber
                value={position}
                prefix="#"
                duration={1000}
                className="block text-3xl sm:text-4xl font-heading font-black tabular-nums bg-gradient-to-b from-white to-amber-200 bg-clip-text text-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Combined Volume', Icon: Coins, accent: '#34d399', deep: '#043d2f',
            body: <AnimatedNumber value={combinedEarnings} prefix="₹" duration={1200} className="block text-2xl sm:text-3xl font-heading font-black text-white leading-none tabular-nums whitespace-nowrap" /> },
          { label: 'Top Earner', Icon: Star, accent: '#c084fc', deep: '#2e1065',
            body: <p className="text-xl sm:text-2xl font-heading font-black text-white leading-none truncate">{leaderboard[0]?.name || '—'}</p> },
        ].map(({ label, Icon, accent, deep, body }) => (
          <div
            key={label}
            className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-white/[0.08] hover:border-white/[0.16]"
            style={{ background: `linear-gradient(155deg, ${deep} 0%, #070d1f 65%)`, boxShadow: '0 10px 30px rgba(8,15,38,0.3)' }}
          >
            <span className="absolute -top-14 -right-10 w-36 h-36 rounded-full blur-[52px] pointer-events-none opacity-45 transition-opacity duration-500 group-hover:opacity-80" style={{ background: accent }}></span>
            <span className="absolute inset-x-0 top-0 h-px pointer-events-none opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}></span>
            <Icon className="absolute -right-4 -bottom-4 w-24 h-24 pointer-events-none transition-transform duration-500 group-hover:scale-105" style={{ color: accent, opacity: 0.08 }} strokeWidth={1} />

            <div className="relative z-10 p-4 sm:p-5 flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}14` }}>
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45 mb-1.5">{label}</p>
                {body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Period Tabs — an even 4-up grid rather than a scrolling row, so the
          last tab is never clipped off the edge on a narrow screen. */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-1 sm:flex sm:justify-center sm:gap-1.5 p-1 bg-slate-100 border border-slate-200/60 rounded-2xl">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 min-w-0 ${period === p.key
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                }`}
            >
              <p.Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
        {tabLoading && (
          <Loader2 className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-600 animate-spin sm:static sm:translate-y-0 sm:ml-2" />
        )}
      </div>

      {/* Podium — top three on dark medal-tinted glass, winner raised */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2.5 sm:gap-6 px-1 pt-8 sm:pt-12">
          {top3.map((row, idx) => {
            const medal = MEDALS[idx];
            const isCurrentUser = row.id === user?.id;
            const isWinner = idx === 0;
            const avatarSize = isWinner ? 'w-16 h-16 sm:w-24 sm:h-24' : 'w-12 h-12 sm:w-18 sm:h-18';

            return (
              <div
                key={row.id}
                className={`relative flex-1 max-w-[118px] sm:max-w-[200px] ${medal.order} ${medal.lift} animate-fade-in-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div
                  className={`group relative rounded-2xl sm:rounded-[1.75rem] px-2 sm:px-4 ${isWinner ? 'pt-8 pb-5 sm:pt-11 sm:pb-7' : 'pt-6 pb-4 sm:pt-8 sm:pb-6'} text-center overflow-hidden border transition-all duration-300 hover:-translate-y-1.5`}
                  style={{
                    background: `linear-gradient(160deg, ${medal.deep} 0%, #070d1f 70%)`,
                    borderColor: isCurrentUser ? '#a78bfa' : `${medal.accent}33`,
                    boxShadow: `0 14px 36px rgba(8,15,38,0.4)${isWinner ? `, 0 0 44px ${medal.accent}33` : ''}`,
                  }}
                >
                  {/* Medal glow + top hairline */}
                  <span className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[50px] pointer-events-none opacity-50 transition-opacity duration-500 group-hover:opacity-80" style={{ background: medal.accent }}></span>
                  <span className="absolute inset-x-0 top-0 h-px pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${medal.accent}, transparent)` }}></span>

                  {/* Crown above the winner */}
                  {isWinner && (
                    <div className="absolute top-1.5 sm:top-2.5 left-1/2 -translate-x-1/2 z-20 animate-float">
                      <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" fill="currentColor" />
                    </div>
                  )}

                  <div className="relative z-10 flex justify-center mb-2.5 sm:mb-4">
                    <div className="relative rounded-full p-[2.5px]" style={{ background: `linear-gradient(140deg, ${medal.accent}, #ffffff55, ${medal.accent})` }}>
                      <div className="rounded-full p-[2px] bg-[#0b1330]">
                        <Avatar row={row} size={avatarSize} />
                      </div>
                    </div>
                  </div>

                  <span
                    className="relative z-10 inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-black mb-2 text-slate-900"
                    style={{ background: `linear-gradient(140deg, #ffffff, ${medal.accent})`, boxShadow: `0 4px 14px ${medal.accent}66` }}
                  >
                    {idx + 1}
                  </span>

                  <p className="relative z-10 font-extrabold text-[11px] sm:text-sm text-white leading-tight line-clamp-2 break-words min-h-[2.2em]">
                    {row.name}
                  </p>

                  {isCurrentUser && (
                    <span className="relative z-10 inline-block text-[8px] sm:text-[9px] font-black text-violet-200 bg-violet-500/20 border border-violet-400/40 px-2 py-0.5 rounded mt-1.5 uppercase tracking-wider">You</span>
                  )}

                  <div className="relative z-10 mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3 border-t border-white/10">
                    <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em] block text-white/40 mb-1">Earned</span>
                    <span className="font-heading font-black text-sm sm:text-lg tabular-nums whitespace-nowrap" style={{ color: medal.accent }}>
                      ₹{Math.round(row.earnings).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Pedestal */}
                <div
                  className={`relative mt-2 sm:mt-2.5 rounded-b-xl sm:rounded-b-2xl ${medal.pedestal} flex items-start justify-center overflow-hidden border-x border-b`}
                  style={{
                    background: `linear-gradient(180deg, ${medal.deep} 0%, #070d1f 100%)`,
                    borderColor: `${medal.accent}26`,
                  }}
                >
                  <span className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${medal.accent}66, transparent)` }}></span>
                  <span className="relative mt-1 sm:mt-2 font-heading font-black text-lg sm:text-2xl" style={{ color: `${medal.accent}55` }}>{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranked list (4th onward) */}
      {rest.length > 0 && (
        <div className="relative rounded-[2.2rem] border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative flex items-center justify-between mb-5">
            <h3 className="flex items-center gap-3 text-sm sm:text-base font-heading font-black text-slate-900">
              <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-amber-500" strokeWidth={2.4} />
              </span>
              Full Rankings
            </h3>
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 border border-slate-200/40 text-slate-500 shrink-0">
              {leaderboard.length} users ranked
            </span>
          </div>

          <div className="relative divide-y divide-slate-100">
            {rest.map((row, idx) => {
              const isCurrentUser = row.id === user?.id;
              const rank = idx + 4;
              const barWidth = Math.max(6, Math.round((row.earnings / topEarnings) * 100));
              return (
                <div
                  key={row.id}
                  className={`group relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl transition-all border-l-2 ${isCurrentUser ? 'bg-purple-500/5 border-purple-500/30 ring-1 ring-purple-500/10' : 'border-transparent hover:bg-slate-50/70 hover:border-amber-400/50'}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Glowing progress line background */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500/[0.12] via-indigo-500/[0.06] to-transparent transition-[width] duration-1000 ease-out group-hover:from-violet-500/20"
                    style={{ width: barsVisible ? `${barWidth}%` : '0%', transitionDelay: `${idx * 60}ms` }}
                  ></div>
                  
                  <span className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${isCurrentUser ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30' : 'bg-slate-100 text-slate-500 border border-slate-200/60 group-hover:bg-slate-200'}`}>
                    {rank}
                  </span>
                  
                  <div className="relative shrink-0">
                    <Avatar row={row} size="w-9 h-9" />
                  </div>
                  
                  <div className="relative flex-1 min-w-0">
                    <p className={`font-bold text-xs sm:text-sm leading-tight truncate ${isCurrentUser ? 'text-purple-700' : 'text-slate-800'}`}>
                      {row.name}
                    </p>
                    {isCurrentUser && <span className="text-[8px] font-black text-purple-600 bg-purple-50 px-1 py-0.1 border border-purple-200/50 rounded uppercase tracking-wider mt-0.5 inline-block">You</span>}
                  </div>
                  
                  <div className="relative text-right shrink-0">
                    <span className="font-heading font-black text-sm sm:text-base text-slate-900 tabular-nums whitespace-nowrap">₹{Math.round(row.earnings).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state details */}
      {leaderboard.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-[2.2rem] border border-slate-200/60">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
            <Trophy className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm font-semibold px-6 max-w-sm mx-auto leading-relaxed">No leaderboard stats recorded yet. Complete referrals and courses to climb the ranks!</p>
        </div>
      )}

      {/* Sticky ranking footer card */}
      {leaderboard.length > 0 && (
        <div className="relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10 animate-fade-in-up">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]" />
          </div>
          <div className="relative flex-1 min-w-0">
            <p className="font-bold text-sm tracking-tight">Rank Position: #{position}</p>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              {inTop10 ? "Spectacular! You are dominating the leaderboard lists." : 'Refer active package sales to increase override ranks.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
