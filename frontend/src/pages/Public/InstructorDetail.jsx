import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import CourseCard from '../../components/Courses/CourseCard';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';
import useCountUp from '../../hooks/useCountUp';
import useInView from '../../hooks/useInView';
import { Sparkles, FileText, Trophy, GraduationCap, ArrowRight, Users, BookOpen, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, Zap, Flame, Rocket, Target } from 'lucide-react';

function StatTile({ icon: Icon, target, decimals = 0, suffix = '', label, color = "from-blue-600 to-indigo-600", idx }) {
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(6);
  const [inViewRef, inView] = useInView(0.2);
  const countValue = useCountUp(target, inView, decimals, 1600);

  return (
    <Reveal variant="scale-in" delay={idx * 120}>
      <div
        ref={(node) => {
          tiltRef.current = node;
          inViewRef.current = node;
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.18)] hover:border-blue-400 transition-all duration-500 flex items-center gap-5 [transform:perspective(800px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform overflow-hidden"
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
          style={{ background: `radial-gradient(220px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(59,130,246,0.15), transparent 70%)` }}
        ></span>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shrink-0 z-20`}>
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <div className="z-20">
          <p className="text-2xl sm:text-3xl font-heading font-black text-slate-900 leading-none tracking-tight">
            {countValue}{suffix}
          </p>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
      </div>
    </Reveal>
  );
}

export default function InstructorDetail() {
  const { slug } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/instructors/${slug}`)
      .then(res => {
        setInstructor(res.data.instructor);
        setCourses(res.data.courses || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unlocking Mentor Details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !instructor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-24 pt-24">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <Star className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 mb-2">Mentor Profile Not Found</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">The requested instructor profile is unavailable or relocated.</p>
          <Link to="/courses" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-500/25 transition-transform active:scale-95">
            Explore Courses <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  const initials = instructor.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const achievementLines = (instructor.achievements || '').split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 -mt-24 pt-24 pb-24 relative overflow-hidden">
      
      {/* Animated Floating Neon Spheres */}
      <div className="absolute top-[12%] left-[10%] w-[500px] h-[500px] bg-blue-400/10 blur-[140px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[8%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2.5s' }}></div>

      {/* Floating particles */}
      <span className="absolute top-28 left-[15%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[12%] w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute bottom-1/3 left-[8%] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-float pointer-events-none z-0"></span>

      {/* Tech Grid Mask Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '36px 36px' }}>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Breadcrumb Navigation */}
        <nav className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 flex-wrap uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">{instructor.name}</span>
        </nav>

        {/* HERO CARD (Ultra-Sexy Animated Light Glass) */}
        <Reveal variant="scale-in" duration={800}>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-blue-50/50 to-slate-50 border border-slate-200/90 p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] mb-8">
            {/* Top Shimmer Sweep Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
              
              {/* Profile Photo Container with Animated Neon Ring */}
              <div className="relative shrink-0 group">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 opacity-70 blur-md animate-[spin_12s_linear_infinite] group-hover:opacity-100 transition-opacity"></div>
                {instructor.photo_display_url ? (
                  <img
                    src={instructor.photo_display_url}
                    alt={instructor.name}
                    className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 border-4 border-white flex items-center justify-center text-white text-5xl font-black shadow-2xl">
                    {initials}
                  </div>
                )}
                
                {/* Verified Shield Badge */}
                <div className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center shadow-xl animate-bounce" title="Verified Practitioner">
                  <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Profile Meta Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black tracking-[0.25em] uppercase mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
                  Top Verified Practitioner
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-3 tracking-tight leading-tight">
                  {instructor.name}
                </h1>

                {instructor.roles?.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                    {instructor.roles.map((role, idx) => (
                      <span key={idx} className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-black shadow-sm flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-blue-600" />
                        {role}
                      </span>
                    ))}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    Verified Practitioner
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-current" strokeWidth={0} />
                    4.9 Faculty Rating
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-sm">
                    <Rocket className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    High-Income Specialist
                  </span>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

        {/* STATS TILES GRID WITH COUNT-UP ANIMATION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatTile
            idx={0}
            icon={BookOpen}
            target={instructor.total_courses || 1}
            decimals={0}
            suffix=""
            label={instructor.total_courses === 1 ? 'Active Course' : 'Active Courses'}
            color="from-blue-600 via-blue-700 to-indigo-600"
          />
          <StatTile
            idx={1}
            icon={Users}
            target={instructor.total_students || 15}
            decimals={0}
            suffix=""
            label={instructor.total_students === 1 ? 'Student Guided' : 'Students Guided'}
            color="from-indigo-600 via-purple-600 to-sky-500"
          />
          <StatTile
            idx={2}
            icon={Star}
            target={4.9}
            decimals={1}
            suffix=" / 5"
            label="Average Rating"
            color="from-amber-500 via-orange-500 to-amber-600"
          />
        </div>

        {/* ABOUT SECTION */}
        {instructor.about && (
          <Reveal variant="fade-up" className="mb-8">
            <section className="relative bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)] transition-all duration-300 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                    About <span className="text-blue-600">{instructor.name.split(' ')[0]}</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Practitioner Bio & Background</p>
                </div>
              </div>
              <p className="relative text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">
                {instructor.about}
              </p>
            </section>
          </Reveal>
        )}

        {/* ACHIEVEMENTS & MILESTONES SECTION */}
        {achievementLines.length > 0 && (
          <Reveal variant="fade-up" className="mb-10">
            <section className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Trophy className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                    Track Record & Milestones
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Key Career Impact Highlights</p>
                </div>
              </div>

              {achievementLines.length > 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievementLines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 hover:border-amber-400 hover:shadow-md transition-all duration-300">
                      <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <p className="text-xs sm:text-sm text-slate-900 font-bold leading-snug">{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">{achievementLines[0]}</p>
              )}
            </section>
          </Reveal>
        )}

        {/* COURSES OFFERED SECTION */}
        <section className="relative space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <GraduationCap className="w-6 h-6" strokeWidth={2.5} />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                  Courses By <span className="text-blue-600">{instructor.name}</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{courses.length} Practical Learning Modules</p>
              </div>
            </div>

            {courses.length > 0 && (
              <Link to="/courses" className="hidden sm:inline-flex items-center gap-1.5 text-blue-600 text-xs font-black uppercase tracking-widest hover:gap-2.5 transition-all">
                View All Courses <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {courses.map((course, idx) => (
                <CourseCard key={course.id} course={course} index={idx} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-[2.5rem] p-10 sm:p-12 text-center shadow-sm">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <h4 className="text-base font-black text-slate-900 mb-1">New Curriculum Modules In Progress</h4>
              <p className="text-slate-500 text-sm font-medium">This mentor is tailoring new practical modules. Check back soon!</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

