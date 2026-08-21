import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift, TrendingUp, Trophy, Medal, Target, Sparkles, ArrowRight,
} from 'lucide-react';
import useInView from '../../hooks/useInView';
import api from '../../utils/api';

// The admin authors every string in this section; these just cycle decorative
// icons and gradients so a list of any length still renders consistently.
const INTRO_ICONS = [Medal, TrendingUp, Trophy, Gift];
const PERK_ICONS = [Medal, Target, Gift, TrendingUp];
const ACCENTS = [
  'from-blue-600 to-indigo-600',
  'from-indigo-600 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

export default function AchievementRewards() {
  const [sectionRef, inView] = useInView(0.15);
  const canvasRef = useRef(null);
  const confettiFired = useRef(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/achievement-rewards')
      .then((res) => { if (mounted) setContent(res.data.content || {}); })
      .catch((err) => console.error('Error fetching achievement rewards', err));
    return () => { mounted = false; };
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

  // Wait for content rather than flashing an empty shell, and let the admin
  // switch the whole section off.
  if (!content || content.is_active === false) return null;

  const introFeatures = content.intro_features || [];
  const perks = content.perks || [];
  const perkCols = perks.length === 3 ? 'md:grid-cols-3' : perks.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-4';

  return (
    <section ref={sectionRef} className="relative py-10 sm:py-32 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40" id="achievement-rewards">

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

        {/* TOP: heading copy (this section is text-only — no imagery) */}
        <div className="mb-8 sm:mb-20">

          {/* LEFT: copy */}
          <div className={`text-center ${revealClass}`}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 shadow-[0_4px_20px_rgba(37,99,235,0.15)] text-xs font-bold text-blue-600 uppercase tracking-widest mb-5 select-none mx-auto hover:scale-105 transition-transform duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>{content.badge_text}</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-6xl uppercase tracking-tight leading-[0.95] mb-5">
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">{content.heading_line1}</span>
              <span className="block text-slate-900 drop-shadow-sm">{content.heading_line2}</span>
            </h2>

            {/* Glowing Underline Bar */}
            <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto mb-6">
              <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
            </div>

            <div className="group/ribbon relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-xl -rotate-1 shadow-lg shadow-slate-900/30 mb-6 overflow-hidden hover:scale-105 hover:rotate-0 transition-all duration-300">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/ribbon:translate-x-full transition-transform duration-1000"></span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 relative animate-pulse" strokeWidth={2.5} />
              <span className="relative">{content.ribbon_text}</span>
            </div>

            <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-xl mx-auto mb-8 leading-relaxed">
              {content.description}{' '}
              <span className="text-blue-600 font-black">{content.description_highlight}</span>
            </p>

            {introFeatures.length > 0 && (
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {introFeatures.map((f, idx) => {
                  const Icon = INTRO_ICONS[idx % INTRO_ICONS.length];
                  return (
                    <div key={idx} className={`text-center group transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${150 + idx * 120}ms` }}>
                      <div className={`w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${ACCENTS[idx % ACCENTS.length]} text-white flex items-center justify-center shadow-md shadow-blue-500/25 mb-2 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-wide group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* PERKS strip */}
        {perks.length > 0 && (
          <div className={`bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-md border border-white/90 rounded-3xl shadow-[0_15px_40px_rgba(37,99,235,0.12)] grid grid-cols-2 ${perkCols} divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden mb-6 sm:mb-12 ${revealClass}`}>
            {perks.map((p, idx) => {
              const Icon = PERK_ICONS[idx % PERK_ICONS.length];
              return (
                <div key={idx} className="flex flex-col items-center text-center gap-2 px-3 py-4 sm:px-4 sm:py-6 group hover:bg-blue-50/40 transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ACCENTS[idx % ACCENTS.length]} text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-115 group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-wide">{p.title}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{p.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA bar */}
        <div className={`relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl px-5 py-5 sm:px-10 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-5 shadow-2xl shadow-slate-900/40 group/cta ${revealClass}`} style={{ transitionDelay: '200ms' }}>
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/20 rounded-full blur-[70px] pointer-events-none animate-pulse" style={{ animationDuration: '3.5s' }}></div>
          <div className="relative flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 animate-float">
              <Trophy className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-white font-black text-base sm:text-lg uppercase tracking-wide">{content.cta_title}</p>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">{content.cta_subtitle}</p>
            </div>
          </div>
          <span className="relative shrink-0">
            <span className="absolute -inset-1.5 rounded-full bg-blue-500/40 blur-md animate-pulse pointer-events-none" style={{ animationDuration: '2s' }}></span>
            <Link
              to={content.cta_button_link || '/register'}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm uppercase tracking-wide px-7 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative">{content.cta_button_text}</span>
              <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </span>
        </div>

      </div>
    </section>
  );
}
