import React from 'react';
import { ShieldCheck, Landmark, Medal, User, Users2, Star, CheckCircle2, Award } from 'lucide-react';

const CERTIFICATIONS = [
  {
    title: 'MSME (UDYAM)',
    desc: 'Registered under the Ministry of MSME, Government of India. Supporting small and medium enterprises for growth.',
    badge: '/static/img/msme-logo.jpeg',
    BottomIcon: ShieldCheck,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    title: 'GST',
    desc: 'Goods & Services Tax registered. Committed to transparent and compliant business operations.',
    badge: '/static/img/gst-logo.jpeg',
    BottomIcon: ShieldCheck,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'MCA Registered',
    desc: 'Registered with the Ministry of Corporate Affairs. Operating as a compliant and recognized entity.',
    badge: '/static/img/mca-logo.jpeg',
    BottomIcon: Landmark,
    color: 'from-indigo-600 to-purple-600',
  },
  {
    title: 'ISO 9001:2015',
    desc: 'Certified for Quality Management Systems. Dedicated to delivering excellence in every service.',
    badge: '/static/img/iso-9001-seal.jpeg',
    BottomIcon: Medal,
    gold: true,
    color: 'from-amber-400 to-amber-600',
  },
  {
    title: 'PAN Card',
    desc: 'Permanent Account Number (PAN) registered with the Income Tax Department.',
    badge: '/static/img/pan-card-icon.jpeg',
    BottomIcon: User,
    color: 'from-blue-600 to-cyan-600',
  },
];

/* Source images are pre-trimmed and squared to the mark */
function CertBadge({ src, alt }) {
  return (
    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white p-2 shadow-inner">
      <img src={src} alt={alt} className="w-full h-full object-contain rounded-full" />
    </div>
  );
}

/* Simple decorative laurel branch */
function Laurel({ className = '' }) {
  return (
    <svg viewBox="0 0 60 160" className={className} fill="currentColor">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} cx="30" cy={20 + i * 24} rx="16" ry="7" transform={`rotate(${-35 + i * 2} 30 ${20 + i * 24})`} opacity={0.35 + i * 0.1} />
      ))}
    </svg>
  );
}

export default function GovernmentCertified() {
  return (
    <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden bg-[#06143c]" id="government-certified">
      
      {/* Background image anchored right - high clarity like reference */}
      <div
        className="absolute inset-0 bg-cover bg-[right_center] bg-no-repeat z-0 opacity-95"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(6, 20, 60, 0.95) 20%, rgba(6, 20, 60, 0.75) 50%, rgba(6, 20, 60, 0.3) 100%), url(/static/img/govt-certified-bg.png)',
        }}
      ></div>

      {/* Top light shimmer sweep bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-600/30 blur-[140px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-indigo-600/30 blur-[140px] rounded-full pointer-events-none z-0"></div>

      {/* Floating accent particles */}
      <span className="absolute top-16 left-[8%] w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-24 left-[4%] w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[4%] w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#7dd3fc] animate-float pointer-events-none z-0"></span>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          
          {/* 5 Stars Header Accent (matching reference photo) */}
          <div className="flex items-center justify-center gap-1.5 mb-3 text-cyan-400">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-400/60"></span>
            <Star className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
            <Star className="w-4 h-4 text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.9)]" fill="currentColor" strokeWidth={0} />
            <Star className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse" fill="currentColor" strokeWidth={0} />
            <Star className="w-4 h-4 text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.9)]" fill="currentColor" strokeWidth={0} />
            <Star className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-400/60"></span>
          </div>

          {/* Main Title with Laurel Wreaths */}
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <Laurel className="hidden sm:block w-9 h-26 text-blue-400/80 -scale-x-100 drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] uppercase drop-shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
              GOVERNMENT{' '}
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                CERTIFIED
              </span>
            </h2>
            <Laurel className="hidden sm:block w-9 h-26 text-blue-400/80 drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
          </div>

          {/* Small Landmark Icon Badge under Title */}
          <div className="flex items-center justify-center gap-3 my-4">
            <span className="w-12 sm:w-20 h-px bg-cyan-400/40"></span>
            <div className="w-7 h-7 rounded-full bg-blue-600/40 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.5)]">
              <Landmark className="w-3.5 h-3.5 text-cyan-300" strokeWidth={2} />
            </div>
            <span className="w-12 sm:w-20 h-px bg-cyan-400/40"></span>
          </div>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Zarni Skills is registered with trusted Government authorities and follows the highest standards of compliance and transparency.
          </p>
        </div>

        {/* Certification Cards — Clean White Cards as in Reference Picture */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
          {CERTIFICATIONS.map((cert, idx) => (
            <div
              key={idx}
              className={`group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-[0_15px_40px_rgba(0,0,0,0.3)] border transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_50px_rgba(34,211,238,0.25)] overflow-hidden ${
                idx === 4 ? 'col-span-2 md:col-span-1 max-w-[240px] sm:max-w-none justify-self-center w-full' : ''
              } ${
                cert.gold ? 'border-amber-300 shadow-amber-500/10' : 'border-blue-100 shadow-blue-500/10'
              }`}
            >
              {/* Top Shimmer Sweep */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></span>

              {/* Verified Ribbon Tag */}
              <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1 text-[7px] sm:text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>VERIFIED</span>
              </div>

              {/* Badge Circle Frame matching reference */}
              <div
                className={`relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-4 rounded-full p-1 transition-transform duration-500 group-hover:scale-108 ${
                  cert.gold
                    ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                }`}
              >
                <CertBadge src={cert.badge} alt={cert.title} />
              </div>

              <h3 className={`font-black text-xs sm:text-sm uppercase tracking-wide mb-1.5 ${cert.gold ? 'text-amber-600' : 'text-blue-900 group-hover:text-blue-600'} transition-colors`}>
                {cert.title}
              </h3>

              <div className={`w-6 sm:w-8 h-[2px] mx-auto mb-2 ${cert.gold ? 'bg-amber-300' : 'bg-blue-200'}`}></div>

              <p className="text-slate-600 text-[10px] sm:text-xs leading-snug sm:leading-relaxed font-medium">{cert.desc}</p>

              {/* Small Circular Bottom Icon Badge matching reference */}
              <div className={`mt-3 sm:mt-4 w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-120 ${
                cert.gold ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
              }`}>
                <cert.BottomIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Bar matching reference design */}
        <div className="mt-10 sm:mt-14 relative overflow-hidden bg-[#030e28]/90 border border-blue-500/30 rounded-2xl sm:rounded-full px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
          <div className="relative flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/40">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-white font-black text-xs sm:text-sm uppercase tracking-wide">Your Trust. Our Responsibility.</div>
              <div className="text-slate-300 text-[11px] sm:text-xs font-medium">We are committed to legal compliance &amp; quality service.</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-blue-500/30"></div>
          <div className="relative flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/40">
              <Users2 className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-white font-black text-xs sm:text-sm uppercase tracking-wide">Building Skills. Building Futures.</div>
              <div className="text-cyan-300 text-[11px] sm:text-xs font-bold">Together We Rise!</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
