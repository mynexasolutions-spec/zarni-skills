import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Image, Plus, ArrowDownRight, ArrowUpRight, MoreHorizontal } from 'lucide-react';

export default function Transformation() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden" id="transformation"
      style={{
        background: "radial-gradient(ellipse 90% 70% at 50% 0%, #eef6ff 0%, #d6e9fb 45%, #aed0f2 100%)"
      }}>

      {/* Ambient gradient backdrop */}
      <div className="absolute -left-24 top-1/3 w-72 h-72 bg-white/40 rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="absolute -right-24 bottom-1/4 w-72 h-72 bg-indigo-300/20 rounded-full blur-[110px] pointer-events-none z-0"></div>

      {/* Subtle dot-grid texture for depth */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      </div>

      {/* Floating accent particles */}
      <span className="absolute top-16 left-[10%] w-2 h-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-20 right-[8%] w-2.5 h-2.5 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(43,128,240,0.6)] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[15%] w-1.5 h-1.5 rounded-full bg-indigo-400/60 shadow-[0_0_8px_rgba(129,140,248,0.6)] animate-float pointer-events-none z-0"></span>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-white shadow-sm backdrop-blur-sm text-xs font-black text-primary uppercase tracking-widest">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            Real Success Stories
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight tracking-tight">
            Turn Your{' '}
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary align-middle mx-1 shadow-md shadow-primary/30">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" stroke="#fff" strokeWidth={2} />
            </span>{' '}
            Skills<br className="hidden sm:block" />
            Into an{' '}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Earning Machine</span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
            We help students land high-paying roles and build passive income through <strong className="text-slate-700 font-bold">expert-led courses and a high-converting affiliate program</strong>.
          </p>
          <div className="pt-2">
            <button onClick={() => navigate('/register')}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              Start Learning Free
              <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Before / After Showcase */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-16 lg:gap-4 items-center pt-6">
          <div className="absolute inset-0 -z-10 hidden lg:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-40 bg-white/30 blur-[80px] rounded-full pointer-events-none"></div>
          </div>

          {/* BEFORE CARD */}
          <div className="relative mx-auto w-full max-w-[280px]">
            <p className="text-center text-slate-400/90 font-black uppercase tracking-widest text-xs mb-5">Before</p>
            <div className="relative -rotate-6 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="absolute inset-0 translate-x-4 -translate-y-3 bg-white/50 border border-white/70 rounded-2xl -z-10"></div>

              <div className="relative bg-white/95 border border-white rounded-2xl shadow-[0_20px_45px_rgba(30,64,110,0.18)] p-4">
                <div className="flex justify-end mb-1">
                  <Image className="w-4 h-4 text-slate-300" strokeWidth={2} />
                </div>
                <div className="relative w-14 h-14 mb-3">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80" alt="Before joining Zarni Skills" className="w-14 h-14 rounded-full object-cover grayscale" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-white">
                    <Plus className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                  </span>
                </div>
                <p className="font-black text-slate-800 text-sm">Rohan Mehta</p>
                <p className="text-slate-400 text-xs font-medium">Confused Beginner</p>
                <p className="text-slate-300 text-[11px] mt-0.5">Stuck in a low-paying job, no clear direction</p>
                <p className="text-slate-300 text-[10px] font-semibold mt-2.5">0 courses completed · ₹0 extra income</p>

                {/* Mock UI footer bar */}
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="h-5 flex-1 rounded-full bg-slate-100"></div>
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Courses badge */}
            <div className="absolute top-2 -left-4 sm:-left-9 bg-rose-50 border border-rose-100 rounded-xl shadow-md px-3 py-1.5 z-20">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Courses</p>
              <p className="text-rose-500 font-black text-sm flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" strokeWidth={3} />
                0
              </p>
            </div>

            {/* Floating Income badge */}
            <div className="absolute top-1/2 -right-4 sm:-right-10 bg-rose-50 border border-rose-100 rounded-xl shadow-md px-3 py-1.5 z-20">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Extra income</p>
              <p className="text-rose-500 font-black text-sm flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" strokeWidth={3} />
                ₹0
              </p>
            </div>
          </div>

          {/* ARROW: curved swoosh (desktop) */}
          <div className="hidden lg:flex items-center justify-center w-32 -mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-24 overflow-visible" viewBox="0 0 130 90" fill="none">
              <defs>
                <linearGradient id="transform-arrow-grad" x1="0" y1="90" x2="130" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="55%" stopColor="#5b9df5" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="transform-arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M6 76 C 40 86, 55 40, 112 16" stroke="url(#transform-arrow-grad)" strokeWidth="3.5" strokeLinecap="round" filter="url(#transform-arrow-glow)" />
              <path d="M96 8 C 104 10, 111 12, 116 17 C 113 22, 110 28, 107 34" stroke="url(#transform-arrow-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#transform-arrow-glow)" />
            </svg>
          </div>
          {/* ARROW: rotated swoosh (mobile) */}
          <div className="flex lg:hidden items-center justify-center py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#5b9df5] rotate-90 overflow-visible" viewBox="0 0 130 90" fill="none">
              <path d="M6 76 C 40 86, 55 40, 112 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M96 8 C 104 10, 111 12, 116 17 C 113 22, 110 28, 107 34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          {/* AFTER CARD */}
          <div className="relative mx-auto w-full max-w-[300px] lg:-translate-y-6">
            <p className="text-center text-primary font-black uppercase tracking-widest text-xs mb-5">After</p>
            <div className="relative rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="absolute inset-0 -translate-x-4 -translate-y-3 bg-white/50 border border-white/70 rounded-2xl -z-10"></div>

              <div className="relative bg-white border border-white rounded-2xl shadow-[0_25px_60px_-8px_rgba(30,64,110,0.28)] p-4">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="relative w-14 h-14 shrink-0">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80" alt="After joining Zarni Skills" className="w-14 h-14 rounded-full object-cover" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-white">
                      <Plus className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                    </span>
                  </div>
                </div>
                <p className="font-black text-slate-900 text-sm">Rohan Mehta</p>
                <p className="text-slate-500 text-xs font-bold">Full-Stack Developer @ TechNova</p>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">Completed the Full-Stack bundle and now earns ₹45,000/month plus affiliate bonuses.</p>
                <p className="text-slate-400 text-[10px] font-semibold mt-2.5">12 courses completed · ₹18,400 affiliate earnings</p>

                {/* Mock UI footer bar */}
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="h-6 flex-1 rounded-full bg-primary/10 border border-primary/15 flex items-center px-3">
                    <span className="text-primary text-[10px] font-bold">Open to mentoring</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Courses badge */}
            <div className="absolute -top-2 -left-4 sm:-left-9 bg-emerald-50 border border-emerald-100 rounded-xl shadow-md px-3 py-1.5 z-20 animate-float">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Courses</p>
              <p className="text-emerald-600 font-black text-sm flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" strokeWidth={3} />
                12+
              </p>
            </div>

            {/* Floating Income badge */}
            <div className="absolute top-1/3 -right-4 sm:-right-10 bg-emerald-50 border border-emerald-100 rounded-xl shadow-md px-3 py-1.5 z-20 animate-float-delayed">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Monthly income</p>
              <p className="text-emerald-600 font-black text-sm flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" strokeWidth={3} />
                ₹45K+
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
