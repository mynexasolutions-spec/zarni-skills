import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift, TrendingUp, Trophy, Lock, Medal, Target, Sparkles, ArrowRight, Smartphone, Watch, Laptop, Mic, Armchair,
} from 'lucide-react';
import useInView from '../../hooks/useInView';
import api from '../../utils/api';

const INTRO_FEATURES = [
  { title: 'Achieve', desc: 'Set your income goals and keep growing.', Icon: Medal, color: 'from-blue-600 to-indigo-600' },
  { title: 'Unlock', desc: 'Reach milestones and unlock exciting rewards.', Icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
  { title: 'Enjoy', desc: 'Get premium gifts that inspire and motivate you.', Icon: Trophy, color: 'from-amber-500 to-orange-600' },
];

const MILESTONES = [
  { label: 'Mic & Tripod', img: '/static/img/reward-tripod.png', Icon: Mic, color: 'from-blue-600 to-indigo-600' },
  { label: 'Smart Watch', img: '/static/img/reward-smartwatch.png', Icon: Watch, color: 'from-cyan-500 to-blue-600' },
  { label: 'Smartphone', img: '/static/img/reward-phone.png', popular: true, Icon: Smartphone, color: 'from-blue-600 to-indigo-600' },
  { label: 'Laptop', img: '/static/img/reward-laptop.png', Icon: Laptop, color: 'from-indigo-600 to-purple-600' },
  { label: 'Office Chair', img: '/static/img/reward-chair.png', Icon: Armchair, color: 'from-purple-600 to-pink-600' },
];

const PERKS = [
  { title: 'No Time Limit', desc: 'Achieve at your own pace.', Icon: Medal, color: 'from-blue-600 to-indigo-600' },
  { title: 'Set Goals', desc: 'Push your limits and grow more.', Icon: Target, color: 'from-indigo-600 to-purple-600' },
  { title: 'Get Rewarded', desc: 'Unlock premium gifts and more.', Icon: Gift, color: 'from-emerald-500 to-teal-600' },
  { title: 'Stay Motivated', desc: 'More income, more rewards.', Icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
];

export default function AchievementRewards() {
  const [sectionRef, inView] = useInView(0.15);
  const canvasRef = useRef(null);
  const confettiFired = useRef(false);
  const [milestones, setMilestones] = useState(MILESTONES);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await api.get('/reward-items');
        const items = res.data.reward_items || [];
        if (items.length > 0) {
          setMilestones(items.map((r) => ({
            label: r.label,
            img: r.image_display_url,
            popular: r.is_popular,
            color: r.gradient || 'from-blue-600 to-indigo-600',
          })));
        }
      } catch (err) {
        console.error('Error fetching reward items', err);
      }
    };
    fetchRewards();
  }, []);

  useEffect(() => {
    if (inView && !confettiFired.current) {
      confettiFired.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      const colors = ['#2563eb', '#3b82f6', '#22d3ee', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      const particles = [];
      const particleCount = 85;

      for (let i = 0; i < particleCount; i++) {
        const fromLeft = Math.random() < 0.5;
        particles.push({
          x: fromLeft ? Math.random() * (canvas.width * 0.35) : canvas.width * 0.65 + Math.random() * (canvas.width * 0.35),
          y: Math.random() * (canvas.height * 0.35) + 50,
          vx: (fromLeft ? 1 : -1) * (Math.random() * 9 + 4),
          vy: Math.random() * -12 - 5,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          opacity: 1,
          shape: Math.random() < 0.5 ? 'rect' : 'circle',
        });
      }

      let animId;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach((p) => {
          if (p.opacity <= 0) return;
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35;
          p.rotation += p.vRot;
          p.opacity -= 0.007;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });

        if (active) {
          animId = requestAnimationFrame(render);
        }
      };

      animId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animId);
    }
  }, [inView]);

  const revealClass = `transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40" id="achievement-rewards">

      {/* Confetti Blast Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30 w-full h-full" />

      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-70" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Top light shimmer sweep bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Diagonal Laser Stream comets */}
      <div className="absolute top-16 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rotate-6 animate-shimmer-sweep pointer-events-none z-0"></div>
      <div className="absolute bottom-24 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent -rotate-6 animate-shimmer-sweep pointer-events-none z-0" style={{ animationDelay: '3.5s' }}></div>

      {/* Ambient glows — slow drift */}
      <div className="absolute -top-10 -left-16 w-[420px] h-[420px] bg-blue-300/15 blur-[120px] rounded-full pointer-events-none z-0 animate-blob"></div>
      <div className="absolute bottom-0 -right-16 w-[420px] h-[420px] bg-indigo-300/15 blur-[120px] rounded-full pointer-events-none z-0 animate-blob" style={{ animationDelay: '2.5s' }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* TOP: heading + photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-20">

          {/* LEFT: copy */}
          <div className={`text-center lg:text-left ${revealClass}`}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 shadow-[0_4px_20px_rgba(37,99,235,0.15)] text-xs font-bold text-blue-600 uppercase tracking-widest mb-5 select-none mx-auto lg:mx-0 hover:scale-105 transition-transform duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Level Up &amp; Cash In</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-6xl uppercase tracking-tight leading-[0.95] mb-5">
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">Achievement</span>
              <span className="block text-slate-900 drop-shadow-sm">Rewards</span>
            </h2>

            {/* Glowing Underline Bar */}
            <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto lg:mx-0 mb-6">
              <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
            </div>

            <div className="group/ribbon relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-xl -rotate-1 shadow-lg shadow-slate-900/30 mb-6 overflow-hidden hover:scale-105 hover:rotate-0 transition-all duration-300">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/ribbon:translate-x-full transition-transform duration-1000"></span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 relative animate-pulse" strokeWidth={2.5} />
              <span className="relative">Earn More, Achieve More!</span>
            </div>

            <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              Your hard work deserves the best rewards. Achieve your income milestones and{' '}
              <span className="text-blue-600 font-black">unlock exciting gifts</span> along the way!
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {INTRO_FEATURES.map((f, idx) => (
                <div key={idx} className={`text-center lg:text-left group transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${150 + idx * 120}ms` }}>
                  <div className={`w-11 h-11 mx-auto lg:mx-0 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center shadow-md shadow-blue-500/25 mb-2 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12`}>
                    <f.Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: photo with Smooth Breathing Backlight Glow */}
          <div className={`relative flex items-center justify-center py-4 transition-all duration-700 ease-out ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '150ms' }}>
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">

              {/* Smooth Breathing Spotlight Backlight Glow behind man */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/35 via-cyan-400/25 to-indigo-500/35 blur-[75px] pointer-events-none animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-300/40 via-blue-400/30 to-indigo-400/40 blur-[45px] pointer-events-none animate-[spin_15s_linear_infinite]"></div>

              {/* Rotating Orbit Rings */}
              <div className="absolute inset-[-15px] rounded-full border border-blue-500/20 border-dashed pointer-events-none hidden sm:block animate-[spin_50s_linear_infinite]"></div>
              <div className="absolute inset-[-35px] rounded-full border border-cyan-400/15 border-dashed pointer-events-none hidden sm:block animate-[spin_35s_linear_infinite_reverse]"></div>

              {/* Floating sparkle accents */}
              <Sparkles className="absolute top-2 -left-3 w-6 h-6 text-blue-500 animate-float z-20 drop-shadow-[0_0_10px_rgba(37,99,235,0.6)]" strokeWidth={2} />
              <Sparkles className="absolute bottom-10 -right-2 w-5 h-5 text-amber-400 animate-float-delayed z-20 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" strokeWidth={2} fill="currentColor" />
              <Trophy className="absolute top-1/3 -right-4 w-7 h-7 text-amber-400 animate-float z-20 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" style={{ animationDelay: '1.5s' }} strokeWidth={2} fill="currentColor" fillOpacity={0.2} />

              <div className="absolute inset-0 z-10 transition-transform duration-700 hover:scale-105">
                <img
                  src="/static/img/achievement-man.png"
                  alt="Student celebrating a reward milestone"
                  className="w-full h-full object-contain drop-shadow-[0_20px_45px_rgba(37,99,235,0.3)]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: journey / milestones */}
        <div className={`text-center mb-12 ${revealClass}`}>
          <div className="flex items-center justify-center gap-3">
            <span className="hidden sm:block w-10 h-px bg-blue-500/30"></span>
            <h3 className="text-lg sm:text-xl font-black text-blue-600 uppercase tracking-widest">Your Journey, Your Rewards</h3>
            <span className="hidden sm:block w-10 h-px bg-blue-500/30"></span>
          </div>
        </div>

        <div className="relative overflow-x-auto pt-9 pb-4 -mx-4 px-6 sm:mx-0 sm:px-0 no-scrollbar snap-x snap-mandatory">
          <div className="relative grid gap-3 sm:gap-5 min-w-[620px] sm:min-w-0" style={{ gridTemplateColumns: `repeat(${milestones.length}, minmax(0, 1fr))` }}>
            {/* Animated flowing-energy connector */}
            <svg className="hidden sm:block absolute top-5 left-[10%] w-[80%] h-1 pointer-events-none overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="journey-flow-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#2563eb" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="url(#journey-flow-grad)" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" className="animate-dash-flow" />
            </svg>

            {milestones.map((m, idx) => (
              <div
                key={idx}
                className={`group relative flex flex-col items-center transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}
                style={{ transitionDelay: `${idx * 110}ms` }}
              >
                {m.popular && (
                  <>
                    <span className="absolute inset-x-2 -inset-y-1 rounded-2xl bg-blue-500/25 blur-lg animate-pulse pointer-events-none" style={{ animationDuration: '2.2s' }}></span>
                    <span className="absolute -top-7 z-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md shadow-md shadow-blue-500/40 whitespace-nowrap flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" fill="currentColor" strokeWidth={0} />
                      Most Popular
                    </span>
                  </>
                )}
                
                {/* Lock / Unlock Icon Badge on Hover */}
                <div className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${m.color} text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3 transition-all duration-300 group-hover:scale-120 group-hover:rotate-12 ${m.popular ? 'animate-pulse' : ''}`}>
                  <Lock className="w-4 h-4 group-hover:hidden transition-all" strokeWidth={2.5} />
                  <Sparkles className="w-4.5 h-4.5 hidden group-hover:block transition-all animate-pulse text-amber-300" strokeWidth={2.5} fill="currentColor" />
                </div>

                {/* Card Container */}
                <div className={`relative w-full h-28 sm:h-32 md:h-36 rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-md flex items-center justify-center p-3 shadow-[0_6px_25px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_16px_40px_rgba(37,99,235,0.22)] overflow-hidden ${m.popular ? 'border-2 border-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.2)]' : 'border border-slate-200/80 group-hover:border-blue-300'}`}>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></span>
                  <img
                    src={m.img}
                    alt={m.label}
                    className="relative max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-115 group-hover:-rotate-3"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 mt-2 text-center group-hover:text-blue-600 transition-colors">{m.label}</p>
                <span className="text-[8px] font-black tracking-wider uppercase text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded-full border border-blue-100 mt-1 transition-transform group-hover:scale-105">Level 0{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex justify-center mt-6 mb-16 ${revealClass}`}>
          <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md border border-blue-200/90 shadow-sm rounded-full px-4 py-2 hover:scale-105 transition-transform duration-300">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2.5} />
            <span className="text-xs font-bold text-slate-700">Complete Each Milestone To Unlock Your Reward</span>
          </div>
        </div>

        {/* PERKS strip */}
        <div className={`bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-md border border-white/90 rounded-3xl shadow-[0_15px_40px_rgba(37,99,235,0.12)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden mb-12 ${revealClass}`}>
          {PERKS.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-2 px-4 py-6 group hover:bg-blue-50/40 transition-all duration-300">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-115 group-hover:rotate-12 transition-transform duration-300`}>
                <p.Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-wide">{p.title}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className={`relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl px-6 py-7 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl shadow-slate-900/40 group/cta ${revealClass}`} style={{ transitionDelay: '200ms' }}>
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/20 rounded-full blur-[70px] pointer-events-none animate-pulse" style={{ animationDuration: '3.5s' }}></div>
          <div className="relative flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 animate-float">
              <Trophy className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-white font-black text-base sm:text-lg uppercase tracking-wide">Your Success, Your Reward!</p>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">The more you achieve, the more you earn.</p>
            </div>
          </div>
          <span className="relative shrink-0">
            <span className="absolute -inset-1.5 rounded-full bg-blue-500/40 blur-md animate-pulse pointer-events-none" style={{ animationDuration: '2s' }}></span>
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm uppercase tracking-wide px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative">Start Your Journey</span>
              <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </span>
        </div>

      </div>
    </section>
  );
}
