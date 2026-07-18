import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { BadgeCheck, Check, Clock, Zap, PlayCircle, List, Play, Lock, HelpCircle, ArrowRight } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/courses/${id}`)
      .then(res => {
        setCourse(res.data.course);
        setChapters(res.data.chapters || []);
        setPackages(res.data.packages || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h3 className="text-lg font-bold">Course not found</h3>
        <Link to="/courses" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const whatYouLearn = (course.what_you_learn || '').split('\n').map(s => s.trim()).filter(Boolean);
  const prerequisites = (course.prerequisites || '').split('\n').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-slate-50 min-h-screen -mt-24 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-10 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Thumbnail hero — cinematic overlay with floating badges + title */}
            <div className="group relative rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_60px_-12px_rgba(43,128,240,0.2)] transition-all duration-500">
              <div className="absolute -inset-[1.5px] rounded-[1.9rem] bg-gradient-to-br from-primary/30 via-indigo-500/20 to-indigo-600/30 opacity-0 group-hover:opacity-100 blur-[4px] transition-all duration-500 pointer-events-none z-0"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden">
                {course.thumbnail_display_url ? (
                  <div className="relative aspect-[16/9] sm:aspect-[2/1]">
                    <img src={course.thumbnail_display_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent"></div>
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] sm:aspect-[2/1] bg-gradient-to-br from-primary/90 via-blue-700 to-indigo-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  </div>
                )}

                {/* Floating badges */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-wrap items-center gap-2">
                  {course.level && (
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-primary text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">{course.level}</span>
                  )}
                  {course.certificate && (
                    <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md">
                      <BadgeCheck className="w-3 h-3" strokeWidth={3} />
                      Certificate
                    </span>
                  )}
                  {course.language && (
                    <span className="px-3 py-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">{course.language}</span>
                  )}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <h1 className="font-heading font-black text-white text-2xl sm:text-3xl md:text-4xl leading-tight drop-shadow-md max-w-2xl">{course.title}</h1>
                </div>
              </div>
            </div>

            {/* Description + Instructor */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              {course.description && (
                <p className="text-slate-600 leading-relaxed text-base flex-1">{course.description}</p>
              )}
              {course.instructor_name && (
                <div className="shrink-0 flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                  {course.instructor_image_display_url ? (
                    <img src={course.instructor_image_display_url} alt={course.instructor_name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {course.instructor_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{course.instructor_name}</p>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Instructor</p>
                  </div>
                </div>
              )}
            </div>

            {/* What You'll Learn */}
            {whatYouLearn.length > 0 && (
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-indigo-600/5 border border-primary/10 rounded-3xl p-7 sm:p-8">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[70px] pointer-events-none"></div>
                <h2 className="relative text-lg font-heading font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <BadgeCheck className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </span>
                  What You'll Learn
                </h2>
                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {whatYouLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-sm text-slate-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {course.course_duration && (
                <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Clock className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Duration</p>
                  <p className="text-sm font-bold text-slate-800">{course.course_duration}</p>
                </div>
              )}
              {course.level && (
                <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Zap className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Level</p>
                  <p className="text-sm font-bold text-slate-800">{course.level}</p>
                </div>
              )}
              <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <PlayCircle className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Lessons</p>
                <p className="text-sm font-bold text-slate-800">{chapters.length}</p>
              </div>
              {course.certificate && (
                <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <BadgeCheck className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Certificate</p>
                  <p className="text-sm font-bold text-emerald-600">Yes</p>
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div>
                <h2 className="text-lg font-heading font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <Zap className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </span>
                  Prerequisites
                </h2>
                <div className="space-y-2.5 bg-white border border-slate-100 rounded-2xl p-5 sm:p-6">
                  {prerequisites.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-primary font-bold text-lg leading-none mt-0.5">✓</span>
                      <span className="text-slate-700 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chapter List */}
            {chapters.length > 0 && (
              <div>
                <h2 className="text-lg font-heading font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <List className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </span>
                  Course Content
                  <span className="text-sm font-normal text-slate-400 ml-auto">({chapters.length} chapters)</span>
                </h2>
                <div className="space-y-2 bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {chapters.map((ch, idx) => (
                    <div key={ch.id} className="flex items-center gap-4 px-5 py-4 hover:bg-primary/[0.03] hover:translate-x-1 transition-all duration-300 group">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-black shrink-0 transition-all duration-300 ${
                        course.owned ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md shadow-primary/25' : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }`}>
                        {ch.order || idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{ch.title}</p>
                        {ch.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{ch.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {ch.duration && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-300" strokeWidth={2.5} />
                            {ch.duration}
                          </span>
                        )}
                        {course.owned ? (
                          <Play className="w-4 h-4 text-primary shrink-0" fill="currentColor" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-300 shrink-0" strokeWidth={2} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available in packages */}
            {packages.length > 0 && (
              <div>
                <h2 className="text-lg font-heading font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <Check className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </span>
                  Available In
                </h2>
                <div className="flex flex-wrap gap-3">
                  {packages.map(p => (
                    <Link key={p.id} to={`/packages/${p.id}`}
                      className="group relative inline-flex items-center gap-3 px-4 py-3 bg-white border-2 border-primary/20 hover:border-primary text-slate-700 hover:text-primary rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300">
                      <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></span>
                      <span className="relative">{p.name}</span>
                      <span className="text-xs font-normal text-slate-400 group-hover:text-primary/60">₹{Number(p.price).toLocaleString()}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 group relative">

              <div className="absolute -inset-[1.5px] rounded-[1.9rem] bg-gradient-to-br from-primary via-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-40 blur-[8px] transition-all duration-500 pointer-events-none z-0"></div>

              <div className="relative z-10 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-hover:shadow-[0_24px_60px_-12px_rgba(43,128,240,0.15)] transition-all duration-500 overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-indigo-600"></div>
                <div className="p-6 sm:p-7 space-y-6">

                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <Lock className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-heading font-black text-slate-900 text-xl leading-tight">Get Access</h3>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Purchase to unlock all chapters</p>
                  </div>
                </div>

                {course.price && (
                  <div className="border-2 border-emerald-100 bg-emerald-50/20 rounded-2xl p-4 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300">
                    <p className="font-bold text-slate-800 text-sm mb-1">Buy Course Individually</p>
                    <p className="text-2xl font-heading font-black text-emerald-600 mb-3">₹{Number(course.price).toLocaleString()}</p>
                    {user ? (
                      course.owned ? (
                        <span className="w-full py-2 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm inline-flex items-center justify-center">You Own This Course</span>
                      ) : (
                        <Link to={`/student/checkout?course_id=${course.id}`}
                          className="group/btn relative w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center justify-center overflow-hidden">
                          Buy Course
                        </Link>
                      )
                    ) : (
                      <Link to="/register" className="group/btn relative w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center justify-center overflow-hidden">
                        Enroll & Buy
                      </Link>
                    )}
                  </div>
                )}

                {packages.length > 0 ? (
                  <div className="space-y-3">
                    {packages.map(p => (
                      <div key={p.id} className="border-2 border-slate-100 rounded-2xl p-4 hover:border-primary/20 transition-colors">
                        <p className="font-bold text-slate-800 text-sm mb-2">{p.name}</p>
                        <p className="text-2xl font-heading font-black text-primary mb-3">₹{Number(p.price).toLocaleString()}</p>
                        {user ? (
                          <Link to={`/student/checkout?package_id=${p.id}`}
                            className="group/btn relative w-full py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 inline-flex items-center justify-center overflow-hidden">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></span>
                            Buy Package
                          </Link>
                        ) : (
                          <Link to="/register" className="group/btn relative w-full py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 inline-flex items-center justify-center overflow-hidden">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></span>
                            Enroll Now
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HelpCircle className="w-6 h-6 text-slate-300" strokeWidth={2} />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Not assigned to any package yet.</p>
                  </div>
                )}

                {!user && (
                  <Link to="/login"
                    className="group/login relative w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm inline-flex items-center justify-center gap-2 overflow-hidden">
                    Already enrolled? Sign In
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </Link>
                )}

                {/* Quick details divider */}
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Course highlights</p>
                  <ul className="space-y-2.5">
                    {course.course_duration && (
                      <li className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                        <span className="text-sm text-slate-600 font-medium">{course.course_duration}</span>
                      </li>
                    )}
                    {course.level && (
                      <li className="flex items-center gap-2.5">
                        <Zap className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                        <span className="text-sm text-slate-600 font-medium">{course.level} Level</span>
                      </li>
                    )}
                    <li className="flex items-center gap-2.5">
                      <PlayCircle className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-slate-600 font-medium">{chapters.length} lesson{chapters.length !== 1 ? 's' : ''}</span>
                    </li>
                    {course.certificate && (
                      <li className="flex items-center gap-2.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                        <span className="text-sm text-slate-600 font-medium">Certificate included</span>
                      </li>
                    )}
                  </ul>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
