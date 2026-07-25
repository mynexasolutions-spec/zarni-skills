import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Star, PlayCircle, Trophy, ChevronLeft, ChevronRight, Play, Quote, X, Sparkles, MessageCircle } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import useInView from '../../hooks/useInView';
import api from '../../utils/api';

const DEFAULT_STORIES = [
  {
    name: 'Suriya Yadav',
    role: 'Freelancer',
    headline: 'From Beginner to Freelancer',
    duration: '1:35',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Anjali Sharma',
    role: 'Digital Marketer',
    headline: 'I Built My Career with Zarni Skills',
    duration: '1:28',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Ravi Verma',
    role: 'Graphic Designer',
    headline: 'Earning My First Online Income',
    duration: '1:42',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Pooja Singh',
    role: 'Content Creator',
    headline: 'Skills That Changed My Life',
    duration: '1:33',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Karan Mehta',
    role: 'Video Editor',
    headline: 'From Zero Clients to Fully Booked',
    duration: '1:19',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Neha Kapoor',
    role: 'Social Media Manager',
    headline: 'Replaced My 9-to-5 in 6 Months',
    duration: '1:51',
    img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop',
  },
];

const STATS = [
  {
    target: 10, decimals: 0, suffix: 'K+',
    label: 'Happy Learners',
    sub: 'Growing community of achievers',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <Users className="w-5 h-5 text-blue-600" strokeWidth={2} />,
  },
  {
    target: 4.9, decimals: 1, suffix: '/5',
    label: 'Average Rating',
    sub: 'Trusted by thousands of learners',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    icon: <Star className="w-5 h-5 text-amber-500" fill="currentColor" />,
  },
  {
    target: 500, decimals: 0, suffix: '+',
    label: 'Success Stories',
    sub: 'Real people, real transformations',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: <PlayCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />,
  },
  {
    target: 100, decimals: 0, suffix: '+',
    label: 'Countries',
    sub: 'Global impact, local success',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: <Trophy className="w-5 h-5 text-purple-600" fill="currentColor" fillOpacity={0.15} strokeWidth={2} />,
  },
];

function getCardsPerPage() {
  if (typeof window === 'undefined') return 4;
  const w = window.innerWidth;
  if (w >= 1024) return 4;
  if (w >= 768) return 3;
  if (w >= 640) return 2;
  return 1;
}

export default function SuccessStories() {
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const [STORIES, setStories] = useState(DEFAULT_STORIES);
  const [activeVideo, setActiveVideo] = useState(null);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const [statsRef, statsInView] = useInView(0.3);
  const statValues = [
    useCountUp(STATS[0].target, statsInView, STATS[0].decimals),
    useCountUp(STATS[1].target, statsInView, STATS[1].decimals),
    useCountUp(STATS[2].target, statsInView, STATS[2].decimals),
    useCountUp(STATS[3].target, statsInView, STATS[3].decimals),
  ];

  const totalPages = Math.max(1, Math.ceil(STORIES.length / cardsPerPage));
  const maxPage = totalPages - 1;

  useEffect(() => {
    const onResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('/success-stories');
        const items = response.data.stories || [];
        if (items.length > 0) {
          setStories(items.map((s) => ({
            name: s.name,
            role: s.role,
            headline: s.headline,
            duration: s.duration,
            img: s.image_display_url,
            video: s.video_display_url,
          })));
        }
      } catch (err) {
        console.error('Error fetching success stories', err);
      }
    };
    fetchStories();
  }, []);

  const getCardStep = () => {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return 300;
    const card = track.firstElementChild;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '24');
    return card.getBoundingClientRect().width + gap;
  };

  const goToPage = useCallback((pageIdx) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(pageIdx, maxPage));
    track.scrollTo({ left: clamped * cardsPerPage * getCardStep(), behavior: 'smooth' });
  }, [maxPage, cardsPerPage]);

  // Auto-swipe carousel every 3.5 seconds
  useEffect(() => {
    if (activeVideo) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        const next = prev >= maxPage ? 0 : prev + 1;
        goToPage(next);
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [maxPage, goToPage, activeVideo]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = getCardStep();
        if (step > 0) setCurrentPage(Math.round(track.scrollLeft / (step * cardsPerPage)));
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
  const stopDragging = () => { isDragging.current = false; };
  const onCardClickCapture = (e) => {
    if (dragMoved.current) {
      e.preventDefault();
      dragMoved.current = false;
    }
  };

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40" id="success-stories">

      {/* Top light shimmer sweep bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Dual Rotating Cyber Compass Rings behind header */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full border border-blue-500/20 border-dashed animate-[spin_50s_linear_infinite] pointer-events-none z-0"></div>
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-cyan-400/25 border-dashed animate-[spin_35s_linear_infinite_reverse] pointer-events-none z-0"></div>

      {/* Floating Neon Particles */}
      <span className="absolute top-20 left-[10%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-32 left-[5%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[6%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-float pointer-events-none z-0"></span>

      {/* Diagonal Laser Stream comets */}
      <div className="absolute top-20 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rotate-6 animate-shimmer-sweep pointer-events-none z-0"></div>
      <div className="absolute bottom-28 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -rotate-6 animate-shimmer-sweep pointer-events-none z-0" style={{ animationDelay: '3.5s' }}></div>

      {/* Ambient Blue Background Flares */}
      <div className="absolute -top-10 -left-16 w-[450px] h-[450px] bg-blue-300/20 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-0 -right-16 w-[450px] h-[450px] bg-indigo-300/20 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_4px_20px_rgba(37,99,235,0.15)] select-none mx-auto hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span>OUR COMMUNITY</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-4 uppercase drop-shadow-sm">
            Success Stories <br />
            From{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 animate-gradient-x drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">
              Our Learners
            </span>
          </h2>

          {/* Glowing Underline Bar */}
          <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto mb-5">
            <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
          </div>

          <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
            Real people, real results. Watch how Zarni Skills has helped learners transform their lives and achieve their dreams.
          </p>
        </div>

        {/* Auto-Swiping Video Cards Carousel */}
        <div className="relative group/slider mb-14">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous stories"
            className="absolute left-0 sm:-left-5 top-[38%] -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.2)] border border-slate-200 hidden md:flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft width={22} height={22} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= maxPage}
            aria-label="Next stories"
            className="absolute right-0 sm:-right-5 top-[38%] -translate-y-1/2 z-20 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.2)] border border-slate-200 hidden md:flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight width={22} height={22} strokeWidth={2.5} />
          </button>

          <div
            ref={trackRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {STORIES.map((s) => (
              <div key={s.name} onClickCapture={onCardClickCapture}
                className="group/card shrink-0 snap-start w-[82%] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] flex">
                <div className="relative bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-md rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200/80 overflow-hidden transition-all duration-500 hover:-translate-y-2.5 hover:shadow-[0_25px_60px_rgba(37,99,235,0.22)] hover:border-blue-400 flex flex-col justify-between w-full h-full">
                  
                  {/* Top Shimmer Light Sweep Accent */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none z-30"></span>

                  {/* Top Accent Gradient Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-30"></div>

                  {/* Video Thumbnail */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 shrink-0">
                    {s.img ? (
                      <img src={s.img} alt={s.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-300 text-4xl font-black">{s.name?.[0] || '?'}</div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/25 group-hover/card:bg-slate-950/45 transition-colors duration-500"></div>
                    
                    {/* Glowing Double Pulsing Radar Play Button */}
                    <button
                      aria-label={`Play ${s.name}'s story`}
                      onClick={() => s.video && setActiveVideo(s)}
                      className={`absolute inset-0 flex items-center justify-center z-20 ${s.video ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute -inset-3 rounded-full bg-blue-500/40 animate-ping"></span>
                        <span className="absolute -inset-1 rounded-full bg-cyan-400/30 blur-md animate-pulse"></span>
                        <span className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-300 group-hover/card:scale-115 group-hover/card:rotate-6 text-white border border-white/30">
                          <Play width={22} height={22} fill="white" className="translate-x-0.5" />
                        </span>
                      </div>
                    </button>
                    
                    {/* Live Duration Tag */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md z-20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      <span>{s.duration}</span>
                    </div>

                    {/* Verified Tag on Thumbnail */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-blue-700 text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-blue-200 shadow-sm flex items-center gap-1 z-20">
                      <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                      <span>STORY</span>
                    </div>
                  </div>

                  <div className="p-5 text-left flex flex-col justify-between flex-1 relative z-10 bg-white">
                    <div>
                      <p className="flex items-start gap-1.5 font-heading font-black text-slate-900 text-sm leading-snug mb-2.5 group-hover/card:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                        <Quote className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="currentColor" fillOpacity={0.2} strokeWidth={2} />
                        {s.headline}
                      </p>
                      <p className="text-slate-900 text-xs sm:text-sm font-black uppercase tracking-wide">{s.name}</p>
                      <p className="text-blue-600 text-xs font-black uppercase tracking-wider mb-2.5">{s.role}</p>
                    </div>
                    <div className="flex text-amber-400 gap-1 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.2)] pt-1 transition-transform duration-300 group-hover/card:scale-105 origin-left">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} width={14} height={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  aria-label={`Go to page ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${idx === currentPage ? 'w-8 h-2.5 bg-blue-600 shadow-md shadow-blue-500/40' : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Strip */}
        <div ref={statsRef} className="bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-md border border-white/90 rounded-3xl shadow-[0_15px_40px_rgba(37,99,235,0.12)] px-6 sm:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 md:divide-x md:divide-slate-200/70">
          {STATS.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 md:pl-6 md:first:pl-0 group">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12`}>
                {stat.icon}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none mb-1">{statValues[idx]}{stat.suffix}</p>
                <p className={`text-xs font-bold ${stat.color}`}>{stat.label}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-snug mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {activeVideo && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
              className="absolute -top-11 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <video src={activeVideo.video} controls autoPlay className="w-full rounded-2xl shadow-2xl bg-black" />
            <p className="text-white text-center mt-3 text-sm font-bold">{activeVideo.name} — {activeVideo.headline}</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
