import React from 'react';
import { MonitorPlay, UserCog, Wrench, Users, Users2, Award, GraduationCap, Headphones, Heart } from 'lucide-react';
import useInView from '../../hooks/useInView';

// Positioned on a symmetric 7-point ellipse (cx 50, cy 45, rx 42, ry 36 — see
// the <ellipse> drawn below, which uses the exact same numbers) so every
// bubble sits precisely on the orbit line, not just near it.
const ORBIT_ITEMS = [
  { label1: 'Live', label2: 'Trainings', x: 50, y: 9, Icon: MonitorPlay },
  { label1: 'Manager', label2: 'Support', x: 83, y: 23, Icon: UserCog },
  { label1: 'Tools', label2: '', x: 91, y: 53, Icon: Wrench },
  { label1: 'Team', label2: 'Support', x: 68, y: 77, Icon: Users },
  { label1: 'Community', label2: '', x: 32, y: 77, Icon: Users2 },
  { label1: 'Master', label2: 'Class', x: 9, y: 53, Icon: Award },
  { label1: 'Mentorship', label2: 'Support', x: 17, y: 23, Icon: GraduationCap },
];

// Both the ring wrapper (below) and this counter-rotation use the same 50s
// duration in opposite directions, so icons travel around the orbit while
// their own icon/label stay upright instead of tumbling.
function OrbitBubble({ item, idx, inView }) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-700 ease-out ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      style={{ top: `${item.y}%`, left: `${item.x}%`, transitionDelay: `${idx * 90}ms` }}
    >
      {/* Counter-rotates against the ring's spin so the icon/label stay upright while orbiting */}
      <div className="flex flex-col items-center gap-2 group animate-[spin_50s_linear_infinite_reverse]">
        {/* Soft halo glow behind the bubble */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/15 blur-xl pointer-events-none group-hover:bg-primary/25 transition-colors duration-300"></div>
        <div className="relative w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-white shadow-[0_10px_30px_-8px_rgba(43,128,240,0.35)] border border-white flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_14px_36px_-8px_rgba(43,128,240,0.5)]">
          <item.Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.6} />
        </div>
        <p className="relative text-center text-[10px] sm:text-[11px] font-black uppercase tracking-wide leading-tight whitespace-nowrap min-h-[2.4em] flex flex-col justify-start">
          <span className="text-primary">{item.label1}</span>
          {item.label2 && <span className="text-slate-900">{item.label2}</span>}
        </p>
      </div>
    </div>
  );
}

export default function SupportSystem() {
  const [sectionRef, inView] = useInView(0.15);

  const revealClass = `transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-24 overflow-hidden bg-slate-50">
      {/* Background artwork — 100% responsive across mobile and desktop */}
      <div className="absolute inset-0 bg-cover bg-center sm:bg-cover bg-no-repeat pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>
      {/* Soft blue ambient wash to match the reference's glowy feel */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(43,128,240,0.08) 0%, transparent 70%)' }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-14 sm:mb-16 ${revealClass}`}>
          <h2 className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.2em] leading-tight text-slate-800">
            Our Complete
          </h2>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight mt-1">
            <span className="text-primary">Support</span> <span className="text-slate-900">System</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-3">
            We Are With You At Every Step Of Your Journey
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          </div>
        </div>

        {/* Orbit layout — 100% responsive layout */}
        <div className="relative mx-auto w-full max-w-[92vw] sm:max-w-[580px] md:max-w-[620px]" style={{ aspectRatio: '1 / 1.15' }}>

          {/* Soft radial glow behind the photo, in place of a hard circular frame */}
          <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full bg-primary/15 blur-[60px] pointer-events-none animate-pulse"></div>
          <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] aspect-square rounded-full bg-white/80 blur-[10px] pointer-events-none"></div>

          {/* Floating accent dots for extra sparkle */}
          <span className="absolute top-[2%] left-[6%] w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-primary shadow-lg animate-float pointer-events-none"></span>
          <span className="absolute top-[46%] right-[1%] w-2 h-2 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-lg animate-float-delayed pointer-events-none"></span>
          <span className="absolute bottom-[8%] left-[2%] w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg animate-float pointer-events-none"></span>

          {/* Ground ripple rings under the photo */}
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[38%] h-[7%] rounded-[50%] border border-primary/20 pointer-events-none"></div>
          <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[52%] h-[9%] rounded-[50%] border border-primary/10 pointer-events-none"></div>

          {/* Center photo — 100% responsive scaling */}
          <div className={`absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56%] sm:w-[54%] h-[64%] sm:h-[62%] flex items-end justify-center pointer-events-none transition-all duration-700 ease-out ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <img
              src="/static/img/customersupportgirl.png"
              alt="Student support"
              className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(43,128,240,0.25)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Rotating ring — the dashed ellipse and all 7 icons spin together as one
              rigid unit (50s/revolution), so icons never drift off the line. */}
          <div
            className={`absolute inset-0 animate-[spin_50s_linear_infinite] transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}
            style={{ transformOrigin: '50% 45%' }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <ellipse
                cx="50" cy="45" rx="42" ry="36"
                fill="none"
                stroke="#2b80f0"
                strokeOpacity="0.45"
                strokeWidth="0.6"
                strokeDasharray="2.2 3"
                strokeLinecap="round"
                className="animate-dash-flow"
              />
            </svg>

            {ORBIT_ITEMS.map((item, idx) => (
              <OrbitBubble key={idx} item={item} idx={idx} inView={inView} />
            ))}
          </div>
        </div>

        {/* Bottom pill */}
        <div className={`mt-14 sm:mt-16 flex justify-center ${revealClass}`} style={{ transitionDelay: '400ms' }}>
          <div className="group inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(43,128,240,0.18)] rounded-full pl-4 pr-5 py-3 transition-shadow duration-300">
            <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              <Headphones className="w-[18px] h-[18px]" strokeWidth={2} />
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-semibold">
              We Don't Just Teach, <span className="text-primary font-black">We Support</span> You To Succeed.
            </p>
            <span className="relative flex items-center justify-center shrink-0 w-[18px] h-[18px]">
              <Heart className="absolute inset-0 w-full h-full text-primary/50 animate-ping" fill="currentColor" />
              <Heart className="relative w-[18px] h-[18px] text-primary" fill="currentColor" />
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
