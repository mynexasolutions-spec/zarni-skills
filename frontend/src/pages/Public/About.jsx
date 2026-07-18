import React from 'react';
import { Link } from 'react-router-dom';
import BrandsMarquee from '../../components/Home/BrandsMarquee';
import SupportSystem from '../../components/About/SupportSystem';
import SmartFreelancing from '../../components/About/SmartFreelancing';
import TripAchievement from '../../components/About/TripAchievement';
import AchievementRewards from '../../components/About/AchievementRewards';
import GovernmentCertified from '../../components/About/GovernmentCertified';
import { Users, GraduationCap, CheckCircle2, Star, Zap, Users2, Clock, Quote, BookOpen, Target, TrendingUp } from 'lucide-react';

const STATS = [
  { value: "50+", label: "Expert Mentors", sub: "Industry leaders & professionals", color: "#3b82f6", Icon: Users },
  { value: "10K+", label: "Students Guided", sub: "Towards their dream careers", color: "#f59e0b", Icon: GraduationCap },
  { value: "95%", label: "Success Rate", sub: "Students achieve their goals", color: "#10b981", Icon: CheckCircle2 },
  { value: "4.8/5", label: "Learner Rating", sub: "Trusted by thousands", color: "#f59e0b", Icon: Star },
];

const BOXES = [
  { title: "Expert Design", desc: "Our courses are designed by industry veterans who have already achieved what they teach.", color: "#3b82f6", Icon: GraduationCap },
  { title: "Rapid Growth", desc: "We focus on actionable strategies that deliver results in weeks, not years.", color: "#f59e0b", Icon: Zap },
  { title: "Community Led", desc: "Join a network of thousands of like-minded individuals scaling their careers together.", color: "#10b981", Icon: Users2 },
  { title: "Lifetime Access", desc: "Learn at your own pace with courses and updates you can revisit whenever you need them.", color: "#8b5cf6", Icon: Clock },
];

const AVATAR_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 -mt-24 pt-24 overflow-hidden relative selection:bg-blue-500 selection:text-white">

      {/* Ambient background glow elements */}
      <div className="absolute top-[20%] left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[25%] right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[130px] rounded-full pointer-events-none z-0"></div>

      {/* Soft light grid pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.25] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* 1. HERO HEADER */}
      <section className="relative py-20 md:py-28 flex items-center justify-center border-b border-slate-200/60 z-10">
        <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0"></div>
        <div className="absolute -left-32 top-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDirection: 'reverse' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="text-center px-4 max-w-4xl mx-auto w-full">
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4 shadow-sm">
              <span className="text-[10px] font-black tracking-[0.25em] text-blue-600 uppercase">The Story Behind Zarni Skills</span>
            </div>
            <h1 className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6" style={{ animationDelay: '80ms' }}>
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">The Next</span> Generation
            </h1>
            <p className="animate-fade-in-up text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8" style={{ animationDelay: '160ms' }}>
              We're on a mission to turn ambition into income — equipping learners with skills that pay, not just certificates that sit in a drawer.
            </p>
            <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: '240ms' }}>
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 text-center">
                Get Started Free
              </Link>
              <Link to="/packages" className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 text-center">
                Explore Packages
              </Link>
            </div>

            {/* Social proof pill */}
            <div className="animate-fade-in-up mt-10 inline-flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-full pl-2 pr-5 py-2" style={{ animationDelay: '320ms' }}>
              <div className="flex -space-x-2.5">
                {AVATAR_COLORS.map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: c }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-slate-600 text-xs font-bold">
                Joined by <span className="text-slate-900">10,000+</span> learners this year
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WIDE STORY LINE */}
      <section className="relative py-16 z-10">
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="w-full px-6 md:px-12 lg:px-24">
            <p className="text-slate-900 text-base sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-wide leading-relaxed text-center lg:text-justify max-w-7xl mx-auto">
              Zarni Skills was founded with a single mission: to bridge the gap between academic learning and real-world success. In a rapidly evolving digital economy, traditional degrees are no longer enough. We empower our students with high-income skills that are in demand right now. Beyond education — we are building tomorrow's world leaders.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TRUST STATS BAR */}
      <section className="relative z-10 pb-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden">
            {STATS.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-6 group hover:bg-slate-50 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${stat.color}1a` }}>
                  <stat.Icon className="w-5 h-5" stroke={stat.color} strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                  <div className="text-[12px] font-bold leading-tight" style={{ color: stat.color }}>{stat.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3a. GOVERNMENT CERTIFIED */}
      <GovernmentCertified />

      {/* 3b. TRUSTED BY LOGOS */}
      <BrandsMarquee />

      {/* 3c. SMART FREELANCING */}
      <SmartFreelancing />

      {/* 3d. TRIP ACHIEVEMENT */}
      <TripAchievement />

      {/* 3e. ACHIEVEMENT REWARDS */}
      <AchievementRewards />

      {/* 4. WHY ZARNI SKILLS & 4 BOXES */}
      <section className="relative py-24 border-t border-slate-200/60 bg-white/20 z-10">
        <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none z-0"></div>
        <div className="absolute -left-32 top-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDirection: 'reverse' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-wider">
              Why Zarni Skills?
            </h2>
            <div className="w-16 h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {BOXES.map((box, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(59,130,246,0.15)] hover:border-blue-200 transition-all duration-300 group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-sm group-hover:-rotate-6 group-hover:scale-110"
                  style={{ backgroundColor: `${box.color}1a`, color: box.color }}
                >
                  <box.Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-3 uppercase tracking-wider transition-colors" style={{ '--box-color': box.color }}>
                  <span className="group-hover:text-[var(--box-color)] transition-colors">{box.title}</span>
                </h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{box.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4b. HOW IT WORKS */}
      <section className="relative py-24 z-10">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-wider">
              How It Works
            </h2>
            <div className="w-16 h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-0 border-t-2 border-dashed border-blue-200"></div>

            {[
              { n: '01', t: 'Learn', d: 'Master in-demand skills through expert-led courses built for the real world.', Icon: BookOpen },
              { n: '02', t: 'Practice', d: 'Apply what you learn with mentorship, community support, and real projects.', Icon: Target },
              { n: '03', t: 'Earn', d: 'Turn your new skills into income — through jobs, freelancing, or referrals.', Icon: TrendingUp },
            ].map(step => (
              <div key={step.n} className="group relative text-center">
                <div className="relative z-10 w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-90 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-3">
                    <step.Icon className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
                    {step.n}
                  </div>
                </div>
                <h3 className="text-lg font-heading font-extrabold text-slate-900 mb-2">{step.t}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[220px] mx-auto">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4c. SUPPORT SYSTEM */}
      <SupportSystem />

      {/* 5. MISSION QUOTE */}
      <section className="relative py-24 z-10">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-[2.5rem] px-8 py-16 md:px-16 md:py-20 text-center overflow-hidden shadow-[0_25px_70px_-10px_rgba(37,99,235,0.45)] ring-1 ring-white/10">
            {/* Dot-grid texture */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Giant decorative quote glyph */}
            <Quote className="hidden sm:block absolute -top-6 left-8 w-40 h-40 text-white/[0.06] pointer-events-none" fill="currentColor" strokeWidth={0} />

            {/* Floating accent particles */}
            <span className="absolute top-10 left-[12%] w-2 h-2 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.6)] animate-float pointer-events-none"></span>
            <span className="absolute bottom-14 right-[10%] w-2.5 h-2.5 rounded-full bg-sky-200/50 shadow-[0_0_10px_rgba(186,230,253,0.6)] animate-float-delayed pointer-events-none"></span>

            <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/15 mb-7 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <Quote className="w-7 h-7 text-white" fill="currentColor" strokeWidth={0} />
            </div>

            <p className="relative z-10 text-white text-xl sm:text-2xl md:text-3xl font-bold leading-snug max-w-3xl mx-auto">
              Our mission is simple: turn ambition into income. Not through empty promises — through real skills, real mentorship, and a community that grows together.
            </p>

            <div className="relative z-10 mt-9 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15">
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-blue-600" style={{ backgroundColor: c }}></div>
                ))}
              </div>
              <span className="text-blue-100 text-xs font-black uppercase tracking-[0.18em]">Team Zarni Skills</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="relative py-24 z-10">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-8 py-16 md:px-16 md:py-20 text-center shadow-[0_25px_70px_-15px_rgba(15,23,42,0.5)] ring-1 ring-white/10">
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
            </div>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDirection: 'reverse' }}></div>

            {/* Floating accent particles */}
            <span className="absolute top-12 left-[15%] w-2 h-2 rounded-full bg-blue-300/60 shadow-[0_0_10px_rgba(147,197,253,0.7)] animate-float pointer-events-none"></span>
            <span className="absolute bottom-16 right-[12%] w-2.5 h-2.5 rounded-full bg-indigo-300/50 shadow-[0_0_10px_rgba(165,180,252,0.6)] animate-float-delayed pointer-events-none"></span>

            <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black tracking-[0.25em] text-blue-200 uppercase mb-6">
              <Zap className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
              Your Future Starts Today
            </div>
            <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Ready to Start Earning While You Learn?
            </h2>
            <p className="relative z-10 text-slate-300 text-base font-medium max-w-xl mx-auto mb-9">
              Join thousands of students already building real, in-demand skills — and real income — with Zarni Skills.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mb-9">
              <Link to="/register" className="group w-full sm:w-auto px-9 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-full shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-center inline-flex items-center justify-center gap-2">
                Create Your Free Account
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-9 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5 text-center">
                Contact Us
              </Link>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 border-t border-white/10">
              {['No credit card required', 'Cancel anytime', 'Instant access'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
