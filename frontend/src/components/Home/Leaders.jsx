import React from 'react';
import { Shield, CheckCircle2, User, Star, Activity } from 'lucide-react';

export default function Leaders() {
  return (
    <section className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden" id="about">

      {/* Abstract tech grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0">
      </div>

      {/* Ambient Blue Effect Background Blobs */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -left-32 top-32 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse z-0"></div>
      <div className="absolute right-0 bottom-0 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">

        {/* Header Section */}
        <div className="relative text-center max-w-3xl mx-auto mb-16 space-y-4">
          {/* Giant decorative ghost icon */}
          <Shield className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 text-primary/[0.05] pointer-events-none" fill="currentColor" strokeWidth={0} />

          {/* Floating accent particles */}
          <span className="absolute top-2 left-[18%] w-1.5 h-1.5 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(43,128,240,0.6)] animate-float pointer-events-none"></span>
          <span className="absolute bottom-4 right-[16%] w-2 h-2 rounded-full bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.6)] animate-float-delayed pointer-events-none"></span>

          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(43,128,240,0.12)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <Shield width={14} height={14} fill="currentColor" className="text-primary" />
            Trusted Platform
          </div>
          <h3 className="relative text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Beyond Learning — We're Building{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(43,128,240,0.25)]">Leaders.</span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600 opacity-30"></span>
            </span>
          </h3>
          <p className="relative text-slate-500 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl mx-auto">
            At Zarni Skills, we empower individuals with high-income capabilities. We prioritize <span className="text-primary font-black">quality, transparency, and real-world results</span> over empty promises.
          </p>

          {/* Mini trust stats */}
          <div className="relative flex items-center justify-center gap-6 sm:gap-10 pt-3">
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">15K+</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Students</p>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">4.9<span className="text-amber-400">★</span></p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Rating</p>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">100%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Practical</p>
            </div>
          </div>
        </div>

        {/* Symmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative">

          {/* LEFT SIDE: 2 Glow Blocks */}
          <div className="order-2 lg:order-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8 z-20">
            {/* Block 1 */}
            <div className="relative bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(43,128,240,0.14)] hover:border-primary/25 hover:-translate-y-1 transition-all duration-400 group">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-indigo-600"></div>
              <div className="p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-slate-300 group-hover:text-primary/40 transition-colors uppercase tracking-widest">01 / Curated</span>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 width={18} height={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2 group-hover:text-primary transition-colors duration-300">Expert Practical Training</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Learn directly from real-world practitioners with a curriculum built to map actionable results from day one.</p>
              </div>
            </div>

            {/* Block 2 */}
            <div className="relative bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(43,128,240,0.14)] hover:border-primary/25 hover:-translate-y-1 transition-all duration-400 group">
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-primary"></div>
              <div className="p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-slate-300 group-hover:text-indigo-400/60 transition-colors uppercase tracking-widest">02 / Network</span>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  <User width={18} height={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">Collaborative Ecosystem</h4>
                <p className="text-slate-500 text-sm leading-relaxed">You are never alone. Access full network rooms, active community support forums, and peers instantly.</p>
              </div>
            </div>
          </div>

          {/* CENTER SIDE: Character Illustration with Orbit Lines & Floating Pills */}
          <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col items-center justify-center relative min-h-[460px]">
            <div className="absolute w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

            {/* Orbit rings, with a glowing comet dot traveling around each */}
            <div className="absolute w-[21rem] h-[21rem] border-2 border-dashed border-primary/40 rounded-full animate-[spin_28s_linear_infinite] z-0 pointer-events-none">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_4px_rgba(43,128,240,0.6)]"></span>
            </div>
            <div className="absolute w-[25rem] h-[25rem] border-2 border-dotted border-indigo-400/45 rounded-full animate-[spin_44s_linear_infinite_reverse] z-0 pointer-events-none">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_3px_rgba(99,102,241,0.6)]"></span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] px-3 py-1 rounded-full font-black absolute top-12 left-6 z-20 shadow-sm animate-[float_4s_ease-in-out_infinite] select-none whitespace-nowrap">
              ✓ Live Mentorship
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black absolute bottom-24 right-4 z-20 shadow-sm animate-[float_6s_ease-in-out_infinite] select-none whitespace-nowrap">
              ✓ 100% Practical
            </div>

            {/* Character image */}
            <div className="relative z-10 w-full flex items-center justify-center transition-transform duration-700 hover:scale-105">
              <img
                src="/static/img/black sticky guy.png"
                alt="Leadership Character"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop";
                }}
                className="w-52 h-52 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-[0_10px_35px_rgba(59,130,246,0.22)]"
              />
            </div>

            {/* Rating overlay badge */}
            <div className="absolute bottom-4 bg-white border border-amber-400/35 rounded-2xl px-5 py-3.5 shadow-[0_15px_40px_rgba(245,158,11,0.15)] flex items-center gap-3.5 z-30 animate-[float_5s_ease-in-out_infinite]">
              <div className="text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-spin [animation-duration:12s]">
                <Star width={22} height={22} fill="currentColor" />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-sm font-black tracking-tight text-slate-800">4.9 / 5 Rating</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">15,000+ Students</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: 2 Glow Blocks */}
          <div className="order-3 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8 z-20">
            {/* Block 3 */}
            <div className="relative bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.14)] hover:border-indigo-300/40 hover:-translate-y-1 transition-all duration-400 group">
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <div className="p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-slate-300 group-hover:text-amber-400/60 transition-colors uppercase tracking-widest">03 / Success</span>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-400/20 group-hover:scale-110 transition-transform duration-300">
                  <Star width={18} height={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">Proven Track Records</h4>
                <p className="text-slate-500 text-sm leading-relaxed">We scale our targets by student success metrics. Transformed career arcs are our primary currency.</p>
              </div>
            </div>

            {/* Block 4 */}
            <div className="relative bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.14)] hover:border-emerald-300/40 hover:-translate-y-1 transition-all duration-400 group">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <div className="p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-slate-300 group-hover:text-emerald-400/60 transition-colors uppercase tracking-widest">04 / Impact</span>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-400/20 group-hover:scale-110 transition-transform duration-300">
                  <Activity width={18} height={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">High-Income Focus</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Skip the fluff. We target high-demand economic skill sets that produce modern value fields.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
