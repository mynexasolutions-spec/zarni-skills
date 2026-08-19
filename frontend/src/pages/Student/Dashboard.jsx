import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Trophy, IndianRupee, CheckCircle, Zap,
  BookOpen, Briefcase, Compass, Award, ChevronRight,
  UserCircle, Crown, Medal, Sparkles, Sun, Sunset, Moon,
  ArrowUpRight, Wallet
} from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', Icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', Icon: Sun };
  if (hour < 21) return { text: 'Good evening', Icon: Sunset };
  return { text: 'Good night', Icon: Moon };
}

// Catmull-Rom → cubic bezier, for a smooth area/line chart
function buildSmoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = useGreeting();

  const [data, setData] = useState({
    leaderboardPosition: 1,
    allTimeEarnings: 0,
    allTimePaid: 0,
    last30Earnings: 0,
    last7Earnings: 0,
    activeIncome: { today: 0, '7days': 0, '30days': 0, alltime: 0 },
    passiveIncome: { today: 0, '7days': 0, '30days': 0, alltime: 0 },
    totalReferrals: 0,
    recentReferrals: [],
    leaderboard: [],
    chartData: { labels: [], values: [] }
  });

  const [loading, setLoading] = useState(true);
  // Matches the 7-day window the initial /student/dashboard call already
  // returns as chart_data, so the effect below doesn't need to re-fetch
  // the same data again the moment the page finishes loading.
  const [timeframe, setTimeframe] = useState('7days');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const skipNextChartFetch = useRef(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/student/dashboard');
        const newData = {
          leaderboardPosition: response.data.leaderboard_position || 1,
          allTimeEarnings: Math.round(response.data.all_time_earnings || 0),
          allTimePaid: Math.round(response.data.all_time_paid || 0),
          last30Earnings: Math.round(response.data.last_30_earnings || 0),
          last7Earnings: Math.round(response.data.last_7_earnings || 0),
          activeIncome: response.data.active_income || { today: 0, '7days': 0, '30days': 0, alltime: 0 },
          passiveIncome: response.data.passive_income || { today: 0, '7days': 0, '30days': 0, alltime: 0 },
          totalReferrals: response.data.referrals_count || 0,
          recentReferrals: response.data.recent_referrals || [],
          leaderboard: response.data.leaderboard || [],
          chartData: response.data.chart_data || { labels: [], values: [] }
        };
        setData(newData);
        formatChartData(newData.chartData);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (loading) return;
    // The very first run right after the initial load already has 7-day
    // chart data from /student/dashboard — skip the redundant round trip.
    if (skipNextChartFetch.current) {
      skipNextChartFetch.current = false;
      return;
    }
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const response = await api.get(`/student/earnings-chart-data?timeframe=${timeframe}`);
        formatChartData(response.data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [timeframe, loading]);

  const formatChartData = (chart) => {
    if (chart.labels && chart.values) {
      const formatted = chart.labels.map((label, idx) => ({
        name: label,
        value: chart.values[idx] || 0
      }));
      setChartData(formatted);
    }
  };

  if (loading) {
    const Shimmer = ({ className }) => (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/60 to-transparent"></span>
      </div>
    );
    return (
      <div className="w-full space-y-6">
        <Shimmer className="h-[132px] rounded-[22px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[0, 1, 2, 3].map(i => <Shimmer key={i} className="h-[140px] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[0, 1, 2, 3].map(i => <Shimmer key={i} className="h-[140px] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[0, 1, 2, 3].map(i => <Shimmer key={i} className="h-[120px] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Shimmer className="h-[320px] rounded-2xl" />
          <Shimmer className="h-[320px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasChartData = chartData.length > 0 && chartData.some(d => d.value > 0);
  const maxChartValue = hasChartData ? Math.max(...chartData.map(d => d.value), 1) : 1;
  const chartTotal = chartData.reduce((sum, d) => sum + d.value, 0);

  const n = chartData.length;
  const padX = n > 1 ? 4 : 50;
  const xFor = (i) => (n > 1 ? padX + (i / (n - 1)) * (100 - 2 * padX) : 50);
  const yFor = (v) => 100 - (v / maxChartValue) * 82 - 9;
  const points = chartData.map((d, i) => ({ x: xFor(i), y: yFor(d.value), ...d }));
  const linePath = buildSmoothPath(points);
  const areaPath = points.length ? `${linePath} L ${xFor(n - 1)} 100 L ${xFor(0)} 100 Z` : '';
  const showDots = n <= 12;
  const showLabel = (i) => n <= 12 || i % Math.ceil(n / 8) === 0;

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in-up">

      {/* ══════════════════════════════════════════════
           WELCOME BANNER
         ══════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 rounded-[18px] sm:rounded-[22px] px-5 sm:px-8 py-5 sm:py-7 overflow-hidden group animate-gradient-x"
        style={{
          background: 'linear-gradient(115deg, #0f1f4d 0%, #1e3a8a 25%, #2563eb 50%, #1e3a8a 75%, #0f1f4d 100%)',
          boxShadow: '0 20px 45px -12px rgba(30, 64, 175, 0.45)'
        }}
      >
        {/* Decorative glows */}
        <div
          className="absolute pointer-events-none rounded-full animate-blob transition-transform duration-700 group-hover:scale-110"
          style={{
            top: '-70%', right: '-6%', width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(96,165,250,0.35) 0%, transparent 70%)'
          }}
        ></div>
        <div
          className="absolute pointer-events-none rounded-full animate-blob"
          style={{
            bottom: '-80%', left: '10%', width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
            animationDelay: '2.5s'
          }}
        ></div>
        {/* subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}></div>
        {/* shimmer sweep */}
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

        <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-3 sm:gap-4 min-w-0">
          <div className="relative flex-shrink-0 animate-float">
            <span className="absolute -inset-2 rounded-full bg-blue-300/40 animate-pulse-ring"></span>
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-blue-300 to-indigo-300 opacity-70 blur-[3px] animate-gradient-x"></div>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 flex items-center justify-center">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] text-white/80" />
              )}
            </div>
            {/* Online status dot */}
            <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#1e3a8a] shadow-[0_0_10px_rgba(52,211,153,0.9)]">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[0.65rem] sm:text-[0.7rem] font-bold text-blue-200/90 uppercase tracking-wider mb-1">
              <greeting.Icon className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
              {greeting.text}
            </div>
            <h1 className="text-[1.1rem] sm:text-[1.55rem] font-extrabold text-white tracking-tight leading-snug truncate">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-blue-200 animate-gradient-x">
                {user?.name?.split(' ')[0]}
              </span>{' '}
              <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
            </h1>
            <p className="text-[0.78rem] sm:text-[0.85rem] text-white/70 font-medium mt-0.5">Here's a snapshot of your performance today</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center sm:justify-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 w-full sm:w-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none"></span>
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
            <div className="absolute -inset-1.5 rounded-xl bg-amber-400/50 blur-md animate-pulse"></div>
            <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div className="relative text-left">
            <span className="block text-[0.6rem] sm:text-[0.65rem] text-white/70 uppercase tracking-wider font-bold">Your Rank</span>
            <AnimatedNumber value={data.leaderboardPosition} prefix="#" duration={900} className="block text-[1.05rem] sm:text-[1.2rem] text-white font-extrabold leading-tight tabular-nums" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 1: KPI BANNER
         ══════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Today's Earning", value: Math.round((data.activeIncome.today || 0) + (data.passiveIncome.today || 0)), sub: 'Earned today', Icon: Zap, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(139,92,246,0.35)' },
            { label: 'Last 7 Days Earnings', value: data.last7Earnings, sub: 'This week', Icon: TrendingUp, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(59,130,246,0.35)' },
            { label: 'Last 30 Days Earnings', value: data.last30Earnings, sub: 'This month', Icon: CheckCircle, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
            { label: 'All Time Earning', value: data.allTimeEarnings, sub: 'Lifetime earnings', Icon: IndianRupee, from: '#fbbf24', to: '#f59e0b', shadow: 'rgba(245,158,11,0.35)' },
          ].map((kpi, i) => (
            <div
              key={i}
              className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 group cursor-default animate-fade-in-up"
              style={{
                background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                boxShadow: `0 10px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                animationDelay: `${i * 80}ms`
              }}
            >
              <kpi.Icon
                className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-24 sm:h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              <div className="relative z-10">
                <p className="flex items-center gap-1.5 sm:gap-2 text-[0.62rem] sm:text-[0.7rem] font-bold text-white/85 uppercase tracking-wide sm:tracking-widest mb-2 sm:mb-3.5">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <kpi.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  <span className="truncate">{kpi.label}</span>
                </p>
                <AnimatedNumber
                  value={kpi.value}
                  prefix="₹"
                  className="block text-[1.35rem] sm:text-[2.15rem] font-black text-white leading-none mb-1.5 sm:mb-2.5 tabular-nums"
                  style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  duration={1400}
                />
                <p className="text-[0.62rem] sm:text-[0.7rem] text-white/75 font-medium truncate">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 1a: ACTIVE INCOME BREAKDOWN
         ══════════════════════════════════════════════ */}
      <section>
        <h2 className="flex items-center gap-2 sm:gap-3 text-[1rem] sm:text-[1.125rem] font-extrabold text-slate-900 mb-3 sm:mb-4 flex-wrap">
          <span className="relative w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-md bg-emerald-400/30 blur-md animate-pulse"></span>
            <TrendingUp className="relative w-3.5 h-3.5 text-emerald-500" />
          </span>
          Active Income Breakdown
          <span className="hidden sm:inline text-xs font-medium text-slate-400 normal-case">Earnings from your direct referrals</span>
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Today's Active Income", value: data.activeIncome.today, sub: 'Direct referrals, today', Icon: Zap, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
            { label: '7 Day Active Income', value: data.activeIncome['7days'], sub: 'Direct referrals, last 7 days', Icon: TrendingUp, from: '#22d3ee', to: '#0891b2', shadow: 'rgba(8,145,178,0.35)' },
            { label: '30 Day Active Income', value: data.activeIncome['30days'], sub: 'Direct referrals, last 30 days', Icon: IndianRupee, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.35)' },
            { label: 'All Time Active Income', value: data.activeIncome.alltime, sub: 'Direct referrals, lifetime', Icon: CheckCircle, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.35)' },
          ].map((kpi, i) => (
            <div
              key={i}
              className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 group cursor-default animate-fade-in-up"
              style={{
                background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                boxShadow: `0 10px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                animationDelay: `${i * 80}ms`
              }}
            >
              <kpi.Icon
                className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-24 sm:h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              <div className="relative z-10">
                <p className="flex items-center gap-1.5 sm:gap-2 text-[0.62rem] sm:text-[0.7rem] font-bold text-white/85 uppercase tracking-wide sm:tracking-widest mb-2 sm:mb-3.5">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <kpi.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  <span className="truncate">{kpi.label}</span>
                </p>
                <AnimatedNumber
                  value={Math.round(kpi.value)}
                  prefix="₹"
                  className="block text-[1.35rem] sm:text-[2.15rem] font-black text-white leading-none mb-1.5 sm:mb-2.5 tabular-nums"
                  style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  duration={1400}
                />
                <p className="text-[0.62rem] sm:text-[0.7rem] text-white/75 font-medium truncate">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 1a-2: PASSIVE INCOME BREAKDOWN
         ══════════════════════════════════════════════ */}
      <section>
        <h2 className="flex items-center gap-2 sm:gap-3 text-[1rem] sm:text-[1.125rem] font-extrabold text-slate-900 mb-3 sm:mb-4 flex-wrap">
          <span className="relative w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-md bg-violet-400/30 blur-md animate-pulse"></span>
            <Users className="relative w-3.5 h-3.5 text-violet-500" />
          </span>
          Passive Income Breakdown
          <span className="hidden sm:inline text-xs font-medium text-slate-400 normal-case">Earnings from your team's referrals (level 2)</span>
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Today's Passive Income", value: data.passiveIncome.today, sub: 'Team referrals, today', Icon: Zap, from: '#c084fc', to: '#9333ea', shadow: 'rgba(147,51,234,0.35)' },
            { label: '7 Day Passive Income', value: data.passiveIncome['7days'], sub: 'Team referrals, last 7 days', Icon: TrendingUp, from: '#e879f9', to: '#c026d3', shadow: 'rgba(192,38,211,0.35)' },
            { label: '30 Day Passive Income', value: data.passiveIncome['30days'], sub: 'Team referrals, last 30 days', Icon: IndianRupee, from: '#f472b6', to: '#db2777', shadow: 'rgba(219,39,119,0.35)' },
            { label: 'All Time Passive Income', value: data.passiveIncome.alltime, sub: 'Team referrals, lifetime', Icon: CheckCircle, from: '#818cf8', to: '#4f46e5', shadow: 'rgba(79,70,229,0.35)' },
          ].map((kpi, i) => (
            <div
              key={i}
              className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 group cursor-default animate-fade-in-up"
              style={{
                background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                boxShadow: `0 10px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                animationDelay: `${i * 80}ms`
              }}
            >
              <kpi.Icon
                className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-24 sm:h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              <div className="relative z-10">
                <p className="flex items-center gap-1.5 sm:gap-2 text-[0.62rem] sm:text-[0.7rem] font-bold text-white/85 uppercase tracking-wide sm:tracking-widest mb-2 sm:mb-3.5">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <kpi.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  <span className="truncate">{kpi.label}</span>
                </p>
                <AnimatedNumber
                  value={Math.round(kpi.value)}
                  prefix="₹"
                  className="block text-[1.35rem] sm:text-[2.15rem] font-black text-white leading-none mb-1.5 sm:mb-2.5 tabular-nums"
                  style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  duration={1400}
                />
                <p className="text-[0.62rem] sm:text-[0.7rem] text-white/75 font-medium truncate">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 1b: QUICK ACTIONS
         ══════════════════════════════════════════════ */}
      <section>
        <h2 className="flex items-center gap-2 sm:gap-3 text-[1rem] sm:text-[1.125rem] font-extrabold text-slate-900 mb-3 sm:mb-4">
          <span className="relative w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-md bg-blue-400/30 blur-md animate-pulse"></span>
            <Sparkles className="relative w-3.5 h-3.5 text-blue-500" />
          </span>
          Quick Actions
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'My Offers', desc: 'View exclusive offers', Icon: BookOpen, path: '/student/offers', grad: 'from-blue-500 to-indigo-600', ring: 'group-hover:ring-blue-200', glow: 'rgba(37,99,235,0.35)', tint: 'group-hover:bg-blue-50/60' },
            { label: 'Freelancing', desc: 'Find projects', Icon: Briefcase, path: '/student/freelancing', grad: 'from-emerald-500 to-teal-600', ring: 'group-hover:ring-emerald-200', glow: 'rgba(5,150,105,0.35)', tint: 'group-hover:bg-emerald-50/60' },
            { label: 'Trip +', desc: 'Travel rewards', Icon: Compass, path: '/student/trip', grad: 'from-purple-500 to-fuchsia-600', ring: 'group-hover:ring-purple-200', glow: 'rgba(147,51,234,0.35)', tint: 'group-hover:bg-purple-50/60' },
            { label: 'Upgrade', desc: 'Level up now', Icon: Award, path: '/student/upgrade', grad: 'from-amber-400 to-orange-500', ring: 'group-hover:ring-amber-200', glow: 'rgba(245,158,11,0.35)', tint: 'group-hover:bg-amber-50/60' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`group relative block bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent ring-2 ring-transparent ${action.ring} ${action.tint} hover:shadow-xl animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></span>
              <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-300 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
              <div className="relative w-9 h-9 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3">
                <div
                  className="absolute -inset-1.5 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"
                  style={{ background: action.glow }}
                ></div>
                <div
                  className={`relative w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br ${action.grad} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                  style={{ boxShadow: `0 8px 20px -4px ${action.glow}` }}
                >
                  <action.Icon className="w-4 h-4 sm:w-[22px] sm:h-[22px] transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
                </div>
              </div>
              <h3 className="relative font-bold text-xs sm:text-sm text-slate-900 mb-0.5 sm:mb-1">{action.label}</h3>
              <p className="relative hidden sm:block text-[0.7rem] text-slate-400 font-medium">{action.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 2: EARNING GRAPH + TOP REFERRALS
         ══════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Earning Graph */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between flex-wrap gap-3 px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <div>
              <h2 className="flex items-center gap-2 sm:gap-2.5 font-bold text-[0.95rem] sm:text-[1.05rem] text-slate-900 m-0">
                <span className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-lg bg-blue-400/30 blur-md animate-pulse"></span>
                  <TrendingUp className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" strokeWidth={2.2} />
                </span>
                Earning Trend
                {hasChartData && (
                  <span className="flex items-center gap-1 text-[0.6rem] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full ml-1">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500"></span>
                    </span>
                    LIVE
                  </span>
                )}
              </h2>
              {hasChartData && (
                <p className="text-[0.7rem] sm:text-[0.72rem] text-slate-400 font-semibold mt-1 ml-9 sm:ml-[42px]">
                  Total: <span className="text-blue-600 font-bold">₹{chartTotal.toLocaleString()}</span>
                </p>
              )}
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-[0.78rem] sm:text-[0.8rem] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-white transition-colors"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="alltime">All Time</option>
            </select>
          </div>
          <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 h-[210px] sm:h-[260px]">
            {chartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px] z-10">
                <div className="relative w-11 h-11">
                  <div className="absolute inset-0 rounded-full border-[3px] border-blue-100 border-t-blue-600 animate-spin"></div>
                  <div className="absolute inset-[5px] rounded-full border-[3px] border-indigo-50 border-b-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.1s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ) : hasChartData ? (
              <div className="w-full h-full flex flex-col">
                <div className="relative flex-1">
                  {[0, 1, 2, 3].map(g => (
                    <div key={g} className="absolute left-0 right-0 border-t border-dashed border-slate-100" style={{ top: `${g * 33.33}%` }}></div>
                  ))}

                  <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                      <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.6" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <path d={areaPath} fill="url(#earnGrad)" className="animate-fade-in" />
                    <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" />
                  </svg>

                  {points.length > 0 && (
                    <div
                      className="absolute pointer-events-none"
                      style={{ left: `${points[points.length - 1].x}%`, top: `${points[points.length - 1].y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" style={{ width: 16, height: 16, left: -8, top: -8 }}></span>
                      <span className="absolute rounded-full bg-blue-600" style={{ width: 8, height: 8, left: -4, top: -4, boxShadow: '0 0 0 3px rgba(37,99,235,0.2)' }}></span>
                    </div>
                  )}

                  {points.map((p, idx) => {
                    const isHovered = hoveredBar === idx;
                    if (!showDots && !isHovered) return null;
                    return (
                      <div
                        key={idx}
                        className="absolute rounded-full bg-white transition-all duration-200"
                        style={{
                          left: `${p.x}%`, top: `${p.y}%`,
                          width: isHovered ? 12 : 8, height: isHovered ? 12 : 8,
                          transform: 'translate(-50%, -50%)',
                          border: '2.5px solid #2563eb',
                          boxShadow: isHovered ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none'
                        }}
                      ></div>
                    );
                  })}

                  {hoveredBar !== null && points[hoveredBar] && (
                    <div
                      className="absolute bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-20 -translate-x-1/2 -translate-y-full pointer-events-none animate-[fadeIn_0.15s_ease-out]"
                      style={{ left: `${points[hoveredBar].x}%`, top: `calc(${points[hoveredBar].y}% - 10px)` }}
                    >
                      ₹{points[hoveredBar].value.toLocaleString()}
                      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}

                  <div className="absolute inset-0 flex">
                    {chartData.map((_, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full cursor-pointer"
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(null)}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="relative h-5 mt-2">
                  {points.map((p, idx) => showLabel(idx) && (
                    <span
                      key={idx}
                      className={`absolute text-[11px] font-semibold -translate-x-1/2 transition-colors ${hoveredBar === idx ? 'text-blue-600' : 'text-slate-400'}`}
                      style={{ left: `${p.x}%` }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <TrendingUp className="w-8 h-8 text-slate-200" strokeWidth={1.5} />
                <p className="text-sm font-medium">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Referrals / Network */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)] flex flex-col">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
              <span className="relative w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="absolute inset-0 rounded-lg bg-blue-400/30 blur-md animate-pulse"></span>
                <Users className="relative w-4 h-4 text-blue-600" strokeWidth={2.2} />
              </span>
              Your Network
            </h2>
          </div>
          <div className="relative flex-1 flex items-center justify-center px-5 sm:px-6 py-6 sm:py-8 overflow-hidden">
            {data.totalReferrals === 0 ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                </div>
                <p className="text-slate-400 text-sm font-medium">No referrals yet</p>
                <p className="text-slate-300 text-xs mt-1">Share your link to grow your network</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center mb-3 w-28 h-28 sm:w-32 sm:h-32">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
                  <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#3b82f6" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" />
                  </svg>
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/70"
                      style={{
                        top: i === 0 ? '4%' : i === 1 ? '55%' : '80%',
                        left: i === 0 ? '78%' : i === 1 ? '2%' : '85%',
                        boxShadow: '0 0 6px 1px rgba(99,102,241,0.6)',
                        animation: `float ${4 + i}s ease-in-out infinite`,
                        animationDelay: `${i * 0.7}s`
                      }}
                    ></span>
                  ))}
                  <AnimatedNumber
                    value={data.totalReferrals}
                    duration={1000}
                    className="relative text-[2.4rem] sm:text-[3.2rem] font-black bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent leading-none"
                  />
                </div>
                <p className="text-slate-500 text-sm font-semibold">Active referrals</p>

                {data.recentReferrals.length > 0 && (
                  <div className="flex items-center justify-center mt-4">
                    {data.recentReferrals.slice(0, 5).map((r, idx) => {
                      const initials = r.name?.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                      const palette = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-purple-400 to-fuchsia-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500'];
                      return (
                        <div
                          key={idx}
                          title={r.name}
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${palette[idx % palette.length]} text-white text-[0.7rem] font-bold flex items-center justify-center ring-2 ring-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:z-10 animate-pop-in ${idx > 0 ? '-ml-2.5' : ''}`}
                          style={{ zIndex: 5 - idx, animationDelay: `${idx * 90}ms` }}
                        >
                          {initials}
                        </div>
                      );
                    })}
                    {data.totalReferrals > 5 && (
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 text-[0.7rem] font-bold flex items-center justify-center ring-2 ring-white -ml-2.5 animate-pop-in" style={{ animationDelay: '450ms' }}>
                        +{data.totalReferrals - 5}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate('/student/referrals')}
                  className="group/btn relative overflow-hidden inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-[0.8rem] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                  <span className="relative">View All</span>
                  <ChevronRight className="relative w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════
           SECTION 3: RECENT REFERRALS + LEADERBOARD
         ══════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Recent Joins */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
              <span className="relative w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="absolute inset-0 rounded-lg bg-blue-400/30 blur-md animate-pulse"></span>
                <Users className="relative w-4 h-4 text-blue-600" strokeWidth={2.2} />
              </span>
              Recent Joins
            </h2>
          </div>
          {data.recentReferrals.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {data.recentReferrals.map((r, idx) => {
                const initials = r.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                const palette = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-purple-400 to-fuchsia-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500'];
                return (
                  <div
                    key={idx}
                    className="group flex items-center gap-3 sm:gap-3.5 px-5 sm:px-6 py-3.5 hover:bg-slate-50/80 hover:translate-x-0.5 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${idx * 70}ms` }}
                  >
                    <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${palette[idx % palette.length]} text-white text-[0.7rem] font-bold flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate flex items-center gap-1.5">
                        {r.name}
                        {idx === 0 && (
                          <span className="text-[0.55rem] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">New</span>
                        )}
                      </p>
                    </div>
                    <span className="text-[0.72rem] text-slate-400 font-medium flex-shrink-0">{r.created_at}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm">No referrals yet</p>
            </div>
          )}
          {data.recentReferrals.length > 0 && (
            <button
              onClick={() => navigate('/student/referrals')}
              className="group/btn relative overflow-hidden flex items-center justify-center gap-1.5 w-full py-3.5 border-t border-slate-100 text-blue-600 font-bold text-[0.8rem] bg-slate-50/50 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent pointer-events-none"></span>
              <span className="relative">View All Referrals</span>
              <ChevronRight className="relative w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Leaderboard */}
        <div className="relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)]">
          <div
            className="relative flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0b1428 0%, #101c4a 55%, #1a2f6e 100%)' }}
          >
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            <div className="absolute -top-8 -right-6 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none animate-blob"></div>
            <h2 className="relative flex items-center gap-2.5 font-bold text-[1.05rem] text-white m-0">
              <span className="relative w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <span className="absolute inset-0 rounded-lg bg-amber-400/40 blur-md animate-pulse"></span>
                <Trophy className="relative w-4 h-4 text-amber-300" strokeWidth={2.2} />
              </span>
              Top Earners
            </h2>
            <span className="relative text-[0.75rem] font-black text-amber-200 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Rank #{data.leaderboardPosition}
            </span>
          </div>

          {data.leaderboard.length > 0 ? (
            <div className="py-2">
              {(() => {
                const topEarnings = data.leaderboard[0]?.earnings || 1;
                const palette = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-purple-400 to-fuchsia-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500'];
                return data.leaderboard.map((row, idx) => {
                  const isMe = row.id === user?.id;
                  const barWidth = Math.max(6, Math.round((row.earnings / topEarnings) * 100));
                  const rankStyle =
                    idx === 0 ? { background: 'linear-gradient(135deg, #fde68a 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(217,119,6,0.4), inset 0 1px 2px rgba(255,255,255,0.5)' } :
                    idx === 1 ? { background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', boxShadow: '0 4px 14px rgba(100,116,139,0.35), inset 0 1px 2px rgba(255,255,255,0.5)' } :
                    idx === 2 ? { background: 'linear-gradient(135deg, #fbbf7a 0%, #92400e 100%)', boxShadow: '0 4px 14px rgba(146,64,14,0.35), inset 0 1px 2px rgba(255,255,255,0.5)' } :
                    { background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3), inset 0 1px 2px rgba(255,255,255,0.4)' };
                  const initials = row.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <div
                      key={idx}
                      className={`group relative overflow-hidden flex items-center gap-3 px-5 sm:px-6 py-3.5 transition-all animate-fade-in-up ${isMe ? 'ring-1 ring-blue-200' : 'hover:bg-slate-50 hover:translate-x-0.5'}`}
                      style={{ background: isMe ? 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)' : 'transparent', animationDelay: `${idx * 60}ms` }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/[0.04] to-transparent transition-all duration-500 group-hover:from-primary/[0.08]"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                      <div className="relative w-9 h-9 flex-shrink-0">
                        {idx === 0 && <div className="absolute -inset-1 rounded-full bg-amber-400/50 blur-md animate-pulse"></div>}
                        <div
                          className="relative w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-[0.85rem]"
                          style={rankStyle}
                        >
                          {idx === 0 ? <Crown className="w-4 h-4" strokeWidth={2.2} /> : idx === 1 || idx === 2 ? <Medal className="w-4 h-4" strokeWidth={2.2} /> : idx + 1}
                        </div>
                      </div>
                      <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${palette[idx % palette.length]} text-white text-[0.65rem] font-bold flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white`}>
                        {initials}
                      </div>
                      <p className={`relative flex-1 min-w-0 truncate text-[0.875rem] m-0 ${isMe ? 'font-bold text-blue-700' : 'font-semibold text-slate-900'}`}>
                        {row.name}
                        {isMe && <span className="text-[0.65rem] text-blue-600 ml-1.5 bg-blue-100 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                      </p>
                      <p className="relative text-[0.9rem] text-slate-800 font-black flex-shrink-0 tabular-nums">₹{row.earnings.toLocaleString()}</p>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="w-8 h-8 text-slate-200 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm">No data available</p>
            </div>
          )}

          {data.leaderboard.length > 0 && (
            <button
              onClick={() => navigate('/student/leaderboard')}
              className="group/btn relative overflow-hidden flex items-center justify-center gap-1.5 w-full py-3.5 border-t border-slate-100 text-blue-600 font-bold text-[0.8rem] bg-slate-50/50 hover:bg-blue-50 hover:text-blue-700 transition-all mt-2"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent pointer-events-none"></span>
              <span className="relative">View Full Leaderboard</span>
              <ChevronRight className="relative w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

      </section>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
