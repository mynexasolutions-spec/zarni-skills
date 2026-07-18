import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, ArrowLeft, Video, BookOpen, AlertCircle, ChevronLeft, ChevronRight, Clock, GraduationCap } from 'lucide-react';
import api from '../../utils/api';

function ChapterVideo({ chapter }) {
  if (!chapter) return null;

  if (chapter.video_type === 'file' || chapter.video_type === 'direct') {
    return (
      <video
        key={chapter.id}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        preload="metadata"
        onContextMenu={(e) => e.preventDefault()}
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
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-white/50 py-16">
      <Video className="w-12 h-12 mb-3" />
      <p className="text-sm font-medium">No video available for this chapter yet.</p>
    </div>
  );
}

export default function WatchCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await api.get(`/student/courses/${courseId}`);
        setCourse(response.data.course || null);
        setChapters(response.data.chapters || []);
        if (response.data.chapters && response.data.chapters.length > 0) {
          setActiveChapter(response.data.chapters[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied or course not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseContent();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-5">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto" />
        <h1 className="text-2xl font-black text-slate-900">Access Restricted</h1>
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={() => navigate('/student/packages')} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
          Browse Packages
        </button>
      </div>
    );
  }

  const activeIndex = chapters.findIndex(c => c.id === activeChapter?.id);
  const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;
  const progressPct = chapters.length > 0 ? Math.round(((activeIndex + 1) / chapters.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <button onClick={() => navigate('/student/courses')} className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>My Courses</span>
        </button>
        {chapters.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              Chapter {activeIndex + 1} of {chapters.length}
            </span>
            <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
              <div className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2.5">
        <GraduationCap className="w-6 h-6 text-primary" /> {course?.title}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Video Player */}
        <div className="flex-1 min-w-0 w-full">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {activeChapter ? (
              <>
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-primary/20">
                      {activeIndex + 1}
                    </span>
                    <h2 className="font-bold text-slate-900 text-base">{activeChapter.title}</h2>
                  </div>
                  {activeChapter.duration && (
                    <p className="text-xs text-slate-400 ml-9 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration: {activeChapter.duration}
                    </p>
                  )}
                </div>

                <div className="bg-slate-950 aspect-video w-full relative">
                  <ChapterVideo chapter={activeChapter} />
                </div>

                {activeChapter.description && (
                  <div className="px-5 py-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">About this chapter</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{activeChapter.description}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Video className="w-14 h-14 mb-4 text-slate-300" />
                <p className="font-bold text-slate-500">No chapters available yet.</p>
                <p className="text-sm mt-1">Check back soon!</p>
              </div>
            )}
          </div>

          {/* Prev / Next */}
          {chapters.length > 0 && (
            <div className="flex items-center justify-between gap-4 mt-4">
              <button
                onClick={() => prevChapter && setActiveChapter(prevChapter)}
                disabled={!prevChapter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => nextChapter && setActiveChapter(nextChapter)}
                disabled={!nextChapter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-sm font-bold text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
              >
                Next Chapter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Chapter List Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Course Chapters</h3>
                <p className="text-xs text-slate-400">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {chapters.length > 0 ? (
              <div className="divide-y divide-slate-50 max-h-[calc(100vh-260px)] overflow-y-auto">
                {chapters.map((ch, idx) => {
                  const isActive = activeChapter?.id === ch.id;
                  const isPast = activeIndex >= 0 && idx < activeIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChapter(ch)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left animate-fade-in-up ${
                        isActive ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent hover:bg-slate-50'
                      }`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isActive ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md shadow-primary/20' : isPast ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                          {ch.title}
                        </p>
                        {ch.duration && <p className="text-[11px] text-slate-400 mt-0.5">{ch.duration}</p>}
                      </div>
                      {ch.video_type !== 'none' ? (
                        <Play className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary fill-primary' : 'text-slate-300'}`} />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No chapters yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
