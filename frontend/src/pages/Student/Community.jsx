import React, { useEffect, useState } from 'react';
import { Users2, Youtube, Instagram, ExternalLink, Sparkles, Link2, Flame, Zap } from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaDiscord, FaFacebook } from 'react-icons/fa';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

const LINK_META = {
  whatsapp: { label: 'WhatsApp Official Group', desc: 'Join active discussions, ask questions, and chat with mentors in real-time.', Icon: FaWhatsapp, grad: 'from-emerald-400 via-emerald-500 to-green-600', glow: 'rgba(16,185,129,0.4)', border: 'border-emerald-200/80 hover:border-emerald-400' },
  telegram: { label: 'Telegram VIP Channel', desc: 'Get instant official updates, event announcements, and daily marketing tips.', Icon: FaTelegram, grad: 'from-sky-400 via-blue-500 to-sky-600', glow: 'rgba(14,165,233,0.4)', border: 'border-sky-200/80 hover:border-sky-400' },
  youtube: { label: 'YouTube Masterclasses', desc: 'Watch free skill tutorials, student interviews, and live workshop replays.', Icon: Youtube, grad: 'from-red-400 via-rose-500 to-red-600', glow: 'rgba(239,68,68,0.4)', border: 'border-red-200/80 hover:border-red-400' },
  instagram: { label: 'Instagram Community', desc: 'Follow for daily student spotlight reels, tips, and motivation posts.', Icon: Instagram, grad: 'from-pink-400 via-fuchsia-500 to-purple-600', glow: 'rgba(217,70,239,0.4)', border: 'border-fuchsia-200/80 hover:border-fuchsia-400' },
  discord: { label: 'Discord Student Lounge', desc: 'Hang out in voice rooms, share work, and collaborate on projects.', Icon: FaDiscord, grad: 'from-indigo-400 via-violet-500 to-indigo-600', glow: 'rgba(124,58,237,0.4)', border: 'border-indigo-200/80 hover:border-indigo-400' },
  facebook: { label: 'Facebook Mastermind', desc: 'Connect, network, and exchange ideas with thousands of active learners.', Icon: FaFacebook, grad: 'from-blue-500 via-blue-600 to-indigo-700', glow: 'rgba(29,78,216,0.4)', border: 'border-blue-200/80 hover:border-blue-400' },
};

const CUSTOM_PALETTE = [
  { grad: 'from-teal-400 to-cyan-600', glow: 'rgba(13,148,136,0.35)', border: 'from-teal-200' },
  { grad: 'from-amber-400 to-orange-600', glow: 'rgba(217,119,6,0.35)', border: 'from-amber-200' },
  { grad: 'from-violet-400 to-purple-600', glow: 'rgba(147,51,234,0.35)', border: 'from-violet-200' },
  { grad: 'from-rose-400 to-pink-600', glow: 'rgba(219,39,119,0.35)', border: 'from-rose-200' },
];

export default function Community() {
  const [links, setLinks] = useState({});
  const [customLinks, setCustomLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await api.get('/student/community-links');
        setLinks(response.data.links || {});
        setCustomLinks(response.data.custom_links || []);
      } catch (err) {
        console.error('Error fetching community links', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-fuchsia-200 border-t-fuchsia-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connecting to Community Rooms...</p>
        </div>
      </div>
    );
  }

  const activeLinks = Object.entries(links).filter(([, url]) => url);
  const totalLinks = activeLinks.length + customLinks.length;

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-purple-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7e22ce 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-[10px] font-black uppercase tracking-widest text-fuchsia-200 mb-4 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Official Student Network
              </div>
              
              <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight flex items-center gap-3">
                Community Hub <Users2 className="w-7 h-7 sm:w-8 sm:h-8 text-fuchsia-300" />
              </h1>
              <p className="text-purple-100/80 text-xs sm:text-sm font-medium leading-relaxed">
                Connect with mentors, participate in weekly live workshops, and collaborate with thousands of ambitious learners.
              </p>
            </div>

            {totalLinks > 0 && (
              <div className="shrink-0 sm:self-center flex items-center gap-2.5 bg-white/10 border border-white/20 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white flex items-center justify-center font-black shadow-md">
                  <Flame className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">Active Rooms</p>
                  <p className="text-base font-black text-white">{totalLinks} Channels Live</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {totalLinks > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLinks.map(([key, url], idx) => {
            const meta = LINK_META[key];
            if (!meta) return null;
            return (
              <Reveal key={key} variant="fade-up" delay={idx * 80}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative overflow-hidden bg-white border ${meta.border} rounded-[2rem] p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5`}
                  style={{ boxShadow: '0 4px 20px -5px rgba(15,23,42,0.05)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 20px 40px -10px ${meta.glow}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(15,23,42,0.05)'; }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-slate-100/60 to-transparent pointer-events-none"></span>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative">
                        <span className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.grad} opacity-40 blur-lg group-hover:opacity-75 transition-opacity`}></span>
                        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.grad} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <meta.Icon className="w-7 h-7" strokeWidth={1.8} />
                        </div>
                      </div>
                      <span className="w-9 h-9 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">{meta.label}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{meta.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Join Channel
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </a>
              </Reveal>
            );
          })}

          {customLinks.map((item, idx) => {
            const meta = CUSTOM_PALETTE[idx % CUSTOM_PALETTE.length];
            return (
              <Reveal key={`custom-${item.id}`} variant="fade-up" delay={(activeLinks.length + idx) * 80}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative overflow-hidden bg-white border ${meta.border} rounded-[2rem] p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5`}
                  style={{ boxShadow: '0 4px 20px -5px rgba(15,23,42,0.05)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 20px 40px -10px ${meta.glow}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(15,23,42,0.05)'; }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-slate-100/60 to-transparent pointer-events-none"></span>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative">
                        <span className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${meta.grad} opacity-40 blur-lg group-hover:opacity-75 transition-opacity`}></span>
                        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.grad} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                          <Link2 className="w-7 h-7" strokeWidth={1.8} />
                        </div>
                      </div>
                      <span className="w-9 h-9 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">{item.description || 'Tap to open this community link.'}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Open External Link
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="relative overflow-hidden text-center py-16 bg-white rounded-3xl border border-slate-100 max-w-xl mx-auto animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <Users2 className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 relative z-10">No Community Rooms Yet</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6 relative z-10 px-6">Check back soon — community links will appear here once configured.</p>
        </div>
      )}
    </div>
  );
}
