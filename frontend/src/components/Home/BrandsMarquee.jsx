import React from 'react';
import { Sparkles } from 'lucide-react';

function BrandCard({ glow, children }) {
  return (
    <div
      className="group/card relative flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white py-4 px-8 rounded-[1.3rem] overflow-hidden hover:-translate-y-1 hover:scale-[1.06] hover:border-white transition-all duration-500 shadow-sm"
    >
      {/* Colored glow that blooms in on hover, tinted per-brand */}
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(120% 140% at 50% 120%, ${glow} 0%, transparent 70%)` }}
      ></div>
      <div
        className="absolute -inset-px rounded-[1.3rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `0 18px 40px -12px ${glow}` }}
      ></div>
      {/* Shine sweep */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-700 pointer-events-none"></span>
      <span className="relative flex items-center gap-3">{children}</span>
    </div>
  );
}

function BrandGroup({ hidden }) {
  return (
    <div className="flex items-center gap-6 sm:gap-10 shrink-0" aria-hidden={hidden ? 'true' : undefined}>
      {/* Google */}
      <BrandCard glow="rgba(66,133,244,0.35)">
        <svg className="h-6 w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        <span className="font-black text-slate-800 text-base tracking-tight">Google</span>
      </BrandCard>

      {/* Microsoft */}
      <BrandCard glow="rgba(0,164,239,0.3)">
        <svg className="h-5.5 w-auto" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" style={{ height: '22px' }}>
          <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022" />
          <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7FBA00" />
          <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00A4EF" />
          <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900" />
        </svg>
        <span className="font-extrabold text-slate-700 text-base tracking-tight">Microsoft</span>
      </BrandCard>

      {/* Airbnb */}
      <BrandCard glow="rgba(255,90,95,0.35)">
        <svg className="h-6 w-auto" viewBox="0 0 32 32" fill="#FF5A5F" xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }}>
          <path d="M16 1c-2.007 0-3.692 1.4-4.5 3.3C9.914 8.2 5.086 19.3 2.18 25.9c-.31.7-.18 1.5.3 2.1.5.6 1.3.9 2.1.9h22.84c.82 0 1.58-.33 2.08-.94.49-.61.61-1.42.3-2.12C26.914 19.3 22.086 8.2 20.5 4.3 19.692 2.4 18.007 1 16 1zm0 3c1.137 0 2.092.8 2.5 1.9l8.32 19.1H5.18l8.32-19.1c.408-1.1 1.363-1.9 2.5-1.9zm0 5c-2.206 0-4 1.79-4 4s1.794 4 4 4 4-1.79 4-4-1.794-4-4-4zm0 2.5c.827 0 1.5.67 1.5 1.5s-.673 1.5-1.5 1.5-1.5-.67-1.5-1.5.673-1.5 1.5-1.5z" />
        </svg>
        <span className="font-black text-[#FF5A5F] text-base tracking-tight">airbnb</span>
      </BrandCard>

      {/* HubSpot */}
      <BrandCard glow="rgba(255,122,89,0.35)">
        <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="#FF7A59" xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }}>
          <circle cx="12" cy="12" r="10" fill="#FF7A59" opacity="0.1" />
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#FF7A59" />
        </svg>
        <span className="font-black text-slate-800 text-base tracking-tight">HubSpot</span>
      </BrandCard>

      {/* LinkedIn */}
      <BrandCard glow="rgba(10,102,194,0.3)">
        <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }}>
          <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z" />
        </svg>
        <span className="font-black text-[#0A66C2] text-base tracking-tight">LinkedIn</span>
      </BrandCard>

      {/* Udemy */}
      <BrandCard glow="rgba(164,53,240,0.3)">
        <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="#A435F0" xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }}>
          <path d="M12 2L8.5 6h7L12 2zm6 7v6.5c0 3.04-2.46 5.5-5.5 5.5S7 18.54 7 15.5V9h3v6.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9h3z" />
        </svg>
        <span className="font-extrabold text-[#A435F0] text-base tracking-tight">Udemy</span>
      </BrandCard>

      {/* Canva */}
      <BrandCard glow="rgba(0,196,204,0.3)">
        <svg className="h-6 w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ height: '24px' }}>
          <defs>
            <linearGradient id={`canva-grad-${hidden ? '2' : '1'}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C4CC" />
              <stop offset="100%" stopColor="#7D2AE8" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="12" fill={`url(#canva-grad-${hidden ? '2' : '1'})`} />
          <path d="M12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#FFF" />
        </svg>
        <span className="font-black text-slate-800 text-base tracking-tight">Canva</span>
      </BrandCard>
    </div>
  );
}

export default function BrandsMarquee() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-blue-50/40 to-white relative overflow-hidden">

      {/* Top shimmer sweep line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Subtle background glow blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[150px] bg-blue-400/15 blur-[120px] rounded-full -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[150px] bg-indigo-400/15 blur-[120px] rounded-full -translate-y-1/2"></div>
      </div>

      {/* Floating neon particles */}
      <span className="absolute top-14 left-[8%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-float pointer-events-none"></span>
      <span className="absolute bottom-20 right-[10%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-float-delayed pointer-events-none"></span>
      <span className="absolute top-1/3 right-[6%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-float pointer-events-none"></span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">

        {/* Pulsing eyebrow badge */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 shadow-sm shadow-blue-500/10 mb-4 mx-auto animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
          <span className="text-[11px] font-black text-blue-800 tracking-widest uppercase">Global Recognition & Hiring Partners</span>
        </div>

        <h2 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight mb-3 animate-fade-in-up" style={{ animationDelay: '90ms' }}>
          <span className="bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-800 bg-clip-text text-transparent animate-gradient-x">
            Trusted by Leading Companies &amp; Brands
          </span>
        </h2>
        <p className="text-slate-600 text-xs sm:text-base font-medium mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          Our learners gain high-demand skillsets and go on to work with, and build for, some of the most iconic companies worldwide.
        </p>

        {/* Logo Marquee Wrapper with edge-fade mask */}
        <div className="relative w-full overflow-hidden hover-pause animate-fade-in-up [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]" style={{ animationDelay: '230ms' }}>
          <div className="flex gap-6 sm:gap-10 items-center animate-marquee whitespace-nowrap min-w-full w-max py-4">
            <BrandGroup />
            <BrandGroup hidden />
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            100+ Enterprise Hiring Partners
          </div>
          <div className="hidden sm:block text-slate-300">•</div>
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" style={{ animationDelay: '0.6s' }}></span>
              <span className="relative w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            </span>
            94% Career Growth Rate
          </div>
          <div className="hidden sm:block text-slate-300">•</div>
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" style={{ animationDelay: '1.2s' }}></span>
              <span className="relative w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            </span>
            Top Tier Skill Certifications
          </div>
        </div>

      </div>
    </section>
  );
}
