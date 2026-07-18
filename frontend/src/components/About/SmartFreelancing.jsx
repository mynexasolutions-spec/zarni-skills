import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clapperboard, Palette, Mic, PenTool, Youtube, TrendingUp,
  Bell, Wallet, CheckCircle2, ArrowRight, Menu, ChevronDown,
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

function SkillIcon({ s, size = 'w-8 h-8' }) {
  return (
    <div className={`${size} rounded-lg bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0`}>
      <s.Icon className="w-4 h-4" strokeWidth={2} />
    </div>
  );
}

export default function SmartFreelancing() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(43,128,240,0.10) 0%, transparent 70%), #f8faff" }}>

      {/* Mesh grid backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(rgba(43,128,240,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(43,128,240,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}>
      </div>

      {/* Floating ambient orbs */}
      <div className="absolute -top-10 -left-20 w-[500px] h-[500px] bg-sky-300/15 blur-[130px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-indigo-400/12 blur-[130px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-[0.95]">
            <span className="block bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Smart</span>
            <span className="block text-slate-900">Freelancing</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-semibold mt-5 flex items-center justify-center gap-2.5 flex-wrap">
            <span>Learn Skills</span>
            <span className="text-primary/40">|</span>
            <span>Work Anywhere</span>
            <span className="text-primary/40">|</span>
            <span>Earn Limitless</span>
          </p>
        </div>

        {/* Desktop collage */}
        <div className="relative hidden lg:block mx-auto" style={{ maxWidth: '1020px', height: '780px' }}>

          {/* Center glow */}
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-sky-100/70 via-blue-50/50 to-indigo-100/30 border border-white/80 shadow-[inset_0_0_60px_rgba(59,130,246,0.1),0_20px_80px_rgba(59,130,246,0.12)] pointer-events-none"></div>

          {/* Glowing swirl ribbon wrapping the laptop */}
          <svg className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[140px] pointer-events-none" viewBox="0 0 340 140" fill="none">
            <defs>
              <linearGradient id="swirlGrad" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2b80f0" stopOpacity="0" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2b80f0" stopOpacity="0" />
              </linearGradient>
              <filter id="swirlBlur"><feGaussianBlur stdDeviation="2.2" /></filter>
            </defs>
            <ellipse cx="170" cy="70" rx="160" ry="42" stroke="url(#swirlGrad)" strokeWidth="3" filter="url(#swirlBlur)" />
            <ellipse cx="170" cy="76" rx="130" ry="30" stroke="url(#swirlGrad)" strokeWidth="2" opacity="0.6" filter="url(#swirlBlur)" />
          </svg>

          {/* Man photo */}
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[460px] z-10 pointer-events-none">
            <img
              src="/static/img/manwithlaptop2.png"
              alt="Freelancer with laptop"
              className="w-full h-full object-contain drop-shadow-[0_25px_40px_rgba(43,128,240,0.2)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Card: Explore Courses (Zarni Skills browser mockup) */}
          <div className="absolute top-0 left-0 w-[320px] animate-float">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-[9px] font-black">Z</span>
                  </div>
                  <div className="leading-none">
                    <p className="text-[11px] font-black text-slate-900">Zarni Skills</p>
                    <p className="text-[6px] font-bold text-slate-400 uppercase tracking-wider">Earn While Learn</p>
                  </div>
                </div>
                <Menu className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="flex items-center gap-3 px-4 py-1.5 border-b border-slate-50">
                {NAV_LINKS.map((n, i) => (
                  <span key={n} className={`text-[8px] font-bold ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>{n}</span>
                ))}
              </div>
              <div className="p-4">
                <p className="text-sm font-black text-slate-900 leading-snug">
                  Start Your Freelancing Journey With <span className="text-primary">Zarni Skills</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">Learn in-demand skills & work on global projects</p>
                <button onClick={() => navigate('/courses')} className="mt-3 inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold px-3.5 py-2 rounded-lg transition-colors">
                  Explore Courses <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Card: Popular Skills */}
          <div className="absolute top-[2%] right-0 w-[270px]">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Popular Skills</p>
                <span className="text-[9px] font-bold text-primary">View All</span>
              </div>
              <div className="flex items-start justify-between gap-1.5 mb-3">
                {SKILLS.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 w-11">
                    <SkillIcon s={s} />
                    <span className="text-[7px] font-bold text-slate-500 text-center leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/courses')} className="w-full py-2 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold rounded-lg transition-colors">
                Start Learning
              </button>
            </div>
          </div>

          {/* Card: In-Demand Freelancing Skills */}
          <div className="absolute top-[30%] left-0 w-[250px]">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">In-Demand Skills</p>
              <div className="space-y-2">
                {FREELANCE_SKILLS.map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-md ${s.color} flex items-center justify-center shrink-0`}>
                      <s.Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Recent Earnings */}
          <div className="absolute top-[30%] right-0 w-[280px] animate-float-delayed">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent Earnings</p>
                <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-slate-400">This Month <ChevronDown className="w-2.5 h-2.5" /></span>
              </div>
              <div className="flex items-center justify-between mb-2.5">
                <svg className="w-[65%] h-9" viewBox="0 0 100 28" preserveAspectRatio="none">
                  <path d="M0 28 L0 22 L15 16 L30 20 L45 9 L60 13 L75 3 L100 7 L100 28 Z" fill="rgba(43,128,240,0.12)" />
                  <path d="M0 22 L15 16 L30 20 L45 9 L60 13 L75 3 L100 7" stroke="#2b80f0" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-center leading-tight">+82%<br /><span className="font-semibold text-emerald-500">vs Last Mo.</span></span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-center">
                {EARNINGS_STATS.map((s) => (
                  <div key={s.label}>
                    <p className="text-xs font-black text-slate-900">{s.value}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{s.label}</p>
                    <p className="text-[8px] text-emerald-600 font-bold">{s.change}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Top Categories */}
          <div className="absolute top-[58%] right-0 w-[270px]">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Top Categories</p>
              <div className="flex items-start justify-between gap-1.5">
                {SKILLS.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 w-11">
                    <SkillIcon s={s} size="w-9 h-9" />
                    <span className="text-[7px] font-bold text-slate-500 text-center leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Earning Potential */}
          <div className="absolute bottom-[4%] left-6 w-[230px]">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Earning Potential</p>
                <p className="text-sm font-black text-slate-900 leading-tight">$1,000 – $10,000+</p>
                <p className="text-[9px] text-slate-400 font-semibold">Work on your terms. Be your own boss.</p>
              </div>
            </div>
          </div>

          {/* Card: Project Progress */}
          <div className="absolute bottom-[2%] right-0 w-[270px]">
            <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Project #ZX4587</p>
              <p className="text-xs font-black text-primary mb-3">In Progress</p>
              <div className="flex items-center justify-between">
                {PROGRESS_STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-300'}`}>
                        {i <= 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                      </div>
                      <span className={`text-[7px] font-bold uppercase text-center leading-tight ${i <= 1 ? 'text-primary' : 'text-slate-400'}`}>{step}</span>
                    </div>
                    {i < PROGRESS_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 -mt-3.5 ${i < 1 ? 'bg-primary' : 'bg-slate-100'}`}></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Notification pill */}
          <div className="absolute bottom-0 left-[26%] animate-float">
            <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl shadow-xl px-4 py-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 leading-tight">New Project Received!</p>
                <p className="text-[9px] text-slate-400 font-semibold">#ZX4587 · Budget $350.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / tablet fallback */}
        <div className="lg:hidden">
          <div className="w-56 h-72 sm:w-64 sm:h-80 mx-auto mb-10 relative">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-sky-100/70 via-blue-50/50 to-indigo-100/30 border border-white/80"></div>
            <img
              src="/static/img/manwithlaptop2.png"
              alt="Freelancer with laptop"
              className="relative w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {SKILLS.map((s, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm">
                <SkillIcon s={s} />
                <span className="text-xs font-bold text-slate-700 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">$1K – $10K+</p>
                <p className="text-[10px] text-slate-400 font-semibold">Monthly potential</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">+82%</p>
                <p className="text-[10px] text-slate-400 font-semibold">Earnings growth</p>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">29 Done</p>
                <p className="text-[10px] text-slate-400 font-semibold">Projects completed</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button onClick={() => navigate('/courses')} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors">
              Explore Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
