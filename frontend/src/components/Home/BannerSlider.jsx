import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const AUTOPLAY_DELAY = 4000;

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1); // 1 is the first real slide
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const currentIndexRef = useRef(1);

  useEffect(() => {
    let mounted = true;
    api.get('/banners')
      .then(res => { if (mounted) setBanners(res.data.banners || []); })
      .catch(err => console.error('Error fetching banners', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const totalPages = banners.length;

  // Prepend last banner and append first banner for symmetric 3-way circular peeking
  const displaySlides = totalPages > 1 
    ? [banners[totalPages - 1], ...banners, banners[0]] 
    : banners;

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Initial scroll to index 1 (the first real slide)
  useEffect(() => {
    if (banners.length > 1) {
      const timer = setTimeout(() => {
        scrollToIndex(1, true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [banners.length]);

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

  const scrollToIndex = (index, instant = false) => {
    const track = trackRef.current;
    const slide = track?.children[index];
    if (!track || !slide) return;
    const target = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    track.scrollTo({ left: target, behavior: instant ? 'auto' : 'smooth' });
  };

  const handleNext = useCallback(() => {
    if (totalPages <= 1) return;
    const nextIdx = currentIndexRef.current + 1;
    scrollToIndex(nextIdx);
    
    // If scrolling into the appended clone (index totalPages + 1)
    if (nextIdx === totalPages + 1) {
      setTimeout(() => {
        scrollToIndex(1, true);
        setCurrentIndex(1);
      }, 500);
    }
  }, [totalPages]);

  const handlePrev = useCallback(() => {
    if (totalPages <= 1) return;
    const prevIdx = currentIndexRef.current - 1;
    scrollToIndex(prevIdx);
    
    // If scrolling into the prepended clone (index 0)
    if (prevIdx === 0) {
      setTimeout(() => {
        scrollToIndex(totalPages, true);
        setCurrentIndex(totalPages);
      }, 500);
    }
  }, [totalPages]);

  // Sync scroll position with index
  useEffect(() => {
    const track = trackRef.current;
    if (!track || totalPages <= 1) return;
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const viewportCenter = track.scrollLeft + track.clientWidth / 2;
        let closestIdx = 1;
        let closestDist = Infinity;
        Array.from(track.children).forEach((child, idx) => {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const dist = Math.abs(childCenter - viewportCenter);
          if (dist < closestDist) { closestDist = dist; closestIdx = idx; }
        });
        setCurrentIndex(closestIdx);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [totalPages]);

  // Autoplay
  useEffect(() => {
    if (isPaused || !inView || totalPages <= 1) return;
    const id = setInterval(handleNext, AUTOPLAY_DELAY);
    return () => clearInterval(id);
  }, [isPaused, inView, totalPages, handleNext]);

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

  if (loading || banners.length === 0) return null;

  // Real slide index for pagination dots (0 to totalPages - 1)
  const activeRealSlide = totalPages > 1 
    ? (currentIndex === 0 ? totalPages - 1 : (currentIndex === totalPages + 1 ? 0 : currentIndex - 1))
    : 0;

  return (
    <section ref={sectionRef} className="py-10 sm:py-16 relative overflow-hidden" id="banner-slider">
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>
      <div className="max-w-[1440px] mx-auto px-2 sm:px-6 relative z-10">
        <div
          className="relative group/slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous banner"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-200/80 flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 shadow-blue-500/20"
              >
                <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next banner"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-200/80 flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 shadow-blue-500/20"
              >
                <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
              </button>
            </>
          )}

          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-8 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-[6%] sm:px-[10%] py-6"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {displaySlides.map((b, idx) => {
              const isCenter = idx === currentIndex;
              return (
                <div 
                  key={`${b.id}-${idx}`} 
                  className={`shrink-0 snap-center w-[88%] sm:w-[84%] lg:w-[82%] transition-all duration-500 ease-out ${
                    isCenter 
                      ? 'opacity-100 scale-100 z-20 shadow-[0_30px_70px_rgba(37,99,235,0.25)] ring-4 ring-blue-500/25 rounded-2xl sm:rounded-[2rem]' 
                      : 'opacity-45 scale-[0.91] grayscale-[15%] hover:opacity-75 blur-[0.4px] hover:blur-none rounded-2xl sm:rounded-[2rem]'
                  }`}
                >
                  <div className="aspect-[16/9] max-h-[820px] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-slate-900 border border-white/60">
                    <img
                      src={b.image_display_url}
                      alt="Promotional banner"
                      draggable="false"
                      className="w-full h-full object-contain transition-transform duration-700 hover:scale-[1.02]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2.5 mt-5">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    scrollToIndex(idx + 1);
                    setCurrentIndex(idx + 1);
                  }}
                  aria-label={`Go to banner ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    idx === activeRealSlide 
                      ? 'w-8 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/40' 
                      : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
