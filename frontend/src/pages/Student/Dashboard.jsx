import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Users, Trophy, DollarSign, CheckCircle, Zap,
  BookOpen, Briefcase, Compass, Award, ChevronRight,
  UserCircle, Loader2, Crown, Medal, Sparkles, Sun, Sunset, Moon,
  ArrowUpRight, Wallet
} from 'lucide-react';
import api from '../../utils/api';

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
    totalReferrals: 0,
    recentReferrals: [],
    leaderboard: [],
    chartData: { labels: [], values: [] }
  });

  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7days');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

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
    if (!loading) fetchChartData();
  }, [timeframe]);

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
    return (
      <div className="max-w-[1400px] mx-auto animate-pulse">
        <div className="h-[132px] rounded-[22px] bg-gradient-to-br from-slate-200 to-slate-100 mb-7"></div>
        <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[150px] rounded-2xl bg-slate-100"></div>)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[130px] rounded-2xl bg-slate-100"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <div className="h-[320px] rounded-2xl bg-slate-100"></div>
          <div className="h-[320px] rounded-2xl bg-slate-100"></div>
        </div>
      </div>
    );
  }

  const hasChartData = chartData.length > 0 && chartData.some(d => d.value > 0);
  const maxChartValue = hasChartData ? Math.max(...chartData.map(d => d.value), 1) : 1;
  const chartTotal = chartData.reduce((sum, d) => sum + d.value, 0);

  // Area-chart geometry (viewBox 0..100 in both axes, y flipped)
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
    <div className="max-w-[1400px] mx-auto">

      {/* ══════════════════════════════════════════════
           WELCOME BANNER
         ══════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-[22px] px-6 sm:px-8 py-7 mb-7 overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 35%, #2563eb 100%)',
          boxShadow: '0 20px 45px -12px rgba(30, 64, 175, 0.45)'
        }}
      >
        {/* Decorative glows */}
        <div
          className="absolute pointer-events-none rounded-full transition-transform duration-700 group-hover:scale-110"
          style={{
            top: '-70%', right: '-6%', width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(96,165,250,0.35) 0%, transparent 70%)'
          }}
        ></div>
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: '-80%', left: '10%', width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)'
          }}
        ></div>
        {/* subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-blue-300 to-indigo-300 opacity-70 blur-[3px]"></div>
            <div className="relative w-[58px] h-[58px] rounded-full border-2 border-white/50 overflow-hidden bg-white/10 flex items-center justify-center">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-8 h-8 text-white/80" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-blue-200/90 uppercase tracking-wider mb-1">
              <greeting.Icon className="w-3.5 h-3.5 text-amber-300" strokeWidth={2.5} />
              {greeting.text}
            </div>
            <h1 className="text-[1.4rem] sm:text-[1.55rem] font-extrabold text-white tracking-tight leading-snug">
              Welcome back, {user?.name?.split(' ')[0]} <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
            </h1>
            <p className="text-[0.85rem] text-white/70 font-medium mt-0.5">Here's a snapshot of your performance today</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 w-full sm:w-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
            <Trophy className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <span className="block text-[0.65rem] text-white/70 uppercase tracking-wider font-bold">Your Rank</span>
            <span className="block text-[1.2rem] text-white font-extrabold leading-tight">#{data.leaderboardPosition}</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 1: KPI BANNER
         ══════════════════════════════════════════════ */}
      <section className="mb-9">
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>

          {[
            { label: 'All Time Earnings', value: data.allTimeEarnings, sub: 'Lifetime earnings', Icon: DollarSign, from: '#fbbf24', to: '#f59e0b', shadow: 'rgba(245,158,11,0.35)' },
            { label: 'All Time Paid', value: data.allTimePaid, sub: 'Payouts received', Icon: CheckCircle, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
            { label: 'Last 30 Days', value: data.last30Earnings, sub: 'This month', Icon: TrendingUp, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(59,130,246,0.35)' },
            { label: 'Last 7 Days', value: data.last7Earnings, sub: 'This week', Icon: Zap, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(139,92,246,0.35)' },
          ].map((kpi, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 group cursor-default"
              style={{
                background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                boxShadow: `0 10px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`
              }}
            >
              {/* watermark icon */}
              <kpi.Icon
                className="absolute -right-3 -bottom-3 w-24 h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                strokeWidth={1.5}
              />
              <div className="relative z-10">
                <p className="flex items-center gap-2 text-[0.7rem] font-bold text-white/85 uppercase tracking-widest mb-3.5">
                  <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <kpi.Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  {kpi.label}
                </p>
                <p className="text-[2.15rem] font-black text-white leading-none mb-2.5 tabular-nums" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                  ₹{kpi.value.toLocaleString()}
                </p>
                <p className="text-[0.7rem] text-white/75 font-medium">{kpi.sub}</p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 1b: QUICK ACTIONS
         ══════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="flex items-center gap-3 text-[1.125rem] font-extrabold text-slate-900 mb-4">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Quick Actions
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {[
            { label: 'My Offers', desc: 'View exclusive offers', Icon: BookOpen, path: '/student/offers', grad: 'from-blue-500 to-indigo-600', ring: 'group-hover:ring-blue-200', glow: 'rgba(37,99,235,0.35)' },
            { label: 'Freelancing', desc: 'Find projects', Icon: Briefcase, path: '/student/freelancing', grad: 'from-emerald-500 to-teal-600', ring: 'group-hover:ring-emerald-200', glow: 'rgba(5,150,105,0.35)' },
            { label: 'Trip +', desc: 'Travel rewards', Icon: Compass, path: '/student/trip-plus', grad: 'from-purple-500 to-fuchsia-600', ring: 'group-hover:ring-purple-200', glow: 'rgba(147,51,234,0.35)' },
            { label: 'Upgrade', desc: 'Level up now', Icon: Award, path: '/student/upgrade-panel', grad: 'from-amber-400 to-orange-500', ring: 'group-hover:ring-amber-200', glow: 'rgba(245,158,11,0.35)' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`group relative block bg-white border border-slate-200 rounded-2xl p-5 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent ring-2 ring-transparent ${action.ring} hover:shadow-xl`}
            >
              <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-300 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.grad} text-white flex items-center justify-center mx-auto mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                style={{ boxShadow: `0 8px 20px -4px ${action.glow}` }}
              >
                <action.Icon className="w-[22px] h-[22px]" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">{action.label}</h3>
              <p className="text-[0.7rem] text-slate-400 font-medium">{action.desc}</p>
            </button>
          ))}

        </div>
      </section>

      {/* ══════════════════════════════════════════════
           SECTION 2: EARNING GRAPH + TOP REFERRALS
         ══════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-10">

        {/* Earning Graph */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <div>
              <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.2} />
                </span>
                Earning Trend
              </h2>
              {hasChartData && (
                <p className="text-[0.72rem] text-slate-400 font-semibold mt-1 ml-[42px]">
                  Total: <span className="text-blue-600 font-bold">₹{chartTotal.toLocaleString()}</span>
                </p>
              )}
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-[0.8rem] px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 hover:bg-white transition-colors"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="alltime">All Time</option>
            </select>
          </div>
          <div className="relative px-6 pt-6 pb-3" style={{ height: 260 }}>
            {chartLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : hasChartData ? (
              <div className="w-full h-full flex flex-col">
                <div className="relative flex-1">
                  {/* horizontal gridlines */}
                  {[0, 1, 2, 3].map(g => (
                    <div key={g} className="absolute left-0 right-0 border-t border-dashed border-slate-100" style={{ top: `${g * 33.33}%` }}></div>
                  ))}

                  {/* area + line */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#earnGrad)" />
                    <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {/* dots */}
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

                  {/* tooltip */}
                  {hoveredBar !== null && points[hoveredBar] && (
                    <div
                      className="absolute bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-20 -translate-x-1/2 -translate-y-full pointer-events-none animate-[fadeIn_0.15s_ease-out]"
                      style={{ left: `${points[hoveredBar].x}%`, top: `calc(${points[hoveredBar].y}% - 10px)` }}
                    >
                      ₹{points[hoveredBar].value.toLocaleString()}
                      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}

                  {/* hover zones */}
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

                {/* labels */}
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
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" strokeWidth={2.2} />
              </span>
              Your Network
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center px-6 py-8">
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
                <div className="relative inline-flex items-center justify-center mb-3">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl"></div>
                  <p className="relative text-[3.2rem] font-black bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent leading-none">
                    {data.totalReferrals}
                  </p>
                </div>
                <p className="text-slate-500 text-sm font-semibold">Active referrals</p>

                {/* avatar stack */}
                {data.recentReferrals.length > 0 && (
                  <div className="flex items-center justify-center mt-4">
                    {data.recentReferrals.slice(0, 5).map((r, idx) => {
                      const initials = r.name?.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                      const palette = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-purple-400 to-fuchsia-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500'];
                      return (
                        <div
                          key={idx}
                          title={r.name}
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${palette[idx % palette.length]} text-white text-[0.7rem] font-bold flex items-center justify-center ring-2 ring-white ${idx > 0 ? '-ml-2.5' : ''}`}
                          style={{ zIndex: 5 - idx }}
                        >
                          {initials}
                        </div>
                      );
                    })}
                    {data.totalReferrals > 5 && (
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 text-[0.7rem] font-bold flex items-center justify-center ring-2 ring-white -ml-2.5">
                        +{data.totalReferrals - 5}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate('/student/referrals')}
                  className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-[0.8rem] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════
           SECTION 3: RECENT REFERRALS + LEADERBOARD
         ══════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-7">

        {/* Recent Joins */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" strokeWidth={2.2} />
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
                  <div key={idx} className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-slate-50/80 transition-colors">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${palette[idx % palette.length]} text-white text-[0.7rem] font-bold flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{r.name}</p>
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
              className="flex items-center justify-center gap-1.5 w-full py-3.5 border-t border-slate-100 text-blue-600 font-bold text-[0.8rem] bg-slate-50/50 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              View All Referrals
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(15,23,42,0.1)] transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-12px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-blue-600" strokeWidth={2.2} />
              </span>
              Top Earners
            </h2>
            <span className="text-[0.8rem] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
              Rank #{data.leaderboardPosition}
            </span>
          </div>

          {data.leaderboard.length > 0 ? (
            <div className="py-2">
              {data.leaderboard.map((row, idx) => {
                const isMe = row.id === user?.id;
                const rankStyle =
                  idx === 0 ? { background: 'linear-gradient(135deg, #fde68a 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(217,119,6,0.4), inset 0 1px 2px rgba(255,255,255,0.5)' } :
                  idx === 1 ? { background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', boxShadow: '0 4px 14px rgba(100,116,139,0.35), inset 0 1px 2px rgba(255,255,255,0.5)' } :
                  idx === 2 ? { background: 'linear-gradient(135deg, #fbbf7a 0%, #92400e 100%)', boxShadow: '0 4px 14px rgba(146,64,14,0.35), inset 0 1px 2px rgba(255,255,255,0.5)' } :
                  { background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3), inset 0 1px 2px rgba(255,255,255,0.4)' };
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3.5 px-4 py-3 mx-2 rounded-xl transition-all ${isMe ? 'ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                    style={{ background: isMe ? 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)' : 'transparent' }}
                  >
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-[0.9rem] flex-shrink-0"
                      style={rankStyle}
                    >
                      {idx === 0 ? <Crown className="w-5 h-5" strokeWidth={2.2} /> : idx === 1 || idx === 2 ? <Medal className="w-[18px] h-[18px]" strokeWidth={2.2} /> : idx + 1}
                    </div>
                    <p className={`flex-1 min-w-0 truncate text-[0.875rem] m-0 ${isMe ? 'font-bold text-blue-700' : 'font-semibold text-slate-900'}`}>
                      {row.name}
                      {isMe && <span className="text-[0.65rem] text-blue-600 ml-1.5 bg-blue-100 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                    </p>
                    <p className="text-[0.9rem] text-slate-800 font-black flex-shrink-0 tabular-nums">₹{row.earnings.toLocaleString()}</p>
                  </div>
                );
              })}
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
              className="flex items-center justify-center gap-1.5 w-full py-3.5 border-t border-slate-100 text-blue-600 font-bold text-[0.8rem] bg-slate-50/50 hover:bg-blue-50 hover:text-blue-700 transition-all mt-2"
            >
              View Full Leaderboard
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
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
