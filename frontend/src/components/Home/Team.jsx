import React from 'react';
import { Users, Mail, GraduationCap, BadgeCheck, Star } from 'lucide-react';

const TEAM = [
  { name: "Suriya Yadav", role: "CEO & Founder", badge: "Founder", imgFile: "/static/img/team/Suriya_Yadav _CEO_FOUNDER.webp", color: "#3b82f6", bio: "Visionary leader with a passion for empowering learners worldwide." },
  { name: "Karan Yadav", role: "COO & Co-Founder", badge: "Co-Founder", imgFile: "/static/img/team/Karan_Yadav_COO_CO_Founder.webp", color: "#f59e0b", bio: "Driving operations and building impactful learning experiences." },
  { name: "Ajay Yadav", role: "Director", badge: "Director", imgFile: "/static/img/team/Ajay_Yadav_Director.webp", color: "#10b981", bio: "Strategic thinker overseeing growth and long-term vision." },
  { name: "Shailendra Yadav", role: "Manager", badge: "Manager", imgFile: "/static/img/team/Shailendra_Yadav_Manager.webp", color: "#8b5cf6", bio: "Ensuring smooth management and delivering excellence every day." },
  { name: "Tarun Prajapati", role: "Distributor", badge: "Distributor", imgFile: "/static/img/team/Tarun_Prajapati_Distributor.webp", color: "#06b6d4", bio: "Expanding our reach and connecting learners across regions." }
];

const STATS = [
  { value: "50+", label: "Expert Mentors", sub: "Industry leaders & professionals", color: "#3b82f6", Icon: Users },
  { value: "10K+", label: "Students Guided", sub: "Towards their dream careers", color: "#f59e0b", Icon: GraduationCap },
  { value: "95%", label: "Success Rate", sub: "Students achieve their goals", color: "#10b981", Icon: BadgeCheck },
  { value: "4.8/5", label: "Learner Rating", sub: "Trusted by thousands", color: "#f59e0b", Icon: Star },
];

export default function Team({ showStats = true }) {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50" id="team">

      {/* Background artwork */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0" style={{ backgroundImage: 'url(/static/img/bgimage.png)' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Users className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            Our Leadership
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Meet Our Expert{' '}
            <span className="relative inline-block text-primary">
              Team
              <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C20 2 40 1 60 3C80 5 100 4 118 2" stroke="#2b80f0" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Connect with industry visionaries and expert mentors dedicated to accelerating your growth.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {TEAM.map((m, idx) => (
            <div key={idx} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-slate-100/80 hover:shadow-[0_16px_40px_rgba(43,128,240,0.14)] hover:-translate-y-1.5 transition-all duration-400">

              {/* Photo block */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src={m.imgFile}
                  alt={m.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-600 group-hover:scale-[1.04]"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider shadow-md" style={{ backgroundColor: m.color }}>
                  {m.badge}
                </div>
              </div>

              {/* Info block */}
              <div className="flex flex-col flex-1 p-4 pt-3.5 gap-1.5">
                <h3 className="text-[15px] font-black text-slate-900 leading-tight">{m.name}</h3>
                <p className="text-[12px] font-bold" style={{ color: m.color }}>{m.role}</p>
                <div className="w-8 h-[2px] rounded-full mt-0.5 mb-1" style={{ backgroundColor: m.color }}></div>
                <p className="text-slate-400 text-[11px] leading-snug flex-1">{m.bio}</p>

                {/* Social icons */}
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-slate-100">
                  <a href="#" className="w-8 h-8 rounded-full bg-white hover:bg-primary hover:text-white flex items-center justify-center text-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white hover:bg-sky-500 hover:text-white flex items-center justify-center text-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white hover:bg-pink-500 hover:text-white flex items-center justify-center text-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white hover:bg-primary hover:text-white flex items-center justify-center text-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Stats Bar */}
        {showStats && (
          <div className="mt-14 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 overflow-hidden">
            {STATS.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-5 group hover:bg-slate-50 transition-colors duration-200">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}1a` }}>
                  <s.Icon className="w-5 h-5" stroke={s.color} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 leading-none mb-0.5">{s.value}</div>
                  <div className="text-[12px] font-bold leading-tight" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
