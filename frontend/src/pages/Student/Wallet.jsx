import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet as WalletIcon, CheckCircle2, Clock, Landmark, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function Wallet() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    transactions: [],
    withdrawals: []
  });
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchWalletDetails = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setBalanceData({
        totalEarnings: response.data.all_time_earnings || 0,
        availableBalance: response.data.available_balance || response.data.availableBalance || 0,
        pendingEarnings: response.data.pending_earnings || response.data.pendingEarnings || 0,
        transactions: response.data.transactions || response.data.recentTransactions || [],
        withdrawals: response.data.withdrawals || []
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Earned', value: balanceData.totalEarnings, sub: 'Lifetime commission earnings', Icon: CheckCircle2, from: '#34d399', to: '#059669', shadow: 'rgba(16,185,129,0.35)' },
    { label: 'Available Balance', value: balanceData.availableBalance, sub: 'Ready to withdraw', Icon: WalletIcon, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.35)' },
    { label: 'Pending', value: balanceData.pendingEarnings, sub: 'Awaiting processing', Icon: Clock, from: '#fbbf24', to: '#d97706', shadow: 'rgba(217,119,6,0.35)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-white mb-10"
        style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 45%, #2563eb 100%)' }}>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Earnings Wallet
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Your Wallet</h1>
          <p className="text-slate-300 text-sm">Track your commissions, request payouts, and review your transaction history.</p>
        </div>
      </div>

      {/* 3 KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className="group relative rounded-3xl p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 animate-fade-in-up"
            style={{
              background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
              boxShadow: `0 10px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
              animationDelay: `${idx * 60}ms`
            }}
          >
            <kpi.Icon className="absolute -right-3 -bottom-3 w-24 h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" strokeWidth={1.5} />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/85 uppercase tracking-widest">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <kpi.Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="relative z-10 text-3xl font-black text-white leading-none" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              ₹{kpi.value.toLocaleString('en-IN')}
            </p>
            <p className="relative z-10 text-xs text-white/75 mt-2 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </section>

      {/* Withdrawal request form */}
      {balanceData.availableBalance > 0 && (
        <section className="mb-10 max-w-xl">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" /> Request Payout
            </h3>

            {msg.text && (
              <div className={`p-4 rounded-xl text-xs font-bold mb-4 ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount</label>
                <input
                  type="number"
                  placeholder="Enter payout amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={balanceData.availableBalance}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">UPI ID</label>
                <input
                  type="text"
                  placeholder="name@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Request Payout'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* History Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Transaction History */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 border-b pb-4 mb-4">Transaction History</h3>
          <div className="space-y-3.5">
            {balanceData.transactions.map((tx, idx) => {
              const isCommission = tx.type === 'commission';
              return (
                <div key={idx} className="flex justify-between items-center p-3.5 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCommission ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {isCommission ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 capitalize">{tx.type}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{tx.created_at}</p>
                    </div>
                  </div>
                  <p className={`font-black text-sm ${isCommission ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isCommission ? '+' : '-'}₹{tx.amount}
                  </p>
                </div>
              );
            })}
            {balanceData.transactions.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">No transactions recorded.</div>
            )}
          </div>
        </div>

        {/* Withdrawal Logs */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 border-b pb-4 mb-4">Withdrawal Requests</h3>
          <div className="space-y-3.5">
            {balanceData.withdrawals.map((wd, idx) => (
              <div key={idx} className="flex justify-between items-center p-3.5 hover:bg-slate-50 rounded-xl transition-colors">
                <div>
                  <p className="font-bold text-sm text-slate-900">₹{wd.amount}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{wd.upi_id} · {wd.created_at}</p>
                </div>
                <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${
                  wd.status === 'approved' || wd.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : wd.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {wd.status}
                </span>
              </div>
            ))}
            {balanceData.withdrawals.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">No payout requests submitted.</div>
            )}
          </div>
        </div>

      </section>

    </div>
  );
}
