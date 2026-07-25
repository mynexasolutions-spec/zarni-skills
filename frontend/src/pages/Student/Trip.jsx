import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Plane, Wallet, Calendar, TrendingUp, Clock, Zap, Flag, ArrowUpRight, Sparkles, Send, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const TRIP_REQUEST_TITLE = 'Trip Achievement';

function daysLeft(goalDateStr) {
  const goalDate = new Date(goalDateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = goalDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function Trip() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tripRequest, setTripRequest] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTripRequest = async () => {
    try {
      const res = await api.get('/student/achievement-requests');
      const items = res.data.requests || [];
      const latest = items.find((r) => !r.achievement_id && r.achievement_title === TRIP_REQUEST_TITLE);
      setTripRequest(latest || null);
    } catch (err) {
      console.error('Error fetching trip claim status', err);
    }
  };

  useEffect(() => {
    const fetchTripGoal = async () => {
      try {
        const response = await api.get('/student/trip-goal');
        setGoal(response.data);
      } catch (err) {
        console.error('Error fetching trip achievement data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTripGoal();
    fetchTripRequest();
  }, []);

  const handleClaimTrip = async () => {
    setSubmitting(true);
    try {
      await api.post('/student/achievement-requests', { title: TRIP_REQUEST_TITLE, note });
      setClaiming(false);
      setNote('');
      fetchTripRequest();
    } catch (err) {
      console.error('Error submitting trip claim', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const earnings = goal?.current_earnings || 0;

  if (!goal?.configured) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin shrink-0" style={{ animationDuration: '15s' }} />
          <h2 className="text-xl sm:text-2xl font-black">Trip Achievements</h2>
        </div>

        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow animate-scale-in">
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-sky-500/5 blur-2xl pointer-events-none"></div>
          <div className="relative flex flex-col sm:flex-row items-center gap-6 border-b pb-6 mb-6">
            <div className="relative w-20 h-20 shrink-0">
              <div className="absolute -inset-1.5 rounded-2xl bg-sky-400/30 blur-md animate-pulse"></div>
              <div className="relative w-full h-full rounded-2xl bg-sky-50 border flex items-center justify-center text-sky-600 animate-float">
                <Plane className="w-10 h-10" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-md">Not Yet Configured</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">No Active Trip Reward Program</h3>
              <p className="text-slate-500 text-xs mt-1">Our team hasn't launched a travel rewards campaign yet. Check back soon — your earnings below will count toward it.</p>
            </div>
          </div>

          <div className="relative flex items-center gap-4 bg-slate-50 rounded-2xl p-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Active Income</p>
              <AnimatedNumber value={earnings} prefix="₹" duration={1200} className="block text-xl sm:text-2xl font-black text-slate-900 mt-0.5" />
              <p className="text-[10px] text-slate-400 mt-1">Only direct-referral (active) earnings count toward this goal</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const target = goal.goal_amount || 0;
  const remaining = Math.max(0, target - earnings);
  const pct = target > 0 ? Math.min(100, Math.round((earnings / target) * 100)) : 0;
  const achieved = earnings >= target;
  const remainingDays = daysLeft(goal.goal_date);
  const goalDateLabel = new Date(goal.goal_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const isOverdue = !achieved && remainingDays <= 0;
  const isUrgent = !achieved && remainingDays > 0 && remainingDays <= 7;
  const dailyPace = !achieved && remainingDays > 0 ? Math.ceil(remaining / remainingDays) : 0;

  const statusMessage = achieved
    ? "You've hit your target — this trip is yours! 🎉"
    : isOverdue
    ? "The deadline has passed for this goal, but your earnings keep counting toward the next one."
    : isUrgent
    ? `Only ${remainingDays} day${remainingDays === 1 ? '' : 's'} left — earn ₹${dailyPace.toLocaleString('en-IN')}/day to make it.`
    : `You're ${pct}% of the way there. Keep referring to stay on pace.`;

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin shrink-0" style={{ animationDuration: '15s' }} />
        <h2 className="text-xl sm:text-2xl font-black">Trip Achievements</h2>
      </div>

      {/* Trip image + title */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] mb-6 text-white animate-fade-in-up animate-gradient-x"
        style={{ background: achieved
          ? 'linear-gradient(115deg, #064e3b 0%, #059669 30%, #10b981 55%, #059669 80%, #064e3b 100%)'
          : 'linear-gradient(115deg, #0f1f4d 0%, #1e3a8a 30%, #2563eb 55%, #1e3a8a 80%, #0f1f4d 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
        {achieved && <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>}
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>
        {achieved && [
          { top: '20%', left: '58%', size: 4, delay: '0s', dur: '5s' },
          { top: '65%', left: '48%', size: 3, delay: '1.2s', dur: '6s' },
          { top: '35%', left: '73%', size: 5, delay: '0.6s', dur: '4.5s' },
        ].map((s, i) => (
          <span key={i} className="absolute rounded-full bg-amber-200/70 pointer-events-none"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, boxShadow: '0 0 8px 2px rgba(252,211,77,0.6)', animation: `float ${s.dur} ease-in-out infinite`, animationDelay: s.delay }}
          ></span>
        ))}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 p-6 sm:p-10">
          {goal.image_url && (
            <div className="w-28 h-28 sm:w-40 sm:h-40 shrink-0 relative animate-float">
              <img
                src={goal.image_url}
                alt="Trip reward"
                className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.25)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <div className="text-center sm:text-left">
            {achieved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-3 animate-pulse">
                <Plane className="w-3 h-3" /> Goal Achieved!
              </span>
            )}
            <h3 className="text-xl sm:text-3xl font-black">{goal.title}</h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-2">Hit your income goal before the deadline to unlock this trip reward.</p>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className={`relative overflow-hidden flex items-center gap-4 rounded-2xl p-4 sm:p-5 mb-6 animate-fade-in-up ${
        achieved ? 'bg-emerald-50 border border-emerald-100' : isUrgent ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50 border border-blue-100'
      }`} style={{ animationDelay: '40ms' }}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          achieved ? 'bg-emerald-500 text-white' : isUrgent ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {achieved ? <Sparkles className="w-5 h-5" /> : isUrgent ? <Zap className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
        </div>
        <p className={`text-sm font-bold flex-1 ${achieved ? 'text-emerald-800' : isUrgent ? 'text-amber-800' : 'text-blue-800'}`}>
          {statusMessage}
        </p>
        {!achieved && (
          <button
            onClick={() => navigate('/student/referrals')}
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-4 py-2 bg-white rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            Boost Earnings <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Claim the trip reward */}
      {achieved && (
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up mb-6" style={{ animationDelay: '60ms' }}>
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>
          <div className="relative flex items-center gap-3 mb-5">
            <span className="relative w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <span className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-md animate-pulse"></span>
              <Plane className="relative w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Claim Your Trip Reward</h3>
              <p className="text-xs text-slate-400">Let our team know so they can confirm your trip booking</p>
            </div>
          </div>

          {tripRequest?.status === 'pending' ? (
            <div className="relative flex items-center gap-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl p-4 text-sm font-bold">
              <Clock className="w-5 h-5 shrink-0" /> Your claim is pending review by our team.
            </div>
          ) : tripRequest?.status === 'approved' ? (
            <div className="relative flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-4 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" /> Claim approved! Our team will reach out to arrange your trip.
            </div>
          ) : (
            <div className="relative">
              {tripRequest?.status === 'rejected' && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm mb-4">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Your previous claim wasn't approved.</p>
                    {tripRequest.admin_note && <p className="text-xs mt-1 text-red-600/80">Reason: {tripRequest.admin_note}</p>}
                  </div>
                </div>
              )}
              {claiming ? (
                <div className="space-y-3">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Optional note for the admin (preferred dates, destination questions, etc.)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleClaimTrip}
                      disabled={submitting}
                      className="group relative overflow-hidden flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:shadow-xl transition-all disabled:opacity-60 active:scale-[0.98]"
                    >
                      {!submitting && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                      <Send className="w-3.5 h-3.5 relative" /> <span className="relative">{submitting ? 'Submitting...' : 'Submit Claim'}</span>
                    </button>
                    <button onClick={() => { setClaiming(false); setNote(''); }} className="px-5 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setClaiming(true)}
                  className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                  <Send className="w-4 h-4 relative" /> <span className="relative">{tripRequest?.status === 'rejected' ? 'Re-Submit Claim' : 'Request Trip Reward'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calculator */}
      <div className="bg-white border border-slate-100 rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
          <span className="relative w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="absolute inset-0 rounded-lg bg-primary/30 blur-md animate-pulse"></span>
            <TrendingUp className="relative w-3.5 h-3.5 text-primary" />
          </span>
          Trip Calculator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
          <div className="group relative overflow-hidden rounded-2xl p-5 bg-sky-50 border border-sky-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <Clock className="absolute -right-2 -bottom-2 w-16 h-16 text-sky-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
            <div className="relative flex items-center gap-2 text-sky-600 mb-2">
              <Clock className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest">Time Left</span>
            </div>
            <p className="relative text-xl sm:text-2xl font-black text-slate-900">
              {remainingDays > 0 ? `${remainingDays} day${remainingDays === 1 ? '' : 's'}` : 'Deadline passed'}
            </p>
            <p className="relative text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Target date: {goalDateLabel}
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-5 bg-emerald-50 border border-emerald-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <Wallet className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
            <div className="relative flex items-center gap-2 text-emerald-600 mb-2">
              <Wallet className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest">{achieved ? 'Goal Reached' : 'Income Left'}</span>
            </div>
            <AnimatedNumber value={remaining} prefix="₹" duration={1200} className="relative block text-xl sm:text-2xl font-black text-slate-900" />
            <p className="relative text-xs text-slate-400 mt-1">of ₹{target.toLocaleString('en-IN')} target</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-5 bg-purple-50 border border-purple-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <Zap className="absolute -right-2 -bottom-2 w-16 h-16 text-purple-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
            <div className="relative flex items-center gap-2 text-purple-600 mb-2">
              <Zap className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest">Daily Pace Needed</span>
            </div>
            <p className="relative text-xl sm:text-2xl font-black text-slate-900">
              {achieved ? '—' : remainingDays > 0 ? `₹${dailyPace.toLocaleString('en-IN')}` : 'N/A'}
            </p>
            <p className="relative text-xs text-slate-400 mt-1">{achieved ? 'Goal already met' : remainingDays > 0 ? 'per day to hit the target' : 'deadline has passed'}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>₹{earnings.toLocaleString('en-IN')} earned</span>
            <span>{pct}%</span>
          </div>
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            {[25, 50, 75].map((m) => (
              <span key={m} className="absolute top-0 bottom-0 w-px bg-white/80 z-10" style={{ left: `${m}%` }}></span>
            ))}
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-primary to-indigo-600 transition-all duration-1000 ease-out overflow-visible"
              style={{ width: `${pct}%` }}
            >
              <span className="absolute inset-0 rounded-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent"></span>
              {pct > 0 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_0_3px_rgba(37,99,235,0.3)]"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
