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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {milestones.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Trophy;
            const pct = item.unlocked ? 100 : Math.min(100, Math.round((item.current / item.target) * 100));
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl animate-pop-in ${item.unlocked ? 'border-slate-100' : 'border-slate-100 opacity-90'}`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {item.unlocked && (
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-slate-100/70 to-transparent pointer-events-none"></span>
                )}
                {item.unlocked && (
                  <div className="absolute top-5 right-5">
                    <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-md animate-pulse"></div>
                    <CheckCircle2 className="relative w-5 h-5 text-emerald-500" />
                  </div>
                )}
                <div className="relative inline-block mb-4">
                  {item.unlocked && <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-40 blur-md animate-pulse`}></div>}
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${item.unlocked ? `bg-gradient-to-br ${item.gradient} shadow-lg` : 'bg-slate-100'}`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.unlocked ? 'text-white' : 'text-slate-400'}`} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="relative font-bold text-slate-900 mb-1">{item.title}</h3>
                {item.description && <p className="relative text-xs text-slate-500 leading-relaxed mb-4">{item.description}</p>}

                {!item.unlocked && (
                  <div className="relative mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] text-slate-400 font-bold">{formatMetricLine(item)}</p>
                      <span className="text-[10px] font-black text-slate-400 tabular-nums">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-[width] duration-1000 ease-out`}
                        style={{ width: barsVisible ? `${pct}%` : '0%', transitionDelay: `${idx * 60}ms` }}
                      ></div>
                    </div>
                  </div>
                )}

                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  item.unlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
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
                          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary rounded-lg text-[10px] font-bold uppercase text-slate-500 transition-colors"
                        >
                          <Send className="w-3 h-3" /> Claim This Achievement
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
