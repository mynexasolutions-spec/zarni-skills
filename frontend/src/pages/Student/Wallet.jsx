import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, CheckCircle2, Clock, Landmark, ArrowUpRight, ArrowDownRight, Zap, TrendingUp, IndianRupee, Layers, Users, Crown, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

// Amounts on these tiles have no upper bound, so the type scale steps down as
// the formatted figure gets longer — a crore-plus number stays on one line
// inside the tile instead of overflowing or wrapping mid-digit.
function amountClass(value) {
  const len = `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`.length;
  if (len <= 7) return 'text-3xl sm:text-4xl';
  if (len <= 9) return 'text-2xl sm:text-3xl';
  if (len <= 12) return 'text-xl sm:text-2xl';
  return 'text-lg sm:text-xl';
}

// Every income figure on this page renders through the same dark-glass tile —
// an accent hue is the only thing that changes between them, so the three
// income sections read as one system instead of three separate designs.
function KpiTile({ label, value, Icon, accent, deep }) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-white/[0.08] hover:border-white/[0.16]"
      style={{
        background: `linear-gradient(155deg, ${deep} 0%, #070d1f 65%)`,
        boxShadow: '0 10px 30px rgba(8,15,38,0.3)',
      }}
    >
      {/* A single restrained corner glow — brighter on hover only, so a row of
          four tiles stays calm instead of four competing washes of colour. */}
      <span
        className="absolute -top-14 -right-10 w-36 h-36 rounded-full blur-[52px] pointer-events-none opacity-45 transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: accent }}
      ></span>
      <span
        className="absolute inset-x-0 top-0 h-px pointer-events-none opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      ></span>
      <Icon
        className="absolute -right-4 -bottom-4 w-24 h-24 pointer-events-none transition-transform duration-500 group-hover:scale-105"
        style={{ color: accent, opacity: 0.08 }}
        strokeWidth={1}
      />

      {/* Icon sits beside the figure on narrow screens (one tile per row) and
          above it once the tiles sit four-across. */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center gap-4 lg:block">
        <span
          className="w-11 h-11 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shrink-0 lg:mb-4 border"
          style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}14` }}
        >
          <Icon className="w-5 h-5 lg:w-4 lg:h-4" strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45 mb-1.5 truncate">
            {label}
          </p>
          <AnimatedNumber
            value={Math.round(value)}
            prefix="₹"
            className={`block ${amountClass(value)} font-heading font-black text-white leading-none tabular-nums whitespace-nowrap`}
          />
        </div>
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
        {/* Aurora glow field sits OUTSIDE the card so the card's backdrop-blur
            has something colourful to frost — that's what makes it read as
            real glass rather than a flat translucent panel. */}
        <div className="relative">
          {/* Analogous hues only (violet → indigo → blue). Warm tones were
              muddying to olive where they crossed the cool ones, so gold now
              appears only in the card's own trim, never in the glow field. */}
          <div className="absolute -inset-3 sm:-inset-5 rounded-[3rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[#070d20]"></div>
            <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-violet-600/70 blur-[75px] animate-blob"></div>
            <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-blue-600/70 blur-[75px] animate-blob" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-56 h-56 rounded-full bg-indigo-500/55 blur-[80px] animate-blob" style={{ animationDelay: '6s' }}></div>
            {/* Vignette keeps the centre readable and the edges rich */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(7,13,32,0.6) 0%, rgba(7,13,32,0.2) 45%, rgba(7,13,32,0.8) 100%)' }}></div>
          </div>

          <div
            ref={tiltHeroRef}
            onMouseMove={onHeroMove}
            onMouseLeave={onHeroLeave}
            className="relative w-full rounded-[2.5rem] p-6 sm:p-8 lg:px-12 lg:py-10 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(8,15,40,0.45)] overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          >
            {/* Glass sheen: bright top edge, soft top-down highlight, sweep */}
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
            <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"></span>

            {/* Fine dot-grid texture */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}></div>

            {/* Gold hairline just below the top edge */}
            <span className="absolute top-[3px] left-10 right-10 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent pointer-events-none"></span>

            {/* Corner brackets */}
            {[
              'top-4 left-4 border-t border-l rounded-tl-xl',
              'top-4 right-4 border-t border-r rounded-tr-xl',
              'bottom-4 left-4 border-b border-l rounded-bl-xl',
              'bottom-4 right-4 border-b border-r rounded-br-xl',
            ].map((pos) => (
              <span key={pos} className={`absolute w-7 h-7 border-amber-300/30 pointer-events-none ${pos}`}></span>
            ))}

          {/* Partner card — stacked and centred on mobile, laid out across the
              full width on desktop so the band never sits half-empty. */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">

            {/* Avatar — slowly rotating gold ring, static portrait inside */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <span className="absolute -inset-6 rounded-full bg-amber-300/20 blur-2xl"></span>
              <span
                className="absolute -inset-[7px] rounded-full animate-spin-slow"
                style={{ background: 'conic-gradient(from 0deg, #fcd34d, #ffffff, #7dd3fc, #fcd34d)' }}
              ></span>
              <span className="absolute -inset-[3px] rounded-full bg-[#16295c]"></span>
              <span className="absolute -inset-4 rounded-full border border-dashed border-amber-200/25 animate-spin-slow" style={{ animationDirection: 'reverse' }}></span>

              <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden ring-2 ring-white/60 shadow-2xl bg-white/20">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                    {(user?.name || 'Z').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-emerald-400 border-[3px] border-[#12224a] flex items-center justify-center shadow-lg z-10">
                <ShieldCheck className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h3 className="text-2xl lg:text-3xl font-heading font-black leading-tight truncate bg-gradient-to-b from-white via-white to-amber-100 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                {user?.name || 'Zarni Partner'}
              </h3>
              <p className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/80">
                <Clock className="w-3 h-3 text-amber-200/80" strokeWidth={2.5} />
                Member Since {user?.created_at || '—'}
              </p>
            </div>

            {/* Badge + brand line */}
            <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 pt-5 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/15 sm:pl-8">
              <span className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400/25 via-amber-300/15 to-amber-400/25 border border-amber-300/50 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] text-amber-100 whitespace-nowrap shadow-[0_0_20px_rgba(252,211,77,0.25)] overflow-hidden">
                <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></span>
                <ShieldCheck className="relative w-3 h-3" strokeWidth={2.5} />
                <span className="relative">Verified Partner</span>
              </span>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                zarniskills.com
              </p>
            </div>
            </div>
          </div>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Today's Income", value: earningsSummary.total.today, Icon: Zap, accent: '#34d399', deep: '#043d2f' },
              { label: '7 Day Income', value: earningsSummary.total['7days'], Icon: TrendingUp, accent: '#22d3ee', deep: '#053745' },
              { label: '30 Day Income', value: earningsSummary.total['30days'], Icon: IndianRupee, accent: '#60a5fa', deep: '#0a2a5e' },
              { label: 'All Time Income', value: earningsSummary.total.alltime, Icon: CheckCircle2, accent: '#c084fc', deep: '#2e1065' },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Today's Team Income", value: earningsSummary.team.today, Icon: Zap, accent: '#38bdf8', deep: '#082f49' },
                  { label: '7 Day Team Income', value: earningsSummary.team['7days'], Icon: TrendingUp, accent: '#22d3ee', deep: '#053745' },
                  { label: '30 Day Team Income', value: earningsSummary.team['30days'], Icon: IndianRupee, accent: '#60a5fa', deep: '#0a2a5e' },
                  { label: 'All Time Team Income', value: earningsSummary.team.alltime, Icon: CheckCircle2, accent: '#818cf8', deep: '#1e1b4b' },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Today's Manager Income", value: earningsSummary.manager.today, Icon: Zap, accent: '#fbbf24', deep: '#451a03' },
                  { label: '7 Day Manager Income', value: earningsSummary.manager['7days'], Icon: TrendingUp, accent: '#fb923c', deep: '#431407' },
                  { label: '30 Day Manager Income', value: earningsSummary.manager['30days'], Icon: IndianRupee, accent: '#f472b6', deep: '#500724' },
                  { label: 'All Time Manager Income', value: earningsSummary.manager.alltime, Icon: CheckCircle2, accent: '#c084fc', deep: '#2e1065' },
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

    </div>
  );
}
