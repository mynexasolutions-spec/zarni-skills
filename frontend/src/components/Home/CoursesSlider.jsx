import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BadgeCheck, Star, Clock, ArrowRight } from 'lucide-react';

function stripAndTruncate(html, max = 80) {
  if (!html) return 'Master industry-relevant skills with practical hands-on projects.';
  const text = html.replace(/<[^>]*>/g, '');
  return text.length > max ? text.slice(0, max) + '...' : text;
}

const AUTOPLAY_DELAY = 3500;

function getCardsPerPage() {
  if (typeof window === 'undefined') return 4;
  const w = window.innerWidth;
  if (w >= 1024) return 4;
  if (w >= 768) return 3;
  if (w >= 640) return 2;
  return 1;
}

export default function CoursesSlider({ courses, loading = false }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const currentPageRef = useRef(0);
  const cardStepRef = useRef(304);

  const displayCourses = courses.slice(0, 10);
  const totalPages = Math.max(1, Math.ceil(displayCourses.length / cardsPerPage));
  const maxPage = totalPages - 1;

  // Measure card width + gap once (not on every scroll event) — recompute only
  // when layout-affecting things change: viewport resize, columns-per-page, or data arriving.
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
  }, [cardsPerPage, displayCourses.length, measureCardStep]);

  // Only run autoplay / scroll-driven work while the slider is actually visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Shows exactly `cardsPerPage` cards at a time; wraps around at both ends
  // so the slider always cycles back to the start once it reaches the end.
  const goToPage = useCallback((pageIdx, instant = false) => {
    const track = trackRef.current;
    if (!track) return;
    const wrapped = ((pageIdx % totalPages) + totalPages) % totalPages;
    track.scrollTo({ left: wrapped * cardsPerPage * cardStepRef.current, behavior: instant ? 'auto' : 'smooth' });
  }, [totalPages, cardsPerPage]);

  // Keep currentPage in sync with native scroll position (snap, touch, wheel, drag)
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

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Autoplay — advances one page (of `cardsPerPage` cards) at a time,
  // loops back to the first page once it reaches the last, pauses on hover/drag/off-screen
  useEffect(() => {
    if (isPaused || !inView || maxPage <= 0) return;
    const id = setInterval(() => {
      const atEnd = currentPageRef.current >= maxPage;
      goToPage(atEnd ? 0 : currentPageRef.current + 1, atEnd);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(id);
  }, [isPaused, inView, maxPage, goToPage]);

  // Desktop mouse drag-to-scroll (native touch scrolling handles mobile)
  const onMouseDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = track.scrollLeft;
    setIsPaused(true);
  };
  const onMouseMove = (e) => {
    if (!isDragging.current || !trackRef.current) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) dragMoved.current = true;
    trackRef.current.scrollLeft = startScrollLeft.current - delta;
  };
  const stopDragging = () => {
    isDragging.current = false;
    setIsPaused(false);
  };
  const onCardClickCapture = (e) => {
    if (dragMoved.current) {
      e.preventDefault();
      dragMoved.current = false;
    }
  };

  return (
    <section ref={sectionRef} className="py-32 bg-slate-50 relative overflow-hidden" id="courses">
      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm mb-6 mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">Premium Catalog</span>
          </div>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Courses that <span className="relative inline-block bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent">Shape Your Future<span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 opacity-30"></span></span>
          </h3>
          <p className="text-slate-500 mt-4 text-sm sm:text-base max-w-xl mx-auto">
            Learn industry-disruptive practical skills and build your financial future from day one.
          </p>
        </div>
      </div>

      <div
        className="relative max-w-7xl mx-auto px-6 group/slider z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['all', 'creative', 'technical', 'softskills'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-sm ${
                activeCategory === cat
                  ? 'shadow-primary/10 bg-gradient-to-r from-primary to-indigo-600 text-white'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              {cat === 'all' ? 'All Catalog' : cat}
            </button>
          ))}
        </div>

        {/* Navigation Arrows (Desktop) — wrap around so Next always cycles back to the start */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={maxPage <= 0}
          aria-label="Previous courses"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 hidden md:flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:scale-110 hover:shadow-[0_12px_36px_rgba(43,128,240,0.3)] active:scale-100 -translate-x-1/2 disabled:opacity-0 disabled:pointer-events-none disabled:scale-90"
        >
          <ChevronLeft width={26} height={26} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={maxPage <= 0}
          aria-label="Next courses"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 hidden md:flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:scale-110 hover:shadow-[0_12px_36px_rgba(43,128,240,0.3)] active:scale-100 translate-x-1/2 disabled:opacity-0 disabled:pointer-events-none disabled:scale-90"
        >
          <ChevronRight width={26} height={26} strokeWidth={2.5} />
        </button>

        {/* Slider Viewport — native scroll-snap, smooth on touch/trackpad/mouse-drag */}
        <div
          ref={trackRef}
          className="flex gap-6 pb-12 px-4 -mx-4 pt-4 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
            {loading ? (
              Array.from({ length: cardsPerPage }).map((_, idx) => (
                <div key={idx} className="shrink-0 w-full sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
                  <div className="rounded-[2rem] bg-white border border-slate-100 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] w-full bg-slate-200"></div>
                    <div className="px-5 pb-5 pt-4 space-y-3">
                      <div className="h-3 w-16 bg-slate-200 rounded-full"></div>
                      <div className="h-4 w-3/4 bg-slate-200 rounded-full"></div>
                      <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                      <div className="h-3 w-2/3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
            {displayCourses.map((course) => (
              <div key={course.id} className="group/card relative flex flex-col h-full shrink-0 snap-start w-full sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">

                {/* Outer glowing neon border on hover */}
                <div className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover/card:opacity-100 blur-[8px] transition-all duration-500 pointer-events-none z-0"></div>

                <Link
                  to={`/courses/${course.id}`}
                  draggable={false}
                  onClickCapture={onCardClickCapture}
                  className="relative block w-full rounded-[2rem] bg-white border border-slate-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(43,128,240,0.18)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full z-10"
                >
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    <img
                      src={course.thumbnail_display_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=60"}
                      alt={course.title}
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                    />

                    {/* Verified badge */}
                    <div className="absolute top-3.5 left-3.5 bg-white text-primary text-[10px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" strokeWidth={3} />
                      Verified
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="px-5 pb-5 pt-4 flex-grow flex flex-col relative bg-white">
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} width={13} height={13} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-slate-400 font-bold text-[11px]">5.0</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-black text-slate-900 text-lg group-hover/card:text-primary transition-colors duration-300 line-clamp-1 leading-snug tracking-tight mb-1.5">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                      {stripAndTruncate(course.description)}
                    </p>

                    {/* Self-paced / Explore Course row */}
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        {course.course_duration || 'Self-paced'}
                      </span>
                      <span className="text-xs font-bold text-primary group-hover/card:translate-x-1 transition-transform duration-300 flex items-center gap-1">
                        Explore Course
                        <ArrowRight width={13} height={13} strokeWidth={2.5} />
                      </span>
                    </div>

                    {/* Instructor row — only shown when a real instructor is set on the course */}
                    {course.instructor_name && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center gap-2.5">
                        {course.instructor_image_display_url ? (
                          <img
                            src={course.instructor_image_display_url}
                            alt={course.instructor_name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {course.instructor_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{course.instructor_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Instructor</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
            {displayCourses.length === 0 && (
              <div className="text-center py-12 text-slate-400 w-full">
                <p>No courses available right now.</p>
              </div>
            )}
              </>
            )}
        </div>

        {/* Page indicators — one dot per page of cardsPerPage cards */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 -mt-6 mb-4">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const isActive = idx === currentPage;
              return (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  aria-label={`Go to page ${idx + 1}`}
                  className={`relative rounded-full overflow-hidden transition-all duration-300 ${
                    isActive ? 'w-8 h-2 bg-primary/20' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400 hover:scale-125'
                  }`}
                >
                  {isActive && (
                    <span
                      key={`${currentPage}-${isPaused}`}
                      className="absolute inset-0 bg-primary rounded-full animate-dot-progress"
                      style={{
                        animationDuration: `${AUTOPLAY_DELAY}ms`,
                        animationPlayState: isPaused || maxPage <= 0 ? 'paused' : 'running'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
