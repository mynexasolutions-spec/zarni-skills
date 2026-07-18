import React from 'react';
import { Mail, Check } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="pb-24 pt-4 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-100/60 border border-white shadow-[0_20px_60px_-25px_rgba(43,128,240,0.25)] group">

          {/* Decorative grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage: 'linear-gradient(#dbeafe 1px, transparent 1px), linear-gradient(90deg, #dbeafe 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 100%)'
            }}>
          </div>
          <div className="absolute -right-16 -bottom-20 w-80 h-80 bg-primary/15 rounded-full blur-[90px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-300/15 rounded-full blur-[90px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 p-8 sm:p-10 md:p-12 lg:p-14">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white border border-primary/15 shadow-sm text-primary text-[10px] font-extrabold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-5">
                <Mail width={14} height={14} strokeWidth={2.5} />
                Newsletter
              </div>
              <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-slate-900 leading-tight mb-3">
                Stay Updated with Zarni Skills
              </h3>
              <p className="text-slate-500 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0 mb-5">
                Get new course drops, affiliate tips, and exclusive offers straight to your inbox.
              </p>

              {/* Trust row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2">
                {['No spam, ever', 'Weekly insights', 'Unsubscribe anytime'].map(point => (
                  <div key={point} className="flex items-center gap-1.5">
                    <Check width={14} height={14} stroke="#16a34a" strokeWidth={3} />
                    <span className="text-slate-500 text-xs font-semibold">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="w-full lg:w-auto lg:max-w-md flex-1">
              <form className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 p-2 bg-white rounded-2xl sm:rounded-full border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <div className="flex items-center flex-1 gap-2 pl-4">
                  <Mail width={18} height={18} className="text-slate-400 shrink-0" strokeWidth={2} />
                  <input type="email" placeholder="Enter your email" required
                    className="w-full py-3 text-slate-800 text-sm placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0" />
                </div>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-7 py-3 rounded-xl sm:rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 shrink-0 whitespace-nowrap">
                  Subscribe Now
                </button>
              </form>
              <p className="text-slate-400 text-[11px] font-medium mt-3 text-center lg:text-left">
                Join 10,000+ learners already subscribed. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
