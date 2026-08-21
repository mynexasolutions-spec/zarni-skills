import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, ChevronRight, Star, Image, Check, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function getCardsPerPage() {
  if (typeof window === 'undefined') return 3;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

// Continuous top accent light sweep
function ShimmerBar({ className }) {
  return (
    <div className={`h-1 w-full relative overflow-hidden ${className}`}>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer-sweep"></span>
    </div>
  );
}

export default function PackagesList({ packages, loading = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef(null);

  useEffect(() => () => clearTimeout(programmaticScrollTimeout.current), []);

  const totalPages = Math.max(1, Math.ceil(packages.length / cardsPerPage));
  const maxPage = totalPages - 1;

  useEffect(() => {
    const onResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const goToPage = useCallback((pageIdx) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(pageIdx, maxPage));
    const card = track.children[clamped * cardsPerPage];
    if (!card) return;
    setCurrentPage(clamped);
    isProgrammaticScroll.current = true;
    clearTimeout(programmaticScrollTimeout.current);
    programmaticScrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [maxPage, cardsPerPage]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = null;
    const onScroll = () => {
      if (isProgrammaticScroll.current) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let closestPage = 0;
        let closestDist = Infinity;
        for (let page = 0; page <= maxPage; page++) {
          const child = track.children[page * cardsPerPage];
          if (!child) continue;
          const dist = Math.abs(child.offsetLeft - track.scrollLeft);
          if (dist < closestDist) { closestDist = dist; closestPage = page; }
        }
        setCurrentPage(closestPage);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cardsPerPage, maxPage]);

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
    <section className="py-20 sm:py-28 relative overflow-hidden" id="packages"
      style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, #eef6ff 0%, #d6e9fb 45%, #aed0f2 100%)' }}>

      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-50" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Floating accent particles */}
      <span className="absolute top-10 left-[12%] w-2 h-2 rounded-full bg-blue-500/60 shadow-[0_0_12px_rgba(37,99,235,0.8)] animate-float pointer-events-none z-10"></span>
      <span className="absolute bottom-12 right-[10%] w-2.5 h-2.5 rounded-full bg-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-float-delayed pointer-events-none z-10"></span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200/80 shadow-[0_4px_20px_rgba(37,99,235,0.12)] text-xs font-black text-blue-700 uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <Package className="w-3.5 h-3.5 shrink-0 text-blue-600" strokeWidth={2.5} />
            Premium Bundles
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
            <span className="block text-blue-700 drop-shadow-[0_2px_15px_rgba(37,99,235,0.2)]">Explore Our</span>
            <span className="block text-slate-900 mt-1">Learning Packages</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed mt-4 max-w-xl mx-auto">
            Structured bundles designed to fast-track your skills and career growth.
          </p>

          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-7 overflow-hidden pt-5 pb-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="shrink-0 w-[85%] sm:w-[calc((100%-1.75rem)/2)] lg:w-[calc((100%-3.5rem)/3)]">
                <div className="rounded-[2rem] bg-white border-2 border-slate-100 overflow-hidden animate-pulse">
                  <div className="p-4 pt-6">
                    <div className="aspect-square rounded-2xl bg-slate-200"></div>
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
            {totalPages > 1 && (
              <>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  aria-label="Previous packages"
                  className="absolute left-0 sm:-left-6 top-[42%] -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-200/80 flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-800 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-blue-500/20"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= maxPage}
                  aria-label="Next packages"
                  className="absolute right-0 sm:-right-6 top-[42%] -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-200/80 flex items-center justify-center text-slate-800 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-800 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-blue-500/20"
                >
                  <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Track */}
            <div
              ref={trackRef}
              className="flex gap-7 pt-6 pb-4 overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-1"
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
                    <div className={`relative flex flex-col h-full bg-white/95 backdrop-blur-md rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ${
                      isPopular 
                        ? 'border-blue-600 shadow-[0_25px_60px_-10px_rgba(37,99,235,0.3)] ring-4 ring-blue-500/20 scale-[1.01]' 
                        : 'border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.05)] hover:border-blue-400 hover:shadow-[0_25px_60px_-10px_rgba(37,99,235,0.2)]'
                    } hover:-translate-y-2.5`}>

                      <ShimmerBar className={isPopular ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600' : 'bg-gradient-to-r from-slate-200 via-blue-400 to-slate-200'} />

                      {isPopular && (
                        <span className="absolute top-4 right-4 z-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1.5 whitespace-nowrap animate-pulse">
                          <Star className="w-3 h-3 text-amber-300" fill="currentColor" />
                          Best Seller
                        </span>
                      )}

                      {/* Display panel */}
                      <div className="p-4 pt-5">
                        <div className={`aspect-square rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner ${pkg.thumbnail_display_url ? 'bg-slate-50 border border-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'}`}>
                          {pkg.thumbnail_display_url ? (
                            <img
                              src={pkg.thumbnail_display_url}
                              alt={pkg.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <Image className="w-16 h-16 text-white/25" strokeWidth={1.5} />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 px-6 pb-6">
                        <div className="inline-flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2">
                          <Package className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                          Bundle Package
                        </div>

                        <h4 className="text-xl font-black text-slate-900 uppercase leading-snug group-hover:text-blue-600 transition-colors duration-300">
                          {pkg.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1 mb-4">
                          {idx === 0 ? 'Kickstart your learning journey' : idx === 1 ? 'Advance your career skills' : 'Master in-demand high income skills'}
                        </p>

                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-3xl font-black ${isPopular ? 'text-blue-600' : 'text-slate-900'}`}>₹{Number(pkg.price).toLocaleString()}</span>
                          <span className="text-sm text-slate-400 line-through font-bold">₹{Number(pkg.price * 2).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg mb-5 inline-flex items-center gap-1 w-fit shadow-sm">
                          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-bounce" />
                          SAVE 50% TODAY
                        </span>

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What you get</p>
                        <ul className="space-y-2 flex-1 mb-6">
                          {features.map((item, fidx) => (
                            <li key={fidx} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold py-0.5">
                              <div className={`w-4.5 h-4.5 rounded-full ${isPopular ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40' : 'bg-blue-50 text-blue-600'} flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300`}>
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </div>
                              <span>{isCourseFallback ? item : item.replace('✓', '').trim()}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => navigate(user ? `/packages/${pkg.public_code || pkg.id}` : `/register?package_id=${pkg.public_code || pkg.id}`)}
                          className={`group/btn relative w-full py-4 px-6 rounded-xl font-black text-xs inline-flex items-center justify-center gap-2 text-center transition-all duration-300 hover:-translate-y-0.5 uppercase tracking-widest overflow-hidden shadow-lg ${
                            isPopular 
                              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/30 hover:shadow-blue-500/50' 
                              : 'bg-white border-2 border-slate-200/90 hover:border-blue-600 text-slate-800 hover:text-blue-600 hover:bg-blue-50/50'
                          }`}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                          Choose Package
                          <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2.5 mt-8">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToPage(idx)}
                    aria-label={`Go to page ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentPage 
                        ? 'w-8 h-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/40' 
                        : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <button onClick={() => navigate('/packages')}
            className="group inline-flex items-center gap-2.5 text-sm font-black text-blue-700 hover:text-blue-800 transition-all duration-300 border-2 border-blue-200 hover:border-blue-500 bg-white hover:bg-blue-50/60 px-7 py-3.5 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5">
            View All Packages
            <ArrowRight width={16} height={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
