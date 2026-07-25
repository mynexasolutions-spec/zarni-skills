import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Crown, Medal, Flame, TrendingUp, Loader2, Sun, CalendarDays, CalendarRange, Infinity as InfinityIcon, Coins, Star, Award, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const PERIODS = [
  { key: 'today', label: 'Today', Icon: Sun },
  { key: '7days', label: '7 Days', Icon: CalendarDays },
  { key: '30days', label: '30 Days', Icon: CalendarRange },
  { key: 'alltime', label: 'All Time', Icon: InfinityIcon },
];

const PODIUM_BASE = {
  0: { height: 'h-20 sm:h-24', from: 'from-amber-100 to-amber-200/70', border: 'border-amber-200', text: 'text-amber-700' },
  1: { height: 'h-14 sm:h-16', from: 'from-slate-100 to-slate-200/70', border: 'border-slate-200', text: 'text-slate-600' },
  2: { height: 'h-10 sm:h-12', from: 'from-orange-100 to-orange-200/60', border: 'border-orange-200', text: 'text-orange-700' },
};

const PODIUM_STYLES = {
  0: {
    ring: 'ring-4 ring-amber-400 ring-offset-2 ring-offset-white',
    badge: 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/20',
    glow: 'shadow-[0_20px_50px_-15px_rgba(245,158,11,0.15)]',
    order: 'order-2',
    lift: '-translate-y-4 sm:-translate-y-8 scale-[1.03]',
    height: 'py-9 sm:py-11',
    border: 'border-amber-200/80',
    bg: 'bg-gradient-to-b from-amber-50/40 to-white',
  },
  1: {
    ring: 'ring-4 ring-slate-300 ring-offset-2 ring-offset-white',
    badge: 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-slate-500/20',
    glow: 'shadow-[0_15px_30px_-10px_rgba(148,163,184,0.1)]',
    order: 'order-1',
    lift: 'scale-95 translate-y-1',
    height: 'py-7 sm:py-8',
    border: 'border-slate-200/80',
    bg: 'bg-gradient-to-b from-slate-50/40 to-white',
  },
  2: {
    ring: 'ring-4 ring-orange-300 ring-offset-2 ring-offset-white',
    badge: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-500/20',
    glow: 'shadow-[0_15px_30px_-10px_rgba(234,88,12,0.1)]',
    order: 'order-3',
    lift: 'scale-[0.9] translate-y-3',
    height: 'py-7 sm:py-8',
    border: 'border-orange-200/80',
    bg: 'bg-gradient-to-b from-orange-50/40 to-white',
  },
};

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

      {/* Hero Banner card in Premium Light gradient */}
      <div className="relative overflow-hidden rounded-[2.2rem] p-6 sm:p-8 text-slate-900 border border-slate-200/60 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #edd8fc 50%, #e0e7ff 100%)' }}>
        
        {/* Subtle grid elements */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #8b5cf6 0.7px, transparent 0.7px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-400/20 rounded-full blur-[80px] pointer-events-none animate-blob"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-purple-200/50 text-[10px] font-black uppercase tracking-widest text-purple-700 shadow-sm backdrop-blur-md">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-purple-600"></span>
              </span>
              <Flame className="w-3.5 h-3.5 text-purple-600" /> Active Rankings
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2 text-slate-900">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]" /> Commission Leaders
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Climb the ranks and compete with other students this month</p>
          </div>
          
          <div className="relative bg-white/80 border border-slate-200/60 px-7 py-4 rounded-2xl text-center shrink-0 shadow-sm min-w-[150px]">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Your rank</p>
            <AnimatedNumber
              value={position}
              prefix="#"
              duration={1000}
              className="block text-2xl sm:text-3xl font-black text-purple-700 tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/15 transition-all duration-300 hover:-translate-y-0.5">
          <Coins className="absolute -right-3 -bottom-3 w-16 h-16 text-white/10 pointer-events-none transition-transform group-hover:scale-105" strokeWidth={1} />
          <p className="relative text-[10px] font-extrabold text-emerald-100/90 uppercase tracking-widest mb-2">Combined Volume</p>
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-emerald-200 mr-0.5">₹</span>
            <AnimatedNumber value={combinedEarnings} duration={1200} className="relative block text-xl sm:text-2xl font-black text-white leading-none tracking-tight tabular-nums" />
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/15 transition-all duration-300 hover:-translate-y-0.5">
          <Star className="absolute -right-3 -bottom-3 w-16 h-16 text-white/10 pointer-events-none transition-transform group-hover:scale-105" strokeWidth={1} />
          <p className="relative text-[10px] font-extrabold text-indigo-100/90 uppercase tracking-widest mb-2">Top earner</p>
          <p className="relative text-base sm:text-lg font-black text-white leading-none truncate mt-1 drop-shadow-sm">{leaderboard[0]?.name || '—'}</p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-start sm:justify-center p-1 bg-slate-100 border border-slate-200/60 rounded-2xl">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 ${period === p.key
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200/40 translate-y-0 font-black'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
          >
            <p.Icon className="w-3.5 h-3.5" />
            {p.label}
          </button>
        ))}
        {tabLoading && <Loader2 className="w-4 h-4 text-purple-600 animate-spin ml-2 shrink-0" />}
      </div>

      {/* Podium — Elevated glass pedestals for top 3 (responsive for both Mobile and Desktop) */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 sm:gap-6 mb-12 px-1">
          {top3.map((row, idx) => {
            const style = PODIUM_STYLES[idx];
            const isCurrentUser = row.id === user?.id;
            
            // Adjust inner padding and heights dynamically for mobile vs desktop
            const cardHeightClass = idx === 0 ? 'py-5 sm:py-11' : 'py-3.5 sm:py-8';
            const avatarSize = idx === 0 ? 'w-14 h-14 sm:w-20 sm:h-20' : 'w-10 h-10 sm:w-16 sm:h-16';
            
            return (
              <div
                key={row.id}
                className={`relative flex-1 max-w-[110px] sm:max-w-[190px] ${style.order} ${style.lift} animate-fade-in-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                
                <div className={`group relative rounded-2xl sm:rounded-[2.2rem] px-1.5 sm:px-4 ${cardHeightClass} text-center border ${style.border} ${style.bg} ${style.glow} border border-slate-200/70 transition-all duration-300 hover:-translate-y-1 ${isCurrentUser ? 'ring-2 ring-purple-600' : 'shadow-md shadow-slate-100/50'}`}>
                  
                  <div className="flex justify-center mb-2 sm:mb-4">
                    <div className={`relative rounded-full ${style.ring}`}>
                      {idx === 0 && (
                        <div className="absolute -top-5 sm:-top-8 transform left-1/2 -translate-x-1/2 z-10 animate-bounce">
                          <Crown className="w-5 sm:w-8 h-5 sm:h-8 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]" fill="currentColor" />
                        </div>
                      )}
                      <Avatar row={row} size={avatarSize} />
                    </div>
                  </div>
                  
                  <span className="relative inline-flex items-center justify-center mb-1.5 sm:mb-3">
                    <span className={`relative inline-flex items-center justify-center w-5 h-5 sm:w-8 sm:h-8 rounded-full text-[9px] sm:text-xs font-black shadow ${style.badge}`}>
                      {idx + 1}
                    </span>
                  </span>
                  
                  <p className="font-extrabold text-[10px] sm:text-sm text-slate-800 leading-tight h-7 sm:h-10 overflow-hidden line-clamp-2 break-words">
                    {row.name}
                  </p>
                  
                  {isCurrentUser && (
                    <span className="inline-block text-[8px] sm:text-[9px] font-black text-purple-600 bg-purple-50 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded mt-1 border border-purple-200/50">YOU</span>
                  )}
                  
                  <div className="mt-1.5 sm:mt-2.5">
                    <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Earned</span>
                    <span className="font-black text-xs sm:text-base text-slate-850 tabular-nums">₹{Math.round(row.earnings).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Light Pedestal base */}
                <div
                  className={`relative mt-2 sm:mt-3 rounded-b-xl sm:rounded-b-2xl border-x border-b ${PODIUM_BASE[idx].border} ${PODIUM_BASE[idx].height} flex items-start justify-center overflow-hidden shadow-inner bg-gradient-to-b ${PODIUM_BASE[idx].from}`}
                >
                  <span className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'repeating-linear-gradient(135deg, #000 0, #000 1px, transparent 1px, transparent 8px)',
                  }}></span>
                  <span className={`relative mt-1 sm:mt-2 font-black text-xl sm:text-3xl ${PODIUM_BASE[idx].text} drop-shadow-sm`}>{idx + 1}</span>
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
            <h3 className="flex items-center gap-2.5 text-sm sm:text-base font-extrabold text-slate-800">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/30">
                <Trophy className="w-4 h-4 text-amber-500" />
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
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/5 to-transparent transition-[width] duration-1000 ease-out group-hover:from-purple-500/10 animate-pulse"
                    style={{ width: barsVisible ? `${barWidth}%` : '0%', transitionDelay: `${idx * 60}ms` }}
                  ></div>
                  
                  <span className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${isCurrentUser ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
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
                    <span className="font-black text-xs sm:text-sm text-slate-800 tabular-nums">₹{Math.round(row.earnings).toLocaleString('en-IN')}</span>
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
