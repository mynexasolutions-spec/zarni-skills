import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Wallet, Clock } from 'lucide-react';
import api from '../../utils/api';

export default function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [totals, setTotals] = useState({ total_earned: 0, available_balance: 0, pending_earnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await api.get('/student/commissions');
        setCommissions(response.data.commissions || []);
        setTotals({
          total_earned: response.data.total_earned || 0,
          available_balance: response.data.available_balance || 0,
          pending_earnings: response.data.pending_earnings || 0,
        });
      } catch (err) {
        console.error('Error fetching commissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Earned', value: totals.total_earned, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
    { label: 'Available Balance', value: totals.available_balance, icon: Wallet, color: 'from-primary to-indigo-600' },
    { label: 'Pending', value: totals.pending_earnings, icon: Clock, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black leading-tight">My Commissions</h2>
          <p className="text-xs text-slate-400 font-medium">{commissions.length} commission{commissions.length !== 1 ? 's' : ''} earned from your referrals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-xl font-black leading-none">₹{kpi.value.toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">From</th>
                <th className="pb-3">Package / Course</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Level</th>
                <th className="pb-3 text-right">Sale Amount</th>
                <th className="pb-3 text-right">Rate</th>
                <th className="pb-3 text-right">Commission</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold text-slate-800">{c.buyer_name}</td>
                  <td className="py-3.5 text-slate-600">{c.item_name}</td>
                  <td className="py-3.5 text-slate-400">{c.created_at}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700">L{c.level}</span>
                  </td>
                  <td className="py-3.5 text-right text-slate-700">₹{c.sale_amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-right text-slate-500">{c.commission_percent}%</td>
                  <td className={`py-3.5 text-right font-black ${c.status === 'approved' || c.status === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                    ₹{c.commission_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      c.status === 'approved' ? 'bg-blue-50 text-blue-700' : c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">No commissions earned yet. Share your referral link to start earning!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {commissions.map(c => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{c.buyer_name}</p>
                <p className="text-xs text-slate-400 truncate">{c.item_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.created_at} · L{c.level} · {c.commission_percent}%</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                c.status === 'approved' ? 'bg-blue-50 text-blue-700' : c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>{c.status}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Sale ₹{c.sale_amount.toLocaleString('en-IN')}</span>
              <span className={`font-black text-sm ${c.status === 'approved' || c.status === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                ₹{c.commission_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
        {commissions.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No commissions earned yet. Share your referral link to start earning!</div>
        )}
      </div>
    </div>
  );
}
