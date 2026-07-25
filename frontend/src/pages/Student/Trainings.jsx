import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, PlayCircle, ExternalLink, Sparkles, Play, Film, X, Video, Tv } from 'lucide-react';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function getYouTubeId(url) {
  const match = (url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function VideoModal({ url, title, onClose }) {
  if (!url) return null;
  return createPortal(
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-4xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <span className="text-white font-black text-sm sm:text-base truncate pr-4 flex items-center gap-2">
            <Tv className="w-4 h-4 text-sky-400" /> {title}
          </span>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <video src={url} controls autoPlay className="w-full max-h-[75vh] rounded-3xl shadow-2xl bg-black border border-white/10" />
      </div>
    </div>,
    document.body
  );
}

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null); // { url, title } | null

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await api.get('/student/trainings');
        setTrainings(response.data.trainings || []);
      } catch (err) {
        console.error('Error fetching training sessions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Training Webinars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-sky-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #2563eb 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-300/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-[10px] font-black uppercase tracking-widest text-sky-200 mb-4 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Live & Recorded Webinars
              </div>
              
              <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight flex items-center gap-3">
                Trainings & Webinars <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-sky-300" />
              </h1>
              <p className="text-sky-100/80 text-xs sm:text-sm font-medium leading-relaxed">
                Watch onboarding walkthroughs, affiliate strategy sessions, and expert skill webinars to scale your earnings.
              </p>
            </div>

            {trainings.length > 0 && (
              <div className="shrink-0 sm:self-center flex items-center gap-2.5 bg-white/10 border border-white/20 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center font-black shadow-md">
                  <Video className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-200">Video Library</p>
                  <p className="text-base font-black text-white">{trainings.length} Sessions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {trainings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {trainings.map((t, idx) => {
            const vType = t.video_type || 'link';
            const isYoutube = vType === 'youtube';
            const isUpload = vType === 'upload';
            const videoId = isYoutube ? getYouTubeId(t.link_url) : null;

            const badgeLabel = isYoutube ? 'YouTube' : isUpload ? 'Video' : 'Resource';
            const badgeColor = isYoutube ? 'bg-red-600' : isUpload ? 'bg-violet-600' : 'bg-blue-600';
            const btnLabel = isYoutube ? 'Watch Video' : isUpload ? 'Play Video' : 'Open Resource';
            const BtnIcon = isYoutube || isUpload ? PlayCircle : ExternalLink;

            const cardInner = (
              <div className="relative bg-white rounded-[2.5rem] border border-slate-200/90 overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1.5 flex flex-col h-full">
                <div className={`aspect-video flex items-center justify-center relative overflow-hidden ${videoId ? 'bg-slate-900' : isYoutube ? 'bg-gradient-to-br from-red-500/10 to-red-600/5' : isUpload ? 'bg-gradient-to-br from-violet-500/10 to-indigo-500/5' : 'bg-gradient-to-br from-blue-500/10 to-sky-100'}`}>
                  {videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt={t.title}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : isYoutube ? (
                    <PlayCircle className="w-16 h-16 text-red-500/60 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  ) : isUpload ? (
                    <Film className="w-14 h-14 text-violet-400/70 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  ) : (
                    <ExternalLink className="w-14 h-14 text-sky-500/40 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  )}
                  {videoId && <span className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></span>}
                  
                  {(isYoutube || isUpload) && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="relative w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <span className={`absolute inset-0 rounded-full blur-md animate-pulse ${isYoutube ? 'bg-red-500/40' : 'bg-violet-500/40'}`}></span>
                        <Play className={`relative w-7 h-7 ml-1 ${isYoutube ? 'text-red-600' : 'text-violet-600'}`} fill="currentColor" />
                      </span>
                    </span>
                  )}
                  <span className={`absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md text-white ${badgeColor}`}>
                    {badgeLabel}
                  </span>
                </div>

                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <h3 className="font-heading font-black text-slate-900 text-lg sm:text-xl group-hover:text-sky-600 transition-colors leading-snug">{t.title}</h3>
                    {t.description && <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed line-clamp-2">{t.description}</p>}
                  </div>

                  <div className="pt-2">
                    <span className="group/btn relative overflow-hidden w-full py-3.5 bg-slate-900 group-hover:bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]">
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                      <BtnIcon className="w-4 h-4 relative" />
                      <span className="relative">{btnLabel}</span>
                    </span>
                  </div>
                </div>
              </div>
            );

            return (
              <Reveal key={t.id} variant="fade-up" delay={idx * 90}>
                {isUpload ? (
                  <button
                    type="button"
                    onClick={() => setPlaying({ url: t.link_url, title: t.title })}
                    className="group block text-left w-full h-full"
                  >
                    {cardInner}
                  </button>
                ) : (
                  <a
                    href={t.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block w-full h-full"
                  >
                    {cardInner}
                  </a>
                )}
              </Reveal>
            );
          })}
        </div>
      ) : (
        <Reveal variant="fade-up">
          <div className="relative overflow-hidden text-center py-16 px-6 bg-white rounded-[2.5rem] border border-slate-200/90 max-w-xl mx-auto shadow-lg">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10 w-16 h-16 mx-auto rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900 relative z-10">No Training Sessions Yet</h3>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mt-2 relative z-10">Check back soon — new recorded webinars and onboarding walkthroughs will appear here.</p>
          </div>
        </Reveal>
      )}

      {playing && <VideoModal url={playing.url} title={playing.title} onClose={() => setPlaying(null)} />}
    </div>
  );
}
