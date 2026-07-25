import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';
import { BadgeCheck, Check, Clock, Zap, PlayCircle, List, Play, Lock, HelpCircle, ArrowRight, ShieldCheck, Infinity as InfinityIcon, Sparkles, ChevronRight, Video, CheckCircle2, User, Star, Flame, Award, BookOpen } from 'lucide-react';

function TiltCourseHero({ course, chapters }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  return (
    <Reveal variant="scale-in" duration={700}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_rgba(37,99,235,0.18)] transition-all duration-500 [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
      >
        {/* Shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 z-30"></div>

        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
          style={{ background: `radial-gradient(300px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(59,130,246,0.15), transparent 70%)` }}
        ></span>

        <div className="relative z-10 overflow-hidden">
          {course.thumbnail_display_url ? (
            <div className="relative aspect-[16/9] sm:aspect-[2/1]">
              <img src={course.thumbnail_display_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
            </div>
          ) : (
            <div className="relative aspect-[16/9] sm:aspect-[2/1] bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2 z-20">
            <span className="px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest shadow-md border border-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              {course.level || 'All Levels'}
            </span>
            {course.certificate && (
              <span className="px-3.5 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md">
                <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                Certificate Included
              </span>
            )}
            <span className="px-3.5 py-1.5 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md border border-white/10">
              {course.language || 'Hindi'}
            </span>
          </div>

          {/* Hero Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-[0.25em] text-blue-200 uppercase mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-spin-slow" strokeWidth={2.5} />
              Mastery Skill Course
            </div>
            <h1 className="font-heading font-black text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-md max-w-2xl">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Quick-Stat Ribbon Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3 px-5 py-4 hover:bg-blue-50/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Clock className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Duration</p>
              <p className="text-xs font-black text-slate-900 truncate">{course.course_duration || 'Lifetime'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 hover:bg-indigo-50/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
              <Zap className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Skill Level</p>
              <p className="text-xs font-black text-slate-900 truncate">{course.level || 'All Levels'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 hover:bg-purple-50/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
              <PlayCircle className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Lessons</p>
              <p className="text-xs font-black text-slate-900 truncate">{chapters.length} Modules</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 hover:bg-emerald-50/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
              <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Certificate</p>
              <p className="text-xs font-black text-emerald-600 truncate">Yes, Included</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/courses/${slug}`)
      .then(res => {
        setCourse(res.data.course);
        setChapters(res.data.chapters || []);
        setPackages(res.data.packages || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-24 pt-24">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <Video className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 mb-2">Course Not Found</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">The course module you are searching for is unavailable.</p>
          <Link to="/courses" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-500/25 transition-transform active:scale-95">
            Browse All Courses <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  const whatYouLearn = (course.what_you_learn || '').split('\n').map(s => s.trim()).filter(Boolean);
  const prerequisites = (course.prerequisites || '').split('\n').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 -mt-24 pt-24 pb-24 relative overflow-hidden">
      {/* Background Animated Neon Blobs */}
      <div className="absolute top-[10%] left-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-[20%] right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Floating Animated Particles */}
      <span className="absolute top-28 left-[12%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[10%] w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute bottom-1/3 left-[6%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-float pointer-events-none z-0"></span>

      {/* Mesh Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '36px 36px' }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Breadcrumb Navigation */}
        <nav className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 flex-wrap uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* 3D Tilt Hero Media */}
            <TiltCourseHero course={course} chapters={chapters} />

            {/* Description + Instructor Card */}
            <Reveal variant="fade-up" delay={150}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                {course.description && (
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium flex-1">
                    {course.description}
                  </p>
                )}
                {(() => {
                  const InstructorWrapper = course.instructor_slug ? Link : 'div';
                  const wrapperProps = course.instructor_slug ? { to: `/instructor/${course.instructor_slug}` } : {};
                  return (
                    <InstructorWrapper
                      {...wrapperProps}
                      className={`shrink-0 flex items-center gap-3.5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all ${course.instructor_slug ? 'hover:border-blue-300 hover:-translate-y-0.5' : ''}`}
                    >
                      {course.instructor_image_display_url ? (
                        <img src={course.instructor_image_display_url} alt={course.instructor_name || 'Zarni Skills Team'} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-blue-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                          {(course.instructor_name || 'Zarni Skills Team').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{course.instructor_name || 'Zarni Skills Team'}</p>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Faculty Mentor
                        </p>
                      </div>
                    </InstructorWrapper>
                  );
                })()}
              </div>
            </Reveal>

            {/* What You'll Learn */}
            {whatYouLearn.length > 0 && (
              <Reveal variant="fade-up" delay={200}>
                <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                      <BadgeCheck className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <h2 className="text-xl font-heading font-black text-slate-900">
                      What You'll Learn
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {whatYouLearn.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span className="text-xs sm:text-sm text-slate-700 font-bold leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <Reveal variant="fade-up" delay={250}>
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Zap className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <h2 className="text-xl font-heading font-black text-slate-900">
                      Prerequisites
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prerequisites.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Curriculum Chapters List */}
            {chapters.length > 0 && (
              <Reveal variant="fade-up" delay={300}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <List className="w-5 h-5" strokeWidth={2.5} />
                      </span>
                      <h2 className="text-xl font-heading font-black text-slate-900">
                        Curriculum Syllabus ({chapters.length} Modules)
                      </h2>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] divide-y divide-slate-100">
                    {chapters.map((ch, idx) => (
                      <div key={ch.id} className="flex items-center gap-4 px-6 py-4.5 hover:bg-blue-50/50 hover:translate-x-1 transition-all duration-300 group">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-xs font-black shrink-0 transition-transform group-hover:scale-110 ${
                          course.owned ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                          {ch.order || idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{ch.title}</p>
                          {ch.description && (
                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{ch.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {ch.duration && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />
                              {ch.duration}
                            </span>
                          )}
                          {course.owned ? (
                            <Play className="w-4 h-4 text-blue-600 shrink-0 fill-current" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 transition-colors" strokeWidth={2} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Included in Packages */}
            {packages.length > 0 && (
              <Reveal variant="fade-up" delay={350}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <h2 className="text-xl font-heading font-black text-slate-900">
                      Bundled In Packages
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {packages.map(p => (
                      <Link key={p.id} to={`/packages/${p.id}`}
                        className="group relative inline-flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200/90 hover:border-blue-300 text-slate-800 hover:text-blue-600 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="relative">{p.name}</span>
                        <span className="text-xs font-bold text-emerald-600">₹{Number(p.price).toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Right Column: Sticky Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Reveal variant="fade-up" delay={200}>
                <div className="relative bg-white rounded-[2.5rem] border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_60px_rgba(37,99,235,0.15)] transition-all duration-500 overflow-hidden">
                  <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>
                  <div className="p-6 sm:p-8 space-y-6">

                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Lock className="w-5 h-5" strokeWidth={2} />
                      </span>
                      <div>
                        <h3 className="font-heading font-black text-slate-900 text-xl leading-tight">Unlock Course</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Enroll to access full curriculum</p>
                      </div>
                    </div>

                    {course.price && (
                      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
                        <p className="font-black text-slate-800 text-xs uppercase tracking-wider">Individual Course Purchase</p>
                        <p className="text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">₹{Number(course.price).toLocaleString()}</p>
                        {authLoading ? (
                          <div className="w-full py-3 bg-slate-100 rounded-xl animate-pulse h-[46px]"></div>
                        ) : user ? (
                          course.owned ? (
                            <Link to={`/student/watch/${course.id}`}
                              className="group w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-widest inline-flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all">
                              <CheckCircle2 className="w-4 h-4" /> Course Unlocked — Watch Now
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                            </Link>
                          ) : (
                            <Link to={`/student/checkout?course_id=${course.id}`}
                              className="group relative w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 active:scale-95 transition-all overflow-hidden text-center">
                              <span className="relative">Buy This Course</span>
                              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                            </Link>
                          )
                        ) : (
                          <Link to="/register" className="group relative w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 active:scale-95 transition-all overflow-hidden text-center">
                            <span className="relative">Enroll & Buy Course</span>
                            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                          </Link>
                        )}
                      </div>
                    )}

                    {packages.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Buy Included Package</p>
                        {packages.map(p => (
                          <div key={p.id} className="border border-slate-200/80 rounded-2xl p-4 hover:border-blue-300 transition-all space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-black text-slate-900 text-xs">{p.name}</span>
                              <span className="text-base font-heading font-black text-blue-600">₹{Number(p.price).toLocaleString()}</span>
                            </div>
                            {authLoading ? (
                              <div className="w-full py-2.5 bg-slate-100 rounded-xl animate-pulse h-[38px]"></div>
                            ) : user ? (
                              <Link to={`/student/checkout?package_id=${p.id}`}
                                className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors">
                                Buy Package
                              </Link>
                            ) : (
                              <Link to="/register" className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors">
                                Enroll Package
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!authLoading && !user && (
                      <Link to="/login"
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 border border-slate-200">
                        Already Enrolled? Sign In
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </Link>
                    )}

                    {/* Course Highlights */}
                    <div className="border-t border-slate-100 pt-4 space-y-2.5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Highlights Guarantee</p>
                      {course.course_duration && (
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={2.5} />
                          <span>{course.course_duration} Content Length</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                        <InfinityIcon className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={2.5} />
                        <span>Full Lifetime Access</span>
                      </div>
                      {course.certificate && (
                        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                          <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                          <span>Certificate of Completion</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={2.5} />
                        <span>Secure & Verified Checkout</span>
                      </div>
                    </div>

                  </div>
                </div>
              </Reveal>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
