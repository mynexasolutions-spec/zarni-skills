import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, GraduationCap, Users, BookOpen, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <>Welcome to the Platform Where<br /><span className="text-primary">Skills Transform Into Success.</span></>
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

function HeroCTAs({ navigate }) {
  return (
    <div className="flex flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-5 sm:mt-7 w-full">
      <button
        onClick={() => navigate('/courses')}
        className="group relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-3 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-primary/30 overflow-hidden whitespace-nowrap"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
        <GraduationCap className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        Explore Courses
      </button>
      <button
        onClick={() => navigate('/register')}
        className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-primary/20 text-slate-700 hover:border-primary hover:text-primary hover:bg-primary/5 px-3 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 bg-white/70 backdrop-blur-sm whitespace-nowrap"
      >
        <Users className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        Join Affiliate
      </button>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
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
      className="relative mt-0 sm:-mt-24 pt-1 sm:pt-0 bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Desktop / tablet: fixed-ratio banner with text overlaid on the image's blank zone */}
      <div className="relative hidden sm:block w-full overflow-hidden bg-white" style={{ aspectRatio: '16 / 9', maxHeight: 920 }}>
        {slides.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt="Zarni Skills Banner"
            className={`absolute inset-0 w-full h-full object-contain object-right transition-opacity duration-1000 ease-in-out ${i === active ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}

        <div className="absolute inset-0 flex items-center -mt-8 sm:-mt-10 lg:-mt-14">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">
            <div key={active} className="max-w-[48%] lg:max-w-[45%] xl:max-w-[42%] animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/85 backdrop-blur-sm border border-primary/15 shadow-sm shadow-primary/10 px-3.5 py-1.5 rounded-full mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Globe className="w-3 h-3 text-slate-500 shrink-0" strokeWidth={2} />
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">India's #1 EdTech Ecosystem</span>
              </div>

              <h1 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl xl:text-[2.75rem] text-slate-900 leading-[1.18] tracking-tight">
                {slide.heading}
              </h1>
              <span className="block w-16 h-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 mt-4"></span>
              <p className="text-slate-600 text-sm lg:text-[15px] leading-relaxed mt-4 max-w-[92%]">
                {slide.paragraph}
              </p>

              <HeroCTAs navigate={navigate} />
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-2 mt-8 lg:mt-10">
              {slides.map((s, i) => (
                <button
                  key={s.image}
                  onClick={() => setActive(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-primary' : 'w-1.5 bg-primary/25 hover:bg-primary/40'}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Text & 1-row CTAs on top, Hero image banner placed BELOW */}
      <div className="sm:hidden w-full bg-white pt-4 pb-2">
        <div key={`m-${active}`} className="px-5 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 px-3.5 py-1.5 rounded-full mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">India's #1 EdTech Ecosystem</span>
          </div>

          <h1 className="font-heading font-black text-2xl text-slate-900 leading-[1.2] tracking-tight">
            {slide.heading}
          </h1>

          <span className="block w-14 h-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 mt-3 mx-auto"></span>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-3 max-w-sm mx-auto">
            {slide.paragraph}
          </p>

          {/* 1-Row Mobile Buttons */}
          <div className="w-full mt-4">
            <HeroCTAs navigate={navigate} />
          </div>
        </div>

        {/* Hero image banner placed BELOW the text & buttons */}
        <div className="relative w-full bg-white flex items-center justify-center overflow-hidden mt-6 shadow-sm">
          {slides.map((s, i) => (
            <img
              key={s.image}
              src={s.image}
              alt="Zarni Skills Banner"
              className={`w-full h-auto block object-contain transition-opacity duration-1000 ease-in-out ${i === active ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0'}`}
            />
          ))}
        </div>

        {/* Touch-Friendly Mobile Slide Navigation */}
        <div className="flex items-center justify-center gap-3 mt-4 pb-3">
          <button
            onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm active:scale-95 hover:bg-primary hover:text-white transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.image || i}
                onClick={() => setActive(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-8 bg-gradient-to-r from-primary to-indigo-600 shadow-md shadow-primary/30'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              ></button>
            ))}
          </div>

          <button
            onClick={() => setActive((i) => (i + 1) % slides.length)}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm active:scale-95 hover:bg-primary hover:text-white transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── ULTRA-SEXY FLOATING STATS CARD STRIP ───────────────────────────────────────── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:-mt-12 pb-8">
        <div className="bg-white/95 backdrop-blur-2xl border border-blue-100/90 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(37,99,235,0.12)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            
            {/* Active Students */}
            <div className="group relative bg-gradient-to-br from-blue-50/80 via-white to-blue-100/40 border border-blue-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-400 flex items-center gap-3 sm:gap-4 overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md sm:shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {students}K+
                </p>
                <p className="text-[10px] sm:text-xs text-blue-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Active Students
                </p>
              </div>
            </div>

            {/* Skill Courses */}
            <div className="group relative bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/40 border border-indigo-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/15 hover:border-indigo-400 flex items-center gap-3 sm:gap-4 overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md sm:shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {courses}+
                </p>
                <p className="text-[10px] sm:text-xs text-indigo-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Skill Courses
                </p>
              </div>
            </div>

            {/* Avg Rating */}
            <div className="group relative bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 border border-amber-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/15 hover:border-amber-400 flex items-center gap-3 sm:gap-4 overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md sm:shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {rating}★
                </p>
                <p className="text-[10px] sm:text-xs text-amber-700 font-extrabold uppercase tracking-tight leading-tight whitespace-normal mt-1">
                  Avg Rating
                </p>
              </div>
            </div>

            {/* Global Reach */}
            <div className="group relative bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/40 border border-emerald-200/70 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/15 hover:border-emerald-400 flex items-center gap-3 sm:gap-4 overflow-hidden">
              <span className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform"></span>
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md sm:shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Globe className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
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
