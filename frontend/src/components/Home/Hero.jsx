import React, { useState, useEffect } from 'react';
import { Globe, Users, BookOpen, Star, Code2, TrendingUp } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import api from '../../utils/api';

// Fallback slides, used until the admin uploads their own via
// Admin → Home Customization → Hero Section. Each background image already
// bakes in the wave shape, world-map graphic and photo — only a blank zone
// on the left is reserved for the text overlay.
const DEFAULT_SLIDES = [
  {
    image: '/static/img/hero3.jpg',
    heading: (
      <>Skills Transform<br /><span className="text-primary">Into Real Success.</span></>
    ),
    paragraph: (
      <>At <strong className="text-primary font-extrabold">Zarni Skills</strong>, we empower you with high-demand skills, smart strategies, and real opportunities through affiliate marketing and sales. Learn, grow, and build a successful online career with us.</>
    ),
  },
  {
    image: '/static/img/hero2.jpg',
    heading: (
      <><span className="text-primary">Zarni Skills</span> Leads To A<br />Self-Reliant Future.</>
    ),
    paragraph: (
      <>At <strong className="text-primary font-extrabold">Zarni Skills</strong>, we empower you with in-demand skills, practical training, and real-world strategies through affiliate marketing and sales. Learn, earn, grow, and build a self-reliant future with limitless opportunities.</>
    ),
  },
  {
    image: '/static/img/hero1.jpg',
    heading: (
      <>Turn Your Skills Into<br /><span className="text-primary">Real, Lasting Income.</span></>
    ),
    paragraph: (
      <>At <strong className="text-primary font-extrabold">Zarni Skills</strong>, we equip you with practical courses, proven strategies, and genuine opportunities to earn through affiliate marketing and sales. Learn, connect, and grow your career on your own terms.</>
    ),
  },
];

export default function Hero() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Hero is always above the fold, so these count up immediately on mount
  // rather than waiting for a scroll-into-view trigger.
  const students = useCountUp(10, true, 0);
  const courses = useCountUp(500, true, 0);
  const rating = useCountUp(4.9, true, 1);
  const countries = useCountUp(100, true, 0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get('/hero-slides');
        const uploaded = response.data.slides || [];
        if (uploaded.length > 0) {
          setSlides(uploaded.map((s) => ({
            image: s.image_display_url,
            heading: (s.heading_line1 || s.heading_line2) ? (
              <>{s.heading_line1}{s.heading_line1 && s.heading_line2 && <br />}<span className="text-primary">{s.heading_line2}</span></>
            ) : null,
            paragraph: s.paragraph || null,
          })));
          setActive(0);
        }
      } catch (err) {
        console.error('Error fetching hero slides', err);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[active] || slides[0];

  return (
    <section
      id="hero-section"
      className="relative -mt-24 pt-16 sm:pt-0 bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Taller box on mobile (image letterboxed via object-contain, so nothing is
          cropped) to leave room for the overlaid text; true 16:9 from sm upward. */}
      <div className="relative block w-full overflow-hidden bg-white aspect-[4/3] sm:aspect-[16/9]" style={{ maxHeight: 920 }}>
        {slides.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt="Zarni Skills Banner"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${i === active ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}

        {/* Floating icon badges over the photo */}
        <div className="absolute top-[24%] left-[58%] sm:left-[50%] lg:left-[52%] z-20 bg-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 p-2 sm:p-3 animate-float">
          <Code2 className="w-4 h-4 sm:w-6 sm:h-6 text-primary" strokeWidth={2.5} />
        </div>
        <div className="absolute top-[42%] left-[53%] sm:left-[44%] lg:left-[46%] z-20 bg-white rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/20 p-2 sm:p-3 animate-float" style={{ animationDelay: '1.2s' }}>
          <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" strokeWidth={2.5} />
        </div>

        <div className="absolute inset-0 flex items-center py-4 -mt-6 sm:mt-0 sm:-mt-10 lg:-mt-14">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-10">
            <div key={active} className="max-w-[58%] sm:max-w-[48%] lg:max-w-[45%] xl:max-w-[42%] animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/85 backdrop-blur-sm border border-primary/15 shadow-sm shadow-primary/10 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full mb-2.5 sm:mb-5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
                </span>
                <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 shrink-0" strokeWidth={2} />
                <span className="text-[10px] sm:text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">India's #1 EdTech Ecosystem</span>
              </div>

              <h1 className="font-heading font-black text-[1.35rem] sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.75rem] text-slate-900 leading-[1.2] tracking-tight">
                {slide.heading}
              </h1>
              <span className="block w-24 sm:w-36 lg:w-44 h-1 rounded-full bg-gradient-to-r from-emerald-500 via-orange-500 to-blue-500 mt-2.5 sm:mt-4"></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ULTRA-SEXY FLOATING STATS CARD STRIP ───────────────────────────────────────── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:-mt-12 pb-8">
        <div className="relative bg-white/95 backdrop-blur-2xl border border-blue-100/90 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(37,99,235,0.12)] overflow-hidden">
          {/* Top shimmer sweep line */}
          <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-shimmer-sweep pointer-events-none"></span>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">

            {/* Active Students */}
            <div className="group relative bg-gradient-to-br from-blue-50/80 via-white to-blue-100/40 border border-blue-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-400 flex items-center gap-3 sm:gap-4 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-blue-500/50 animate-pulse-ring"></span>
                <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 animate-gradient-x">
                  {students}K+
                </p>
                <p className="text-[10px] sm:text-xs text-blue-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Active Students
                </p>
              </div>
            </div>

            {/* Skill Courses */}
            <div className="group relative bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/40 border border-indigo-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/15 hover:border-indigo-400 flex items-center gap-3 sm:gap-4 overflow-hidden animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-indigo-500/50 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></span>
                <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-700 animate-gradient-x">
                  {courses}+
                </p>
                <p className="text-[10px] sm:text-xs text-indigo-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Skill Courses
                </p>
              </div>
            </div>

            {/* Avg Rating */}
            <div className="group relative bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 border border-amber-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/15 hover:border-amber-400 flex items-center gap-3 sm:gap-4 overflow-hidden animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-amber-500/50 animate-pulse-ring" style={{ animationDelay: '1s' }}></span>
                <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 animate-gradient-x">
                  {rating}★
                </p>
                <p className="text-[10px] sm:text-xs text-amber-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Avg Rating
                </p>
              </div>
            </div>

            {/* Global Reach */}
            <div className="group relative bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/40 border border-emerald-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/15 hover:border-emerald-400 flex items-center gap-3 sm:gap-4 overflow-hidden animate-fade-in-up" style={{ animationDelay: '360ms' }}>
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-emerald-500/50 animate-pulse-ring" style={{ animationDelay: '1.5s' }}></span>
                <div className="relative w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Globe className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 animate-gradient-x">
                  {countries}+
                </p>
                <p className="text-[10px] sm:text-xs text-emerald-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Global Reach
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
