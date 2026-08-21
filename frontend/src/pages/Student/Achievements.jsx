import React, { useEffect, useState } from 'react';
import { Award, Trophy, Users, Rocket, Star, Crown, Medal, Target, Flame, Gem, Zap, ShieldCheck, Lock, CheckCircle2, Loader2, Send, Clock, XCircle, Search, X, SlidersHorizontal } from 'lucide-react';
import api from '../../utils/api';

const ICON_MAP = {
  Trophy, Users, Rocket, Star, Crown, Medal, Target, Flame, Gem, Zap, ShieldCheck, Award,
};

function UnlockedRing({ unlocked, total }) {
  const size = 74;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? unlocked / total : 0;
  const offset = circumference - pct * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Soft bloom so the ring sits in the glass rather than on top of it */}
      <span className="absolute inset-1 rounded-full bg-amber-300/20 blur-lg pointer-events-none"></span>
      <svg width={size} height={size} className="relative -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#unlockedRingGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: 'drop-shadow(0 0 6px rgba(252,211,77,0.6))' }}
        />
        <defs>
          <linearGradient id="unlockedRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-lg font-black text-white leading-none tabular-nums">
          {unlocked}<span className="text-white/45 text-xs">/{total}</span>
        </span>
      </div>
    </div>
  );
}

// The joined "x / y label" string is fine for a ribbon but too long for the
// card body, where it truncated mid-word. These are the same numbers split
// into pieces the layout can place independently.
function metricParts(m) {
  if (m.metric === 'referrals') {
    const left = Math.max(0, Number(m.target) - Number(m.current));
    return { current: `${m.current} referrals`, target: `of ${m.target}`, remaining: left > 0 ? `${left} more` : null };
  }
  if (m.metric === 'rank') {
    return { current: m.current ? `Rank #${m.current}` : 'Unranked', target: `Top ${m.target}`, remaining: null };
  }
  const cur = Number(m.current) || 0;
  const tgt = Number(m.target) || 0;
  const left = Math.max(0, tgt - cur);
  return {
    current: `₹${Math.round(cur).toLocaleString('en-IN')}`,
    target: `of ₹${Math.round(tgt).toLocaleString('en-IN')}`,
    remaining: left > 0 ? `₹${Math.round(left).toLocaleString('en-IN')}` : null,
  };
}

function formatMetricLine(m) {
  if (m.metric === 'referrals') return `${m.current} / ${m.target} referrals`;
  if (m.metric === 'rank') return m.current ? `Currently rank #${m.current}` : 'Not ranked yet';
  return `₹${Number(m.current).toLocaleString('en-IN')} / ₹${Number(m.target).toLocaleString('en-IN')} active income`;
}

export default function Achievements() {
  const [milestones, setMilestones] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barsVisible, setBarsVisible] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/student/achievement-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching achievement requests', err);
    }
  };

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await api.get('/student/achievement-milestones');
        setMilestones(response.data.milestones || []);
      } catch (err) {
        console.error('Error fetching achievement data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
    fetchRequests();
  }, []);

  const requestFor = (achievementId) => requests.find(r => r.achievement_id === achievementId);

  const handleClaim = async (achievementId) => {
    setSubmittingId(achievementId);
    try {
      await api.post('/student/achievement-requests', { achievement_id: achievementId, note });
      setClaimingId(null);
      setNote('');
      fetchRequests();
    } catch (err) {
      console.error('Error submitting achievement claim', err);
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setBarsVisible(true), 100);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const unlockedCount = milestones.filter(m => m.unlocked).length;
  const lockedCount = milestones.length - unlockedCount;
  const completionPct = milestones.length ? Math.round((unlockedCount / milestones.length) * 100) : 0;

  const filterTabs = [
    { key: 'all', label: 'All', count: milestones.length },
    { key: 'unlocked', label: 'Unlocked', count: unlockedCount },
    { key: 'locked', label: 'Locked', count: lockedCount },
  ];

  const visibleMilestones = milestones.filter((m) => {
    if (filter === 'unlocked' && !m.unlocked) return false;
    if (filter === 'locked' && m.unlocked) return false;
    if (search.trim() && !m.title?.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">

      {/* Hero — aurora field behind a frosted glass panel, matching the
          wallet and leaderboard pages so the dashboard reads as one product. */}
      <div className="relative mb-8 sm:mb-10">
        <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#0c0722]"></div>
          <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-violet-600/50 blur-[80px] animate-blob"></div>
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-fuchsia-600/40 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-56 h-56 rounded-full bg-indigo-500/40 blur-[85px] animate-blob" style={{ animationDelay: '6s' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(12,7,34,0.72) 0%, rgba(12,7,34,0.5) 45%, rgba(12,7,34,0.94) 100%)' }}></div>
        </div>

        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(12,7,34,0.5)]">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>

          {/* Kept fully inside the panel — bled off the edge it just showed a
              few stray curves and stopped reading as a trophy at all. */}
          <Trophy
            className="absolute right-5 top-5 w-28 h-28 sm:w-40 sm:h-40 text-amber-300/[0.06] pointer-events-none select-none rotate-6"
            strokeWidth={1}
          />

          {/* floating sparkles */}
          {[
            { top: '18%', left: '58%', size: 4, delay: '0s', dur: '5s' },
            { top: '62%', left: '48%', size: 3, delay: '1.2s', dur: '6s' },
            { top: '32%', left: '73%', size: 5, delay: '0.6s', dur: '4.5s' },
            { top: '78%', left: '66%', size: 3, delay: '2s', dur: '5.5s' },
          ].map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-amber-200/70 pointer-events-none"
              style={{
                top: s.top, left: s.left, width: s.size, height: s.size,
                boxShadow: '0 0 8px 2px rgba(252,211,77,0.6)',
                animation: `float ${s.dur} ease-in-out infinite`,
                animationDelay: s.delay
              }}
            ></span>
          ))}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-amber-200 backdrop-blur-md mb-3">
                <Award className="w-3.5 h-3.5 animate-pulse" /> Milestone Tracker
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                {/* Gold trophy medallion — the card's focal point */}
                <span className="relative shrink-0">
                  <span className="absolute -inset-2 rounded-full bg-amber-400/25 blur-lg animate-pulse pointer-events-none"></span>
                  <span className="relative flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-400/25 to-amber-600/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                    <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" strokeWidth={2.1} />
                  </span>
                </span>

                <h1
                  className="min-w-0 font-display font-black text-[30px] sm:text-[46px] leading-[1.05] tracking-[-0.015em] bg-clip-text text-transparent animate-shine drop-shadow-[0_2px_14px_rgba(0,0,0,0.4)]"
                  style={{
                    backgroundImage: 'linear-gradient(100deg, #ffffff 0%, #ffffff 32%, #fde68a 46%, #fbbf24 54%, #ffffff 68%, #ffffff 100%)',
                    backgroundSize: '200% auto',
                  }}
                >
                  Achievements
                </h1>
              </div>
              <p className="text-violet-100/80 text-xs sm:text-sm max-w-md font-medium">
                Badges that unlock automatically from your real earnings and referral activity.
              </p>
            </div>
            <div className="relative shrink-0 w-full sm:w-auto sm:min-w-[300px] backdrop-blur-md border border-white/15 rounded-2xl px-5 sm:px-6 py-5 overflow-hidden"
              style={{ background: 'linear-gradient(150deg, rgba(14,9,38,0.72) 0%, rgba(8,5,24,0.82) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(8,5,25,0.35)' }}>
              <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent"></span>
              <span className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

              <div className="relative flex items-center gap-4">
                <UnlockedRing unlocked={unlockedCount} total={milestones.length} />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[9px] text-violet-200/75 font-black uppercase tracking-[0.22em] mb-1.5 whitespace-nowrap">Badges Unlocked</p>
                  <p className="font-heading text-2xl font-black text-white leading-none tabular-nums">
                    {unlockedCount}
                    <span className="text-white/55 text-sm font-bold"> of {milestones.length}</span>
                  </p>
                  <p className="text-[10px] text-amber-300 font-black mt-1.5">
                    {lockedCount > 0 ? `${lockedCount} more to unlock` : 'Every badge earned 🎉'}
                  </p>
                </div>
              </div>

              <div className="relative mt-4 h-2 w-full rounded-full bg-black/40 ring-1 ring-inset ring-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-violet-300 shadow-[0_0_12px_rgba(252,211,77,0.45)] transition-[width] duration-1000 ease-out"
                  style={{ width: `${completionPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
          No achievement milestones have been set up yet. Check back soon!
        </div>
      ) : (
        <>
          {/* Filter tabs + search */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-2.5 sm:p-3 overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.10)]">
            <span className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-violet-500/[0.05] blur-3xl pointer-events-none"></span>

            {/* Even 3-up on mobile so no tab is clipped off the edge */}
            <div className="relative grid grid-cols-3 gap-1.5 sm:flex sm:items-center">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`min-w-0 inline-flex items-center justify-center gap-1.5 px-1.5 sm:px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide transition-all duration-300 active:scale-95 ${
                    filter === tab.key
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {tab.key === 'unlocked' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  {tab.key === 'locked' && <Lock className="w-3.5 h-3.5 shrink-0" />}
                  {tab.key === 'all' && <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{tab.label}</span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] tabular-nums ${filter === tab.key ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600'}`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search achievements..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 hover:bg-slate-50 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {visibleMilestones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
              No achievements match {search ? `"${search}"` : 'this filter'}.
            </div>
          ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 auto-rows-fr">
          {visibleMilestones.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Trophy;
            const pct = item.unlocked ? 100 : Math.min(100, Math.round((item.current / item.target) * 100));
            const parts = metricParts(item);
            const onCardMouseMove = (e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              el.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
              el.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
            };
            const onCardMouseLeave = (e) => {
              e.currentTarget.style.setProperty('--tilt-x', '0deg');
              e.currentTarget.style.setProperty('--tilt-y', '0deg');
            };
            return (
              <div
                key={item.id}
                onMouseMove={onCardMouseMove}
                onMouseLeave={onCardMouseLeave}
                className="group relative h-full animate-pop-in transition-transform duration-300 hover:-translate-y-2 [transform:perspective(1000px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {/* Ambient colored glow behind the card, blooms on hover */}
                <div className={`absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 pointer-events-none`}></div>

              <div className={`relative overflow-hidden h-full flex flex-col bg-white border rounded-2xl sm:rounded-[1.75rem] p-3 sm:p-6 shadow-sm transition-shadow duration-300 ${item.unlocked ? 'border-amber-200/70 group-hover:shadow-[0_20px_45px_-10px_rgba(180,120,10,0.22)]' : 'border-slate-100 group-hover:shadow-xl'}`}>
                {item.unlocked && (
                  <span className="absolute inset-x-0 top-0 h-[3px] z-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none"></span>
                )}
                {item.unlocked && (
                  <>
                    <span className="absolute top-2 left-2 w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(252,211,77,0.8)] animate-float pointer-events-none z-10"></span>
                    <span className="absolute top-8 left-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)] animate-float-delayed pointer-events-none z-10"></span>
                  </>
                )}
                <span className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none z-10 ${
                  item.unlocked ? 'bg-gradient-to-r from-transparent via-slate-100/70 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-200/25 to-transparent'
                }`}></span>
                {item.unlocked && !item.image_display_url && (
                  <div className="absolute top-5 right-5 z-10">
                    <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-md animate-pulse"></div>
                    <CheckCircle2 className="relative w-5 h-5 text-emerald-500" />
                  </div>
                )}

                {item.image_display_url ? (
                  <div className="relative -mx-3 -mt-3 sm:-mx-6 sm:-mt-6 mb-2.5 sm:mb-4 overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                    {/* Glow ring around the image, colored by tier when unlocked */}
                    <div className={`absolute -inset-4 opacity-60 blur-2xl transition-opacity duration-500 ${item.unlocked ? `bg-gradient-to-br ${item.gradient}` : 'bg-slate-400/0'}`}></div>
                    <img
                      src={item.image_display_url}
                      alt={item.title}
                      className={`relative w-full h-full object-cover transition-all duration-500 ${item.unlocked ? 'group-hover:scale-110' : 'grayscale brightness-[0.4] group-hover:brightness-[0.5] group-hover:scale-105'}`}
                    />
                    <div className={`absolute inset-0 ${item.unlocked ? 'bg-gradient-to-t from-black/60 via-black/5 to-transparent' : 'bg-gradient-to-b from-black/50 via-black/25 to-black/50'}`}></div>

                    {/* Target amount ribbon */}
                    <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full backdrop-blur-md border shadow-lg ${
                      item.unlocked
                        ? 'bg-black/55 border-amber-300/40 text-amber-200 shadow-black/40'
                        : `bg-gradient-to-r ${item.gradient} border-white/10 text-white shadow-black/40`
                    }`}>
                      {item.metric === 'earnings' ? `₹${Number(item.target).toLocaleString('en-IN')}` : formatMetricLine(item).split(' / ')[1] || item.title}
                    </span>

                    {item.unlocked ? (
                      <div className="absolute top-3 right-3">
                        <div className="absolute inset-0 rounded-full bg-emerald-400/50 blur-md animate-pulse"></div>
                        <div className="relative w-8 h-8 rounded-full bg-emerald-500 border-2 border-white/70 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-3 rounded-full bg-amber-400/40 blur-lg animate-pulse"></div>
                          <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-amber-300/50 animate-spin-slow"></div>
                          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-black border border-amber-300/40 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-transform duration-300 group-hover:scale-110">
                            <Lock className="w-6 h-6 text-amber-300" strokeWidth={2.2} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Title overlaid on the image, matching the reference layout */}
                    <h3 className="absolute bottom-2 sm:bottom-3 left-2.5 sm:left-4 right-2.5 sm:right-4 font-black text-white text-xs sm:text-base tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] truncate">{item.title}</h3>
                  </div>
                ) : (
                  <div className={`relative -mx-3 -mt-3 sm:-mx-6 sm:-mt-6 mb-2.5 sm:mb-4 overflow-hidden ${item.unlocked ? `bg-gradient-to-br ${item.gradient}` : 'bg-slate-100'}`} style={{ aspectRatio: '1 / 1' }}>
                    {item.unlocked && (
                      <div className="absolute inset-0 opacity-[0.12] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px' }}></div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${item.unlocked ? 'bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg' : 'bg-white border border-slate-200'}`}>
                        {item.unlocked && <span className="absolute -inset-1.5 rounded-2xl bg-white/30 blur-md animate-pulse"></span>}
                        <Icon className={`relative w-6 h-6 sm:w-7 sm:h-7 ${item.unlocked ? 'text-white' : 'text-slate-300'}`} strokeWidth={1.8} />
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${item.unlocked ? 'text-white/70' : 'text-slate-300'}`}>No Image</span>
                    </div>
                    {!item.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <div className="relative">
                          <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-lg animate-pulse"></div>
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-slate-800 to-black border border-amber-300/40 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                            <Lock className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-300" strokeWidth={2.2} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!item.image_display_url && <h3 className="relative font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h3>}
                {item.description && <p className="relative text-[10px] sm:text-xs text-slate-500 leading-relaxed mb-3 sm:mb-4 line-clamp-2">{item.description}</p>}

                {!item.unlocked ? (
                  /* Progress is the whole story on a locked card, so the
                     percentage leads at display size and the raw figures sit
                     under the bar as support — the old single-line
                     "x / y active income" was overflowing and truncating. */
                  <div className="relative mt-auto">
                    <div className="flex items-end justify-between gap-1.5 mb-2">
                      <span className={`font-heading font-black text-2xl sm:text-3xl leading-none tabular-nums bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                        {pct}<span className="text-sm sm:text-base">%</span>
                      </span>
                      {parts.remaining && (
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wide text-slate-400 tabular-nums pb-0.5 truncate min-w-0">
                          {parts.remaining} to go
                        </span>
                      )}
                    </div>

                    <div className="relative w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden ring-1 ring-inset ring-slate-200/70">
                      <div
                        className={`relative h-full rounded-full bg-gradient-to-r ${item.gradient} transition-[width] duration-1000 ease-out overflow-hidden`}
                        style={{ width: barsVisible ? `${pct}%` : '0%', transitionDelay: `${idx * 60}ms` }}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer-sweep"></span>
                        {/* Glossy cap so the fill reads as a filled tube, not a flat block */}
                        <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-white/25 pointer-events-none"></span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-1.5 mt-1.5">
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-600 tabular-nums truncate min-w-0">{parts.current}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tabular-nums shrink-0">{parts.target}</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-auto flex items-center gap-2.5 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/70 overflow-hidden">
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
                    <span className="relative w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.6} />
                    </span>
                    <p className="relative text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 leading-none truncate">Achievement Earned</p>
                  </div>
                )}

                {item.unlocked && (() => {
                  const req = requestFor(item.id);
                  if (req?.status === 'pending') {
                    return (
                      <div className="relative mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5" /> Claim Pending Review
                      </div>
                    );
                  }
                  if (req?.status === 'approved') {
                    return (
                      <div className="relative mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claim Approved
                      </div>
                    );
                  }
                  return (
                    <div className="relative mt-2.5 pt-2.5 border-t border-slate-100/80">
                      {req?.status === 'rejected' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Previous claim not approved
                        </p>
                      )}
                      {claimingId === item.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Optional note for the admin..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClaim(item.id)}
                              disabled={submittingId === item.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase disabled:opacity-60"
                            >
                              <Send className="w-3 h-3" /> {submittingId === item.id ? 'Sending...' : 'Submit'}
                            </button>
                            <button onClick={() => { setClaimingId(null); setNote(''); }} className="px-3 py-2 border border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-500">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setClaimingId(item.id)}
                          className={`group/btn relative w-full overflow-hidden flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-[0.12em] text-white bg-gradient-to-r ${item.gradient} shadow-[0_8px_20px_-6px_rgba(15,23,42,0.45)] ring-1 ring-inset ring-white/25 transition-all duration-300 hover:shadow-[0_14px_28px_-8px_rgba(15,23,42,0.5)] hover:-translate-y-0.5 active:translate-y-0`}
                        >
                          <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></span>
                          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent"></span>
                          <Send className="relative w-3 h-3 shrink-0" /> <span className="relative">Claim This Achievement</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
              </div>
            );
          })}
        </div>
          )}
        </>
      )}
    </div>
  );
}
