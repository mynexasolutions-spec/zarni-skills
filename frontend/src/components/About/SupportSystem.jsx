import React from 'react';
import { MonitorPlay, UserCog, Wrench, Users, Users2, Award, GraduationCap, Headphones, Heart } from 'lucide-react';

// Positioned on a symmetric 7-point ring (evenly spaced, computed via trig)
// so every bubble sits cleanly on the orbit line instead of eyeballed coordinates.
// Coordinates are in the same 0-100 (x) / 0-120 (y) space as the connector SVG below.
const ORBIT_ITEMS = [
  { label1: 'Live', label2: 'Trainings', x: 50, y: 9, Icon: MonitorPlay },
  { label1: 'Manager', label2: 'Support', x: 83, y: 23, Icon: UserCog },
  { label1: 'Tools', label2: '', x: 91, y: 53, Icon: Wrench },
  { label1: 'Team', label2: 'Support', x: 68, y: 77, Icon: Users },
  { label1: 'Community', label2: '', x: 32, y: 77, Icon: Users2 },
  { label1: 'Master', label2: 'Class', x: 9, y: 53, Icon: Award },
  { label1: 'Mentorship', label2: 'Support', x: 17, y: 23, Icon: GraduationCap },
];

// Quadratic-curve control points bulging outward from center (50, 46) — draws a
// connected swirl chain between each adjacent pair of icons around the ring.
const CONNECTORS = [
  { from: 0, to: 1, cx: 74, cy: 2 },
  { from: 1, to: 2, cx: 96, cy: 36 },
  { from: 2, to: 3, cx: 87, cy: 70 },
  { from: 3, to: 4, cx: 50, cy: 90 },
  { from: 4, to: 5, cx: 13, cy: 70 },
  { from: 5, to: 6, cx: 4, cy: 36 },
  { from: 6, to: 0, cx: 27, cy: 2 },
];

function OrbitBubble({ item }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group z-10"
      style={{ top: `${item.y}%`, left: `${item.x}%` }}
    >
      <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-white shadow-[0_10px_30px_-8px_rgba(43,128,240,0.35)] border border-white flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_14px_36px_-8px_rgba(43,128,240,0.5)]">
        <item.Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.6} />
      </div>
      <p className="text-center text-[10px] sm:text-[11px] font-black uppercase tracking-wide leading-tight whitespace-nowrap min-h-[2.4em] flex flex-col justify-start">
        <span className="text-primary">{item.label1}</span>
        {item.label2 && <span className="text-slate-900">{item.label2}</span>}
      </p>
    </div>
  );
}

export default function SupportSystem() {
  return (
    <section className="relative py-24 overflow-hidden bg-slate-50">
      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-[0.2em] leading-tight text-slate-800">
            Our Complete
          </h2>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight mt-1">
            <span className="text-primary">Support</span> <span className="text-slate-900">System</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium mt-4">
            We Are With You At Every Step Of Your Journey
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          </div>
        </div>

        {/* Desktop orbit layout */}
        <div className="relative mx-auto hidden md:block" style={{ width: '100%', maxWidth: '620px', aspectRatio: '1 / 1.2' }}>

          {/* Soft radial glow behind the photo, in place of a hard circular frame */}
          <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full bg-primary/15 blur-[60px] pointer-events-none"></div>
          <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] aspect-square rounded-full bg-white/80 blur-[10px] pointer-events-none"></div>
          <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-full border border-primary/15 pointer-events-none"></div>

          {/* Floating accent dots for extra sparkle */}
          <span className="absolute top-[2%] left-[6%] w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-primary shadow-lg animate-float pointer-events-none"></span>
          <span className="absolute top-[46%] right-[1%] w-2 h-2 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-lg animate-float-delayed pointer-events-none"></span>
          <span className="absolute bottom-[8%] left-[2%] w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg animate-float pointer-events-none"></span>

          {/* Ground ripple rings under the photo */}
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[38%] h-[7%] rounded-[50%] border border-primary/20 pointer-events-none"></div>
          <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[52%] h-[9%] rounded-[50%] border border-primary/10 pointer-events-none"></div>

          {/* Connector chain — dotted swirl linking each adjacent icon */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 120" preserveAspectRatio="none">
            {CONNECTORS.map((c, idx) => {
              const from = ORBIT_ITEMS[c.from];
              const to = ORBIT_ITEMS[c.to];
              return (
                <path
                  key={idx}
                  d={`M ${from.x} ${from.y} Q ${c.cx} ${c.cy} ${to.x} ${to.y}`}
                  fill="none"
                  stroke="#2b80f0"
                  strokeOpacity="0.4"
                  strokeWidth="0.6"
                  strokeDasharray="2.2 3"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Center photo — shown as a natural cutout, not clipped into a hard circle */}
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[54%] h-[62%] flex items-end justify-center pointer-events-none">
            <img
              src="/static/img/customersupportgirl.png"
              alt="Student support"
              className="max-w-full max-h-full object-contain drop-shadow-[0_20px_30px_rgba(43,128,240,0.25)]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Orbit icons */}
          {ORBIT_ITEMS.map((item, idx) => (
            <OrbitBubble key={idx} item={item} />
          ))}
        </div>

        {/* Mobile / tablet fallback: center photo + grid */}
        <div className="md:hidden">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-[40px] pointer-events-none"></div>
            <img
              src="/static/img/customersupportgirl.png"
              alt="Student support"
              className="relative w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {ORBIT_ITEMS.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-white shadow-[0_10px_30px_-8px_rgba(43,128,240,0.35)] border border-white flex items-center justify-center text-primary">
                  <item.Icon className="w-6 h-6" strokeWidth={1.6} />
                </div>
                <p className="text-center text-[10px] font-black uppercase tracking-wide leading-tight">
                  <span className="text-primary">{item.label1}</span>
                  {item.label2 && <><br /><span className="text-slate-900">{item.label2}</span></>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom pill */}
        <div className="mt-16 flex justify-center">
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
