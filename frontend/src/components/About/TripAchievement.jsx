import React from 'react';
import { TrendingUp, Gift, Trophy, Globe, Luggage, Plane } from 'lucide-react';

const FEATURES = [
  {
    title: 'Achieve Higher Income',
    desc: 'Reach your income goals and unlock amazing rewards.',
    Icon: TrendingUp,
  },
  {
    title: 'Get Free Trips',
    desc: 'Enjoy international and national trips on us.',
    Icon: Gift,
  },
  {
    title: 'Reward Your Success',
    desc: 'Your success, our celebration. You earn, you explore!',
    Icon: Trophy,
  },
];

export default function TripAchievement() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#eaf4ff]">

      {/* Travel landmarks background */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/tripbg.png)' }}></div>
      {/* Fade to white on the left so the copy stays readable, lighter on the right over the photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#eaf4ff] via-[#eaf4ff]/85 to-[#eaf4ff]/30 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaf4ff]/40 via-transparent to-[#eaf4ff]/70 pointer-events-none z-0"></div>

      {/* Floating accent dots */}
      <span className="absolute top-10 left-10 w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-primary shadow-lg animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-16 right-12 w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg animate-float-delayed pointer-events-none z-0"></span>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-black text-primary uppercase tracking-widest mb-5">
              <Trophy className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
              Exclusive Rewards
            </div>

            <h2 className="font-heading font-black text-5xl sm:text-6xl uppercase tracking-tight leading-[0.95]">
              <span className="block bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">Trip</span>
              <span className="block text-slate-900">Achievement</span>
            </h2>

            <div className="group/ribbon relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-lg -rotate-1 shadow-lg shadow-slate-900/30 my-5 overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/ribbon:translate-x-full transition-transform duration-700"></span>
              <Plane className="w-3.5 h-3.5 text-primary-light shrink-0 relative" strokeWidth={2.5} />
              <span className="relative">Earn More, Travel More!</span>
            </div>

            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0 mb-8">
              <span className="text-primary font-bold">Zarni Skills</span> rewards your hard work with unforgettable experiences.
            </p>

            <div className="relative space-y-7 max-w-md mx-auto lg:mx-0">
              <div className="absolute left-[22px] top-8 bottom-8 w-px border-l-2 border-dashed border-primary/25 hidden sm:block"></div>
              {FEATURES.map((f, idx) => (
                <div key={idx} className="group relative flex items-start gap-4 text-left -mx-3 px-3 py-1.5 rounded-2xl hover:bg-white/60 transition-colors duration-300">
                  <div className="relative z-10 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <f.Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-primary uppercase tracking-wide">{f.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: photo */}
          <div className="relative flex items-center justify-center py-4">
            <div className="group/photo relative w-full max-w-[380px] aspect-[3/4]">

              {/* Concentric orbit rings */}
              <div className="absolute inset-[-16px] rounded-full border border-primary/8 pointer-events-none hidden sm:block"></div>
              <div className="absolute inset-[-34px] rounded-full border border-dashed border-primary/10 pointer-events-none hidden sm:block"></div>

              {/* Outer glow on hover */}
              <div className="absolute -inset-1 rounded-[3.3rem] bg-gradient-to-br from-primary via-blue-400 to-indigo-600 opacity-0 group-hover/photo:opacity-40 blur-xl transition-opacity duration-500 pointer-events-none"></div>

              {/* Frosted backdrop so the photo stands out against the busy landmarks background */}
              <div className="absolute inset-0 rounded-[3rem] bg-white/40 backdrop-blur-md border border-white/80 shadow-[inset_0_0_60px_rgba(59,130,246,0.1),0_20px_80px_rgba(59,130,246,0.15)]"></div>

              {/* Girl photo */}
              <div className="absolute inset-0 z-10 transition-transform duration-500 group-hover/photo:scale-[1.02]">
                <img
                  src="/static/img/tripgirl.png"
                  alt="Student trip reward"
                  className="w-full h-full object-contain drop-shadow-[0_25px_40px_rgba(43,128,240,0.2)]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Plane + dashed flight trail */}
              <svg className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[110%] h-24 pointer-events-none z-20" viewBox="0 0 320 90" fill="none">
                <path d="M10 60 C 90 20, 230 20, 310 55" stroke="#2b80f0" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
              </svg>
              <div className="absolute bottom-2 right-2 sm:right-6 z-20 bg-white rounded-full p-2.5 shadow-xl shadow-primary/20 transition-transform duration-300 group-hover/photo:rotate-12 group-hover/photo:scale-110">
                <Plane className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>

              {/* Floating stat card */}
              <div className="absolute top-4 -left-6 sm:-left-10 z-20 animate-float">
                <div className="bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">50+</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Trips Awarded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OUR TRIP RULES */}
        <div className="relative overflow-hidden mt-16 bg-white/90 backdrop-blur-md border border-white shadow-[0_15px_40px_-15px_rgba(43,128,240,0.2)] rounded-[2rem] p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-[70px] pointer-events-none"></div>
          <div className="relative flex items-center justify-center gap-3 mb-6">
            <span className="hidden sm:block w-10 h-px bg-primary/30"></span>
            <h3 className="text-lg sm:text-xl font-black text-primary uppercase tracking-widest">Our Trip Rules</h3>
            <span className="hidden sm:block w-10 h-px bg-primary/30"></span>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="group flex items-center justify-center gap-3 py-3 sm:py-2 px-3 rounded-2xl hover:bg-primary/5 transition-colors duration-300">
              <span className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <Globe className="w-5 h-5" strokeWidth={2} />
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">1 International Trip <span className="block sm:inline text-slate-400">in a Year</span></p>
            </div>
            <div className="group flex items-center justify-center gap-3 py-3 sm:py-2 px-3 rounded-2xl hover:bg-primary/5 transition-colors duration-300">
              <span className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <Luggage className="w-5 h-5" strokeWidth={2} />
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">2 National Trips <span className="block sm:inline text-slate-400">in a Year</span></p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex justify-center">
          <div className="group/bar relative inline-flex items-center gap-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-lg shadow-slate-900/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-700"></span>
            <Plane className="w-4 h-4 text-primary-light shrink-0 relative" strokeWidth={2} />
            <span className="relative">Work Hard. Achieve More. <span className="text-primary-light font-black">Explore The World.</span></span>
          </div>
        </div>

      </div>
    </section>
  );
}
