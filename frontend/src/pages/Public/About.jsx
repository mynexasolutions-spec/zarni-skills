import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandsMarquee from '../../components/Home/BrandsMarquee';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useInView from '../../hooks/useInView';
import useTilt from '../../hooks/useTilt';
import api from '../../utils/api';
import { Users, GraduationCap, CheckCircle2, Star, Zap, Users2, Clock, Quote, BookOpen, Target, TrendingUp, FileText, ArrowRight, Sparkles, ChevronRight, Flame, Rocket, Award, ShieldCheck, Heart } from 'lucide-react';

const SKILLS_TICKER = ['Video Editing', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'Voice Over', 'Freelancing', 'Personal Branding', 'Affiliate Growth'];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
];

function MagneticLink({ children, className = '', strength = 16, ...props }) {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--mx', `${(x * strength).toFixed(1)}px`);
    el.style.setProperty('--my', `${(y * strength).toFixed(1)}px`);
  };
  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mx', '0px');
    el.style.setProperty('--my', '0px');
  };
  return (
    <Link
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`${className} [transform:translate(var(--mx,0px),var(--my,0px))] transition-transform duration-200 ease-out`}
      {...props}
    >
      {children}
    </Link>
  );
}

const STATS = [
  { value: 50, suffix: "+", label: "Expert Mentors", sub: "Industry leaders & professionals", color: "#3b82f6", Icon: Users },
  { value: 10, suffix: "K+", label: "Students Guided", sub: "Towards high-income careers", color: "#6366f1", Icon: GraduationCap },
  { value: 95, suffix: "%", label: "Success Rate", sub: "Students achieve income goals", color: "#10b981", Icon: CheckCircle2 },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Learner Rating", sub: "Trusted by active learners", color: "#f59e0b", Icon: Star },
];

function RevealUnderline() {
  const [ref, inView] = useInView(0.5);
  return (
    <div ref={ref} className="w-20 h-1 mx-auto rounded-full bg-slate-100 overflow-hidden mt-3">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 transition-transform duration-700 ease-out"
        style={{ transformOrigin: 'left', transform: inView ? 'scaleX(1)' : 'scaleX(0)' }}
      ></div>
    </div>
  );
}

function TiltStatCard({ stat, idx }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(6);
  return (
    <Reveal variant="scale-in" delay={idx * 100}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 sm:p-6 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.18)] hover:border-blue-400 transition-all duration-500 [transform:perspective(800px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
          style={{ background: `radial-gradient(220px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(59,130,246,0.15), transparent 70%)` }}
        ></span>
        <span
          className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
        ></span>
        <div className="relative z-20 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-md" style={{ backgroundColor: `${stat.color}15` }}>
            <stat.Icon className="w-6 h-6" stroke={stat.color} strokeWidth={2.5} />
          </div>
          <div>
            <AnimatedNumber
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals || 0}
              duration={1500}
              className="block text-2xl sm:text-3xl font-heading font-black text-slate-900 leading-none mb-1 tracking-tight"
            />
            <div className="text-xs font-black uppercase tracking-wider" style={{ color: stat.color }}>{stat.label}</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5">{stat.sub}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function TiltBoxCard({ box, idx }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  return (
    <Reveal variant="fade-up" delay={idx * 100}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative overflow-hidden bg-white border border-slate-200/90 p-6 sm:p-8 rounded-[2.25rem] shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_55px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-all duration-500 group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(260px circle at var(--glare-x,50%) var(--glare-y,50%), ${box.color}1f, transparent 70%)` }}
        ></span>
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 shadow-md group-hover:-rotate-6 group-hover:scale-110"
          style={{ backgroundColor: `${box.color}15`, color: box.color }}
        >
          <box.Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <h3 className="relative text-xl font-heading font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
          {box.title}
        </h3>
        <p className="relative text-slate-600 text-sm font-medium leading-relaxed">{box.desc}</p>
      </div>
    </Reveal>
  );
}

const BOXES = [
  { title: "Practitioner Led", desc: "Our courses are created by active industry experts who practice what they teach daily.", color: "#3b82f6", Icon: GraduationCap },
  { title: "Rapid Growth", desc: "We focus on high-impact, practical frameworks engineered for immediate earning power.", color: "#f59e0b", Icon: Zap },
  { title: "Community Driven", desc: "Join a vibrant network of thousands of like-minded learners scaling their income together.", color: "#10b981", Icon: Users2 },
  { title: "Lifetime Access", desc: "Master skills at your own pace with lifetime updates and perpetual course access.", color: "#6366f1", Icon: Clock },
];

export default function About() {
  const heroRef = useRef(null);
  const [instructorsList, setInstructorsList] = useState([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await api.get('/instructors');
        const list = res.data.instructors || [];
        setInstructorsList(list);
      } catch (err) {
        console.error('Error fetching instructors:', err);
      }
    };
    fetchInstructors();
  }, []);

  const onHeroMouseMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen text-slate-800 -mt-24 pt-24 overflow-hidden relative selection:bg-blue-500 selection:text-white">

      {/* Animated Floating Neon Spheres */}
      <div className="absolute top-[15%] left-[8%] w-[550px] h-[550px] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-[25%] right-[5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2.5s' }}></div>

      {/* Floating Animated Particles */}
      <span className="absolute top-28 left-[14%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[10%] w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute bottom-1/3 left-[6%] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-float pointer-events-none z-0"></span>

      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '36px 36px' }}>
      </div>

      {/* HERO HEADER */}
      <section
        ref={heroRef}
        onMouseMove={onHeroMouseMove}
        className="group relative py-20 md:py-28 flex items-center justify-center z-10 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto w-full">
            
            <Reveal variant="scale-in" duration={600}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
                <span>The Story Behind Zarni Skills</span>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={150}>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                Empowering{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                  The Next Generation
                </span>
              </h1>
            </Reveal>

            <Reveal variant="fade-up" delay={250}>
              <p className="text-slate-600 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-9 leading-relaxed">
                We turn ambition into income — equipping learners with practical skills that pay, backed by live mentorship and a community that grows together.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={350}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <MagneticLink to="/register" strength={14} className="group relative w-full sm:w-auto px-9 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/25 active:scale-95 text-center inline-flex items-center justify-center gap-2">
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                </MagneticLink>
                <MagneticLink to="/packages" strength={14} className="w-full sm:w-auto px-9 py-4 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs uppercase tracking-widest rounded-full border border-slate-200 shadow-sm active:scale-95 text-center">
                  Explore Packages
                </MagneticLink>
              </div>
            </Reveal>

            {/* Social proof pill */}
            <Reveal variant="fade-up" delay={450}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-full pl-2.5 pr-5 py-2">
                  <div className="flex -space-x-2">
                    {DEFAULT_AVATARS.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`Learner ${i + 1}`}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover transition-transform duration-300 hover:scale-125 hover:z-20"
                      />
                    ))}
                  </div>
                  <span className="text-slate-700 text-xs font-black">
                    Joined by <span className="text-blue-600 font-black">10,000+</span> active learners
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-full pl-3.5 pr-4 py-2">
                  <div className="flex -space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-current" strokeWidth={0} />
                    ))}
                  </div>
                  <span className="text-slate-700 text-xs font-black">4.9/5 Faculty Rating</span>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* SKEWED SKILLS TICKER RIBBON */}
      <section className="relative z-10 py-1.5 overflow-hidden">
        <div className="-rotate-1 sm:-rotate-2 w-[120%] -ml-[10%] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 shadow-lg shadow-blue-500/20">
          <div className="flex whitespace-nowrap animate-marquee hover-pause py-3" style={{ animationDuration: '32s' }}>
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center shrink-0">
                {SKILLS_TICKER.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-2 mx-6 text-white font-black text-xs sm:text-sm uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-white/60 shrink-0" strokeWidth={2.5} />
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WELCOME / PLATFORM STORY */}
      <section className="relative py-20 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <Reveal variant="fade-up">
            <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_15px_45px_rgba(0,0,0,0.03)] space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                <FileText className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                About Our Platform
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Welcome to <span className="text-blue-600">Zarni Skills.</span>
              </h2>
              <div className="space-y-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed border-l-4 border-blue-500 pl-4 sm:pl-6">
                <p>Welcome to Zarni Skills, where you can learn in-demand skills online and turn what you learn into real income.</p>
                <p>We started Zarni Skills because we believe <span className="font-black text-slate-900">learning should lead somewhere</span> — not just a certificate, but a skill you can actually use and a real way to earn from it.</p>
                <p>We offer courses in freelancing skills like video editing, graphic design, content writing, voice over, and digital marketing, taught in a simple, practical way. Alongside learning, our platform also rewards you for growing your own network — refer others, build your team, and earn commissions as they learn and grow too.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-10 pt-4 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat, idx) => (
              <TiltStatCard key={idx} stat={stat} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* BRAND MARQUEE */}
      <BrandsMarquee />

      {/* WHY ZARNI SKILLS */}
      <section className="relative py-24 border-t border-slate-200/60 bg-gradient-to-b from-blue-50/40 via-white to-slate-50 z-10 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <Reveal variant="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black tracking-[0.25em] uppercase mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
              The Difference
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 animate-gradient-x">Zarni Skills?</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-xl mx-auto mt-4 leading-relaxed">
              We replace outdated theoretical degrees with high-impact, real-world skill systems built for rapid income generation.
            </p>
            <RevealUnderline />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                title: "Practitioner Led",
                subtitle: "Active Experts",
                desc: "Created exclusively by veterans who practice what they teach daily in top global firms.",
                color: "#3b82f6",
                Icon: GraduationCap,
                tag: "Real Experience",
              },
              {
                title: "Rapid Earning",
                subtitle: "Fast Frameworks",
                desc: "Engineered for speed — acquire actionable skills and start monetizing in weeks, not years.",
                color: "#f59e0b",
                Icon: Zap,
                tag: "Fast Track",
              },
              {
                title: "Vibrant Community",
                subtitle: "Network & Scale",
                desc: "Connect with 10,000+ ambitious learners, collaborate on projects, and build long-term teams.",
                color: "#10b981",
                Icon: Users2,
                tag: "10K+ Peers",
              },
              {
                title: "Lifetime Access",
                subtitle: "Forever Mine",
                desc: "Enjoy lifetime course access with perpetual updates as industry trends and tools evolve.",
                color: "#6366f1",
                Icon: Clock,
                tag: "Free Updates",
              },
            ].map((box, idx) => (
              <Reveal key={idx} variant="scale-in" delay={idx * 100}>
                <div className="group relative bg-white border border-slate-200/90 rounded-[2.25rem] p-7 sm:p-8 overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.18)] hover:border-blue-300 transition-all duration-500 flex flex-col justify-between h-full">
                  {/* Subtle Shimmer Beam */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-slate-100/70 to-transparent"></span>
                  </span>

                  <div>
                    {/* Badge Pill */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 border border-slate-200/80 text-slate-700 shadow-sm">
                        {box.tag}
                      </span>
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: box.color }}></span>
                    </div>

                    {/* Glowing Icon Halo */}
                    <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl transition-transform duration-500 group-hover:scale-125" style={{ backgroundColor: box.color }}></div>
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                        style={{ backgroundColor: box.color }}
                      >
                        <box.Icon className="w-8 h-8" strokeWidth={2.2} />
                      </div>
                    </div>

                    {/* Titles */}
                    <h3 className="font-heading font-black text-slate-900 text-xl mb-1 tracking-tight group-hover:text-blue-600 transition-colors">
                      {box.title}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: box.color }}>
                      {box.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {box.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-1.5 text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 z-10 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal variant="fade-up" className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black tracking-[0.25em] uppercase mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
              The Process
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-xl mx-auto mb-4 leading-relaxed">
              From absolute beginner to high-income earner — a structured 3-step engine built to deliver real results.
            </p>
            <RevealUnderline />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: '01',
                t: 'Learn',
                sub: 'Master High-Income Skills',
                d: 'Learn directly from real-world practitioners with practical courses built for immediate implementation.',
                Icon: BookOpen,
                color: 'from-blue-600 to-indigo-600',
                tagColor: 'bg-blue-50 text-blue-700 border-blue-100',
                perks: ['Expert Mentorship', 'Actionable Modules'],
              },
              {
                n: '02',
                t: 'Practice',
                sub: 'Build Real Portfolio',
                d: 'Apply concepts with real projects, community feedback, and live mentorship guidance.',
                Icon: Target,
                color: 'from-indigo-600 to-purple-600',
                tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                perks: ['Live Support', 'Hands-On Projects'],
              },
              {
                n: '03',
                t: 'Earn',
                sub: 'Monetize & Scale',
                d: 'Turn your new skill set into real income through freelancing, client jobs, or direct referral commissions.',
                Icon: TrendingUp,
                color: 'from-emerald-500 to-teal-600',
                tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                perks: ['Instant Payouts', 'Direct Referrals'],
              },
            ].map((step, idx) => (
              <Reveal key={step.n} variant="scale-in" delay={idx * 140} className="group relative">
                <div className="relative z-10 h-full bg-white border border-slate-200/90 rounded-[2.25rem] p-7 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)] hover:border-blue-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${step.tagColor}`}>
                        STEP {step.n}
                      </span>
                      <span className="text-3xl font-black text-slate-200 font-heading tracking-tight">
                        {step.n}
                      </span>
                    </div>

                    <div className="relative w-16 h-16 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                        <step.Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-heading font-black text-slate-900 mb-1 tracking-tight group-hover:text-blue-600 transition-colors">
                      {step.t}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                      {step.sub}
                    </p>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                      {step.d}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {step.perks.map((perk, pIdx) => (
                      <span key={pIdx} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2.5} />
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION CARD WITH CLICKABLE MENTOR TEAM */}
      <section className="relative py-24 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal variant="scale-in" duration={800} className="relative rounded-[2.5rem] bg-gradient-to-br from-white via-blue-50/50 to-slate-50 border border-slate-200/90 p-8 sm:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>
            
            <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 mb-8 text-blue-600 shadow-sm">
              <Quote className="w-8 h-8" strokeWidth={2} />
            </div>

            <h2 className="relative z-10 text-slate-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black leading-tight tracking-tight max-w-4xl mx-auto mb-10">
              "Our mission is simple: <span className="text-blue-600">turn ambition into income.</span> Not through empty promises — through real skills, real mentorship, and a community that grows together."
            </h2>

            {/* Clickable Instructor Profiles */}
            <div className="relative z-10 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <div className="flex -space-x-2">
                {instructorsList.length > 0 ? (
                  instructorsList.slice(0, 5).map((inst, i) => (
                    <Link
                      key={inst.id || i}
                      to={`/instructor/${inst.slug}`}
                      title={`${inst.name} — View Profile`}
                      className="relative group/avatar"
                    >
                      <img
                        src={inst.photo_display_url || DEFAULT_AVATARS[i % DEFAULT_AVATARS.length]}
                        alt={inst.name || `Mentor ${i + 1}`}
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATARS[i % DEFAULT_AVATARS.length];
                        }}
                        className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md transition-transform duration-300 group-hover/avatar:scale-125 group-hover/avatar:z-20 group-hover/avatar:border-blue-500"
                      />
                    </Link>
                  ))
                ) : (
                  DEFAULT_AVATARS.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Mentor ${i + 1}`}
                      className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md transition-transform duration-300 hover:scale-125 hover:z-20"
                    />
                  ))
                )}
              </div>
              <span className="text-slate-800 text-xs font-black uppercase tracking-wider">Meet Team Zarni Mentors →</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal variant="scale-in" duration={800} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-12 sm:px-12 sm:py-16 text-center shadow-[0_25px_70px_rgba(15,23,42,0.4)]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black tracking-[0.25em] text-blue-200 uppercase mb-6">
              <Zap className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
              Your Future Starts Today
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Ready to Start Earning While You Learn?
            </h2>
            <p className="text-slate-300 text-base font-medium max-w-xl mx-auto mb-8">
              Join 10,000+ active students already building real, in-demand skills and income with Zarni Skills.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="w-full sm:w-auto px-9 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/25 transition-all text-center inline-flex items-center justify-center gap-2">
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-9 py-4 bg-white/10 hover:bg-white/15 text-white font-black text-xs uppercase tracking-widest rounded-full border border-white/20 transition-all text-center">
                Contact Support
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

