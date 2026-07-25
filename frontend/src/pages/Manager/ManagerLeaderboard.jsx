import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Loader2, Sun, CalendarDays, CalendarRange, Infinity as InfinityIcon } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const PERIODS = [
  { key: 'today', label: 'Today', Icon: Sun },
  { key: '7days', label: '7 Days', Icon: CalendarDays },
  { key: '30days', label: '30 Days', Icon: CalendarRange },
  { key: 'alltime', label: 'All Time', Icon: InfinityIcon },
];

const RANK_BADGE = {
  0: 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-400/50',
  1: 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-400/50',
  2: 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-400/50',
};

function Avatar({ row, size = 'w-10 h-10' }) {
  const initials = row.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return row.profile_image_url ? (
    <img src={row.profile_image_url} alt={row.name} className={`${size} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

export default function ManagerLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [period, setPeriod] = useState('alltime');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setTabLoading(true);
        const response = await api.get(`/manager/leaderboard?period=${period}`);
        setLeaderboard(response.data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching manager leaderboard', err);
      } finally {
        setLoading(false);
        setTabLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight">Team Leaderboard</h2>
          <p className="text-xs text-slate-400 font-medium">Top performers in your team</p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              period === p.key
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 -translate-y-0.5'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:-translate-y-0.5'
            }`}
          >
            <p.Icon className="w-3.5 h-3.5" />
            {p.label}
          </button>
        ))}
        {tabLoading && <Loader2 className="w-4 h-4 text-violet-600 animate-spin ml-1 shrink-0" />}
      </div>

      {/* Ranked list */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 sm:p-6 shadow-sm">
        <div className="divide-y divide-slate-50">
          {leaderboard.map((row, idx) => (
            <div
              key={row.id}
              className="group flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3.5 rounded-2xl transition-all animate-fade-in-up hover:bg-slate-50"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 ${
                idx < 3 ? `shadow-md ${RANK_BADGE[idx]}` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
              }`}>
                {idx === 0 ? <Crown className="w-3.5 h-3.5" fill="currentColor" /> : idx + 1}
              </span>
              <Avatar row={row} size="w-9 h-9 sm:w-10 sm:h-10" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">{row.name}</p>
              </div>
              <AnimatedNumber value={row.earnings} prefix="₹" duration={1000} className="font-black text-xs sm:text-sm text-slate-900 shrink-0 whitespace-nowrap tabular-nums" />
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium px-6">No earnings in your team yet for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
