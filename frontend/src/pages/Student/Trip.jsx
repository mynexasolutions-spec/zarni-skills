import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Plane, Wallet, Calendar, Clock, Zap, Flag, ArrowUpRight, Sparkles,
  Send, CheckCircle2, XCircle, Lock, MapPin, Trophy, Search, X, SlidersHorizontal,
} from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

// A digit tile. Keying the inner span on the digit makes React remount it the
// instant the number changes, which is what re-triggers the flip animation —
// a plain re-render would just swap the text with no transition.
//
// Two skins: `hero` is white tiles for the dark scoreboard, `card` is dark
// tiles for the white trip cards. Same markup, inverted palette.
const CLOCK_SKIN = {
  hero: {
    tile: 'bg-gradient-to-b from-white via-white to-slate-100 shadow-[0_8px_22px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.6)]',
    size: 'w-7 h-10 sm:w-10 sm:h-12',
    sizeSmall: 'w-7 h-10 sm:w-9 sm:h-12',
    text: 'text-sm sm:text-xl',
    digit: 'from-violet-700 to-fuchsia-900',
    digitPulse: 'from-fuchsia-600 to-rose-700',
    seam: 'bg-black/15',
    flap: 'from-black/[0.10]',
    label: 'text-white/60',
    labelPulse: 'text-fuchsia-300',
  },
  card: {
    tile: 'bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_4px_12px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.12)]',
    size: 'w-6 h-8 sm:w-7 sm:h-9',
    sizeSmall: 'w-5 h-8 sm:w-6 sm:h-9',
    text: 'text-[11px] sm:text-sm',
    digit: 'from-white to-slate-300',
    digitPulse: 'from-fuchsia-300 to-violet-400',
    seam: 'bg-white/15',
    flap: 'from-white/[0.10]',
    label: 'text-slate-400',
    labelPulse: 'text-violet-500',
  },
};

function FlipDigit({ digit, pulse, small, skin }) {
  const k = CLOCK_SKIN[skin];
  return (
    <div
      className={`relative rounded-md sm:rounded-lg overflow-hidden ${small ? k.sizeSmall : k.size} ${k.tile}`}
      style={{ perspective: '160px' }}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <span
          key={digit}
          className={`animate-flip-in font-heading font-black bg-gradient-to-b bg-clip-text text-transparent tabular-nums ${k.text} ${pulse ? k.digitPulse : k.digit}`}
          style={{ transformOrigin: 'center top', backfaceVisibility: 'hidden' }}
        >
          {digit}
        </span>

        {/* Hinge line + the shadow the top half casts as a digit lands */}
        <span className={`absolute inset-x-0 top-1/2 h-px z-10 pointer-events-none ${k.seam}`}></span>
        <span
          key={`sh-${digit}`}
          className={`absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent animate-flip-in pointer-events-none ${k.flap}`}
        ></span>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label, pulse, skin }) {
  const k = CLOCK_SKIN[skin];
  const digits = String(value).padStart(2, '0').split('');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex gap-0.5">
        {pulse && (
          <span key={value} className="absolute -inset-1 rounded-xl animate-tick-glow pointer-events-none"></span>
        )}
        {digits.map((d, i) => (
          <FlipDigit key={i} digit={d} pulse={pulse} small={digits.length > 2} skin={skin} />
        ))}
      </div>
      <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${pulse ? k.labelPulse : k.label}`}>
        {label}
      </span>
    </div>
  );
}

// Ticks once a second and keeps that state to itself — if the interval lived in
// the page or card component, the whole card would re-render 60 times a minute.
function TripCountdown({ goalDate, title, skin = 'hero' }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!goalDate) return null;
  const diff = new Date(`${goalDate}T23:59:59`).getTime() - now;
  if (!(diff > 0)) return null;

  const units = [
    { label: 'Days', value: Math.floor(diff / 86400000) },
    { label: 'Hrs', value: Math.floor((diff / 3600000) % 24) },
    { label: 'Min', value: Math.floor((diff / 60000) % 60) },
    { label: 'Sec', value: Math.floor((diff / 1000) % 60) },
  ];

  const row = (
    <div className={`flex items-center ${skin === 'hero' ? 'gap-1.5 sm:gap-2.5' : 'gap-1 sm:gap-1.5'}`}>
      {units.map((u) => (
        <CountdownUnit key={u.label} value={u.value} label={u.label} pulse={u.label === 'Sec'} skin={skin} />
      ))}
    </div>
  );

  if (!title) return row;

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 mb-2 min-w-0">
        <Clock className="w-3.5 h-3.5 text-violet-300 shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50 shrink-0">Time left for</span>
        <span className="text-[11px] font-black text-amber-200 truncate min-w-0">{title}</span>
      </div>
      {row}
    </div>
  );
}

// One place deciding how each of the three states looks, so "earned" and
// "still to go" can never drift into looking similar.
const STATUS = {
  achieved: {
    label: 'Earned',
    Icon: CheckCircle2,
    pill: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
    card: 'border-emerald-300 shadow-[0_10px_30px_-12px_rgba(16,185,129,0.45)]',
    accent: 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
    bar: 'from-emerald-500 to-teal-500',
    tint: 'from-emerald-50 to-white',
  },
  in_progress: {
    label: 'In Progress',
    Icon: Zap,
    pill: 'bg-violet-600 text-white shadow-md shadow-violet-600/30',
    card: 'border-violet-200',
    accent: 'bg-gradient-to-r from-transparent via-violet-400 to-transparent',
    bar: 'from-violet-500 to-indigo-500',
    tint: 'from-violet-50 to-white',
  },
  missed: {
    label: 'Deadline Passed',
    Icon: XCircle,
    pill: 'bg-slate-400 text-white',
    card: 'border-slate-200',
    accent: 'bg-gradient-to-r from-transparent via-slate-300 to-transparent',
    bar: 'from-slate-400 to-slate-500',
    tint: 'from-slate-50 to-white',
  },
};

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
const dateLabel = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function TripCard({ trip, onClaim, claimingId, setClaimingId, note, setNote, submittingId }) {
  const st = STATUS[trip.status] || STATUS.in_progress;
  const isClaiming = claimingId === trip.id;

  return (
    <div className={`group relative overflow-hidden bg-white border rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${st.card}`}>
      <span className={`absolute inset-x-0 top-0 h-[3px] z-20 pointer-events-none ${st.accent}`}></span>

      {/* Banner — 16:9 to match the 1200x675 derivative Cloudinary serves, so
          the delivered crop lands in the box with nothing cut off again. */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        {trip.image_display_url ? (
          <img
            src={trip.image_display_url}
            alt={trip.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${trip.status === 'missed' ? 'grayscale' : ''}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${st.tint} flex items-center justify-center`}>
            <Plane className="w-12 h-12 text-slate-300" strokeWidth={1.4} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

        {/* The single most important thing on the card */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${st.pill}`}>
          <st.Icon className="w-3.5 h-3.5" strokeWidth={2.6} /> {st.label}
        </span>

        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-amber-200 text-[10px] font-black uppercase tracking-widest">
          {inr(trip.goal_amount)}
        </span>

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-heading font-black text-white text-base sm:text-lg leading-tight truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{trip.title}</h3>
          {trip.destination && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-white/75 mt-0.5 truncate">
              <MapPin className="w-3 h-3 shrink-0" /> {trip.destination}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {trip.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">{trip.description}</p>
        )}

        {/* Progress — always shown, so "how far along" is never a guess */}
        <div className="mb-3">
          <div className="flex items-end justify-between gap-2 mb-2">
            <span className={`font-heading font-black text-2xl leading-none tabular-nums bg-gradient-to-r ${st.bar} bg-clip-text text-transparent`}>
              {trip.progress_pct}<span className="text-sm">%</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wide text-slate-400 tabular-nums pb-0.5">
              {trip.achieved ? 'Target reached' : `${inr(trip.remaining)} to go`}
            </span>
          </div>
          <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden ring-1 ring-inset ring-slate-200/70">
            <div
              className={`relative h-full rounded-full bg-gradient-to-r ${st.bar} transition-[width] duration-1000 ease-out`}
              style={{ width: `${trip.progress_pct}%` }}
            >
              <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-white/25 pointer-events-none"></span>
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 mt-1.5">
            <span className="text-[10px] font-black text-slate-600 tabular-nums">{inr(trip.current_earnings)}</span>
            <span className="text-[10px] font-bold text-slate-400 tabular-nums">of {inr(trip.goal_amount)}</span>
          </div>
        </div>

        {/* Deadline + its own live clock. Every open trip gets one, so each
            card answers "how long do I have" without going back up the page. */}
        <div className="pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{dateLabel(trip.goal_date)}</span>
            {trip.status === 'missed' && <span className="ml-auto font-black text-slate-400">Closed</span>}
            {trip.status !== 'missed' && trip.days_left <= 7 && trip.days_left >= 0 && (
              <span className="ml-auto font-black text-amber-600 uppercase tracking-wide text-[10px]">Final week</span>
            )}
          </div>

          {trip.status === 'missed' ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-400">
              <Clock className="w-3.5 h-3.5 shrink-0" /> Deadline has passed
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 shrink-0 hidden sm:block">
                {trip.achieved ? 'Window closes' : 'Time left'}
              </span>
              <div className="ml-auto">
                <TripCountdown goalDate={trip.goal_date} skin="card" />
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        {trip.achieved ? (
          trip.claim_status === 'pending' ? (
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-amber-600">
              <Clock className="w-4 h-4 shrink-0" /> Claim pending review
            </div>
          ) : trip.claim_status === 'approved' ? (
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Claim approved
            </div>
          ) : isClaiming ? (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional note (preferred dates, questions...)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onClaim(trip)}
                  disabled={submittingId === trip.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/25 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" /> {submittingId === trip.id ? 'Sending...' : 'Submit Claim'}
                </button>
                <button
                  onClick={() => { setClaimingId(null); setNote(''); }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {trip.claim_status === 'rejected' && (
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-red-500 mb-2">
                  <XCircle className="w-3.5 h-3.5" /> Previous claim not approved
                </p>
              )}
              <button
                onClick={() => { setClaimingId(trip.id); setNote(''); }}
                className="group/btn relative w-full overflow-hidden flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-white/25 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.6)] transition-all hover:-translate-y-0.5"
              >
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></span>
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent"></span>
                <Send className="relative w-3.5 h-3.5" />
                <span className="relative">{trip.claim_status === 'rejected' ? 'Re-Submit Claim' : 'Claim This Trip'}</span>
              </button>
            </>
          )
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {trip.status === 'missed' ? 'Deadline passed' : 'Keep earning to unlock'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Trip() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [note, setNote] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchTrips = async () => {
    try {
      const res = await api.get('/student/trip-goals');
      setTrips(res.data.trips || []);
      setEarnings(res.data.current_earnings || 0);
    } catch (err) {
      console.error('Error fetching trip goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleClaim = async (trip) => {
    setSubmittingId(trip.id);
    try {
      await api.post('/student/achievement-requests', { title: trip.title, note });
      setClaimingId(null);
      setNote('');
      fetchTrips();
    } catch (err) {
      console.error('Error submitting trip claim', err);
    } finally {
      setSubmittingId(null);
    }
  };

  // The nearest trip still within reach — the one worth putting a clock on.
  const nextTrip = trips.find((t) => t.status === 'in_progress') || null;

  const achievedCount = trips.filter((t) => t.achieved).length;
  const remainingCount = trips.filter((t) => t.status === 'in_progress').length;
  const missedCount = trips.filter((t) => t.status === 'missed').length;
  const overallPct = trips.length ? Math.round((achievedCount / trips.length) * 100) : 0;

  const filterTabs = [
    { key: 'all', label: 'All', Icon: SlidersHorizontal, count: trips.length },
    { key: 'achieved', label: 'Earned', Icon: Trophy, count: achievedCount },
    { key: 'in_progress', label: 'To Go', Icon: Zap, count: remainingCount },
    { key: 'missed', label: 'Closed', Icon: Flag, count: missedCount },
  ];

  const q = search.trim().toLowerCase();
  const visibleTrips = trips.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (q && !`${t.title} ${t.destination || ''}`.toLowerCase().includes(q)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up pb-12">

      <div className="flex items-center gap-3">
        <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin shrink-0" style={{ animationDuration: '15s' }} />
        <h2 className="text-xl sm:text-2xl font-black">Trip Achievements</h2>
      </div>

      {/* Scoreboard — answers "how many have I earned, how many are left" first */}
      <div className="relative">
        <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#0c0722]"></div>
          <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-violet-600/50 blur-[80px] animate-blob"></div>
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-fuchsia-600/40 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(12,7,34,0.72) 0%, rgba(12,7,34,0.5) 45%, rgba(12,7,34,0.94) 100%)' }}></div>
        </div>

        <div className="relative rounded-[2.2rem] p-5 sm:p-8 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(12,7,34,0.5)] overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-violet-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-3">
                <Sparkles className="w-3 h-3 text-amber-300" /> Travel Rewards
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-amber-100 bg-clip-text text-transparent">
                {achievedCount} of {trips.length} trips earned
              </h3>
              <p className="text-violet-100/80 text-xs sm:text-sm font-medium mt-2">
                Your active income counts toward every trip below. Only direct-referral earnings qualify.
              </p>

              <div className="mt-4 h-2 w-full max-w-md rounded-full bg-black/40 ring-1 ring-inset ring-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-violet-300 shadow-[0_0_12px_rgba(252,211,77,0.45)] transition-[width] duration-1000 ease-out"
                  style={{ width: `${overallPct}%` }}
                ></div>
              </div>
            </div>

            {/* Three counts, so nothing has to be inferred */}
            <div className="grid grid-cols-3 gap-2.5 shrink-0 lg:w-[340px]">
              {[
                { label: 'Earned', value: achievedCount, Icon: Trophy, color: '#34d399' },
                { label: 'To Go', value: remainingCount, Icon: Zap, color: '#c084fc' },
                { label: 'Closed', value: missedCount, Icon: Flag, color: '#94a3b8' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="rounded-2xl bg-black/35 border border-white/10 px-3 py-3.5 text-center">
                  <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} strokeWidth={2.4} />
                  <p className="font-heading text-2xl font-black leading-none tabular-nums" style={{ color }}>{value}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45 mt-1.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active income + countdown to the nearest reachable trip */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-3 shrink-0">
              <span className="w-11 h-11 rounded-xl bg-emerald-400/15 border border-emerald-300/30 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-emerald-300" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45 mb-1">Your Active Income</p>
                <AnimatedNumber value={earnings} prefix="₹" duration={1200}
                  className="block font-heading text-xl sm:text-2xl font-black text-white leading-none tabular-nums" />
              </div>
            </div>

            {nextTrip && (
              <div className="w-full sm:w-auto sm:ml-auto">
                <TripCountdown goalDate={nextTrip.goal_date} title={nextTrip.title} />
              </div>
            )}
          </div>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-4 animate-float">
            <Plane className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Active Trip Rewards</h3>
          <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
            Our team hasn't launched a travel rewards campaign yet. Your active income of{' '}
            <strong className="text-slate-700">{inr(earnings)}</strong> will count toward it when they do.
          </p>
        </div>
      ) : (
        <>
          {/* Prompt to keep earning, unless everything is already won */}
          {remainingCount > 0 && (
            <div className="relative overflow-hidden flex items-center gap-4 rounded-2xl p-4 sm:p-5 bg-violet-50 border border-violet-100">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-violet-900 flex-1 min-w-0">
                {nextTrip
                  ? <>Next up: <strong>{nextTrip.title}</strong> — {inr(nextTrip.remaining)} more to unlock it.</>
                  : `${remainingCount} trip${remainingCount === 1 ? '' : 's'} still open.`}
              </p>
              <button
                onClick={() => navigate('/student/referrals')}
                className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-4 py-2 bg-white rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                Boost Earnings <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter + search — same dark glass control bar as the achievements page */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-2.5 sm:p-3 overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.10)]">
            <span className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-violet-500/[0.05] blur-3xl pointer-events-none"></span>

            {/* 2x2 on phones rather than 4-across: four tabs in one narrow row
                left no room for the labels, which truncated to "EARN…"/"CLO…". */}
            <div className="relative grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`min-w-0 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all duration-300 active:scale-95 ${
                    filter === tab.key
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <tab.Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] tabular-nums ${
                    filter === tab.key ? 'bg-white/25 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trips..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 hover:bg-slate-50 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded-md transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {visibleTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-semibold px-6">
                No trips match {search ? `"${search}"` : 'this filter'}.
              </p>
              {(search || filter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {visibleTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClaim={handleClaim}
                  claimingId={claimingId}
                  setClaimingId={setClaimingId}
                  note={note}
                  setNote={setNote}
                  submittingId={submittingId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
