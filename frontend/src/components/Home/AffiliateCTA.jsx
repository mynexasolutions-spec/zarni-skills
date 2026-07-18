import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users } from 'lucide-react';

export default function AffiliateCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-16 lg:py-20 bg-slate-50 relative overflow-hidden" id="affiliate-banner">
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
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/25 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center p-8 sm:p-12 lg:p-16">

            {/* LEFT: Copy & CTA */}
            <div className="text-center lg:text-left">
              <span className="inline-block bg-white/10 border border-white/15 text-primary-light text-[10px] font-extrabold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-5">
                Earn More
              </span>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[2.6rem] text-white leading-[1.2] mb-4">
                Join Our Affiliate Program<br className="hidden sm:block" /> &amp; Earn Passive Income
              </h2>

              <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0 mb-7">
                Promote Zarni Skills and earn up to 30% commission on every successful referral.
              </p>

              {/* Feature Checks */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 mb-9">
                {['High Commission Rates', 'Real-time Tracking', 'Quick Payouts'].map(feature => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check width={12} height={12} stroke="#34d399" strokeWidth={3} />
                    </span>
                    <span className="text-slate-200 text-xs sm:text-sm font-semibold">{feature}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/register')}
                className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-black/20">
                Join Affiliate Program
              </button>
            </div>

            {/* RIGHT: Photo & Floating Stat Cards */}
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-primary/25 rounded-full blur-[90px] pointer-events-none"></div>
              <img
                src="/static/img/manwithlaptop.png"
                alt="Affiliate partner earning with Zarni Skills"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=350&q=80";
                }}
                className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
              />

              {/* Floating Card: Your Earnings */}
              <div className="absolute -top-2 -left-2 sm:top-2 sm:-left-4 z-20 animate-float">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl min-w-[104px] sm:min-w-[170px]">
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
                <div className="flex items-center gap-1.5 sm:gap-3 bg-white/95 backdrop-blur-md border border-white/90 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-4 sm:py-3 shadow-2xl">
                  <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
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
