import React from 'react';
import { TrendingUp, Gift, Trophy, Globe, Luggage, Plane, Sparkles, Navigation } from 'lucide-react';

const FEATURES = [
  {
    title: 'Achieve Higher Income',
    desc: 'Reach your income goals and unlock amazing rewards.',
    Icon: TrendingUp,
    color: 'from-blue-600 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
  {
    title: 'Get Free Trips',
    desc: 'Enjoy international and national trips on us.',
    Icon: Gift,
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
  },
  {
    title: 'Reward Your Success',
    desc: 'Your success, our celebration. You earn, you explore!',
    Icon: Trophy,
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
  },
];

export default function TripAchievement() {
  return (
    <section className="relative py-10 sm:py-32 overflow-hidden bg-[#eaf4ff]" id="trip-achievement">

      {/* Travel landmarks background */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/tripbg.png)' }}></div>
      {/* Fade to light blue on the left so the copy stays readable, lighter on the right over the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#eaf4ff]/90 via-[#eaf4ff]/30 to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaf4ff]/10 via-transparent to-[#eaf4ff]/20 pointer-events-none z-0"></div>

      {/* Shared Background Pattern Image overlay */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Diagonal Flight Laser Stream */}
      <div className="absolute top-16 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rotate-6 animate-shimmer-sweep z-0 pointer-events-none"></div>
      <div className="absolute bottom-24 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent -rotate-6 animate-shimmer-sweep z-0 pointer-events-none" style={{ animationDelay: '3s' }}></div>

      {/* Ambient background glow & soft blurred bokeh spheres */}
      <div className="absolute -left-20 top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute right-0 bottom-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-[130px] pointer-events-none z-0"></div>

      {/* Floating Sparkles & Flying Mini Plane */}
      <div className="absolute top-16 left-[10%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></div>
      <div className="absolute bottom-20 right-[15%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-float-delayed pointer-events-none z-0"></div>
      <Plane className="hidden md:block absolute top-24 right-[8%] w-5 h-5 text-blue-500/40 rotate-45 animate-float pointer-events-none z-0" style={{ animationDelay: '1.5s' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-14 items-center">

          {/* LEFT: copy */}
          <div className="text-center lg:text-left">
            {/* Glowing top badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold w-fit mb-5 shadow-[0_4px_20px_rgba(37,99,235,0.18)] select-none mx-auto lg:mx-0 hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
              <span>EXCLUSIVE TRAVEL REWARDS</span>
            </div>

            {/* Main Heading */}
            <h2 className="font-heading font-black text-3xl sm:text-6xl uppercase tracking-tight leading-[0.95] mb-4">
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">Trip</span>
              <span className="block text-slate-900 drop-shadow-sm">Achievement</span>
            </h2>

            {/* Glowing Underline Bar */}
            <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto lg:mx-0 mb-6">
              <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
            </div>

            <div className="group/ribbon relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-xl -rotate-1 shadow-lg shadow-slate-900/30 my-3 overflow-hidden hover:scale-105 hover:rotate-0 transition-all duration-300">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/ribbon:translate-x-full transition-transform duration-1000"></span>
              <Plane className="w-3.5 h-3.5 text-blue-400 shrink-0 relative animate-pulse" strokeWidth={2.5} />
              <span className="relative">Earn More, Travel More!</span>
            </div>

            <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-md mx-auto lg:mx-0 mb-8 mt-4 leading-relaxed">
              <span className="text-blue-600 font-black">Zarni Skills</span> rewards your hard work with unforgettable international & national trip experiences.
            </p>

            <div className="relative space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="absolute left-[22px] top-8 bottom-8 w-px border-l-2 border-dashed border-blue-500/30 hidden sm:block"></div>
              {FEATURES.map((f, idx) => (
                <div key={idx} className="group relative flex items-start gap-4 text-left sm:-mx-3 mx-0 px-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white hover:border-blue-300 hover:shadow-[0_15px_35px_rgba(37,99,235,0.15)] hover:-translate-y-1 transition-all duration-300">
                  <div className={`relative z-10 w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center shrink-0 shadow-md ${f.glow} transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12`}>
                    <f.Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide group-hover:text-blue-600 transition-colors">{f.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: photo */}
          <div className="relative flex items-center justify-center py-0 sm:py-4">
            <div className="group/photo relative w-full max-w-[220px] sm:max-w-[480px] aspect-[3/4]">

              {/* Rotating Flight Compass Ring behind photo */}
              <div className="absolute inset-[-20px] rounded-full border border-blue-500/20 border-dashed pointer-events-none hidden sm:block animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-[-40px] rounded-full border border-cyan-400/15 border-dashed pointer-events-none hidden sm:block animate-[spin_40s_linear_infinite_reverse]"></div>

              {/* Glowing Background Radial Aura */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-blue-500/20 via-cyan-400/15 to-indigo-500/20 blur-[40px] sm:blur-[80px] pointer-events-none animate-pulse"></div>

              {/* Girl photo */}
              <div className="absolute inset-0 z-10 transition-transform duration-700 group-hover/photo:scale-[1.05]">
                <img
                  src="/static/img/tripgirl.png"
                  alt="Student trip reward"
                  className="w-full h-full object-contain drop-shadow-[0_25px_50px_rgba(37,99,235,0.35)]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Plane + dashed flight trail */}
              <svg className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[115%] h-24 pointer-events-none z-20" viewBox="0 0 320 90" fill="none">
                <path d="M10 60 C 90 20, 230 20, 310 55" stroke="#2563eb" strokeOpacity="0.5" strokeWidth="2.5" strokeDasharray="3 5" strokeLinecap="round" className="animate-pulse" />
              </svg>
              <div className="absolute bottom-2 right-4 z-20 bg-white rounded-full p-3 shadow-xl shadow-blue-500/25 transition-all duration-500 hover:rotate-180 hover:scale-125 border border-slate-100 cursor-pointer group/plane">
                <Plane className="w-5 h-5 text-blue-600 group-hover/plane:text-indigo-600 transition-colors" strokeWidth={2.5} />
              </div>

              {/* Floating stat card */}
              <div className="absolute top-4 left-0 sm:-left-12 z-20 animate-float">
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_15px_35px_rgba(37,99,235,0.18)] flex items-center gap-2.5 transition-transform duration-300 hover:scale-108">
                  <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Globe className="w-4 h-4 animate-spin-slow" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-900 leading-none">50+</p>
                    <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Trips Awarded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OUR TRIP RULES */}
        <div className="relative overflow-hidden mt-6 sm:mt-16 bg-gradient-to-br from-white/95 via-white to-blue-50/30 backdrop-blur-md border border-white shadow-[0_20px_50px_rgba(37,99,235,0.14)] rounded-[2rem] p-4 sm:p-8 hover:shadow-[0_30px_70px_rgba(37,99,235,0.22)] transition-all duration-500 group/rules">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-[70px] pointer-events-none"></div>
          <div className="relative flex items-center justify-center gap-3 mb-3 sm:mb-6">
            <span className="hidden sm:block w-10 h-px bg-blue-500/30"></span>
            <h3 className="text-lg sm:text-xl font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
              Our Trip Rules
            </h3>
            <span className="hidden sm:block w-10 h-px bg-blue-500/30"></span>
          </div>

          <div className="relative grid grid-cols-2 divide-x divide-slate-100">
            <div className="group/rule flex items-center justify-center gap-1.5 sm:gap-3.5 py-2 px-1 sm:px-4 rounded-2xl hover:bg-blue-500/5 transition-all duration-300">
              <span className="w-8 h-8 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover/rule:scale-115 group-hover/rule:-rotate-6">
                <Globe className="w-4 h-4 sm:w-5.5 sm:h-5.5 animate-pulse" strokeWidth={2} />
              </span>
              <p className="font-bold text-slate-800 uppercase tracking-wide whitespace-nowrap">
                <span className="sm:hidden text-[10px]">1 Int'l Trip <span className="text-blue-600 font-black">/Year</span></span>
                <span className="hidden sm:inline text-sm">1 International Trip <span className="text-blue-600 font-black">in a Year</span></span>
              </p>
            </div>
            <div className="group/rule flex items-center justify-center gap-1.5 sm:gap-3.5 py-2 px-1 sm:px-4 rounded-2xl hover:bg-blue-500/5 transition-all duration-300">
              <span className="w-8 h-8 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover/rule:scale-115 group-hover/rule:-rotate-6">
                <Luggage className="w-4 h-4 sm:w-5.5 sm:h-5.5 animate-pulse" strokeWidth={2} />
              </span>
              <p className="font-bold text-slate-800 uppercase tracking-wide whitespace-nowrap">
                <span className="sm:hidden text-[10px]">2 Natl Trips <span className="text-blue-600 font-black">/Year</span></span>
                <span className="hidden sm:inline text-sm">2 National Trips <span className="text-blue-600 font-black">in a Year</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-5 sm:mt-8 flex justify-center">
          <div className="group/bar relative inline-flex items-center gap-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-xs sm:text-sm font-bold px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full shadow-lg shadow-slate-900/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden cursor-pointer">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></span>
            <Plane className="w-4 h-4 text-blue-400 shrink-0 relative animate-pulse" strokeWidth={2} />
            <span className="relative">Work Hard. Achieve More. <span className="text-blue-400 font-black">Explore The World.</span></span>
          </div>
        </div>

      </div>
    </section>
  );
}
