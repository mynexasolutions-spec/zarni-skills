import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Quote, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import useCountUp from '../../hooks/useCountUp';
import useInView from '../../hooks/useInView';
import api from '../../utils/api';

const DEFAULT_REVIEWS = [
  { name: "TONI", role: "Affiliate Marketer", text: "Life-changing experience! The training was clear, actionable, and easy to follow even with zero experience. Highly recommended!", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop" },
  { name: "Maha Lakshmi", role: "Freelancer", text: "Course chala easy and simple. Online nundi extra income start chesanu. I highly suggest this to everyone!", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" },
  { name: "Ravi Varma", role: "Student", text: "Transformative journey. Started with zero knowledge, now I enjoy steady online income. Perfect fit for beginners!", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" },
  { name: "Anjali Sharma", role: "Digital Marketer", text: "The community support here is incredible. I've scaled my freelancing business to new heights within months.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop" },
  { name: "Vikram Singh", role: "Entrepreneur", text: "Finally found a course that actually works. Actionable strategies that deliver real-world ROI. 10/10!", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" },
  { name: "Priya Das", role: "Content Creator", text: "From struggling to find a niche to becoming a top creator. Zarni Skills gave me the roadmap I needed.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" },
];

function TestimonialCard({ r }) {
  return (
    <div className="shrink-0 group/tcard">
      <div className="relative bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between border border-slate-200/80 hover:border-blue-400 h-full w-[290px] md:w-[330px] transition-all duration-500 hover:shadow-[0_25px_60px_rgba(37,99,235,0.2)] hover:-translate-y-2 overflow-hidden">

        {/* Top Accent Light Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 opacity-0 group-hover/tcard:opacity-100 transition-opacity duration-500"></div>

        {/* Shimmer sweep on hover */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover/tcard:translate-x-full transition-transform duration-1000 pointer-events-none z-20"></span>

        {/* Verified Ribbon Tag */}
        <div className="absolute top-3.5 right-4 flex items-center gap-1 text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>VERIFIED</span>
        </div>

        {/* Large Decorative Quote Mark */}
        <Quote className="absolute top-4 right-16 w-10 h-10 text-blue-600/[0.06] select-none pointer-events-none group-hover/tcard:text-blue-600/[0.12] transition-colors duration-500" fill="currentColor" strokeWidth={0} />

        <div className="relative z-10">
          {/* Gold Star Reviews */}
          <div className="flex text-amber-400 mb-3.5 gap-1 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} width={15} height={15} fill="currentColor" />
            ))}
          </div>
          <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed mb-6 font-medium">"{r.text}"</p>
        </div>

        <div className="flex items-center gap-3.5 border-t border-slate-100/90 pt-4 relative z-10">
          {r.img ? (
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shrink-0">
              <img src={r.img} alt={r.name} className="w-full h-full rounded-full object-cover bg-white" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full border-2 border-blue-400 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
              {r.name?.[0] || '?'}
            </div>
          )}
          <div>
            <h4 className="font-heading font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide group-hover/tcard:text-blue-600 transition-colors">{r.name}</h4>
            <p className="text-blue-600 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-widest mt-0.5">{r.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [ratingRef, ratingInView] = useInView(0.5);
  const [headerRef, headerInView] = useInView(0.2);
  const [REVIEWS, setReviews] = useState(DEFAULT_REVIEWS);
  const [statTargets, setStatTargets] = useState({ rating: 4.9, students: 2500 });
  const rating = useCountUp(statTargets.rating, ratingInView, 1);
  const students = useCountUp(statTargets.students, ratingInView, 0);
  const headerReveal = `transition-all duration-700 ease-out ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/testimonials');
        const items = response.data.testimonials || [];
        if (items.length > 0) {
          setReviews(items.map((t) => ({ name: t.name, role: t.role, text: t.text, img: t.image_display_url })));
        }
        setStatTargets({
          rating: response.data.rating ?? 4.9,
          students: response.data.student_count ?? 2500,
        });
      } catch (err) {
        console.error('Error fetching testimonials', err);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 text-slate-900 relative overflow-hidden min-h-fit" id="testimonials">

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

      {/* Header Container */}
      <div ref={headerRef} className={`relative max-w-7xl mx-auto px-6 text-center mb-14 md:mb-18 z-10 ${headerReveal}`}>
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_4px_20px_rgba(37,99,235,0.15)] select-none mx-auto hover:scale-105 transition-transform duration-300">
          <MessageCircle className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>STUDENT REVIEWS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-4 uppercase drop-shadow-sm">
          What Our{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 animate-gradient-x drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">
            Students
          </span>{' '}
          Say
        </h2>

        {/* Glowing Underline Bar */}
        <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto mb-5">
          <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
        </div>

        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base font-semibold leading-relaxed mb-6">
          Discover how ambitious individuals transformed their careers and income streams through Zarni Skills.
        </p>

        {/* Aggregate rating strip */}
        <span className="relative inline-block">
          <span className="absolute -inset-1.5 rounded-full bg-blue-500/20 blur-md animate-pulse pointer-events-none" style={{ animationDuration: '2.5s' }}></span>
          <div ref={ratingRef} className="relative inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white shadow-md rounded-full pl-4 pr-6 py-2.5">
            <div className="flex text-amber-400 gap-1 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} width={15} height={15} fill="currentColor" />
              ))}
            </div>
            <span className="w-px h-4 bg-slate-200"></span>
            <span className="text-slate-700 text-xs sm:text-sm font-bold">
              <span className="text-slate-900 font-black">{rating}/5</span> from {Number(students).toLocaleString('en-IN')}+ students
            </span>
          </div>
        </span>
      </div>

      {/* Bi-directional Continuous Infinite Marquee Sliders */}
      <div className="w-full overflow-hidden hover-pause relative z-10 space-y-6">
        {/* Marquee Row 1 (Left to Right) */}
        <div className="flex w-max gap-6 animate-marquee py-2 px-3">
          {[0, 1].map(setIdx => (
            REVIEWS.map((r, idx) => <TestimonialCard key={`row1-${setIdx}-${idx}`} r={r} />)
          ))}
        </div>

        {/* Marquee Row 2 (Right to Left / Reverse) */}
        <div className="flex w-max gap-6 animate-marquee py-2 px-3" style={{ animationDirection: 'reverse' }}>
          {[0, 1].map(setIdx => (
            [...REVIEWS].reverse().map((r, idx) => <TestimonialCard key={`row2-${setIdx}-${idx}`} r={r} />)
          ))}
        </div>
      </div>
    </section>
  );
}
