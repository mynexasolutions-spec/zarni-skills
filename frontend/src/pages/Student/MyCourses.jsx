import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Play, ShoppingCart, GraduationCap, Sparkles } from 'lucide-react';
import api from '../../utils/api';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-white mb-10"
        style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 45%, #2563eb 100%)' }}>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-indigo-400/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> Learning Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-2">My Courses</h1>
            <p className="text-slate-300 text-sm max-w-lg">Continue where you left off, or unlock new courses through your packages.</p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-4">
            <p className="text-3xl font-black leading-none">{myCourses.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1.5">Enrolled Courses</p>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <section className="mb-14">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <Play className="w-5 h-5 text-primary fill-primary" /> Continue Learning
        </h2>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course, idx) => (
              <div
                key={course.id}
                className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {course.thumbnail_display_url ? (
                    <img src={course.thumbnail_display_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                    <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-primary fill-primary translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 uppercase group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.description || 'Actionable training syllabus.'}</p>

                  <button
                    onClick={() => navigate(`/student/watch/${course.id}`)}
                    className="w-full mt-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 group-hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" /> Watch Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-xl mx-auto">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4 relative z-10" />
            <h3 className="text-lg font-bold text-slate-850 relative z-10">No Courses Yet</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6 relative z-10">You haven't unlocked any courses. Browse our packages to enroll.</p>
            <button onClick={() => navigate('/student/packages')} className="relative z-10 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:-translate-y-0.5 transition-all">
              Browse Packages
            </button>
          </div>
        )}
      </section>

      {/* Available / Locked Courses */}
      {availableCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Available to Unlock
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course, idx) => (
              <div
                key={course.id}
                className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="aspect-video bg-slate-100 relative">
                  {course.thumbnail_display_url ? (
                    <img src={course.thumbnail_display_url} alt={course.title} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 uppercase">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.description || 'Master hands-on skills.'}</p>
                  </div>
                  <div className="mt-6">
                    <button onClick={() => navigate('/student/packages')} className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                      <ShoppingCart className="w-4 h-4" /> Unlock via Package
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
