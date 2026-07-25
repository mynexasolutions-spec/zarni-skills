import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Play, ShoppingCart, GraduationCap, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function CourseCard({ course, isOwned, idx, onAction }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);

  return (
    <Reveal variant="scale-in" delay={idx * 80}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative bg-white border border-slate-200/90 rounded-[2.25rem] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_55px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-all duration-500 flex flex-col justify-between [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
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
              <span className="absolute top-3.5 left-3.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Unlocked
              </span>
            ) : (
              <span className="absolute top-3.5 left-3.5 bg-slate-900/90 backdrop-blur-md text-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} /> Premium Lock
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
              <span className="relative">Watch Course</span>
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
    </Reveal>
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

      {/* HERO BANNER */}
      <Reveal variant="scale-in">
        <div
          className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl shadow-blue-900/10"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Glow & Shimmer */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4 backdrop-blur-md">
                <GraduationCap className="w-4 h-4 text-blue-300 animate-pulse" /> Student Learning Workspace
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black mb-3 tracking-tight">
                My Course Vault
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
                Continue your learning journey, watch video modules, or unlock new high-income courses.
              </p>
            </div>

            {/* Enrolled Counter Card */}
            <div className="relative shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center min-w-[180px] shadow-lg">
              <AnimatedNumber value={myCourses.length} duration={1200} className="block text-4xl sm:text-5xl font-heading font-black leading-none text-white tracking-tight" />
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mt-2">Unlocked Courses</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* CONTINUED LEARNING SECTION */}
      <section className="space-y-6">
        <Reveal variant="fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Play className="w-5 h-5 fill-current translate-x-0.5" strokeWidth={2.5} />
              </span>
              Enrolled Courses ({myCourses.length})
            </h2>
          </div>
        </Reveal>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course, idx) => (
              <CourseCard
                key={course.id}
                course={course}
                isOwned={true}
                idx={idx}
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
            <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
                <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              </span>
              Available to Unlock ({availableCourses.length})
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course, idx) => (
              <CourseCard
                key={course.id}
                course={course}
                isOwned={false}
                idx={idx}
                onAction={() => navigate('/student/packages')}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

