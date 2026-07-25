import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, CheckCircle2, Clock, Landmark, ArrowUpRight, ArrowDownRight, Sparkles, Zap, TrendingUp, IndianRupee, Layers, Users, Crown, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

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

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

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

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-5 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Official Earnings Vault
              </div>
              
              <p className="text-blue-200/80 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Available Payout Balance</p>
              <AnimatedNumber
                value={balanceData.availableBalance}
                prefix="₹"
                duration={1400}
                className="block text-4xl sm:text-6xl font-heading font-black leading-none tabular-nums text-white"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
              />
              <p className="text-blue-100/80 text-xs sm:text-sm font-medium mt-4 leading-relaxed">
                Track direct & passive referral payouts, manage instant withdrawals, and view full transaction logs.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
                  <span className="w-7 h-7 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  </span>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-black text-blue-200">Total Earned</p>
                    <p className="text-sm font-black text-white tabular-nums">₹{Math.round(balanceData.totalEarnings).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
                  <span className="w-7 h-7 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-300" />
                  </span>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-black text-blue-200">Pending</p>
                    <p className="text-sm font-black text-white tabular-nums">₹{Math.round(balanceData.pendingEarnings).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Glassmorphic Debit Card Visual */}
            <div className="group relative w-full lg:w-80 shrink-0 rounded-[2rem] p-6 bg-gradient-to-br from-white/15 to-white/5 border border-white/25 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-2 hover:border-white/40 transition-all duration-500 overflow-hidden">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-[2rem]"></span>
              
              <div className="relative flex items-center justify-between mb-8">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 shadow-inner flex items-center justify-center">
                  <div className="w-6 h-4 border border-amber-600/40 rounded"></div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-widest text-amber-300">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              </div>

              <div className="relative flex items-center gap-2 mb-6">
                {[0, 1, 2].map((g) => (
                  <span key={g} className="flex items-center gap-1 mr-2">
                    {[0, 1, 2, 3].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/50"></span>)}
                  </span>
                ))}
                <span className="text-base font-mono font-bold tracking-widest text-white">{String(user?.id || 0).padStart(4, '0')}</span>
              </div>

              <div className="relative flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60 font-black pt-2 border-t border-white/10">
                <span className="truncate max-w-[65%] text-white">{user?.name || 'Zarni Partner'}</span>
                <span className="text-amber-300">{user?.role === 'manager' ? 'Manager' : 'Affiliate'}</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Total Income breakdown */}
      <Reveal variant="fade-up" delay={150}>
        <section>
          <h2 className="flex items-center gap-3 font-heading text-lg font-black text-slate-900 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
            Total Income Summary
            <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Today's Income", value: earningsSummary.total.today, Icon: Zap, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.3)' },
              { label: '7 Day Income', value: earningsSummary.total['7days'], Icon: TrendingUp, from: '#22d3ee', to: '#0891b2', shadow: 'rgba(8,145,178,0.3)' },
              { label: '30 Day Income', value: earningsSummary.total['30days'], Icon: IndianRupee, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.3)' },
              { label: 'All Time Income', value: earningsSummary.total.alltime, Icon: CheckCircle2, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.3)' },
            ].map((kpi, idx) => (
              <div
                key={kpi.label}
                className="group relative rounded-3xl p-5 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                  boxShadow: `0 12px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                }}
              >
                <kpi.Icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-white/85 uppercase tracking-widest">{kpi.label}</span>
                  <AnimatedNumber
                    value={Math.round(kpi.value)}
                    prefix="₹"
                    className="block text-2xl sm:text-3xl font-heading font-black text-white leading-none mt-2.5 tabular-nums"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  />
                </div>
              </div>
            ))}
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
                  <AnimatedNumber value={Math.round(row.value)} prefix="₹" className="block text-xl font-black text-purple-900" />
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
              <h2 className="flex items-center gap-3 font-heading text-lg font-black text-slate-900 mb-1">
                <Users className="w-5 h-5 text-sky-600 shrink-0" />
                Team's Income Overview
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-4">Combined earnings generated by your direct network</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Today's Team Income", value: earningsSummary.team.today, Icon: Zap, from: '#38bdf8', to: '#0284c7', shadow: 'rgba(2,132,199,0.3)' },
                  { label: '7 Day Team Income', value: earningsSummary.team['7days'], Icon: TrendingUp, from: '#22d3ee', to: '#0891b2', shadow: 'rgba(8,145,178,0.3)' },
                  { label: '30 Day Team Income', value: earningsSummary.team['30days'], Icon: IndianRupee, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.3)' },
                  { label: 'All Time Team Income', value: earningsSummary.team.alltime, Icon: CheckCircle2, from: '#818cf8', to: '#4f46e5', shadow: 'rgba(79,70,229,0.3)' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="group relative rounded-3xl p-5 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                      boxShadow: `0 12px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                    }}
                  >
                    <kpi.Icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-white/85 uppercase tracking-widest">{kpi.label}</span>
                      <AnimatedNumber
                        value={Math.round(kpi.value)}
                        prefix="₹"
                        className="block text-2xl sm:text-3xl font-heading font-black text-white leading-none mt-2.5 tabular-nums"
                        style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 font-heading text-lg font-black text-slate-900 mb-1">
                <Crown className="w-5 h-5 text-amber-500 shrink-0" />
                Manager Income <span className="text-slate-400 font-medium normal-case text-sm">(Passive)</span>
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-4">Earnings derived from managers within your direct downline</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Today's Manager Income", value: earningsSummary.manager.today, Icon: Zap, from: '#fbbf24', to: '#d97706', shadow: 'rgba(217,119,6,0.3)' },
                  { label: '7 Day Manager Income', value: earningsSummary.manager['7days'], Icon: TrendingUp, from: '#fb923c', to: '#ea580c', shadow: 'rgba(234,88,12,0.3)' },
                  { label: '30 Day Manager Income', value: earningsSummary.manager['30days'], Icon: IndianRupee, from: '#f472b6', to: '#db2777', shadow: 'rgba(219,39,119,0.3)' },
                  { label: 'All Time Manager Income', value: earningsSummary.manager.alltime, Icon: CheckCircle2, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.3)' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="group relative rounded-3xl p-5 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                      boxShadow: `0 12px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                    }}
                  >
                    <kpi.Icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-white/85 uppercase tracking-widest">{kpi.label}</span>
                      <AnimatedNumber
                        value={Math.round(kpi.value)}
                        prefix="₹"
                        className="block text-2xl sm:text-3xl font-heading font-black text-white leading-none mt-2.5 tabular-nums"
                        style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                      />
                    </div>
                  </div>
                ))}
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

    </div>
  );
}
