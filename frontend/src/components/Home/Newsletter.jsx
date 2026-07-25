import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, Send, ShieldCheck } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="pb-24 pt-4 bg-gradient-to-b from-blue-50/40 via-white to-blue-50/60 relative overflow-hidden" id="newsletter">
      
      {/* Top light shimmer sweep bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main Glassmorphic 3D Card Container */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-white via-white to-blue-50/60 backdrop-blur-md border border-slate-200/90 shadow-[0_20px_60px_rgba(37,99,235,0.18)] hover:shadow-[0_30px_80px_rgba(37,99,235,0.25)] transition-all duration-500 group">

          {/* Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400"></div>

          {/* Top Shimmer Light Sweep */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-20"></span>

          {/* Dual Rotating Cyber Compass Rings */}
          <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full border border-blue-500/20 border-dashed animate-[spin_50s_linear_infinite] pointer-events-none z-0"></div>
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full border border-cyan-400/25 border-dashed animate-[spin_35s_linear_infinite_reverse] pointer-events-none z-0"></div>

          {/* Floating Neon Particles */}
          <span className="absolute top-12 left-[12%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
          <span className="absolute bottom-12 right-[10%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-float-delayed pointer-events-none z-0"></span>

          {/* Ambient Blue Background Flares */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse"></div>
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10 p-7 sm:p-10 md:p-12 lg:p-14">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_4px_20px_rgba(37,99,235,0.15)] select-none mx-auto lg:mx-0 hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
                <span>NEWSLETTER</span>
              </div>

              <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.05] mb-3 uppercase">
                Stay Updated with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 animate-gradient-x drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">
                  Zarni Skills
                </span>
              </h3>

              <p className="text-slate-500 text-xs sm:text-sm md:text-base font-semibold max-w-md mx-auto lg:mx-0 mb-6 leading-relaxed">
                Get new course drops, affiliate tips, and exclusive offers straight to your inbox.
              </p>

              {/* Trust row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2.5">
                {['No spam, ever', 'Weekly insights', 'Unsubscribe anytime'].map(point => (
                  <div key={point} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-100 px-3 py-1.5 rounded-full shadow-2xs transition-transform duration-300 hover:scale-105">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-slate-700 text-xs font-bold">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="w-full lg:w-auto lg:max-w-md flex-1">
              {subscribed ? (
                <div className="bg-emerald-500 text-white rounded-2xl sm:rounded-full p-4 sm:px-8 sm:py-4 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 animate-fade-in">
                  <ShieldCheck className="w-5 h-5" />
                  <span>You're Subscribed! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-full border border-blue-200/90 shadow-[0_10px_30px_rgba(37,99,235,0.12)] focus-within:ring-2 focus-within:ring-blue-500/40 transition-all duration-300">
                  <div className="flex items-center flex-1 gap-2.5 pl-4 py-1">
                    <Mail className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full py-2.5 text-slate-800 text-xs sm:text-sm font-semibold placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0"
                    />
                  </div>

                  <button
                    type="submit"
                    className="relative group/btn bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3.5 rounded-xl sm:rounded-full font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap overflow-hidden flex items-center justify-center gap-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">Subscribe Now</span>
                    <Send className="relative w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
                  </button>
                </form>
              )}

              <p className="text-slate-400 text-[11px] font-semibold mt-3.5 text-center lg:text-left flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Join 10,000+ learners already subscribed. We respect your privacy.</span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
