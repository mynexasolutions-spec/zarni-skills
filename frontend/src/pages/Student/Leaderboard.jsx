import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Crown, Medal, Flame, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

const PODIUM_STYLES = {
  0: {
    ring: 'ring-4 ring-amber-300',
    badge: 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-400/50',
    glow: 'shadow-[0_20px_50px_-15px_rgba(251,191,36,0.5)]',
    order: 'order-2',
    lift: '-translate-y-4 sm:-translate-y-8',
    height: 'py-10 sm:py-12',
  },
  1: {
    ring: 'ring-4 ring-slate-300',
    badge: 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-400/50',
    glow: 'shadow-[0_15px_40px_-15px_rgba(148,163,184,0.5)]',
    order: 'order-1',
    lift: '',
    height: 'py-7 sm:py-8',
  },
  2: {
    ring: 'ring-4 ring-orange-300',
    badge: 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-400/50',
    glow: 'shadow-[0_15px_40px_-15px_rgba(251,146,60,0.5)]',
    order: 'order-3',
    lift: '',
    height: 'py-7 sm:py-8',
  },
};

function Avatar({ row, size = 'w-16 h-16' }) {
  const initials = row.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return row.profile_image_url ? (
    <img src={row.profile_image_url} alt={row.name} className={`${size} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white font-black flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [position, setPosition] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/student/dashboard');
        setLeaderboard(response.data.leaderboard || []);
        setPosition(response.data.leaderboard_position || 1);
      } catch (err) {
        console.error('Error fetching leaderboard lists', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const topEarnings = leaderboard[0]?.earnings || 1;
  const inTop10 = leaderboard.some(row => row.id === user?.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-white mb-12 shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0b1428 0%, #101c4a 55%, #1a2f6e 100%)' }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/25 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-amber-400/15 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-3">
              <Flame className="w-3.5 h-3.5" /> Live Rankings
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 animate-float" /> Top Earners
            </h1>
            <p className="text-slate-300 text-sm font-medium">See who's leading the pack this season.</p>
          </div>
          <div className="bg-white/10 border border-white/15 px-7 py-4 rounded-2xl text-center backdrop-blur-sm">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">Your Position</p>
            <p className="text-3xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">#{position}</p>
          </div>
        </div>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 sm:gap-6 mb-14 px-2">
          {top3.map((row, idx) => {
            const style = PODIUM_STYLES[idx];
            const isCurrentUser = row.id === user?.id;
            return (
              <div
                key={row.id}
                className={`relative flex-1 max-w-[180px] ${style.order} ${style.lift} animate-fade-in-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {idx === 0 && (
                  <Crown className="w-8 h-8 text-amber-400 absolute -top-9 left-1/2 -translate-x-1/2 drop-shadow-[0_4px_8px_rgba(251,191,36,0.5)]" fill="currentColor" />
                )}
                <div className={`relative bg-white rounded-3xl px-4 ${style.height} text-center border border-slate-100 ${style.glow} ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex justify-center mb-3">
                    <div className={`rounded-full ${style.ring}`}>
                      <Avatar row={row} size={idx === 0 ? 'w-20 h-20' : 'w-16 h-16'} />
                    </div>
                  </div>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black mb-2 shadow-lg ${style.badge}`}>
                    {idx + 1}
                  </span>
                  <p className="font-bold text-sm text-slate-900 truncate">
                    {row.name} {isCurrentUser && <span className="text-primary">(You)</span>}
                  </p>
                  <p className="font-black text-base sm:text-lg text-slate-900 mt-1">₹{row.earnings.toLocaleString('en-IN')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranked list (4th onward) */}
      {rest.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-sm mb-8">
          <div className="space-y-2">
            {rest.map((row, idx) => {
              const isCurrentUser = row.id === user?.id;
              const rank = idx + 4;
              const barWidth = Math.max(6, Math.round((row.earnings / topEarnings) * 100));
              return (
                <div
                  key={row.id}
                  className={`relative overflow-hidden flex items-center gap-4 p-3.5 rounded-2xl transition-all animate-fade-in-up ${
                    isCurrentUser ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-slate-50'
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/5 to-transparent"
                    style={{ width: `${barWidth}%` }}
                  ></div>
                  <span className="relative w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black shrink-0">
                    {rank}
                  </span>
                  <div className="relative">
                    <Avatar row={row} size="w-9 h-9" />
                  </div>
                  <p className={`relative flex-1 font-bold text-sm truncate ${isCurrentUser ? 'text-primary' : 'text-slate-900'}`}>
                    {row.name} {isCurrentUser && <span className="text-xs text-primary/70 font-medium">(You)</span>}
                  </p>
                  <p className="relative font-black text-sm text-slate-900 shrink-0">₹{row.earnings.toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm font-medium">
          No leaderboard stats available yet. Start earning commissions to climb the ranks!
        </div>
      )}

      {/* Your position card, shown if outside top 10 */}
      {leaderboard.length > 0 && !inTop10 && (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg">
          <div className="w-11 h-11 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">You're currently ranked #{position}</p>
            <p className="text-xs text-white/75">Keep referring and earning to climb into the top 10!</p>
          </div>
          <Medal className="w-8 h-8 text-white/40 shrink-0" />
        </div>
      )}

    </div>
  );
}
