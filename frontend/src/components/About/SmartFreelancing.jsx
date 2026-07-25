import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clapperboard, Palette, Mic, PenTool, Youtube, TrendingUp,
  Bell, Wallet, CheckCircle2, ArrowRight, Menu, ChevronDown, Sparkles, Globe, Rocket, Laptop
} from 'lucide-react';

const SKILLS = [
  { label: 'Video Editing', Icon: Clapperboard, color: 'from-red-500 to-rose-600' },
  { label: 'Graphic Design', Icon: Palette, color: 'from-purple-500 to-indigo-600' },
  { label: 'Voice Over', Icon: Mic, color: 'from-amber-500 to-orange-600' },
  { label: 'Content Writing', Icon: PenTool, color: 'from-sky-500 to-blue-600' },
  { label: 'Digital Marketing', Icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
];

const FREELANCE_SKILLS = [
  { label: 'Video Editing', Icon: Clapperboard, color: 'text-red-600 bg-red-50' },
  { label: 'Graphic Design', Icon: Palette, color: 'text-purple-600 bg-purple-50' },
  { label: 'Voice Over', Icon: Mic, color: 'text-amber-600 bg-amber-50' },
  { label: 'Content Writing', Icon: PenTool, color: 'text-sky-600 bg-sky-50' },
  { label: 'YouTube Automation', Icon: Youtube, color: 'text-red-600 bg-red-50' },
  { label: 'Digital Marketing', Icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
];

const EARNINGS_STATS = [
  { label: 'Earnings', value: '$8.6K', change: '+62%' },
  { label: 'Projects', value: '36', change: '+44%' },
  { label: 'Completed', value: '29', change: '+38%' },
];

const PROGRESS_STEPS = ['Started', 'In Progress', 'Review', 'Completed'];

const NAV_LINKS = ['Home', 'Courses', 'Dashboard', 'Blog'];

const COLLAGE_WIDTH = 880;
const COLLAGE_HEIGHT = 700;
const MIN_MOBILE_SCALE = 0.58;

function SkillIcon({ s, size = 'w-8 h-8' }) {
  return (
    <div className={`${size} rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
      <s.Icon className="w-4 h-4" strokeWidth={2} />
    </div>
  );
}

export default function SmartFreelancing() {
  const navigate = useNavigate();
  const scaleWrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = scaleWrapRef.current;
    if (!el) return;
    const updateScale = () => {
      const width = el.offsetWidth;
      if (width > 0) setScale(Math.max(width / COLLAGE_WIDTH, MIN_MOBILE_SCALE));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const collage = (
    <>
      {/* Small floating accent dots, top corners */}
      <span className="absolute -top-4 left-[8%] w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_12px_#2563eb] animate-float pointer-events-none"></span>
      <span className="absolute -top-2 right-[6%] w-4 h-4 rounded-full bg-gradient-to-br from-cyan-300 to-indigo-500 shadow-[0_0_15px_#6366f1] animate-float-delayed pointer-events-none"></span>

      {/* Man photo — nearly fills the collage height, matching the reference */}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[640px] z-0 pointer-events-none select-none">
        {/* Live Animated Color-Shifting Spotlight Flares */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-blue-600/40 via-cyan-400/35 to-indigo-500/40 blur-[100px] pointer-events-none animate-[spin_25s_linear_infinite]"></div>
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-300/50 via-blue-400/40 to-indigo-400/50 blur-[60px] pointer-events-none animate-[spin_14s_linear_infinite_reverse]"></div>
        <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-cyan-300/40 blur-[45px] pointer-events-none animate-[pulse_3s_ease-in-out_infinite]"></div>

        <img
          src="/static/img/manwithlaptop2.png"
          alt="Freelancer with laptop"
          className="w-full h-full object-contain drop-shadow-[0_25px_45px_rgba(37,99,235,0.25)] relative z-10 transition-transform duration-700 hover:scale-105"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Card: Explore Courses (Zarni Skills browser mockup) */}
      <div className="absolute z-20 top-0 left-0 w-[330px] animate-float">
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] overflow-hidden transition-all duration-500 hover:scale-105 hover:-rotate-2 hover:shadow-[0_30px_60px_rgba(37,99,235,0.25)] group/card">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm group-hover/card:rotate-12 transition-transform duration-300">
                <span className="text-white text-[9px] font-black">Z</span>
              </div>
              <div className="leading-none">
                <p className="text-[11px] font-black text-slate-900">Zarni Skills</p>
                <p className="text-[6px] font-bold text-blue-600 uppercase tracking-wider">Earn While Learn</p>
              </div>
            </div>
            <Menu className="w-3.5 h-3.5 text-slate-400 group-hover/card:rotate-90 transition-transform duration-300" />
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 border-b border-slate-50">
            {NAV_LINKS.map((n, i) => (
              <span key={n} className={`text-[8px] font-bold transition-colors ${i === 0 ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600 cursor-pointer'}`}>{n}</span>
            ))}
          </div>
          <div className="p-4">
            <p className="text-sm font-black text-slate-900 leading-snug">
              Start Your Freelancing Journey With <span className="text-blue-600">Zarni Skills</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">Learn in-demand skills & work on global projects</p>
            <button onClick={() => navigate('/courses')} className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-lg shadow-md transition-all group/btn">
              Explore Courses <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Card: Popular Skills */}
      <div className="absolute z-20 top-[2%] right-0 w-[260px] animate-float" style={{ animationDelay: '1s' }}>
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] p-4 transition-all duration-500 hover:scale-105 hover:rotate-2 hover:shadow-[0_30px_60px_rgba(37,99,235,0.25)] group/pop">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Popular Skills</p>
            <span className="text-[9px] font-bold text-blue-600 group-hover/pop:translate-x-0.5 transition-transform">View All</span>
          </div>
          <div className="flex items-start justify-between gap-1.5 mb-3">
            {SKILLS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 w-11 group/item">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-115 group-hover/item:rotate-12 transition-all duration-300">
                  <s.Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <span className="text-[7px] font-bold text-slate-500 text-center leading-tight group-hover/item:text-blue-600 transition-colors">{s.label}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/courses')} className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold rounded-lg shadow-sm hover:shadow-md transition-all">
            Start Learning
          </button>
        </div>
      </div>

      {/* Card: In-Demand Freelancing Skills */}
      <div className="absolute z-20 top-[32%] left-0 w-[220px] animate-float" style={{ animationDelay: '2.4s' }}>
        <div className="bg-gradient-to-br from-white via-white to-blue-50/50 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] p-4 transition-all duration-500 hover:scale-105 hover:-rotate-3 hover:shadow-[0_25px_50px_rgba(37,99,235,0.28)] group/indemand">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">In-Demand Skills</p>
          <div className="space-y-2">
            {FREELANCE_SKILLS.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 group/line">
                <div className={`w-6 h-6 rounded-md ${s.color} flex items-center justify-center shrink-0 shadow-xs group-hover/line:rotate-12 group-hover/line:scale-115 transition-transform duration-300`}>
                  <s.Icon className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover/line:text-blue-600 transition-colors">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card: Recent Earnings */}
      <div className="absolute z-20 top-[27%] right-0 w-[250px] animate-float-delayed">
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] p-4 transition-all duration-500 hover:scale-105 hover:rotate-3 hover:shadow-[0_25px_50px_rgba(37,99,235,0.28)] group/earn">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent Earnings</p>
            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-slate-400">This Month <ChevronDown className="w-2.5 h-2.5 animate-bounce" /></span>
          </div>
          <div className="flex items-center justify-between mb-2.5">
            <svg className="w-[65%] h-9" viewBox="0 0 100 28" preserveAspectRatio="none">
              <path d="M0 28 L0 22 L15 16 L30 20 L45 9 L60 13 L75 3 L100 7 L100 28 Z" fill="rgba(37,99,235,0.15)" />
              <path d="M0 22 L15 16 L30 20 L45 9 L60 13 L75 3 L100 7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="0" className="animate-[dash-flow_3s_ease-in-out_infinite]" fill="none" />
            </svg>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-center leading-tight shadow-xs animate-pulse">+82%<br /><span className="font-semibold text-emerald-500">vs Last Mo.</span></span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-center">
            {EARNINGS_STATS.map((s) => (
              <div key={s.label} className="group/stat">
                <p className="text-xs font-black text-slate-900 group-hover/stat:text-blue-600 transition-colors">{s.value}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{s.label}</p>
                <p className="text-[8px] text-emerald-600 font-bold">{s.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card: Top Categories */}
      <div className="absolute z-20 top-[60%] right-0 w-[230px] animate-float" style={{ animationDelay: '4.8s' }}>
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] p-4 transition-all duration-500 hover:scale-105 hover:rotate-2 hover:shadow-[0_25px_50px_rgba(37,99,235,0.28)] group/topcat">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Top Categories</p>
          <div className="flex items-start justify-between gap-1.5">
            {SKILLS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 w-11 group/subcat">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover/subcat:rotate-12 group-hover/subcat:scale-115 transition-transform duration-300">
                  <s.Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <span className="text-[7px] font-bold text-slate-500 text-center leading-tight group-hover/subcat:text-blue-600 transition-colors">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card: Earning Potential */}
      <div className="absolute z-20 bottom-[6%] left-0 w-[220px] animate-float" style={{ animationDelay: '1.6s' }}>
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/20 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] p-4 flex items-center gap-3 transition-all duration-500 hover:scale-105 hover:-rotate-2 hover:shadow-[0_30px_60px_rgba(37,99,235,0.25)] group/potential">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs group-hover/potential:rotate-12 transition-transform duration-300">
            <Wallet className="w-5 h-5 animate-pulse" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Earning Potential</p>
            <p className="text-sm font-black text-slate-900 leading-tight group-hover/potential:text-blue-600 transition-colors">$1,000 – $10,000+</p>
            <p className="text-[9px] text-slate-400 font-semibold">Work on your terms. Be your own boss.</p>
          </div>
        </div>
      </div>

      {/* Card: Project Progress */}
      <div className="absolute z-20 bottom-[3%] right-0 w-[250px] animate-float" style={{ animationDelay: '4s' }}>
        <div className="bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.14)] p-4 transition-all duration-500 hover:scale-105 hover:rotate-2 hover:shadow-[0_30px_60px_rgba(37,99,235,0.25)] group/proj">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Project #ZX4587</p>
          <p className="text-xs font-black text-blue-600 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            In Progress
          </p>
          <div className="flex items-center justify-between">
            {PROGRESS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5 group/step">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${i <= 1 ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)] scale-110' : 'bg-slate-100 text-slate-300'}`}>
                    {i <= 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                  </div>
                  <span className={`text-[7px] font-bold uppercase text-center leading-tight transition-colors ${i <= 1 ? 'text-blue-600' : 'text-slate-400'}`}>{step}</span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 -mt-3.5 transition-all duration-500 ${i < 1 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Notification pill */}
      <div className="absolute z-20 bottom-0 left-[4%] animate-float" style={{ animationDelay: '2s' }}>
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-br from-white via-white to-cyan-50/30 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_12px_30px_rgba(37,99,235,0.15)] px-4 py-2.5 transition-all duration-500 hover:scale-105 group/notif">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover/notif:scale-110 transition-transform">
            <Bell className="w-4 h-4 animate-swing" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-800 leading-tight">New Project Received!</p>
            <p className="text-[9px] text-slate-400 font-semibold">#ZX4587 · Budget $350.00</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white" id="smart-freelancing"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(43,128,240,0.08) 0%, transparent 70%), #ffffff" }}>

      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Diagonal Cyber Laser Stream comets */}
      <div className="absolute top-0 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rotate-12 animate-shimmer-sweep z-0 pointer-events-none"></div>
      <div className="absolute bottom-20 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/45 to-transparent -rotate-12 animate-shimmer-sweep z-0 pointer-events-none" style={{ animationDelay: '3.5s' }}></div>

      {/* Floating ambient orbs — slow drift */}
      <div className="absolute -top-10 -left-20 w-[500px] h-[500px] bg-sky-300/15 blur-[130px] rounded-full pointer-events-none z-0 animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-indigo-400/12 blur-[130px] rounded-full pointer-events-none z-0 animate-blob" style={{ animationDelay: '2.5s' }}></div>

      {/* Floating Light Sparks */}
      <div className="absolute top-20 right-[15%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></div>
      <div className="absolute bottom-24 left-[10%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-float-delayed pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Glowing Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-xs font-bold w-fit mb-5 shadow-[0_4px_16px_rgba(37,99,235,0.15)] select-none mx-auto hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span>GLOBAL FREELANCE ENGINE</span>
          </div>

          {/* Main Title — Compact & Crisp on Mobile */}
          <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-7xl uppercase tracking-tight leading-[0.95] mb-3 sm:mb-4">
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">Smart</span>
            <span className="block text-slate-900 drop-shadow-sm">Freelancing</span>
          </h2>

          {/* Glowing Underline Bar */}
          <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto mb-5 sm:mb-6">
            <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
          </div>

          {/* Subtitle Glass Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:scale-105">
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] sm:text-xs font-black text-slate-800">Learn Skills</span>
            </div>
            <span className="text-blue-400 font-bold hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:scale-105">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] sm:text-xs font-black text-slate-800">Work Anywhere</span>
            </div>
            <span className="text-blue-400 font-bold hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:scale-105">
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] sm:text-xs font-black text-slate-800">Earn Limitless</span>
            </div>
          </div>
        </div>

        {/* Desktop collage — true 1:1 size */}
        <div className="relative hidden lg:block mx-auto" style={{ maxWidth: `${COLLAGE_WIDTH}px`, height: `${COLLAGE_HEIGHT}px` }}>
          {collage}
        </div>

        {/* Mobile & Tablet — Clean Native Vertical Card Layout (Zero Distortion, 100% Crisp Text) */}
        <div className="lg:hidden flex flex-col gap-6 items-center w-full max-w-md mx-auto">
          {/* Central Character Portrait */}
          <div className="relative w-full max-w-[280px] aspect-[4/5] flex items-center justify-center">
            {/* Smooth Breathing Spotlight Light Flares on Mobile */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/40 via-cyan-400/30 to-indigo-500/40 blur-[70px] pointer-events-none animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-300/50 via-blue-400/40 to-indigo-400/50 blur-[45px] pointer-events-none animate-[spin_15s_linear_infinite]"></div>
            <img
              src="/static/img/manwithlaptop2.png"
              alt="Freelancer with laptop"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(37,99,235,0.25)]"
            />
          </div>

          {/* Mobile Card 1: Start Freelancing Journey */}
          <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.12)] p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">Z</div>
              <div>
                <p className="text-xs font-black text-slate-900">Zarni Skills</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase">Earn While Learn</p>
              </div>
            </div>
            <p className="text-base font-black text-slate-900 leading-snug mb-1">
              Start Your Freelancing Journey With <span className="text-blue-600">Zarni Skills</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mb-4">Learn in-demand skills & work on global projects.</p>
            <button onClick={() => navigate('/courses')} className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md">
              Explore Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Card 2: Recent Earnings & Earning Potential */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Wallet className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Earning Potential</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">$1K – $10K+</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm p-4 text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Recent Growth</p>
              <p className="text-sm font-black text-emerald-600 mt-0.5">+82% MoM</p>
            </div>
          </div>

          {/* Mobile Card 3: In-Demand Skills Pills */}
          <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-sm p-5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">In-Demand Skills</p>
            <div className="grid grid-cols-2 gap-2.5">
              {FREELANCE_SKILLS.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className={`w-6 h-6 rounded-md ${s.color} flex items-center justify-center shrink-0`}>
                    <s.Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
