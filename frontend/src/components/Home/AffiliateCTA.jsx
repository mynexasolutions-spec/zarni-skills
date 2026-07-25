import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, Sparkles, ArrowRight } from 'lucide-react';
import useInView from '../../hooks/useInView';

export default function AffiliateCTA() {
  const navigate = useNavigate();
  const [sectionRef, inView] = useInView(0.15);
  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-slate-50 relative overflow-hidden" id="affiliate-banner">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/20"
          style={{
            background: 'radial-gradient(ellipse 70% 100% at 90% 10%, rgba(43,128,240,0.35) 0%, transparent 60%), linear-gradient(135deg, #0a1428 0%, #0d1b3a 45%, #101c4a 100%)'
          }}>

          {/* Decorative grid + glow */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}>
          </div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
          <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center p-8 sm:p-12 lg:p-16">

            {/* LEFT: Copy & CTA */}
            <div className={`text-center lg:text-left transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="relative inline-flex items-center gap-2 bg-white/10 border border-white/15 text-primary-light text-[10px] font-extrabold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-5 overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-sweep"></span>
                <Sparkles className="w-3 h-3 relative animate-pulse" strokeWidth={2.5} />
                <span className="relative">Earn More</span>
              </span>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[2.6rem] text-white leading-[1.2] mb-4">
                Join Our Affiliate Program<br className="hidden sm:block" /> &amp; Earn{' '}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">Passive Income</span>
              </h2>

              <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0 mb-7">
                Promote Zarni Skills and earn up to{' '}
                <span className="text-emerald-300 font-bold">30% commission</span> on every successful referral.
              </p>

              {/* Feature Checks */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 mb-9">
                {['High Commission Rates', 'Real-time Tracking', 'Quick Payouts'].map((feature, idx) => (
                  <div
                    key={feature}
                    className={`flex items-center gap-2 group transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${150 + idx * 120}ms` }}
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-125">
                      <Check width={12} height={12} stroke="#34d399" strokeWidth={3} />
                    </span>
                    <span className="text-slate-200 text-xs sm:text-sm font-semibold">{feature}</span>
                  </div>
                ))}
              </div>

              <span className="relative inline-block">
                <span className="absolute -inset-2 rounded-xl bg-white/30 blur-md animate-pulse pointer-events-none" style={{ animationDuration: '2s' }}></span>
                <button onClick={() => navigate('/register')}
                  className="group relative overflow-hidden bg-white hover:bg-slate-50 text-slate-900 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 shadow-lg shadow-black/20 inline-flex items-center gap-2">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative">Join Affiliate Program</span>
                  <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                </button>
              </span>
            </div>

            {/* RIGHT: Photo & Floating Stat Cards */}
            <div className={`relative flex items-center justify-center py-4 transition-all duration-700 ease-out ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: '150ms' }}>
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-primary/25 rounded-full blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>

              {/* Floating sparkle accents */}
              <Sparkles className="absolute top-4 left-2 sm:left-6 w-5 h-5 text-emerald-300/80 animate-float z-20 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" strokeWidth={2} />
              <Sparkles className="absolute bottom-16 right-4 w-4 h-4 text-primary-light animate-float-delayed z-20 drop-shadow-[0_0_8px_rgba(43,128,240,0.6)]" strokeWidth={2} fill="currentColor" />

              <img
                src="/static/img/manwithlaptop.png"
                alt="Affiliate partner earning with Zarni Skills"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=350&q=80";
                }}
                className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)] animate-float"
              />

              {/* Floating Card: Your Earnings */}
              <div className="absolute -top-2 -left-2 sm:top-2 sm:-left-4 z-20 animate-float">
                <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl min-w-[104px] sm:min-w-[170px]">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none"></span>
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-wider mb-0.5 sm:mb-1">Earnings</p>
                  <p className="text-sm sm:text-xl font-black text-white mb-0.5 sm:mb-1">$12,875</p>
                  <svg className="hidden sm:block w-full h-8" viewBox="0 0 100 28" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="affiliate-chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 24 L0 20 L14 22 L28 12 L42 17 L56 6 L70 12 L100 2 L100 28 L0 28 Z" fill="url(#affiliate-chart-grad)" />
                    <path d="M0 20 L14 22 L28 12 L42 17 L56 6 L70 12 L100 2" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                  <p className="text-[7px] sm:text-[9px] text-slate-300 font-medium mt-0.5 sm:mt-1">This Month</p>
                </div>
              </div>

              {/* Floating Card: Commission Rate */}
              <div className="absolute -bottom-2 -right-2 sm:bottom-2 sm:-right-4 z-20 animate-float-delayed">
                <span className="absolute -inset-1.5 rounded-2xl bg-emerald-400/40 blur-md animate-pulse pointer-events-none" style={{ animationDuration: '2.2s' }}></span>
                <div className="relative flex items-center gap-1.5 sm:gap-3 bg-white/95 backdrop-blur-md border border-white/90 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-4 sm:py-3 shadow-2xl">
                  <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Users width={14} height={14} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Commission</p>
                    <p className="text-[11px] sm:text-sm font-black text-slate-900">Up to 30%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
