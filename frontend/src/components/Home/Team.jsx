import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, BadgeCheck, Star, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import useInView from '../../hooks/useInView';
import api from '../../utils/api';

const FALLBACK_IMG = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";

const STATS = [
  { target: 50, decimals: 0, suffix: '+', label: "Expert Mentors", sub: "Industry leaders & professionals", color: "#3b82f6", Icon: Users },
  { target: 10, decimals: 0, suffix: 'K+', label: "Students Guided", sub: "Towards their dream careers", color: "#f59e0b", Icon: GraduationCap },
  { target: 95, decimals: 0, suffix: '%', label: "Success Rate", sub: "Students achieve their goals", color: "#10b981", Icon: BadgeCheck },
  { target: 4.8, decimals: 1, suffix: '/5', label: "Learner Rating", sub: "Trusted by thousands", color: "#f59e0b", Icon: Star },
];

function getCardsPerPage() {
  if (typeof window === 'undefined') return 5;
  const w = window.innerWidth;
  if (w >= 1280) return 5;
  if (w >= 1024) return 4;
  if (w >= 768) return 3;
  return 2; // 2 cards per view on mobile
}

export default function Team({ showStats = true }) {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/home-team');
        setTeam(response.data.team_members || []);
      } catch (err) {
        console.error('Error fetching team members', err);
      }
    };
    fetchTeam();
  }, []);

  const [statsRef, statsInView] = useInView(0.3);
  const statValues = [
    useCountUp(STATS[0].target, statsInView, STATS[0].decimals),
    useCountUp(STATS[1].target, statsInView, STATS[1].decimals),
    useCountUp(STATS[2].target, statsInView, STATS[2].decimals),
    useCountUp(STATS[3].target, statsInView, STATS[3].decimals),
  ];

  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const cardStepRef = useRef(280);

  const totalPages = Math.max(1, Math.ceil(team.length / cardsPerPage));
  const maxPage = totalPages - 1;

  const measureCardStep = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return;
    const card = track.firstElementChild;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '24');
    cardStepRef.current = card.getBoundingClientRect().width + gap;
  }, []);

  useEffect(() => {
    const onResize = () => {
      setCardsPerPage(getCardsPerPage());
      measureCardStep();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measureCardStep]);

  useEffect(() => {
    measureCardStep();
  }, [cardsPerPage, measureCardStep]);

  const goToPage = useCallback((pageIdx) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(pageIdx, maxPage));
    track.scrollTo({ left: clamped * cardsPerPage * cardStepRef.current, behavior: 'smooth' });
  }, [maxPage, cardsPerPage]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = cardStepRef.current;
        if (step > 0) {
          setCurrentPage(Math.round(track.scrollLeft / (step * cardsPerPage)));
        }
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cardsPerPage]);

  const onMouseDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = track.scrollLeft;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current || !trackRef.current) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) dragMoved.current = true;
    trackRef.current.scrollLeft = startScrollLeft.current - delta;
  };
  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40" id="team">

      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-70" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Top light shimmer sweep bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Dual Rotating Cyber Compass Rings behind header */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full border border-blue-500/20 border-dashed animate-[spin_50s_linear_infinite] pointer-events-none z-0"></div>
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full border border-cyan-400/25 border-dashed animate-[spin_35s_linear_infinite_reverse] pointer-events-none z-0"></div>

      {/* Floating Neon Particles */}
      <span className="absolute top-20 left-[10%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-32 left-[5%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[6%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-float pointer-events-none z-0"></span>

      {/* Diagonal Laser Stream comets */}
      <div className="absolute top-16 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rotate-6 animate-shimmer-sweep pointer-events-none z-0"></div>
      <div className="absolute bottom-24 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -rotate-6 animate-shimmer-sweep pointer-events-none z-0" style={{ animationDelay: '3.5s' }}></div>

      {/* Ambient glows */}
      <div className="absolute -top-10 -left-16 w-[420px] h-[420px] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-0 -right-16 w-[420px] h-[420px] bg-indigo-300/20 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_4px_20px_rgba(37,99,235,0.15)] select-none mx-auto hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span>OUR LEADERSHIP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-4 uppercase drop-shadow-sm">
            Meet Our Expert{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 animate-gradient-x drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">
              Team
            </span>
          </h2>
          {/* Glowing Underline Bar */}
          <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto mb-5">
            <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
            Connect with industry visionaries and expert mentors dedicated to accelerating your growth.
          </p>
        </div>
      </div>

      {/* Team Cards Slider */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 group/slider z-10">

        {/* Navigation Arrows (Desktop) */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 0}
          aria-label="Previous team members"
          className="absolute left-2 top-[38%] -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.2)] border border-slate-200 hidden md:flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 active:scale-100 -translate-x-1/2 disabled:opacity-0 disabled:pointer-events-none disabled:scale-90"
        >
          <ChevronLeft width={22} height={22} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= maxPage}
          aria-label="Next team members"
          className="absolute right-2 top-[38%] -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.2)] border border-slate-200 hidden md:flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 active:scale-100 translate-x-1/2 disabled:opacity-0 disabled:pointer-events-none disabled:scale-90"
        >
          <ChevronRight width={22} height={22} strokeWidth={2.5} />
        </button>

        <div
          ref={trackRef}
          className="grid grid-cols-2 md:flex gap-3 sm:gap-6 pb-4 px-1 -mx-1 md:overflow-x-auto md:snap-x md:snap-mandatory cursor-grab active:cursor-grabbing select-none no-scrollbar"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
        >
          {team.map((m) => (
            <Link
              key={m.id}
              to={`/team/${m.slug || m.id}`}
              draggable={false}
              onClick={(e) => { if (dragMoved.current) e.preventDefault(); }}
              className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-blue-300 hover:shadow-[0_16px_36px_rgba(37,99,235,0.14)] hover:-translate-y-1.5 transition-all duration-300 w-full md:shrink-0 md:snap-start md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]"
            >
              {/* Photo block */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src={m.image_display_url || FALLBACK_IMG}
                  alt={m.name}
                  draggable={false}
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />

                {m.badge && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md" style={{ backgroundColor: m.color || '#2563eb' }}>
                    {m.badge}
                  </div>
                )}
              </div>

              {/* Info block */}
              <div className="bg-white flex flex-col flex-1 p-3.5 sm:p-5 pt-3 sm:pt-4 gap-0.5 sm:gap-1 text-left">
                <h3 className="text-xs sm:text-base font-heading font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase truncate">{m.name}</h3>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate" style={{ color: m.color || '#2563eb' }}>{m.designation}</p>
                <div className="w-6 sm:w-8 h-[2px] rounded-full my-1.5 sm:my-2 transition-all duration-300 group-hover:w-14" style={{ backgroundColor: m.color || '#2563eb' }}></div>
                <p className="text-slate-500 text-[10px] sm:text-xs font-medium leading-snug sm:leading-relaxed flex-1 line-clamp-2 sm:line-clamp-none">{m.bio}</p>
              </div>

            </Link>
          ))}
          {team.length === 0 && (
            <div className="w-full text-center py-12 text-slate-400 font-medium">Loading team...</div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Stats Bar */}
        {showStats && (
          <div ref={statsRef} className="mt-14 sm:mt-18 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-md border border-white/90 rounded-3xl shadow-[0_15px_40px_rgba(37,99,235,0.12)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden">
            {STATS.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-6 group hover:bg-blue-50/40 transition-colors duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12" style={{ backgroundColor: `${s.color}1a` }}>
                  <s.Icon className="w-6 h-6" stroke={s.color} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none mb-1">{statValues[idx]}{s.suffix}</div>
                  <div className="text-[12px] font-bold leading-tight" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
