import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Play, ShoppingCart, GraduationCap, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function CourseCard({ course, isOwned, onAction }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);

  const p = course.progress || null;
  const pct = p ? p.percent : 0;
  const done = !!p?.is_completed;
  const started = pct > 0;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative bg-white border border-slate-200/90 rounded-[2.25rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.13)] hover:border-blue-300 transition-[transform,box-shadow,border-color] duration-500 flex flex-col justify-between hover:[transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] hover:will-change-transform"
      >
        {/* Mouse Glare Overlay */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
          style={{ background: `radial-gradient(280px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(59,130,246,0.15), transparent 70%)` }}
        ></span>

        <div>
          {/* Thumbnail Container */}
          <div className="aspect-video bg-slate-900 relative overflow-hidden">
            {course.thumbnail_display_url ? (
              <img
                src={course.thumbnail_display_url}
                alt={course.title}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isOwned ? 'group-hover:scale-110' : 'grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105'
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700 bg-gradient-to-br from-slate-900 to-slate-950">
                <BookOpen className="w-14 h-14" strokeWidth={1.5} />
              </div>
            )}

            {/* Overlay Gradient & Badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

            {isOwned ? (
              <span className={`absolute top-3.5 left-3.5 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md ${
                done ? 'bg-emerald-500 shadow-emerald-900/25' : started ? 'bg-blue-600 shadow-blue-900/25' : 'bg-slate-800 shadow-slate-900/25'
              }`}>
                {done
                  ? <><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Completed</>
                  : started
                    ? <><Zap className="w-3.5 h-3.5" strokeWidth={2.5} /> {pct}% done</>
                    : <><Play className="w-3 h-3 fill-current" /> Ready</>}
              </span>
            ) : (
              <span className="absolute top-3.5 left-3.5 bg-slate-900 text-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} /> Premium Lock
              </span>
            )}

            {isOwned && course.certificate_eligible && (
              <span className={`absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                done ? 'bg-amber-400 text-amber-950' : 'bg-slate-900/80 text-slate-400 border border-white/10'
              }`} title={done ? 'Certificate unlocked' : 'Finish to earn a certificate'}>
                <ShieldCheck className="w-4 h-4" strokeWidth={2.4} />
              </span>
            )}

            {/* Hover Play Button */}
            {isOwned && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 z-20">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {course.level || 'All Levels'}
              </span>
              {course.language && (
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  • {course.language}
                </span>
              )}
            </div>

            <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2 leading-relaxed">
              {course.description || 'Comprehensive training course designed for actionable results and skill mastery.'}
            </p>

            {isOwned && p && p.total > 0 && (
              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {p.completed} of {p.total} chapters
                  </span>
                  <span className={`text-[11px] font-black tabular-nums ${done ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out bg-gradient-to-r ${
                      done ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-600'
                    }`}
                    style={{ width: `${Math.max(pct, pct > 0 ? 6 : 0)}%` }}
                  >
                    <span className="block h-1/2 rounded-t-full bg-white/25"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6 pt-2">
          {isOwned ? (
            <button
              onClick={() => onAction(course.id)}
              className="group/btn relative overflow-hidden w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              <Play className="w-4 h-4 fill-current relative" />
              <span className="relative">{done ? 'Rewatch Course' : started ? 'Continue Learning' : 'Start Course'}</span>
            </button>
          ) : (
            <button
              onClick={() => onAction(course.id)}
              className="group/btn relative overflow-hidden w-full py-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              <ShoppingCart className="w-4 h-4 relative" />
              <span className="relative">Unlock via Package</span>
            </button>
          )}
        </div>
    </div>
  );
}

export default function MyCourses() {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/student/courses');
        setMyCourses(response.data.my_courses || []);
        setAvailableCourses(response.data.available_courses || []);
      } catch (err) {
        console.error('Error fetching student courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const completedCount = myCourses.filter((c) => c.progress?.is_completed).length;


  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Your Learning Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 text-slate-800 pb-12">

      {/* HERO — aurora field behind a glass panel, matching the rest of the
          dashboard. The blur lives on this one element only, never per card. */}
      <Reveal variant="scale-in">
        <div className="relative">
          <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[#070d20]"></div>
            <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-blue-600/55 blur-[80px] animate-blob"></div>
            <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-indigo-600/45 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(7,13,32,0.70) 0%, rgba(7,13,32,0.45) 45%, rgba(7,13,32,0.94) 100%)' }}></div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] p-7 sm:p-10 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(8,15,40,0.45)]">
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
            <GraduationCap className="absolute right-5 top-5 w-28 h-28 sm:w-40 sm:h-40 text-blue-300/[0.07] rotate-6 pointer-events-none" strokeWidth={1} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-3">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-300" /> Learning Workspace
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight bg-gradient-to-b from-white via-white to-blue-100 bg-clip-text text-transparent">
                  My Course Vault
                </h1>
                <p className="text-blue-100/70 text-sm font-medium max-w-lg leading-relaxed mt-2.5">
                  Continue your learning journey, watch video modules, or unlock new high-income courses.
                </p>
              </div>

              {/* Enrolled / completed at a glance */}
              <div className="grid grid-cols-2 gap-2.5 shrink-0 md:w-[280px]">
                {[
                  { label: 'Unlocked', value: myCourses.length, color: '#60a5fa', Icon: Layers },
                  { label: 'Completed', value: completedCount, color: '#34d399', Icon: CheckCircle2 },
                ].map(({ label, value, color, Icon }) => (
                  <div key={label} className="rounded-2xl bg-black/35 border border-white/10 px-4 py-4 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} strokeWidth={2.4} />
                    <AnimatedNumber value={value} duration={1200}
                      className="block text-3xl font-heading font-black leading-none tabular-nums" style={{ color }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45 mt-1.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* CONTINUED LEARNING SECTION */}
      <section className="space-y-6">
        <Reveal variant="fade-up">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Play className="w-4.5 h-4.5 fill-current translate-x-0.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Enrolled Courses
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                {myCourses.length} unlocked{completedCount > 0 ? ` · ${completedCount} completed` : ''}
              </p>
            </div>
            <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 tabular-nums">
              {myCourses.length}
            </span>
          </div>
        </Reveal>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isOwned={true}
                onAction={(id) => navigate(`/student/watch-course/${id}`)}
              />
            ))}
          </div>
        ) : (
          <Reveal variant="scale-in">
            <div className="text-center py-16 px-6 bg-white rounded-[2.5rem] border border-slate-200/90 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <BookOpen className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900 mb-2">No Courses Enrolled Yet</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                You haven't unlocked any courses yet. Choose a package to gain immediate lifetime access to top courses.
              </p>
              <button
                onClick={() => navigate('/student/packages')}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-transform active:scale-95"
              >
                Browse Available Packages
              </button>
            </div>
          </Reveal>
        )}
      </section>

      {/* AVAILABLE COURSES SECTION */}
      {availableCourses.length > 0 && (
        <section className="space-y-6 pt-4">
          <Reveal variant="fade-up">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Sparkles className="w-4.5 h-4.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <h2 className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  Available to Unlock
                </h2>
                <p className="text-[11px] font-semibold text-slate-400">Included in a higher package</p>
              </div>
              <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 tabular-nums">
                {availableCourses.length}
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isOwned={false}
                onAction={() => navigate('/student/packages')}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

