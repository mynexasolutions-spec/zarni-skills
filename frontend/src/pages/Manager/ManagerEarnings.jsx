import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Zap, IndianRupee, CheckCircle2, Layers, Users, Crown } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function IncomeGrid({ data, palette }) {
  const rows = [
    { label: "Today's Income", value: data.today, Icon: Zap, ...palette[0] },
    { label: '7 Day Income', value: data['7days'], Icon: TrendingUp, ...palette[1] },
    { label: '30 Day Income', value: data['30days'], Icon: IndianRupee, ...palette[2] },
    { label: 'All Time Income', value: data.alltime, Icon: CheckCircle2, ...palette[3] },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {rows.map((kpi, idx) => (
        <div
          key={kpi.label}
          className="group relative rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 animate-fade-in-up"
          style={{
            background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
            boxShadow: `0 8px 22px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
            animationDelay: `${idx * 80}ms`,
          }}
        >
          <kpi.Icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
          <div className="relative z-10">
            <span className="text-[0.65rem] font-bold text-white/85 uppercase tracking-widest">{kpi.label}</span>
            <AnimatedNumber
              value={Math.round(kpi.value || 0)}
              prefix="₹"
              className="block text-xl sm:text-2xl font-black text-white leading-none mt-2 tabular-nums"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const ALL_INCOME_PALETTE = [
  { from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.3)' },
  { from: '#22d3ee', to: '#0891b2', shadow: 'rgba(8,145,178,0.3)' },
  { from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.3)' },
  { from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.3)' },
];
const TEAM_INCOME_PALETTE = [
  { from: '#38bdf8', to: '#0284c7', shadow: 'rgba(2,132,199,0.3)' },
  { from: '#22d3ee', to: '#0891b2', shadow: 'rgba(8,145,178,0.3)' },
  { from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.3)' },
  { from: '#818cf8', to: '#4f46e5', shadow: 'rgba(79,70,229,0.3)' },
];
const MANAGER_INCOME_PALETTE = [
  { from: '#fbbf24', to: '#d97706', shadow: 'rgba(217,119,6,0.3)' },
  { from: '#fb923c', to: '#ea580c', shadow: 'rgba(234,88,12,0.3)' },
  { from: '#f472b6', to: '#db2777', shadow: 'rgba(219,39,119,0.3)' },
  { from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.3)' },
];

export default function ManagerEarnings() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/manager/earnings-summary');
        setSummary(response.data);
      } catch (err) {
        console.error('Error fetching manager earnings summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading || !summary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const showManagerIncome = summary.has_sub_managers || (summary.manager_income?.alltime || 0) > 0;

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight">My Earnings</h2>
          <p className="text-xs text-slate-400 font-medium">Your income breakdown across every source</p>
        </div>
      </div>

      {/* All Income */}
      <section className="mb-8 sm:mb-10">
        <h3 className="flex items-center gap-2 sm:gap-3 text-lg font-bold text-slate-900 mb-4">
          <TrendingUp className="w-5 h-5 text-primary shrink-0" />
          All Income
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
        </h3>
        <IncomeGrid data={summary.total_income} palette={ALL_INCOME_PALETTE} />
      </section>

      {/* Passive Income */}
      <section className="mb-8 sm:mb-10 bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up">
        <h3 className="font-bold text-lg text-slate-900 mb-1 flex items-center gap-2">
          <span className="relative w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <span className="absolute inset-0 rounded-lg bg-purple-400/30 blur-md animate-pulse"></span>
            <Layers className="relative w-4 h-4 text-purple-500" />
          </span>
          Passive Income
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4 ml-[42px]">Earnings from your team's referrals (Level 2)</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: "Today's Passive", value: summary.passive_income.today },
            { label: '7 Day Passive', value: summary.passive_income['7days'] },
            { label: '30 Day Passive', value: summary.passive_income['30days'] },
            { label: 'All Time Passive', value: summary.passive_income.alltime },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl p-4 bg-purple-50 border border-purple-100 transition-transform hover:-translate-y-1">
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1.5">{row.label}</p>
              <AnimatedNumber value={Math.round(row.value || 0)} prefix="₹" className="block text-xl font-black text-purple-700" />
            </div>
          ))}
        </div>
      </section>

      {/* Team's Income */}
      <section className="mb-8 sm:mb-10">
        <h3 className="flex items-center gap-2 sm:gap-3 text-lg font-bold text-slate-900 mb-1">
          <Users className="w-5 h-5 text-sky-500 shrink-0" />
          Team's Income
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-4">Combined earnings of everyone in your team</p>
        <IncomeGrid data={summary.team_income} palette={TEAM_INCOME_PALETTE} />
      </section>

      {/* Manager Income (passive) */}
      {showManagerIncome && (
        <section className="mb-8 sm:mb-10">
          <h3 className="flex items-center gap-2 sm:gap-3 text-lg font-bold text-slate-900 mb-1">
            <Crown className="w-5 h-5 text-amber-500 shrink-0" />
            Manager Income <span className="text-slate-400 font-medium normal-case text-sm">(Passive)</span>
            <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Earnings of the sub-managers within your team, plus your override commissions</p>
          <IncomeGrid data={summary.manager_income} palette={MANAGER_INCOME_PALETTE} />
        </section>
      )}
    </div>
  );
}
