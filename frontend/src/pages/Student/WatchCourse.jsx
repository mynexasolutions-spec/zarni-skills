import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, CheckCircle2, ArrowLeft, Video, BookOpen, AlertCircle, ChevronLeft, ChevronRight, Clock, Sparkles, Award, Layers, PartyPopper, Radio } from 'lucide-react';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';

function ChapterVideo({ chapter, onEnded }) {
  // onEnded should fire exactly once per chapter view — but relying only on
  // the native 'ended' event misses it when a user scrubs to the end or the
  // browser doesn't emit it cleanly, so we also treat >=95% watched (via
  // timeupdate) as "finished". This ref stops that from firing repeatedly
  // on every timeupdate tick before React state catches up.
  const firedRef = useRef(false);
  useEffect(() => { firedRef.current = false; }, [chapter?.id]);

  if (!chapter) return null;

  const handleFinish = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    onEnded();
  };

  const handleTimeUpdate = (e) => {
    const v = e.currentTarget;
    if (!firedRef.current && v.duration && v.currentTime / v.duration >= 0.95) {
      handleFinish();
    }
  };

  if (chapter.video_type === 'file' || chapter.video_type === 'direct') {
    return (
      <video
        key={chapter.id}
        className="w-full h-full object-contain bg-black"
        controls
        controlsList="nodownload"
        preload="metadata"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        onEnded={handleFinish}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={chapter.video_src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (chapter.video_type === 'embed') {
    return (
      <iframe
        key={chapter.id}
        src={chapter.video_src}
        title={chapter.title}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
      <Video className="w-12 h-12 sm:w-14 sm:h-14 mb-3 text-slate-500" strokeWidth={1.5} />
      <p className="text-sm font-bold text-slate-300">No video preview available for this chapter.</p>
    </div>
  );
}

export default function WatchCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percent: 0, is_completed: false });
  const [completedIds, setCompletedIds] = useState(new Set());
  const [marking, setMarking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await api.get(`/student/courses/${courseId}`);
        setCourse(response.data.course || null);
        const fetchedChapters = response.data.chapters || [];
        setChapters(fetchedChapters);
        setCompletedIds(new Set(fetchedChapters.filter(c => c.is_completed).map(c => c.id)));
        setProgress(response.data.progress || { total: 0, completed: 0, percent: 0, is_completed: false });
        if (fetchedChapters.length > 0) {
          const firstUnfinished = fetchedChapters.find(c => !c.is_completed);
          setActiveChapter(firstUnfinished || fetchedChapters[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Access restricted or course module unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseContent();
  }, [courseId]);

  const markChapterComplete = async (chapterId) => {
    if (completedIds.has(chapterId) || marking) return;
    setMarking(true);
    try {
      const response = await api.post(`/student/chapters/${chapterId}/complete`);
      setCompletedIds(prev => new Set(prev).add(chapterId));
      setProgress(response.data.progress);
    } catch (err) {
      console.error('Error marking chapter complete', err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Cinema Player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16 sm:py-20 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg my-6 sm:my-10">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
          <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-slate-500 text-sm font-medium mb-6">{error}</p>
        <button onClick={() => navigate('/student/packages')} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-500/25 transition-transform active:scale-95">
          Browse All Packages <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  const activeIndex = chapters.findIndex(c => c.id === activeChapter?.id);
  const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;
  const progressPct = progress.percent || 0;
  const activeCompleted = activeChapter ? completedIds.has(activeChapter.id) : false;

  return (
    <div className="space-y-3 sm:space-y-6 pb-10 px-1.5 sm:px-0">

      {/* COMPACT HEADER: back + title + instructor + progress, all in one card
          so mobile reaches the video without scrolling past several banners */}
      <Reveal variant="scale-in">
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-3 sm:space-y-4">

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate('/student/courses')}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 pl-2 pr-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all border border-slate-200/80 group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
              <span>My Courses</span>
            </button>
            {progress.is_completed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Complete
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2">
                <Sparkles className="w-3 h-3 text-blue-600" strokeWidth={2.5} />
                Video Classroom
              </div>
              <h1 className="text-base sm:text-2xl lg:text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight truncate">
                {course?.title}
              </h1>
            </div>

            {course?.instructor_name && (() => {
              // Only the instructors that exist as their own record have a
              // profile page; a free-text name on a course has nowhere to go.
              const Wrapper = course.instructor_slug ? Link : 'div';
              const wrapperProps = course.instructor_slug
                ? { to: `/instructor/${course.instructor_slug}`, title: `View ${course.instructor_name}'s profile` }
                : {};
              return (
              <Wrapper {...wrapperProps} className={`flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 shrink-0 self-start sm:self-auto transition-all ${
                course.instructor_slug ? 'hover:bg-white hover:border-blue-300 hover:shadow-md cursor-pointer group/inst' : ''
              }`}>
                {course.instructor_image_display_url ? (
                  <img src={course.instructor_image_display_url} alt={course.instructor_name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-blue-200" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {course.instructor_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 truncate group-hover/inst:text-blue-600 transition-colors">{course.instructor_name}</p>
                  <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">
                    {course.instructor_slug ? 'View profile →' : 'Faculty Mentor'}
                  </p>
                </div>
              </Wrapper>
              );
            })()}
          </div>

          {chapters.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex-1 h-2 sm:h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-blue-600 shrink-0 tabular-nums">{progressPct}%</span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Module {activeIndex + 1} of {chapters.length} · {progress.completed}/{progress.total} watched
              </p>
            </div>
          )}
        </div>
      </Reveal>

      {/* COURSE COMPLETION CELEBRATION */}
      {progress.is_completed && (
        <Reveal variant="fade-up" delay={100}>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
            style={{ background: 'linear-gradient(115deg, #0f1f4d 0%, #1e3a8a 40%, #2563eb 100%)' }}>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0">
                <PartyPopper className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-white font-black text-sm sm:text-base">Course Completed! 🎉</p>
                <p className="text-blue-200 text-[11px] sm:text-xs mt-0.5">
                  {course?.certificate_eligible
                    ? "You've unlocked your certificate for this course."
                    : 'Great job finishing every module.'}
                </p>
              </div>
            </div>
            {course?.certificate_eligible && (
              <button
                onClick={() => navigate('/student/certificates')}
                className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
              >
                <Award className="w-4 h-4 text-amber-500" /> View Certificate
              </button>
            )}
          </div>
        </Reveal>
      )}

      {/* MAIN VIDEO THEATER + CHAPTER PLAYLIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

        {/* LEFT COLUMN: THEATER VIDEO PLAYER */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <Reveal variant="scale-in" delay={150}>
            {/* Ambient glow ring — the "sexy" premium frame around the player */}
            <div className="relative rounded-2xl sm:rounded-[2.5rem] p-[1.5px] bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-transparent shadow-[0_20px_60px_-15px_rgba(37,99,235,0.35)]">
              <div className="bg-white rounded-[calc(1rem-1.5px)] sm:rounded-[calc(2.5rem-1.5px)] overflow-hidden">

                {activeChapter ? (
                  <>
                    <div className="px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-slate-100 flex items-center gap-2.5 bg-gradient-to-r from-slate-50 to-white">
                      <span className="px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl bg-blue-600 text-white font-heading font-black text-[9px] sm:text-xs uppercase tracking-widest shrink-0 shadow-md shadow-blue-500/25">
                        Module {activeIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-heading font-black text-slate-900 text-xs sm:text-lg truncate leading-tight">{activeChapter.title}</h2>
                        {activeChapter.duration && (
                          <p className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-blue-500 shrink-0" strokeWidth={2} /> {activeChapter.duration}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cinema frame with glass overlay badges */}
                    <div className="bg-slate-950 aspect-video w-full relative shadow-inner overflow-hidden ring-1 ring-white/10 group/theater">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none z-10 opacity-0 group-hover/theater:opacity-100 transition-opacity"></div>

                      <span className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-20 inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider pointer-events-none">
                        <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" strokeWidth={2.5} /> Now Playing
                      </span>

                      {activeCompleted && (
                        <span className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-20 inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider pointer-events-none shadow-lg shadow-emerald-900/30">
                          <CheckCircle2 className="w-3 h-3" /> Watched
                        </span>
                      )}

                      <ChapterVideo chapter={activeChapter} onEnded={() => markChapterComplete(activeChapter.id)} />
                    </div>

                    {/* Watched-status strip — the reliable, unmissable fallback
                        for embeds (YouTube/Vimeo) that can't be auto-tracked */}
                    <div className={`flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 px-3.5 sm:px-6 py-2.5 sm:py-3 border-t border-slate-100 ${activeCompleted ? 'bg-emerald-50/60' : 'bg-amber-50/60'}`}>
                      <p className={`text-[11px] sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 ${activeCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {activeCompleted ? (
                          <><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> You've watched this module.</>
                        ) : (
                          <><Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> Finished watching? Mark it done.</>
                        )}
                      </p>
                      <button
                        onClick={() => markChapterComplete(activeChapter.id)}
                        disabled={activeCompleted || marking}
                        className={`w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all shadow-sm ${
                          activeCompleted
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                        }`}
                      >
                        {activeCompleted ? 'Completed' : marking ? 'Marking…' : 'Mark as Watched'}
                      </button>
                    </div>

                    {activeChapter.description && (
                      <div className="p-3.5 sm:p-6 bg-white space-y-1.5 sm:space-y-2 border-t border-slate-100">
                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" strokeWidth={2.5} /> About this module
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">{activeChapter.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 sm:py-24 text-slate-400">
                    <Video className="w-10 h-10 sm:w-16 sm:h-16 mb-4 text-slate-300" strokeWidth={1.5} />
                    <p className="font-black text-slate-800 text-sm sm:text-base">No chapters available yet.</p>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">Check back soon as new modules release!</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {/* NEXT / PREVIOUS NAVIGATION BUTTONS */}
          {chapters.length > 0 && (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => prevChapter && setActiveChapter(prevChapter)}
                disabled={!prevChapter}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>Prev</span>
              </button>
              <button
                onClick={() => nextChapter && setActiveChapter(nextChapter)}
                disabled={!nextChapter}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none active:scale-95"
              >
                <span>Next Module</span>
                <ChevronRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CHAPTER PLAYLIST */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28">
            <Reveal variant="fade-up" delay={200}>
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.04)] overflow-hidden">

                <div className="px-4 sm:px-5 py-3 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-xs sm:text-base leading-tight">Course Playlist</h3>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">{progress.completed}/{progress.total} Completed</p>
                    </div>
                  </div>
                </div>

                {chapters.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-[280px] sm:max-h-[350px] lg:max-h-[calc(100vh-280px)] overflow-y-auto">
                    {chapters.map((ch, idx) => {
                      const isActive = activeChapter?.id === ch.id;
                      const isDone = completedIds.has(ch.id);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChapter(ch)}
                          className={`group w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3.5 transition-all duration-200 text-left ${
                            isActive
                              ? 'bg-blue-50/80 border-l-4 border-blue-600'
                              : 'border-l-4 border-transparent hover:bg-slate-50/80'
                          }`}
                        >
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                              : isDone
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] sm:text-sm font-black leading-snug break-words ${isActive ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'}`}>
                              {ch.title}
                            </p>
                            {ch.duration && <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-0.5">{ch.duration}</p>}
                          </div>
                          {isActive ? (
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 fill-current shrink-0 animate-pulse" />
                          ) : (
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" strokeWidth={2} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-6 py-10 text-center text-xs text-slate-400 font-bold">No chapters loaded.</p>
                )}
              </div>
            </Reveal>
          </div>
        </div>

      </div>
    </div>
  );
}
