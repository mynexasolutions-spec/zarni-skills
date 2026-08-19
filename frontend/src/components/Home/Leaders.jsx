import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, User, Star, Activity, Sparkles, Zap, Award, TrendingUp, Trophy, Target, Gift, Medal } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import useInView from '../../hooks/useInView';
import api from '../../utils/api';

const PLATFORM_ICON_MAP = { CheckCircle2, User, Star, Activity, Shield, Award, TrendingUp, Zap, Sparkles, Trophy, Target, Gift, Medal };

const DEFAULT_FEATURES = [
  { title: 'Expert Practical Training', description: 'Learn directly from real-world practitioners with a curriculum built to map actionable results from day one.', icon: 'CheckCircle2' },
  { title: 'Collaborative Ecosystem', description: 'You are never alone. Access full network rooms, active community support forums, and peers instantly.', icon: 'User' },
  { title: 'Proven Track Records', description: 'We scale our targets by student success metrics. Transformed career arcs are our primary currency.', icon: 'Star' },
  { title: 'High-Income Focus', description: 'Skip the fluff. We target high-demand economic skill sets that produce modern value fields.', icon: 'Activity' },
];

// Shimmering highlight sweeping across a card's top accent bar, continuously.
function ShimmerBar({ className }) {
  return (
    <div className={`h-1 w-full relative overflow-hidden ${className}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer-sweep"></span>
    </div>
  );
}

export default function Leaders() {
  const [sectionRef, inView] = useInView(0.2);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.get('/platform-features');
        const items = res.data.platform_features || [];
        if (items.length >= 4) {
          setFeatures(items.slice(0, 4).map((f) => ({ title: f.title, description: f.description, icon: f.icon })));
        }
      } catch (err) {
        console.error('Error fetching platform features', err);
      }
    };
    fetchFeatures();
  }, []);

  const revealClass = `transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;
  const revealStyle = (delay = 0) => ({ transitionDelay: `${delay}ms` });

  const revealXClass = (dir) =>
    `transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-x-0' : `opacity-0 ${dir === 'left' ? '-translate-x-10' : 'translate-x-10'}`}`;
  const revealScaleClass = `transition-all duration-700 ease-out ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`;

  const students = useCountUp(15, inView, 0);
  const rating = useCountUp(4.9, inView, 1);
  const practical = useCountUp(100, inView, 0);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white text-slate-900 relative overflow-hidden" id="about">

      {/* Abstract tech grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none z-0">
      </div>

      {/* Ambient Blue Effect Background Blobs */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -left-32 top-32 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none animate-pulse z-0"></div>
      <div className="absolute right-0 bottom-0 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">

        {/* Header Section */}
        <div className="relative text-center max-w-3xl mx-auto mb-16 space-y-4">
          {/* Giant decorative ghost icon — slow breathing pulse */}
          <Shield className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-44 text-blue-500/[0.06] pointer-events-none animate-pulse" fill="currentColor" strokeWidth={0} />

          {/* Floating accent particles */}
          <span className="absolute top-2 left-[18%] w-2 h-2 rounded-full bg-blue-500/60 shadow-[0_0_12px_rgba(37,99,235,0.8)] animate-float pointer-events-none"></span>
          <span className="absolute bottom-4 right-[16%] w-2.5 h-2.5 rounded-full bg-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-float-delayed pointer-events-none"></span>
          <span className="absolute top-1/3 right-[8%] w-1.5 h-1.5 rounded-full bg-blue-400/70 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-float pointer-events-none"></span>
          <span className="absolute bottom-1/4 left-[10%] w-2 h-2 rounded-full bg-indigo-400/70 shadow-[0_0_10px_rgba(129,140,248,0.7)] animate-float-delayed pointer-events-none"></span>

          <div style={revealStyle(0)} className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-xs font-black text-blue-700 uppercase tracking-widest mb-3 shadow-[0_4px_20px_rgba(37,99,235,0.12)] ${revealClass}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <Shield width={14} height={14} fill="currentColor" className="text-blue-600" />
            About Platform
          </div>
          
          <h3 style={revealStyle(100)} className={`relative text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight ${revealClass}`}>
            About{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(37,99,235,0.25)] bg-[length:200%_auto] animate-gradient-x">Platform</span>
              <span className="absolute -bottom-1 left-0 w-full h-[3.5px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 shadow-[0_0_10px_rgba(37,99,235,0.6)]"></span>
            </span>
          </h3>

          <p style={revealStyle(200)} className={`relative text-slate-600 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl mx-auto ${revealClass}`}>
            At Zarni Skills, we empower individuals with high-income capabilities. We prioritize <span className="text-blue-600 font-black">quality, transparency, and real-world results</span> over empty promises.
          </p>

          {/* Mini trust stats — count up once in view */}
          <div style={revealStyle(300)} className={`relative flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 ${revealClass}`}>
            <div className="relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-[0_6px_20px_rgba(37,99,235,0.08)] text-center transition-all duration-300 hover:scale-105 hover:border-blue-300 overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-blue-200/40 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none"></span>
              <p className="relative text-xl sm:text-2xl font-black text-slate-900 leading-none">{students}K+</p>
              <p className="relative text-[10px] text-blue-600 font-black uppercase tracking-wider mt-1">Active Students</p>
            </div>
            <div className="relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-100 shadow-[0_6px_20px_rgba(245,158,11,0.08)] text-center transition-all duration-300 hover:scale-105 hover:border-amber-300 overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-amber-200/40 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" style={{ animationDelay: '0.7s' }}></span>
              <p className="relative text-xl sm:text-2xl font-black text-slate-900 leading-none">{rating}<span className="text-amber-400">★</span></p>
              <p className="relative text-[10px] text-amber-600 font-black uppercase tracking-wider mt-1">Avg Rating</p>
            </div>
            <div className="relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-[0_6px_20px_rgba(16,185,129,0.08)] text-center transition-all duration-300 hover:scale-105 hover:border-emerald-300 overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" style={{ animationDelay: '1.4s' }}></span>
              <p className="relative text-xl sm:text-2xl font-black text-slate-900 leading-none">{practical}%</p>
              <p className="relative text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-1">Practical Focus</p>
            </div>
          </div>
        </div>

        {/* Symmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center relative">

          {/* LEFT SIDE: 2 Glow Blocks */}
          <div className="order-2 lg:order-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5 lg:gap-6 z-20">
            {/* Block 1 */}
            <div style={revealStyle(400)} className={`relative bg-gradient-to-br from-white via-blue-50/40 to-white backdrop-blur-md border border-blue-100/80 rounded-2xl overflow-hidden shadow-[0_10px_35px_rgba(37,99,235,0.08)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.22)] hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 group ${revealXClass('left')}`}>
              <ShimmerBar className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
              <div className="p-5 sm:p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 group-hover:text-blue-700 transition-colors uppercase tracking-widest">01 / Curated</span>
                <div className="relative w-12 h-12 mb-4">
                  <span className="absolute inset-0 rounded-xl bg-blue-500/50 animate-pulse-ring"></span>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {(() => { const Ic = PLATFORM_ICON_MAP[features[0]?.icon] || CheckCircle2; return <Ic width={22} height={22} strokeWidth={2.5} />; })()}
                  </div>
                </div>
                <h4 className="text-base font-black text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-300">{features[0]?.title}</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{features[0]?.description}</p>
              </div>
            </div>

            {/* Block 2 */}
            <div style={revealStyle(550)} className={`relative bg-gradient-to-br from-white via-indigo-50/40 to-white backdrop-blur-md border border-indigo-100/80 rounded-2xl overflow-hidden shadow-[0_10px_35px_rgba(99,102,241,0.08)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.22)] hover:border-indigo-400 hover:-translate-y-1.5 transition-all duration-300 group ${revealXClass('left')}`}>
              <ShimmerBar className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />
              <div className="p-5 sm:p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 group-hover:text-indigo-700 transition-colors uppercase tracking-widest">02 / Network</span>
                <div className="relative w-12 h-12 mb-4">
                  <span className="absolute inset-0 rounded-xl bg-indigo-500/50 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></span>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {(() => { const Ic = PLATFORM_ICON_MAP[features[1]?.icon] || User; return <Ic width={22} height={22} strokeWidth={2.5} />; })()}
                  </div>
                </div>
                <h4 className="text-base font-black text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors duration-300">{features[1]?.title}</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{features[1]?.description}</p>
              </div>
            </div>
          </div>

          {/* CENTER SIDE: Character Illustration with Orbit Lines & Floating Pills */}
          <div style={revealStyle(150)} className={`order-1 lg:order-2 lg:col-span-4 flex flex-col items-center justify-center relative min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] ${revealScaleClass}`}>
            <div className="absolute w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-[90px] pointer-events-none z-0 animate-pulse"></div>

            {/* Orbit rings with traveling glowing comets */}
            <div className="absolute w-56 h-56 sm:w-72 sm:h-72 lg:w-[21rem] lg:h-[21rem] border-2 border-dashed border-blue-400/40 rounded-full animate-[spin_24s_linear_infinite] z-0 pointer-events-none">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-blue-600 shadow-[0_0_16px_6px_rgba(37,99,235,0.8)]"></span>
            </div>
            <div className="absolute w-64 h-64 sm:w-[21.5rem] sm:h-[21.5rem] lg:w-[25rem] lg:h-[25rem] border-2 border-dotted border-indigo-400/50 rounded-full animate-[spin_38s_linear_infinite_reverse] z-0 pointer-events-none">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_14px_5px_rgba(99,102,241,0.8)]"></span>
            </div>

            {/* 4 Animated Floating Feature Pills */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[9px] sm:text-xs px-2.5 py-1 rounded-full font-black absolute top-8 left-6 sm:top-14 sm:left-4 z-20 shadow-md shadow-emerald-500/10 animate-[float_4s_ease-in-out_infinite] select-none whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ✓ Live Mentorship
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-700 text-[9px] sm:text-xs px-2.5 py-1 rounded-full font-black absolute top-10 right-6 sm:top-16 sm:right-4 z-20 shadow-md shadow-blue-500/10 animate-[float_5s_ease-in-out_infinite] select-none whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              ✓ High Income Skills
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 text-[9px] sm:text-xs px-2.5 py-1 rounded-full font-black absolute bottom-24 right-6 sm:bottom-28 sm:right-4 z-20 shadow-md shadow-indigo-500/10 animate-[float_6s_ease-in-out_infinite] select-none whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              ✓ 100% Practical
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[9px] sm:text-xs px-2.5 py-1 rounded-full font-black absolute bottom-20 left-6 sm:bottom-24 sm:left-4 z-20 shadow-md shadow-amber-500/10 animate-[float_7s_ease-in-out_infinite] select-none whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              ✓ Verified Community
            </div>

            {/* Character image */}
            <div className="relative z-10 w-full flex items-center justify-center transition-transform duration-700 hover:scale-105">
              <img
                src="/static/img/black sticky guy.png"
                alt="Leadership Character"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop";
                }}
                className="w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-[0_15px_40px_rgba(37,99,235,0.25)]"
              />
            </div>

            {/* Rating overlay badge */}
            <div className="absolute bottom-0 sm:bottom-2 bg-white/95 backdrop-blur-md border border-amber-300 rounded-2xl px-3 py-2 sm:px-5 sm:py-3.5 shadow-[0_15px_40px_rgba(245,158,11,0.2)] flex items-center gap-2 sm:gap-3.5 z-30 animate-[float_5s_ease-in-out_infinite]">
              <div className="text-amber-400 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-spin [animation-duration:10s]">
                <Star width={20} height={20} className="sm:w-[24px] sm:h-[24px]" fill="currentColor" />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-xs sm:text-sm font-black tracking-tight text-slate-900">4.9 / 5 Rating</p>
                <p className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">15,000+ Active Students</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: 2 Glow Blocks */}
          <div className="order-3 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5 lg:gap-6 z-20">
            {/* Block 3 */}
            <div style={revealStyle(400)} className={`relative bg-white/95 backdrop-blur-md border border-amber-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(245,158,11,0.06)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)] hover:border-amber-300 hover:-translate-y-1.5 transition-all duration-300 group ${revealXClass('right')}`}>
              <ShimmerBar className="bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="p-5 sm:p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-amber-400 group-hover:text-amber-600 transition-colors uppercase tracking-widest">03 / Success</span>
                <div className="relative w-11 h-11 mb-3.5">
                  <span className="absolute inset-0 rounded-xl bg-amber-400/50 animate-pulse-ring" style={{ animationDelay: '1s' }}></span>
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-400/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {(() => { const Ic = PLATFORM_ICON_MAP[features[2]?.icon] || Star; return <Ic width={20} height={20} strokeWidth={2.5} />; })()}
                  </div>
                </div>
                <h4 className="text-base font-black text-slate-900 mb-1.5 group-hover:text-amber-600 transition-colors duration-300">{features[2]?.title}</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{features[2]?.description}</p>
              </div>
            </div>

            {/* Block 4 */}
            <div style={revealStyle(550)} className={`relative bg-white/95 backdrop-blur-md border border-emerald-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 group ${revealXClass('right')}`}>
              <ShimmerBar className="bg-gradient-to-r from-emerald-500 to-teal-600" />
              <div className="p-5 sm:p-6">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-colors pointer-events-none"></div>
                <span className="absolute top-5 right-5 text-[10px] font-black text-emerald-400 group-hover:text-emerald-600 transition-colors uppercase tracking-widest">04 / Impact</span>
                <div className="relative w-11 h-11 mb-3.5">
                  <span className="absolute inset-0 rounded-xl bg-emerald-500/50 animate-pulse-ring" style={{ animationDelay: '1.5s' }}></span>
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-400/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {(() => { const Ic = PLATFORM_ICON_MAP[features[3]?.icon] || Activity; return <Ic width={20} height={20} strokeWidth={2.5} />; })()}
                  </div>
                </div>
                <h4 className="text-base font-black text-slate-900 mb-1.5 group-hover:text-emerald-600 transition-colors duration-300">{features[3]?.title}</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{features[3]?.description}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
