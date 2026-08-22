import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, CheckCircle2, Clock, Landmark, ArrowUpRight, ArrowDownRight, Zap, TrendingUp, IndianRupee, Layers, Users, Crown, UserCircle, Sun, Sunset, Moon } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';

function useGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', Icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', Icon: Sun };
  if (hour < 21) return { text: 'Good evening', Icon: Sunset };
  return { text: 'Good night', Icon: Moon };
}

// Same KPI tile as the main Dashboard's stat cards — a colored gradient card
// per tile, not the wallet page's old dark-glass tile, so both pages read as
// one consistent design system instead of two different ones.
function KpiTile({ label, value, sub, Icon, from, to, shadow }) {
  return (
    <div
      className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 group cursor-default animate-fade-in-up"
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 10px 28px ${shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
      }}
    >
      <Icon
        className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-24 sm:h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        strokeWidth={1.5}
      />
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
      <div className="relative z-10">
        <p className="flex items-center gap-1.5 sm:gap-2 text-[0.62rem] sm:text-[0.7rem] font-bold text-white/85 uppercase tracking-wide sm:tracking-widest mb-2 sm:mb-3.5">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="truncate">{label}</span>
        </p>
        <AnimatedNumber
          value={Math.round(value)}
          prefix="₹"
          className="block text-[1.35rem] sm:text-[2.15rem] font-black text-white leading-none mb-1.5 sm:mb-2.5 tabular-nums"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
          duration={1400}
        />
        {sub && <p className="text-[0.62rem] sm:text-[0.7rem] text-white/75 font-medium truncate">{sub}</p>}
      </div>
    </div>
  );
}

const EMPTY_SUMMARY = {
  total: { today: 0, '7days': 0, '30days': 0, alltime: 0 },
  passive: { today: 0, '7days': 0, '30days': 0, alltime: 0 },
  team: { today: 0, '7days': 0, '30days': 0, alltime: 0 },
  manager: { today: 0, '7days': 0, '30days': 0, alltime: 0 },
  isManager: false,
};

export default function Wallet() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    transactions: [],
    withdrawals: []
  });
  const [earningsSummary, setEarningsSummary] = useState(EMPTY_SUMMARY);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const greeting = useGreeting();

  const fetchWalletDetails = async () => {
    try {
      const [walletRes, summaryRes] = await Promise.all([
        api.get('/student/wallet-details'),
        api.get('/student/earnings-summary'),
      ]);
      const response = walletRes;
      setBalanceData({
        totalEarnings: response.data.all_time_earnings || 0,
        availableBalance: response.data.available_balance || response.data.availableBalance || 0,
        pendingEarnings: response.data.pending_earnings || response.data.pendingEarnings || 0,
        transactions: response.data.transactions || response.data.recentTransactions || [],
        withdrawals: response.data.withdrawals || []
      });
      setEarningsSummary({
        total: summaryRes.data.total_income || EMPTY_SUMMARY.total,
        passive: summaryRes.data.passive_income || EMPTY_SUMMARY.passive,
        team: summaryRes.data.team_income || EMPTY_SUMMARY.team,
        manager: summaryRes.data.manager_income || EMPTY_SUMMARY.manager,
        isManager: !!summaryRes.data.is_manager,
      });
    } catch (err) {
      console.error('Error fetching wallet balance details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);

    try {
      const response = await api.post('/student/withdraw', { amount: parseFloat(amount), upi_id: upiId });
      if (response.data.success) {
        setMsg({ type: 'success', text: 'Withdrawal request submitted successfully!' });
        setAmount('');
        setUpiId('');
        fetchWalletDetails();
      } else {
        setMsg({ type: 'error', text: response.data.message || 'Request failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Earnings Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── WELCOME BANNER — identical to /student Dashboard's, so the two
             pages read as one consistent design instead of two different
             ones. Right-side highlight swapped from "Your Rank" to
             "Available Balance", the wallet-relevant equivalent. ── */}
      <Reveal variant="scale-in">
        <section
          className="relative flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 rounded-[18px] sm:rounded-[22px] px-5 sm:px-8 py-5 sm:py-7 overflow-hidden group animate-gradient-x"
          style={{
            background: 'linear-gradient(115deg, #0f1f4d 0%, #1e3a8a 25%, #2563eb 50%, #1e3a8a 75%, #0f1f4d 100%)',
            boxShadow: '0 20px 45px -12px rgba(30, 64, 175, 0.45)'
          }}
        >
          <div
            className="absolute pointer-events-none rounded-full animate-blob transition-transform duration-700 group-hover:scale-110"
            style={{
              top: '-70%', right: '-6%', width: 360, height: 360,
              background: 'radial-gradient(circle, rgba(96,165,250,0.35) 0%, transparent 70%)'
            }}
          ></div>
          <div
            className="absolute pointer-events-none rounded-full animate-blob"
            style={{
              bottom: '-80%', left: '10%', width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
              animationDelay: '2.5s'
            }}
          ></div>
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-3 sm:gap-4 min-w-0">
            <div className="relative flex-shrink-0 animate-float">
              <span className="absolute -inset-2 rounded-full bg-blue-300/40 animate-pulse-ring"></span>
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-blue-300 to-indigo-300 opacity-70 blur-[3px] animate-gradient-x"></div>
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 flex items-center justify-center">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] text-white/80" />
                )}
              </div>
              <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#1e3a8a] shadow-[0_0_10px_rgba(52,211,153,0.9)]">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[0.65rem] sm:text-[0.7rem] font-bold text-blue-200/90 uppercase tracking-wider mb-1">
                <greeting.Icon className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
                {greeting.text}
              </div>
              <h1 className="text-[1.1rem] sm:text-[1.55rem] font-extrabold text-white tracking-tight leading-normal py-0.5 truncate">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-blue-200 animate-gradient-x">
                  {user?.name?.split(' ')[0]}
                </span>{' '}
                <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span>
              </h1>
              <p className="text-[0.78rem] sm:text-[0.85rem] text-white/70 font-medium mt-0.5">Here's a snapshot of your wallet today</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center sm:justify-start gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 w-full sm:w-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none"></span>
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
              <div className="absolute -inset-1.5 rounded-xl bg-amber-400/50 blur-md animate-pulse"></div>
              <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
              </div>
            </div>
            <div className="relative text-left">
              <span className="block text-[0.6rem] sm:text-[0.65rem] text-white/70 uppercase tracking-wider font-bold">Available Balance</span>
              <AnimatedNumber value={Math.round(balanceData.availableBalance)} prefix="₹" duration={900} className="block text-[1.05rem] sm:text-[1.2rem] text-white font-extrabold leading-tight tabular-nums" />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Total Income breakdown */}
      <Reveal variant="fade-up" delay={150}>
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 leading-tight">Total Income Summary</h2>
              <p className="text-[11px] font-semibold text-slate-400">Your complete earnings across every period</p>
            </div>
            <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { label: "Today's Income", value: earningsSummary.total.today, sub: 'Earned today', Icon: Zap, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(139,92,246,0.35)' },
              { label: '7 Day Income', value: earningsSummary.total['7days'], sub: 'This week', Icon: TrendingUp, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(59,130,246,0.35)' },
              { label: '30 Day Income', value: earningsSummary.total['30days'], sub: 'This month', Icon: IndianRupee, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
              { label: 'All Time Income', value: earningsSummary.total.alltime, sub: 'Lifetime earnings', Icon: CheckCircle2, from: '#fbbf24', to: '#f59e0b', shadow: 'rgba(245,158,11,0.35)' },
            ].map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
          </div>
        </section>
      </Reveal>

      {/* Passive Income + Payout request */}
      <Reveal variant="fade-up" delay={200}>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">

          {/* Passive Income breakdown */}
          <div className={`bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${balanceData.availableBalance > 0 ? '' : 'lg:col-span-2'}`}>
            <h3 className="font-heading font-black text-lg text-slate-900 mb-1 flex items-center gap-3">
              <span className="relative w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center">
                <span className="absolute inset-0 rounded-2xl bg-purple-400/30 blur-md animate-pulse"></span>
                <Layers className="relative w-4.5 h-4.5 text-purple-600" />
              </span>
              Passive Income (Level 2)
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6 ml-[48px]">Earnings generated by your downline team's direct sales</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Today's Passive", value: earningsSummary.passive.today },
                { label: '7 Day Passive', value: earningsSummary.passive['7days'] },
                { label: '30 Day Passive', value: earningsSummary.passive['30days'] },
                { label: 'All Time Passive', value: earningsSummary.passive.alltime },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl p-4 bg-purple-50/70 border border-purple-100 transition-transform hover:-translate-y-1">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{row.label}</p>
                  <AnimatedNumber value={Math.round(row.value)} prefix="₹" className="block text-xl font-black text-purple-900 tabular-nums whitespace-nowrap" />
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal request form */}
          {balanceData.availableBalance > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="font-heading font-black text-lg text-slate-900 mb-4 flex items-center gap-3">
                <span className="relative w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md animate-pulse"></span>
                  <Landmark className="relative w-4.5 h-4.5 text-blue-600" />
                </span>
                Request Wallet Payout
              </h3>

              {msg.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold mb-4 ${
                  msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleWithdrawRequest} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payout Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter payout amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={balanceData.availableBalance}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Registered UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. mobile@ybl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5 disabled:opacity-60 active:scale-[0.98]"
                >
                  {!submitting && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                  <span className="relative">{submitting ? 'Submitting...' : 'Request Payout Now'}</span>
                </button>
              </form>
            </div>
          )}
        </section>
      </Reveal>

      {/* Manager-only: Team's Income + Manager Income (Passive) */}
      {earningsSummary.isManager && (
        <Reveal variant="fade-up" delay={250}>
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-sky-600" strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 leading-tight">Team's Income Overview</h2>
                  <p className="text-[11px] font-semibold text-slate-400">Combined earnings generated by your direct network</p>
                </div>
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[
                  { label: "Today's Team Income", value: earningsSummary.team.today, sub: 'Direct referrals, today', Icon: Zap, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
                  { label: '7 Day Team Income', value: earningsSummary.team['7days'], sub: 'Direct referrals, last 7 days', Icon: TrendingUp, from: '#22d3ee', to: '#0891b2', shadow: 'rgba(8,145,178,0.35)' },
                  { label: '30 Day Team Income', value: earningsSummary.team['30days'], sub: 'Direct referrals, last 30 days', Icon: IndianRupee, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.35)' },
                  { label: 'All Time Team Income', value: earningsSummary.team.alltime, sub: 'Direct referrals, lifetime', Icon: CheckCircle2, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.35)' },
                ].map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-amber-500" strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-heading text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Manager Income <span className="text-slate-400 font-semibold text-sm">(Passive)</span>
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-400">Earnings derived from managers within your direct downline</p>
                </div>
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[
                  { label: "Today's Manager Income", value: earningsSummary.manager.today, sub: 'Team referrals, today', Icon: Zap, from: '#c084fc', to: '#9333ea', shadow: 'rgba(147,51,234,0.35)' },
                  { label: '7 Day Manager Income', value: earningsSummary.manager['7days'], sub: 'Team referrals, last 7 days', Icon: TrendingUp, from: '#e879f9', to: '#c026d3', shadow: 'rgba(192,38,211,0.35)' },
                  { label: '30 Day Manager Income', value: earningsSummary.manager['30days'], sub: 'Team referrals, last 30 days', Icon: IndianRupee, from: '#f472b6', to: '#db2777', shadow: 'rgba(219,39,119,0.35)' },
                  { label: 'All Time Manager Income', value: earningsSummary.manager.alltime, sub: 'Team referrals, lifetime', Icon: CheckCircle2, from: '#818cf8', to: '#4f46e5', shadow: 'rgba(79,70,229,0.35)' },
                ].map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
              </div>
            </section>
          </div>
        </Reveal>
      )}

      {/* History Grid */}
      <Reveal variant="fade-up" delay={300}>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Transaction History */}
          <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="relative flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <h3 className="flex items-center gap-3 font-heading font-black text-lg text-slate-900">
                <span className="relative w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md animate-pulse"></span>
                  <WalletIcon className="relative w-4.5 h-4.5 text-blue-600" />
                </span>
                Transaction History
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0">
                {balanceData.transactions.length} Total
              </span>
            </div>
            <div className="relative space-y-2.5 max-h-[420px] overflow-y-auto pr-1 mt-4">
              {balanceData.transactions.map((tx, idx) => {
                const isCommission = tx.type === 'commission';
                return (
                  <div key={idx} className={`group flex justify-between items-center gap-3 p-4 rounded-2xl border transition-all ${isCommission ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50' : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50'}`}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-sm ${isCommission ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {isCommission ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-black text-sm text-slate-900 capitalize truncate">{tx.type}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{tx.created_at}</p>
                      </div>
                    </div>
                    <p className={`font-heading font-black text-base shrink-0 tabular-nums ${isCommission ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCommission ? '+' : '-'}₹{tx.amount}
                    </p>
                  </div>
                );
              })}
              {balanceData.transactions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                    <WalletIcon className="w-7 h-7" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No transactions recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Logs */}
          <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="relative flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <h3 className="flex items-center gap-3 font-heading font-black text-lg text-slate-900">
                <span className="relative w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md animate-pulse"></span>
                  <Landmark className="relative w-4.5 h-4.5 text-blue-600" />
                </span>
                Withdrawal Requests
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0">
                {balanceData.withdrawals.length} Total
              </span>
            </div>
            <div className="relative space-y-2.5 max-h-[420px] overflow-y-auto pr-1 mt-4">
              {balanceData.withdrawals.map((wd, idx) => {
                const isPaid = wd.status === 'approved' || wd.status === 'paid';
                const isRejected = wd.status === 'rejected';
                const StatusIcon = isPaid ? CheckCircle2 : isRejected ? ArrowDownRight : Clock;
                const badgeColor = isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                return (
                  <div key={idx} className="group flex justify-between items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-black text-base text-slate-900 tabular-nums">₹{wd.amount}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 truncate">{wd.upi_id} · {wd.created_at}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border shrink-0 ${badgeColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {wd.status}
                    </span>
                  </div>
                );
              })}
              {balanceData.withdrawals.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                    <Landmark className="w-7 h-7" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No payout requests submitted</p>
                </div>
              )}
            </div>
          </div>

        </section>
      </Reveal>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}
