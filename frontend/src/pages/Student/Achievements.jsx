import React, { useEffect, useState } from 'react';
import { Award, Trophy, Users, Rocket, Star, Crown, Medal, Target, Flame, Gem, Zap, ShieldCheck, Lock, CheckCircle2, Loader2, Send, Clock, XCircle } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const ICON_MAP = {
  Trophy, Users, Rocket, Star, Crown, Medal, Target, Flame, Gem, Zap, ShieldCheck, Award,
};

function formatMetricLine(m) {
  if (m.metric === 'referrals') return `${m.current} / ${m.target} referrals`;
  if (m.metric === 'rank') return m.current ? `Currently rank #${m.current}` : 'Not ranked yet';
  return `₹${Number(m.current).toLocaleString('en-IN')} / ₹${Number(m.target).toLocaleString('en-IN')} active income`;
}

export default function Achievements() {
  const [milestones, setMilestones] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barsVisible, setBarsVisible] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [note, setNote] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/student/achievement-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching achievement requests', err);
    }
  };

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await api.get('/student/achievement-milestones');
        setMilestones(response.data.milestones || []);
      } catch (err) {
        console.error('Error fetching achievement data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
    fetchRequests();
  }, []);

  const requestFor = (achievementId) => requests.find(r => r.achievement_id === achievementId);

  const handleClaim = async (achievementId) => {
    setSubmittingId(achievementId);
    try {
      await api.post('/student/achievement-requests', { achievement_id: achievementId, note });
      setClaimingId(null);
      setNote('');
      fetchRequests();
    } catch (err) {
      console.error('Error submitting achievement claim', err);
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setBarsVisible(true), 100);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const unlockedCount = milestones.filter(m => m.unlocked).length;

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white mb-8 sm:mb-10 animate-fade-in-up animate-gradient-x"
        style={{ background: 'linear-gradient(115deg, #1c1147 0%, #4c1d95 30%, #7c3aed 55%, #4c1d95 80%, #1c1147 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-fuchsia-400/20 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-amber-400/15 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
        {/* floating sparkles */}
        {[
          { top: '18%', left: '58%', size: 4, delay: '0s', dur: '5s' },
          { top: '62%', left: '48%', size: 3, delay: '1.2s', dur: '6s' },
          { top: '32%', left: '73%', size: 5, delay: '0.6s', dur: '4.5s' },
          { top: '78%', left: '66%', size: 3, delay: '2s', dur: '5.5s' },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-amber-200/70 pointer-events-none"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              boxShadow: '0 0 8px 2px rgba(252,211,77,0.6)',
              animation: `float ${s.dur} ease-in-out infinite`,
              animationDelay: s.delay
            }}
          ></span>
        ))}

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-3">
              <Award className="w-3.5 h-3.5 animate-pulse" /> Milestone Tracker
            </div>
            <h1 className="text-xl sm:text-3xl font-black mb-2 flex items-center gap-2">My Achievements</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md">Badges that unlock automatically from your real earnings and referral activity.</p>
          </div>
          <div className="relative shrink-0 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-4 text-center overflow-hidden">
            <span className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent"></span>
            <p className="relative text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1">Unlocked</p>
            <p className="relative text-3xl font-black leading-none">
              <AnimatedNumber value={unlockedCount} duration={900} className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent" />
              <span className="text-white/50 text-lg">/{milestones.length}</span>
            </p>
          </div>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
          No achievement milestones have been set up yet. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {milestones.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Trophy;
            const pct = item.unlocked ? 100 : Math.min(100, Math.round((item.current / item.target) * 100));
            const onCardMouseMove = (e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              el.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
              el.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
            };
            const onCardMouseLeave = (e) => {
              e.currentTarget.style.setProperty('--tilt-x', '0deg');
              e.currentTarget.style.setProperty('--tilt-y', '0deg');
            };
            return (
              <div
                key={item.id}
                onMouseMove={onCardMouseMove}
                onMouseLeave={onCardMouseLeave}
                className="group relative animate-pop-in transition-transform duration-300 hover:-translate-y-2 [transform:perspective(1000px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {/* Ambient colored glow behind the card, blooms on hover */}
                <div className={`absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 pointer-events-none`}></div>

              <div className={`relative overflow-hidden bg-white border rounded-2xl sm:rounded-[1.75rem] p-3 sm:p-6 shadow-sm transition-shadow duration-300 ${item.unlocked ? 'border-slate-100 group-hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.18)]' : 'border-slate-100 group-hover:shadow-xl'}`}>
                {item.unlocked && (
                  <>
                    <span className="absolute top-2 left-2 w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(252,211,77,0.8)] animate-float pointer-events-none z-10"></span>
                    <span className="absolute top-8 left-6 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)] animate-float-delayed pointer-events-none z-10"></span>
                  </>
                )}
                <span className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none z-10 ${
                  item.unlocked ? 'bg-gradient-to-r from-transparent via-slate-100/70 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-200/25 to-transparent'
                }`}></span>
                {item.unlocked && !item.image_display_url && (
                  <div className="absolute top-5 right-5 z-10">
                    <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-md animate-pulse"></div>
                    <CheckCircle2 className="relative w-5 h-5 text-emerald-500" />
                  </div>
                )}

                {item.image_display_url ? (
                  <div className="relative -mx-3 -mt-3 sm:-mx-6 sm:-mt-6 mb-2.5 sm:mb-4 aspect-square overflow-hidden">
                    {/* Glow ring around the image, colored by tier when unlocked */}
                    <div className={`absolute -inset-4 opacity-60 blur-2xl transition-opacity duration-500 ${item.unlocked ? `bg-gradient-to-br ${item.gradient}` : 'bg-slate-400/0'}`}></div>
                    <img
                      src={item.image_display_url}
                      alt={item.title}
                      className={`relative w-full h-full object-cover transition-all duration-500 ${item.unlocked ? 'group-hover:scale-110' : 'grayscale brightness-[0.4] group-hover:brightness-[0.5] group-hover:scale-105'}`}
                    />
                    <div className={`absolute inset-0 ${item.unlocked ? 'bg-gradient-to-t from-black/60 via-black/5 to-transparent' : 'bg-gradient-to-b from-black/50 via-black/25 to-black/50'}`}></div>

                    {/* Target amount ribbon */}
                    <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md border shadow-md ${
                      item.unlocked
                        ? 'bg-white/15 border-white/25 text-white'
                        : `bg-gradient-to-r ${item.gradient} border-white/10 text-white shadow-black/40`
                    }`}>
                      {item.metric === 'earnings' ? `₹${Number(item.target).toLocaleString('en-IN')}` : formatMetricLine(item).split(' / ')[1] || item.title}
                    </span>

                    {item.unlocked ? (
                      <div className="absolute top-3 right-3">
                        <div className="absolute inset-0 rounded-full bg-emerald-400/50 blur-md animate-pulse"></div>
                        <div className="relative w-8 h-8 rounded-full bg-emerald-500 border-2 border-white/70 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-3 rounded-full bg-amber-400/40 blur-lg animate-pulse"></div>
                          <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-amber-300/50 animate-spin-slow"></div>
                          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-black border border-amber-300/40 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-transform duration-300 group-hover:scale-110">
                            <Lock className="w-6 h-6 text-amber-300" strokeWidth={2.2} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Title overlaid on the image, matching the reference layout */}
                    <h3 className="absolute bottom-2 sm:bottom-3 left-2.5 sm:left-4 right-2.5 sm:right-4 font-black text-white text-xs sm:text-base tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] truncate">{item.title}</h3>
                  </div>
                ) : (
                  <div className="relative inline-block mb-4">
                    {item.unlocked && <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-40 blur-md animate-pulse`}></div>}
                    <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${item.unlocked ? `bg-gradient-to-br ${item.gradient} shadow-lg` : 'bg-slate-100'}`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.unlocked ? 'text-white' : 'text-slate-400'}`} strokeWidth={1.8} />
                    </div>
                  </div>
                )}
                {!item.image_display_url && <h3 className="relative font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h3>}
                {item.description && <p className="relative text-[10px] sm:text-xs text-slate-500 leading-relaxed mb-2.5 sm:mb-4 line-clamp-2 sm:line-clamp-none">{item.description}</p>}

                {!item.unlocked && (
                  <div className="relative mb-2.5 sm:mb-3.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold truncate min-w-0">{formatMetricLine(item)}</p>
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-500 tabular-nums shrink-0">{pct}%</span>
                    </div>
                    <div className="relative w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`relative h-full rounded-full bg-gradient-to-r ${item.gradient} shadow-[0_0_10px_rgba(0,0,0,0.15)] transition-[width] duration-1000 ease-out overflow-hidden`}
                        style={{ width: barsVisible ? `${pct}%` : '0%', transitionDelay: `${idx * 60}ms` }}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer-sweep"></span>
                      </div>
                    </div>
                  </div>
                )}

                <span className={`relative inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${
                  item.unlocked ? 'bg-emerald-50 text-emerald-600 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]' : 'bg-slate-100 text-slate-500 shadow-[0_0_0_1px_rgba(100,116,139,0.1)]'
                }`}>
                  {item.unlocked ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {item.unlocked ? 'Unlocked' : 'Locked'}
                </span>

                {item.unlocked && (() => {
                  const req = requestFor(item.id);
                  if (req?.status === 'pending') {
                    return (
                      <div className="relative mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5" /> Claim Pending Review
                      </div>
                    );
                  }
                  if (req?.status === 'approved') {
                    return (
                      <div className="relative mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claim Approved
                      </div>
                    );
                  }
                  return (
                    <div className="relative mt-3 pt-3 border-t border-slate-100">
                      {req?.status === 'rejected' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Previous claim not approved
                        </p>
                      )}
                      {claimingId === item.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Optional note for the admin..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClaim(item.id)}
                              disabled={submittingId === item.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase disabled:opacity-60"
                            >
                              <Send className="w-3 h-3" /> {submittingId === item.id ? 'Sending...' : 'Submit'}
                            </button>
                            <button onClick={() => { setClaimingId(null); setNote(''); }} className="px-3 py-2 border border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-500">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setClaimingId(item.id)}
                          className={`group/btn relative w-full overflow-hidden flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${item.gradient} shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                        >
                          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                          <Send className="relative w-3 h-3 shrink-0" /> <span className="relative">Claim This Achievement</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
