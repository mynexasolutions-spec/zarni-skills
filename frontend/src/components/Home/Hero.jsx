import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, GraduationCap, Users, BookOpen, Star, Play } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section 
      className="relative -mt-24 pt-28 pb-14 sm:pt-32 sm:pb-20 lg:pt-44 lg:pb-28 overflow-hidden" 
      id="hero-section"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(43,128,240,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), #f8faff"
      }}
    >
      {/* Animated mesh grid backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(rgba(43,128,240,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(43,128,240,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}
      ></div>

      {/* Floating ambient orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-10 -left-20 w-[600px] h-[600px] bg-sky-300/15 blur-[140px] rounded-full"></div>
        <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-indigo-400/12 blur-[130px] rounded-full"></div>
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] bg-blue-200/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Floating decorative dots pattern */}
      <div className="absolute top-32 right-12 opacity-20 pointer-events-none z-0 hidden lg:block">
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <g fill="#2b80f0">
            <circle cx="4" cy="4" r="2.5" />
            <circle cx="22" cy="4" r="2.5" />
            <circle cx="40" cy="4" r="2.5" />
            <circle cx="58" cy="4" r="2.5" />
            <circle cx="76" cy="4" r="2.5" />
            <circle cx="4" cy="22" r="2.5" />
            <circle cx="22" cy="22" r="2.5" />
            <circle cx="40" cy="22" r="2.5" />
            <circle cx="58" cy="22" r="2.5" />
            <circle cx="76" cy="22" r="2.5" />
            <circle cx="4" cy="40" r="2.5" />
            <circle cx="22" cy="40" r="2.5" />
            <circle cx="40" cy="40" r="2.5" />
            <circle cx="58" cy="40" r="2.5" />
            <circle cx="76" cy="40" r="2.5" />
            <circle cx="4" cy="58" r="2.5" />
            <circle cx="22" cy="58" r="2.5" />
            <circle cx="40" cy="58" r="2.5" />
            <circle cx="58" cy="58" r="2.5" />
            <circle cx="76" cy="58" r="2.5" />
            <circle cx="4" cy="76" r="2.5" />
            <circle cx="22" cy="76" r="2.5" />
            <circle cx="40" cy="76" r="2.5" />
            <circle cx="58" cy="76" r="2.5" />
            <circle cx="76" cy="76" r="2.5" />
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT CONTENT COLUMN */}
          <div className="flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
            
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-primary/15 shadow-sm shadow-primary/10 px-4 py-2 rounded-full mb-7 mx-auto lg:mx-0 w-fit">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">India's #1 EdTech Ecosystem</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-[3.6rem] xl:text-[4rem] text-slate-900 leading-[1.08] tracking-tight mb-6">
              Learn Today.<br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Earn Tomorrow.</span>
                <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-gradient-to-r from-primary to-indigo-600 opacity-30"></span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-500 text-base sm:text-lg leading-[1.75] max-w-[520px] mx-auto lg:mx-0 mb-8 font-medium">
              Upgrade your skills with <strong className="text-slate-700 font-bold">expert-led courses</strong> and build a passive income stream through our high-converting affiliate program.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3.5 mb-10">
              <button 
                onClick={() => navigate('/courses')}
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-primary/30 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <GraduationCap className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                Explore Courses
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="group inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:bg-primary/5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 bg-white/60 backdrop-blur-sm"
              >
                <Users className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                Join Affiliate Program
              </button>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-start gap-4 pt-7 border-t border-slate-200/80">
              <div className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Users width={20} height={20} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-900 leading-none">10K+</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Students</p>
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 self-center hidden sm:block"></div>

              <div className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-200/50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen width={20} height={20} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-900 leading-none">500+</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Courses</p>
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 self-center hidden sm:block"></div>

              <div className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/10 to-amber-400/5 border border-amber-200/50 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Star width={20} height={20} fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-900 leading-none">4.9★</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Student Image & Floating Cards */}
          <div className="relative flex items-center justify-center py-6 lg:py-10 order-1 lg:order-2 group/right">
            <div className="relative w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] lg:w-[460px] lg:h-[460px]">

              {/* Concentric rings */}
              <div className="absolute inset-[-20px] rounded-full border border-primary/8 animate-spin-slow"></div>
              <div className="absolute inset-[-44px] rounded-full border border-dashed border-primary/10"></div>
              <div className="absolute inset-[-68px] rounded-full border border-primary/5"></div>

              {/* Central glow backdrop */}
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-sky-100/70 via-blue-50/50 to-indigo-100/30 border border-white/80 shadow-[inset_0_0_60px_rgba(59,130,246,0.1),0_20px_80px_rgba(59,130,246,0.12)]"></div>

              {/* Student Image */}
              <div className="relative z-10 w-full h-full">
                <img
                  src="/static/img/hero_student.png"
                  alt="Student learning online"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80";
                  }}
                  className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(59,130,246,0.18)]"
                />
              </div>

              {/* FLOATING CARD: Affiliate Earning */}
              <div className="absolute -top-3 -left-3 sm:-top-6 sm:-left-14 lg:-top-4 lg:-left-16 z-20 animate-float">
                <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl min-w-[104px] sm:min-w-[170px]">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <span className="text-emerald-605 font-bold text-xs sm:text-base">₹</span>
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Earning</p>
                      <p className="text-xs sm:text-base font-black text-slate-900">$7,842</p>
                    </div>
                  </div>
                  <svg className="hidden sm:block w-full h-8" viewBox="0 0 100 28" preserveAspectRatio="none">
                    <path d="M0 28 L0 22 L15 16 L30 20 L45 9 L60 13 L75 3 L100 7 L100 28 Z" fill="rgba(34,197,94,0.15)" />
                    <path d="M0 22 L15 16 L30 20 L45 9 L60 13 L75 3 L100 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                  <p className="text-[7px] sm:text-[9px] text-emerald-650 font-bold mt-0.5 sm:mt-1">↑ 32% this month</p>
                </div>
              </div>

              {/* FLOATING CARD: Course Progress */}
              <div className="absolute -bottom-3 -right-3 sm:-bottom-8 sm:-right-8 z-20 animate-float-delayed">
                <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl min-w-[112px] sm:min-w-[188px]">
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-2.5">Progress</p>
                  <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1.5 sm:mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="Avatar"
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-800 truncate">UI/UX</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-primary ml-1">75%</p>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING BADGE: Play Button */}
              <div className="absolute top-1 right-1 sm:top-6 sm:-right-2 z-20">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/25 animate-ping"></div>
                  <div className="relative w-9 h-9 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-primary/40 cursor-pointer">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white translate-x-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
