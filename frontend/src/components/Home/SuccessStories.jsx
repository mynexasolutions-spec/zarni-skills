import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Users, Star, PlayCircle, MapPin, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const STORIES = [
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
    value: '10K+',
    label: 'Happy Learners',
    sub: 'Growing community of achievers',
    color: 'text-primary',
    bg: 'bg-primary/10',
    icon: <Users className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: '4.9/5',
    label: 'Average Rating',
    sub: 'Trusted by thousands of learners',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    icon: <Star className="w-5 h-5" fill="currentColor" />,
  },
  {
    value: '500+',
    label: 'Success Stories',
    sub: 'Real people, real transformations',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: <PlayCircle className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: '100+',
    label: 'Countries',
    sub: 'Global impact, local success',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    icon: <MapPin className="w-5 h-5" strokeWidth={2} />,
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
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const totalPages = Math.max(1, Math.ceil(STORIES.length / cardsPerPage));
  const maxPage = totalPages - 1;

  useEffect(() => {
    const onResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
    <section className="py-24 relative overflow-hidden bg-slate-50" id="success-stories">

      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <Users className="w-3.5 h-3.5" strokeWidth={2.5} />
            Our Community
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Success Stories<br />
            From <span className="relative inline-block text-primary">
              Our Learners
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-primary"></span>
            </span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Real people, real results. Watch how Zarni Skills has helped learners transform their lives and achieve their dreams.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative group/slider mb-10">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous stories"
            className="absolute left-0 sm:-left-5 top-[38%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-slate-100 hidden md:flex items-center justify-center text-slate-700 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft width={20} height={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= maxPage}
            aria-label="Next stories"
            className="absolute right-0 sm:-right-5 top-[38%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-slate-100 hidden md:flex items-center justify-center text-slate-700 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight width={20} height={20} strokeWidth={2.5} />
          </button>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {STORIES.map((s) => (
              <div key={s.name} onClickCapture={onCardClickCapture}
                className="group/card shrink-0 snap-start w-[78%] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
                <div className="bg-white rounded-2xl shadow-[0_10px_30px_-12px_rgba(30,41,110,0.15)] border border-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-15px_rgba(43,128,240,0.25)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={s.img} alt={s.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" />
                    <div className="absolute inset-0 bg-slate-900/25 group-hover/card:bg-slate-900/35 transition-colors duration-300"></div>
                    <button aria-label={`Play ${s.name}'s story`} className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/card:scale-110">
                        <Play width={18} height={18} fill="#2b80f0" className="translate-x-0.5" />
                      </span>
                    </button>
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{s.duration}</span>
                  </div>
                  <div className="p-4">
                    <p className="flex items-start gap-1.5 font-heading font-black text-slate-900 text-[15px] leading-snug mb-2">
                      <span className="text-primary text-lg leading-none shrink-0">&ldquo;</span>
                      {s.headline}
                    </p>
                    <p className="text-slate-800 text-xs font-bold">{s.name}</p>
                    <p className="text-primary text-xs font-bold mb-2">{s.role}</p>
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} width={13} height={13} fill="currentColor" />
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
                  className={`rounded-full transition-all duration-300 ${idx === currentPage ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className="bg-white/70 backdrop-blur-md border border-white rounded-[1.75rem] shadow-[0_15px_40px_-20px_rgba(30,41,110,0.15)] px-6 sm:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 md:divide-x md:divide-slate-200/70">
          {STATS.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 md:pl-6 md:first:pl-0">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
                <p className={`text-xs font-bold ${stat.color} mt-1`}>{stat.label}</p>
                <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
