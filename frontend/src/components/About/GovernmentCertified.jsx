import React from 'react';
import { ShieldCheck, FileText, Landmark, Building2, Award, Medal, CreditCard, User, Users2, Star } from 'lucide-react';

const CERTIFICATIONS = [
  {
    title: 'MSME (UDYAM)',
    desc: 'Registered under the Ministry of MSME, Government of India. Supporting small and medium enterprises for growth and opportunities.',
    TopIcon: Landmark,
    BottomIcon: ShieldCheck,
  },
  {
    title: 'GST',
    desc: 'Goods & Services Tax registered. Committed to transparent and compliant business operations.',
    TopIcon: FileText,
    BottomIcon: FileText,
  },
  {
    title: 'MCA Registered',
    desc: 'Registered with the Ministry of Corporate Affairs. Operating as a compliant and recognized entity.',
    TopIcon: Building2,
    BottomIcon: Landmark,
  },
  {
    title: 'ISO 9001:2015',
    desc: 'Certified for Quality Management Systems. Dedicated to delivering excellence in every service.',
    TopIcon: Award,
    BottomIcon: Medal,
    gold: true,
  },
  {
    title: 'PAN Card',
    desc: 'Permanent Account Number (PAN) registered with the Income Tax Department.',
    TopIcon: CreditCard,
    BottomIcon: User,
  },
];

/* Simple decorative laurel branch, mirrored via CSS scale-x for the right side */
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
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background image + dark navy overlay */}
      <div
        className="absolute inset-0 bg-slate-900 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,12,32,0.55), rgba(6,12,32,0.65)), url(/static/img/govt-certified-bg.png)',
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-transparent to-transparent pointer-events-none z-0"></div>

      {/* Subtle dot-grid texture for a techy, premium feel */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-blue-500/15 blur-[130px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-indigo-500/15 blur-[130px] rounded-full pointer-events-none z-0"></div>

      {/* Floating accent particles */}
      <span className="absolute top-16 left-[8%] w-2 h-2 rounded-full bg-blue-300/70 shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-24 left-[4%] w-2.5 h-2.5 rounded-full bg-sky-300/60 shadow-[0_0_10px_rgba(125,211,252,0.7)] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[3%] w-1.5 h-1.5 rounded-full bg-blue-200/70 shadow-[0_0_8px_rgba(191,219,254,0.8)] animate-float pointer-events-none z-0"></span>

      {/* Decorative giant shield-check, top right */}
      <div className="hidden lg:flex absolute top-8 right-10 items-center justify-center w-40 h-40 pointer-events-none opacity-90">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl"></div>
        <ShieldCheck className="w-28 h-28 text-blue-300 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]" strokeWidth={1.5} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 mb-5 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" strokeWidth={2.5} />
            <span className="text-[10px] font-black tracking-[0.25em] text-blue-200 uppercase">100% Verified &amp; Compliant</span>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-3 mb-4 text-blue-400">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-blue-400/50"></span>
            <Star className="w-3 h-3" fill="currentColor" strokeWidth={0} />
            <Star className="w-4 h-4 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" fill="currentColor" strokeWidth={0} />
            <Star className="w-3 h-3" fill="currentColor" strokeWidth={0} />
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-blue-400/50"></span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <Laurel className="hidden sm:block w-8 h-24 text-blue-400/50 -scale-x-100" />
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-wider drop-shadow-[0_2px_20px_rgba(59,130,246,0.35)]">
              GOVERNMENT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400 block sm:inline">
                CERTIFIED
              </span>
            </h2>
            <Laurel className="hidden sm:block w-8 h-24 text-blue-400/50" />
          </div>

          {/* Divider with icon */}
          <div className="flex items-center justify-center gap-3 my-5">
            <span className="w-16 sm:w-28 h-px bg-gradient-to-r from-transparent to-blue-400/40"></span>
            <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
              <Landmark className="w-4 h-4 text-blue-300" strokeWidth={2} />
            </div>
            <span className="w-16 sm:w-28 h-px bg-gradient-to-l from-transparent to-blue-400/40"></span>
          </div>

          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            Zarni Skills is registered with trusted Government authorities and follows the highest standards of compliance and transparency.
          </p>
        </div>

        {/* Certification badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {CERTIFICATIONS.map((cert, idx) => (
            <div
              key={idx}
              className={`group relative bg-white rounded-2xl p-5 md:p-6 pt-6 text-center shadow-[0_15px_45px_rgba(0,0,0,0.35)] hover:-translate-y-2 transition-all duration-300 overflow-hidden ${
                cert.gold ? 'hover:shadow-[0_20px_50px_rgba(245,158,11,0.35)]' : 'hover:shadow-[0_20px_50px_rgba(37,99,235,0.35)]'
              }`}
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${cert.gold ? 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300' : 'bg-gradient-to-r from-blue-400 via-primary to-indigo-500'}`}></div>

              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-full border-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
                  cert.gold ? 'border-amber-200 bg-amber-50/70' : 'border-blue-100 bg-blue-50/70'
                }`}
              >
                <cert.TopIcon className={`w-6 h-6 ${cert.gold ? 'text-amber-500' : 'text-blue-600'}`} strokeWidth={1.8} />
              </div>
              <h3 className={`font-black text-xs md:text-sm uppercase tracking-wide mb-2 ${cert.gold ? 'text-amber-600' : 'text-blue-700'}`}>
                {cert.title}
              </h3>
              <div className={`w-8 h-[2px] mx-auto mb-2 ${cert.gold ? 'bg-amber-200' : 'bg-blue-200'}`}></div>
              <p className="text-slate-500 text-[11px] leading-relaxed">{cert.desc}</p>
              <div className={`mt-4 w-7 h-7 mx-auto rounded-full flex items-center justify-center shadow-md ${cert.gold ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'}`}>
                <cert.BottomIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-10 relative overflow-hidden bg-white/[0.06] border border-white/10 rounded-2xl px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/20 border border-blue-400/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-300" strokeWidth={2} />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">Your Trust. Our Responsibility.</div>
              <div className="text-slate-400 text-xs">We are committed to legal compliance, quality service, and building a better future with every skill we deliver.</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/20 border border-blue-400/20 flex items-center justify-center shrink-0">
              <Users2 className="w-5 h-5 text-blue-300" strokeWidth={2} />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">Building Skills. Building Futures.</div>
              <div className="text-blue-300 text-xs font-semibold">Together We Rise!</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
