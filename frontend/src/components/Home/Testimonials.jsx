import React from 'react';
import { Star, MessageCircle, Quote } from 'lucide-react';

const REVIEWS = [
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
      <div className="relative bg-white/90 backdrop-blur-md rounded-[2rem] p-6 pb-7 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.04)] flex flex-col justify-between border border-white hover:border-primary/20 h-full w-[280px] md:w-[320px] transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(43,128,240,0.18)] hover:-translate-y-2 overflow-hidden">

        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 opacity-0 group-hover/tcard:opacity-100 transition-opacity duration-500"></div>

        {/* Large Decorative Quote Mark */}
        <Quote className="absolute top-4 right-5 w-10 h-10 text-primary/[0.07] select-none pointer-events-none group-hover/tcard:text-primary/[0.14] transition-colors duration-500" fill="currentColor" strokeWidth={0} />

        <div className="relative z-10">
          {/* Gold Star Reviews */}
          <div className="flex text-amber-500 mb-4 gap-0.5 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.15)]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} width={14} height={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-slate-650 text-xs sm:text-sm italic leading-relaxed mb-6 font-medium">"{r.text}"</p>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100/80 pt-4 relative z-10">
          <img src={r.img} alt={r.name} className="w-10 h-10 rounded-full border-2 border-primary-light/40 object-cover shadow-sm" />
          <div>
            <h4 className="font-heading font-black text-slate-900 text-xs uppercase tracking-wider">{r.name}</h4>
            <p className="text-primary-dark font-extrabold text-[10px] uppercase tracking-widest">{r.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden min-h-fit" id="testimonials">

      {/* Abstract tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>

      {/* Ambient Blue Effect Background Blobs */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -left-32 top-32 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute right-0 bottom-0 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-primary-light/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Floating accent particles */}
      <span className="absolute top-24 left-[10%] w-2 h-2 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(43,128,240,0.6)] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-32 right-[8%] w-2.5 h-2.5 rounded-full bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.6)] animate-float-delayed pointer-events-none z-0"></span>

      {/* Header Container */}
      <div className="relative max-w-7xl mx-auto px-6 text-center mb-12 md:mb-16 z-10">
        <MessageCircle className="hidden sm:block absolute -top-8 left-1/2 -translate-x-1/2 w-36 h-36 text-primary/[0.05] pointer-events-none" strokeWidth={1.5} />

        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
          <MessageCircle className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2.5} />
          Testimonials
        </div>
        <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 font-extrabold">Students</span> Say
        </h2>
        <p className="relative text-slate-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
          Discover how ambitious individuals transformed their careers and income streams through Zarni Skills.
        </p>

        {/* Aggregate rating strip */}
        <div className="relative inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white shadow-sm rounded-full pl-3 pr-5 py-2">
          <div className="flex text-amber-500 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} width={14} height={14} fill="currentColor" />
            ))}
          </div>
          <span className="w-px h-4 bg-slate-200"></span>
          <span className="text-slate-700 text-xs font-bold">
            <span className="text-slate-900 font-black">4.9/5</span> from 2,500+ students
          </span>
        </div>
      </div>

      {/* Continuous Infinite Slider (Right to Left) */}
      <div className="w-full overflow-hidden hover-pause relative z-10">
        {/* Gradient Fades on edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 via-slate-50/50 to-transparent z-20"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 via-slate-50/50 to-transparent z-20"></div>

        {/* Flex wrapper hosting two identical rows to bridge the infinite loop gap */}
        <div className="flex w-max gap-6 animate-marquee py-4 px-3">
          {[0, 1].map(setIdx => (
            REVIEWS.map((r, idx) => <TestimonialCard key={`${setIdx}-${idx}`} r={r} />)
          ))}
        </div>
      </div>
    </section>
  );
}
