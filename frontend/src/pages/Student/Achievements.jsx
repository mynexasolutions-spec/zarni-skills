import React, { useEffect, useState } from 'react';
import { Award, Trophy, Users, Rocket, Star, Crown, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function Achievements() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/student/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching achievement data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const earnings = stats?.all_time_earnings || 0;
  const referrals = stats?.referrals_count || 0;
  const rank = stats?.leaderboard_position || null;

  const milestones = [
    {
      title: 'First Commission', desc: 'Earn your first affiliate referral commission.',
      icon: Trophy, unlocked: earnings > 0, current: earnings, target: 1, format: 'currency',
      grad: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Rising Earner', desc: 'Cross ₹5,000 in lifetime commission earnings.',
      icon: Rocket, unlocked: earnings >= 5000, current: earnings, target: 5000, format: 'currency',
      grad: 'from-emerald-400 to-teal-600',
    },
    {
      title: 'First Referral', desc: 'Get your first person to join through your link.',
      icon: Users, unlocked: referrals >= 1, current: referrals, target: 1, format: 'count',
      grad: 'from-blue-400 to-indigo-600',
    },
    {
      title: 'Network Builder', desc: 'Refer 10 active students to the platform.',
      icon: Star, unlocked: referrals >= 10, current: referrals, target: 10, format: 'count',
      grad: 'from-violet-400 to-purple-600',
    },
    {
      title: 'Top 10 Earner', desc: 'Break into the top 10 on the earnings leaderboard.',
      icon: Crown, unlocked: rank !== null && rank <= 10, current: rank ? Math.max(0, 11 - rank) : 0, target: 10, format: 'rank', rankValue: rank,
      grad: 'from-pink-400 to-rose-600',
    },
  ];

  const unlockedCount = milestones.filter(m => m.unlocked).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-slate-800">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-black">My Achievements</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Based on your real earnings and referral activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
          <span className="text-sm font-black text-primary">{unlockedCount}</span>
          <span className="text-xs font-bold text-slate-500">/ {milestones.length} unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map((item, idx) => {
          const Icon = item.icon;
          const pct = item.unlocked ? 100 : Math.min(100, Math.round((item.current / item.target) * 100));
          return (
            <div
              key={idx}
              className={`relative overflow-hidden bg-white border rounded-3xl p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg animate-fade-in-up ${item.unlocked ? 'border-slate-100' : 'border-slate-100 opacity-90'}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {item.unlocked && (
                <CheckCircle2 className="absolute top-5 right-5 w-5 h-5 text-emerald-500" />
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${item.unlocked ? `bg-gradient-to-br ${item.grad} shadow-lg` : 'bg-slate-100'}`}>
                <Icon className={`w-7 h-7 ${item.unlocked ? 'text-white' : 'text-slate-400'}`} strokeWidth={1.8} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>

              {!item.unlocked && (
                <div className="mb-3">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${item.grad}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                    {item.format === 'currency' && `₹${item.current.toLocaleString('en-IN')} / ₹${item.target.toLocaleString('en-IN')}`}
                    {item.format === 'count' && `${item.current} / ${item.target} referrals`}
                    {item.format === 'rank' && (item.rankValue ? `Currently rank #${item.rankValue}` : 'Not ranked yet')}
                  </p>
                </div>
              )}

              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                item.unlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {item.unlocked ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {item.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
