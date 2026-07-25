import React from 'react';
import { ArrowUpRight, Sparkles, CheckCircle2, Zap, ShieldCheck, Trophy, Star } from 'lucide-react';

// 3D Glass Orbit Tile with floating counter-rotation so icons stay upright while orbiting
function OrbitIcon({ top, left, children }) {
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14"
      style={{ top, left }}
    >
      <div className="w-full h-full animate-[spin_50s_linear_infinite_reverse]">
        <div className="w-full h-full rounded-[12px] sm:rounded-[18px] p-0.5 sm:p-1 bg-white/90 backdrop-blur-md shadow-[0_6px_20px_rgba(37,99,235,0.22)] sm:shadow-[0_10px_28px_rgba(37,99,235,0.28)] border border-white/90 flex items-center justify-center transition-all duration-300 hover:scale-125 hover:shadow-[0_20px_45px_rgba(37,99,235,0.5)] group/orbit">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SkillsShowcase() {
  return (
    <section className="py-12 sm:py-28 relative overflow-hidden bg-white" id="skills-showcase"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(43,128,240,0.08) 0%, transparent 65%), #ffffff' }}>

      {/* Shared Background Pattern Image */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-50" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      {/* Top light shimmer sweep bar across the section */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Floating Animated Bokeh & Light Comets in Background */}
      <div className="absolute -left-20 top-10 w-80 h-80 bg-blue-500/12 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute right-0 bottom-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-[130px] pointer-events-none z-0 animate-blob"></div>
      <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-cyan-400/12 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Floating Sparkles & Light Particles */}
      <div className="absolute top-20 left-[15%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></div>
      <div className="absolute bottom-24 right-[12%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-float-delayed pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-[8%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse pointer-events-none z-0"></div>

      {/* Top right branding tag */}
      <div className="hidden sm:block absolute top-8 right-12 text-right z-10 select-none">
        <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">Skills For</p>
        <p className="text-[10px] font-black tracking-[0.25em] text-slate-800 uppercase">A Better Future</p>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 animate-ping"></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 items-center">

          {/* 1. TOP HEADING BLOCK (Order-1 on Mobile, Left-Top on Desktop) */}
          <div className="order-1 lg:col-span-5 lg:col-start-1 lg:row-start-1 flex flex-col pt-2 sm:pt-4 relative">

            {/* Glowing top badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-xs font-bold w-fit mb-3 sm:mb-5 shadow-[0_4px_16px_rgba(37,99,235,0.15)] select-none hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
              <span>FUTURE-READY CAREER PATHWAYS</span>
            </div>

            {/* Vertical rotated label along the left edge (desktop only) */}
            <div className="hidden lg:flex absolute -left-12 top-2 flex-col items-center gap-3 select-none">
              <div className="w-px h-24 bg-gradient-to-b from-blue-400 to-transparent"></div>
              <p
                className="text-[10px] font-black tracking-[0.28em] text-slate-400 uppercase whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                LEARN. PRACTICE. EARN. <span className="text-blue-600">GROW WITHOUT LIMITS.</span>
              </p>
            </div>

            {/* Main Heading — HIGH DEMANDED SKILLS */}
            <h2 className="font-heading font-black text-3xl sm:text-6xl lg:text-[4rem] leading-[0.95] tracking-tight mb-3 sm:mb-6">
              <span className="block bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">HIGH</span>
              <span className="block bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">DEMANDED</span>
              <span className="block text-slate-900 drop-shadow-sm">SKILLS</span>
            </h2>

            {/* Blue accent line bar with shimmer sweep */}
            <div className="relative w-24 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
            </div>
          </div>

          {/* 2. MAN PORTRAIT & ORBIT RING (Order-2 on Mobile, Right Column Spanning Both Rows on Desktop) */}
          <div className="relative order-2 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2 flex items-center justify-center py-2 sm:py-4">
            <div className="relative w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[540px] aspect-square">

              {/* Soft ambient radial glow behind character */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-gradient-to-tr from-blue-500/20 via-cyan-400/15 to-indigo-500/20 blur-[80px] pointer-events-none animate-pulse"></div>

              {/* Central portrait — Man pointing finger towards skill icon */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] h-[92%] z-10 pointer-events-none"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 80%, transparent 96%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 96%)'
                }}
              >
                <img
                  src="/static/img/skills-man.png"
                  alt="Learn high-demand skills with Zarni Skills"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  style={{ objectPosition: '75% 30%' }}
                />
              </div>

              {/* Rotating ring with dual dashed orbit ellipses — z-30 sits IN FRONT of man image */}
              <div className="absolute inset-0 z-30 animate-[spin_50s_linear_infinite]" style={{ transformOrigin: '50% 52%' }}>

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                  <ellipse cx="50" cy="52" rx="43" ry="46" stroke="#2b80f0" strokeOpacity="0.5" strokeWidth="0.8" strokeDasharray="2.5 3.5" strokeLinecap="round" className="animate-dash-flow drop-shadow-[0_0_8px_rgba(43,128,240,0.6)]" />
                  <ellipse cx="50" cy="52" rx="38" ry="41" stroke="#818cf8" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="1.5 2.5" strokeLinecap="round" />
                </svg>

                {/* 1. Premiere Pro (Pr) - top center */}
                <OrbitIcon top="6%" left="50%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#1C003B] flex items-center justify-center shadow-inner">
                    <span className="text-white font-black text-xs sm:text-base tracking-tight">Pr</span>
                  </div>
                </OrbitIcon>

                {/* 2. VN Video Editor */}
                <OrbitIcon top="11.3%" left="70%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-black flex items-center justify-center shadow-inner">
                    <span className="text-white font-black text-[10px] sm:text-sm tracking-tight">VN</span>
                  </div>
                </OrbitIcon>

                {/* 3. Canva */}
                <OrbitIcon top="25.9%" left="85.4%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-tr from-[#00C4CC] via-[#5B30E2] to-[#7D2AE8] flex items-center justify-center shadow-inner">
                    <span className="text-white font-black italic text-[9px] sm:text-sm tracking-tight font-serif">Canva</span>
                  </div>
                </OrbitIcon>

                {/* 4. Meta */}
                <OrbitIcon top="46.5%" left="92.7%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-white flex items-center justify-center">
                    <svg viewBox="0 0 36 24" className="w-5 h-4 sm:w-8 sm:h-6">
                      <path d="M7 21C3.1 21 0 17 0 12c0-5 3.1-9 7-9 2.5 0 4.7 1.4 6.8 4.2.4-.7.9-1.4 1.5-2C17.3 3.4 19.5 2 22 2c3.9 0 7 4 7 9 0 5-3.1 9-7 9-2.6 0-4.6-1.5-7.1-5.7l-1-1.6c-.4.6-.7 1.1-1.1 1.7C10.2 19 8.6 21 7 21z" fill="#0866FF"/>
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 5. Google Ads */}
                <OrbitIcon top="68.3%" left="90.2%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
                      <path d="M14.5 3.5L4 19.5H9.5L20 3.5H14.5Z" fill="#FBBC04"/>
                      <path d="M4 19.5L8.5 12.5L14 19.5H4Z" fill="#34A853"/>
                      <path d="M14.5 3.5L20 3.5L14 19.5H9.5L14.5 3.5Z" fill="#4285F4"/>
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 6. WhatsApp */}
                <OrbitIcon top="86.5%" left="78.5%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#25D366] flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 fill-white">
                      <path d="M12.011 2C6.48 2 2 6.48 2 12.011c0 2.115.656 4.075 1.777 5.694L2 22l4.423-1.745A9.957 9.957 0 0 0 12.011 22C17.54 22 22 17.54 22 12.011 22 6.48 17.54 2 12.011 2zm5.728 14.34c-.244.686-1.42 1.348-1.97 1.408-.512.056-1.168.232-3.832-.823-3.238-1.282-5.3-4.576-5.46-4.79-.16-.214-1.3-1.733-1.3-3.307 0-1.574.825-2.35 1.118-2.67.293-.32.64-.4.853-.4.213 0 .426.002.613.01.2.008.47.014.733.645.267.64.907 2.213.987 2.373.08.16.133.347.027.56-.107.213-.16.347-.32.533-.16.187-.336.413-.48.554-.16.16-.327.334-.14.654.187.32.83 1.372 1.78 2.22 1.222 1.09 2.25 1.43 2.57 1.59.32.16.507.133.693-.08.187-.213.8-0.933 1.013-1.253.213-.32.427-.267.72-.16.293.107 1.867.88 2.187 1.04.32.16.533.24.613.373.08.133.08.773-.164 1.46z"/>
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 7. ChatGPT / OpenAI */}
                <OrbitIcon top="96.7%" left="60.3%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#10A37F] flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current">
                      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 19.0193 19.8182a5.9847 5.9847 0 0 0 3.9977-2.9 6.051 6.051 0 0 0-.7351-7.0971zm-10.2819 11.1789a4.45 4.45 0 0 1-2.28-.6212l.11-.0637 3.7915-2.1884a.82.82 0 0 0 .41-.711v-5.3444l1.603 1.603a.07.07 0 0 1 .02.05v4.5427a4.475 4.475 0 0 1-3.6545 4.733zm-8.68-3.7226a4.45 4.45 0 0 1-.54-2.3025l.11.0637 3.7915 2.1884a.82.82 0 0 0 .82 0l4.63-2.6712v1.854a.07.07 0 0 1-.03.06l-3.93 2.2687a4.475 4.475 0 0 1-4.8515-.4511zm-1.04-9.4563a4.45 4.45 0 0 1 1.74-1.6813v4.5516a.82.82 0 0 0 .41.711l4.63 2.6712-1.603 1.603a.07.07 0 0 1-.07 0l-3.93-2.2687a4.475 4.475 0 0 1-1.177-5.5868zm14.44 3.2563l-4.63-2.6712 1.603-1.603a.07.07 0 0 1 .07 0l3.93 2.2687a4.475 4.475 0 0 1 1.177 5.5868 4.45 4.45 0 0 1-1.74 1.6813v-4.5516a.82.82 0 0 0-.41-.711zm2.5-2.7a4.45 4.45 0 0 1 .54 2.3025l-.11-.0637-3.7915-2.1884a.82.82 0 0 0-.82 0l-4.63 2.6712v-1.854a.07.07 0 0 1 .03-.06l3.93-2.2687a4.475 4.475 0 0 1 4.8515.4511zm-7.22-4.4789a4.475 4.475 0 0 1 3.6545 4.733v.01l-.11-.0637-3.7915-2.1884a.82.82 0 0 0-.41-.711v-1.78zm.5 5.6105l2.25 1.3-2.25 1.3-2.25-1.3 2.25-1.3z"/>
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 8. AI Spark Star */}
                <OrbitIcon top="96.7%" left="39.7%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#64B5F6] flex items-center justify-center shadow-inner">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current animate-pulse">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 9. DaVinci Resolve */}
                <OrbitIcon top="86.5%" left="21.5%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#0D1117] flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7">
                      <path d="M16 4A12 12 0 1 0 28 16 12 12 0 0 0 16 4z" fill="#0D1117"/>
                      <path d="M16 7a9 9 0 0 0-6.4 2.6l6.4 6.4V7z" fill="#FF5A5F"/>
                      <path d="M25 16a9 9 0 0 0-2.6-6.4l-6.4 6.4H25z" fill="#06D6A0"/>
                      <path d="M16 25a9 9 0 0 0 6.4-2.6l-6.4-6.4V25z" fill="#4285F4"/>
                      <path d="M7 16a9 9 0 0 0 2.6 6.4l6.4-6.4H7z" fill="#FFD166"/>
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 10. Photoshop (Ps) */}
                <OrbitIcon top="68.3%" left="9.8%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#001E36] flex items-center justify-center shadow-inner">
                    <span className="text-[#31A8FF] font-black text-xs sm:text-base tracking-tight">Ps</span>
                  </div>
                </OrbitIcon>

                {/* 11. Python */}
                <OrbitIcon top="46.5%" left="7.3%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
                      <path d="M12 2c-4 0-4.2 1.8-4.2 1.8v2.4h4.3v.6H5.9S3 6.5 3 11.5c0 5 2.5 4.8 2.5 4.8h1.6v-2.6s-.1-2.5 2.5-2.5h4s2.4.1 2.4-2.3V4.3S16.4 2 12 2z" fill="#3776AB" />
                      <path d="M12 22c4 0 4.2-1.8 4.2-1.8v-2.4h-4.3v-.6h6.2s2.9.3 2.9-4.7c0-5-2.5-4.8-2.5-4.8h-1.6v2.6s.1 2.5-2.5 2.5h-4s-2.4-.1-2.4 2.3v4.6S7.6 22 12 22z" fill="#FFD43B" />
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 12. YouTube */}
                <OrbitIcon top="25.9%" left="14.6%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7">
                      <rect x="1" y="4.5" width="22" height="15" rx="5" fill="#FF0000" />
                      <path d="M10 8.5l7 3.5-7 3.5z" fill="#fff" />
                    </svg>
                  </div>
                </OrbitIcon>

                {/* 13. Instagram */}
                <OrbitIcon top="11.3%" left="30%">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-none stroke-current" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="6" />
                      <circle cx="12" cy="12" r="4.5" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                    </svg>
                  </div>
                </OrbitIcon>

              </div>

              {/* Electric Touch Energy Burst & Lens Flare behind AR tile */}
              <div
                className="absolute z-35 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ top: 'calc(48% - 40px)', left: 'calc(37.5% + 5px)' }}
              >
                {/* Outer radial glow halo */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 rounded-full bg-gradient-to-r from-[#00FF66]/50 via-cyan-400/40 to-blue-500/30 blur-xl animate-pulse"></div>

                {/* Lens Flare light beams */}
                <div className="w-28 sm:w-40 h-1 -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 bg-gradient-to-r from-transparent via-cyan-300 to-transparent blur-[1px] rotate-45 opacity-85"></div>
                <div className="w-28 sm:w-40 h-1 -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 bg-gradient-to-r from-transparent via-[#00FF66] to-transparent blur-[1px] -rotate-45 opacity-85"></div>
              </div>

              {/* FIXED Spark AR (Ar) Tile — Sits right over the man's index finger point, STAYING FIXED */}
              <div
                className="absolute z-40 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-auto transition-transform duration-300 hover:scale-115 w-10 h-10 sm:w-14 sm:h-14"
                style={{ top: 'calc(48% - 40px)', left: 'calc(37.5% + 5px)' }}
              >
                <div className="w-full h-full p-0.5 sm:p-1 rounded-[12px] sm:rounded-[18px] bg-white/90 backdrop-blur-md shadow-[0_8px_25px_rgba(0,255,102,0.5)] sm:shadow-[0_12px_35px_rgba(0,255,102,0.6)] border border-white flex items-center justify-center">
                  <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#002B16] border border-[#00FF66]/70 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.9)]">
                    <span className="text-[#00FF66] font-black text-xs sm:text-base tracking-tight drop-shadow-[0_0_12px_rgba(0,255,102,1)]">Ar</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. CONTENT BLOCK (Order-3 on Mobile, Left-Bottom on Desktop) */}
          <div className="order-3 lg:col-span-5 lg:col-start-1 lg:row-start-2 flex flex-col pb-4 relative mt-2 sm:mt-0">
            <p className="text-slate-600 font-semibold text-sm sm:text-lg leading-relaxed mb-3 max-w-md">
              Learn industry-leading skills with <span className="text-blue-600 font-black">Zarni Skills</span> and unlock high-income opportunities.
            </p>
            <p className="text-slate-500 font-medium text-xs sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
              From creative tools to advanced tech, <span className="text-slate-900 font-bold">we prepare you for the real world.</span>
            </p>

            {/* Glass Feature Badges with hover effects */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">50+ Courses</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-amber-300">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">Practical</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-emerald-300">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">Certified</span>
              </div>
            </div>

            {/* Bottom Footer Details */}
            <div className="mt-auto pt-4 sm:pt-6 border-t border-slate-200/80 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="font-heading font-black text-blue-600 text-base sm:text-lg tracking-tight leading-none mb-1">ZARNI SKILLS</p>
                <p className="text-slate-500 text-[11px] sm:text-xs font-semibold">Your Skills. Your Future. Our Mission.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
