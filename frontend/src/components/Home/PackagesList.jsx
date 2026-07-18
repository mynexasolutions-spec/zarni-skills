import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, ChevronRight, Star, Image, Check, ArrowRight } from 'lucide-react';

function getCardsPerPage() {
  if (typeof window === 'undefined') return 3;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 768) return 2;
  return 1;
}

export default function PackagesList({ packages, loading = false }) {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const totalPages = Math.max(1, Math.ceil(packages.length / cardsPerPage));
  const maxPage = totalPages - 1;

  useEffect(() => {
    const onResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getCardStep = () => {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return 380;
    const card = track.firstElementChild;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '28');
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
    <section className="py-24 relative overflow-hidden bg-slate-50" id="packages">
      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-black text-primary uppercase tracking-widest mb-5">
            <Package className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            Premium Bundles
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight">
            <span className="block text-primary">Explore Our</span>
            <span className="block text-slate-900">Learning Packages</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed mt-4">
            Structured bundles designed to fast-track your skills and career growth.
          </p>
        </div>

        {loading ? (
          <div className="flex gap-7 overflow-hidden pt-5 pb-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="shrink-0 w-[85%] sm:w-[calc((100%-1.75rem)/2)] lg:w-[calc((100%-3.5rem)/3)]">
                <div className="rounded-[1.75rem] bg-white border-2 border-slate-100 overflow-hidden animate-pulse">
                  <div className="p-4 pt-6">
                    <div className="aspect-[4/3] rounded-2xl bg-slate-200"></div>
                  </div>
                  <div className="px-6 pb-6 space-y-3">
                    <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-2/3 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-1/2 bg-slate-200 rounded-full"></div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl mt-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Packages coming soon.</p>
          </div>
        ) : (
          <div className="relative group/slider">
            {/* Arrows */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous packages"
              className="absolute left-0 sm:-left-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-slate-100 hidden md:flex items-center justify-center text-slate-700 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <ChevronLeft width={20} height={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= maxPage}
              aria-label="Next packages"
              className="absolute right-0 sm:-right-5 top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-slate-100 hidden md:flex items-center justify-center text-slate-700 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <ChevronRight width={20} height={20} strokeWidth={2.5} />
            </button>

            {/* Track */}
            <div
              ref={trackRef}
              className="flex gap-7 pt-5 pb-2 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
            >
              {packages.map((pkg, idx) => {
                const isPopular = idx === 1;
                let features = pkg.what_you_get
                  ? pkg.what_you_get.split('\n').filter(item => item.trim()).slice(0, 5)
                  : (pkg.courses || []).slice(0, 5).map(c => c.title);
                const isCourseFallback = !pkg.what_you_get && pkg.courses;

                return (
                  <div key={pkg.id} onClickCapture={onCardClickCapture}
                    className="group shrink-0 snap-start w-[85%] sm:w-[calc((100%-1.75rem)/2)] lg:w-[calc((100%-3.5rem)/3)]">
                    <div className={`relative flex flex-col h-full bg-white rounded-[1.75rem] overflow-visible border-2 ${
                      isPopular ? 'border-primary shadow-[0_20px_50px_-15px_rgba(43,128,240,0.3)]' : 'border-slate-100 shadow-sm'
                    } hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-15px_rgba(43,128,240,0.22)] transition-all duration-500`}>

                      {isPopular && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-primary to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5 whitespace-nowrap">
                          <Star className="w-3 h-3" fill="currentColor" />
                          Best Seller
                        </span>
                      )}

                      {/* Display panel — real package artwork, not hardcoded */}
                      <div className="p-4 pt-6">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 flex items-center justify-center relative">
                          {pkg.thumbnail_display_url ? (
                            <img
                              src={pkg.thumbnail_display_url}
                              alt={pkg.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <Image className="w-16 h-16 text-white/25" strokeWidth={1.5} />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 px-6 pb-6">
                        <div className="inline-flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2.5">
                          <Package className="w-2.5 h-2.5 shrink-0" strokeWidth={2.5} />
                          Bundle Package
                        </div>

                        <h4 className="text-lg font-black text-slate-900 uppercase leading-snug group-hover:text-primary transition-colors duration-300">
                          {pkg.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-1 mb-4">
                          {idx === 0 ? 'Kickstart your learning journey' : idx === 1 ? 'Advance your career skills' : 'Master in-demand high income skills'}
                        </p>

                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className={`text-2xl font-black ${isPopular ? 'text-primary' : 'text-slate-900'}`}>₹{Number(pkg.price).toLocaleString()}</span>
                          <span className="text-xs text-slate-400 line-through">₹{Number(pkg.price * 2).toLocaleString()}</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mb-5 inline-block w-fit">SAVE 50% TODAY</span>

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What you get</p>
                        <ul className="space-y-2 flex-1 mb-6">
                          {features.map((item, fidx) => (
                            <li key={fidx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium py-0.5">
                              <div className={`w-4 h-4 rounded-full ${isPopular ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300`}>
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              </div>
                              <span>{isCourseFallback ? item : item.replace('✓', '').trim()}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => navigate('/register')}
                          className={`group/btn relative w-full py-3.5 px-6 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 text-center transition-all duration-300 hover:-translate-y-0.5 uppercase tracking-widest overflow-hidden ${
                            isPopular ? 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40' : 'bg-white border-2 border-slate-200 hover:border-primary text-slate-700 hover:text-primary'
                          }`}
                        >
                          {isPopular && (
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                          )}
                          Choose Package
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
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
        )}

        <div className="text-center mt-10">
          <button onClick={() => navigate('/packages')}
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors border border-primary/20 hover:border-primary/40 hover:bg-primary/5 px-5 py-2.5 rounded-xl">
            View All Packages
            <ArrowRight width={15} height={15} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
