import React, { useEffect, useState } from 'react';
import { Sparkles, Clock, CheckCircle2, Wallet, IndianRupee, CheckCheck } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'paid', label: 'Paid' },
];

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [pendingTotal, setPendingTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const fetchCommissions = async (status) => {
    try {
      const response = await api.get('/admin/commissions', { params: { status } });
      setCommissions(response.data.commissions || []);
      setStatusCounts(response.data.status_counts || {});
      setPendingTotal(response.data.pending_total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCommissions(statusFilter);
  }, [statusFilter]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/commissions/${id}/approve`);
      fetchCommissions(statusFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm(`Approve all ${statusCounts.pending ?? 0} pending commissions?`)) return;
    setApprovingAll(true);
    try {
      await api.post('/admin/commissions/approve-all');
      fetchCommissions(statusFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Pending Total', value: pendingTotal, prefix: '₹', icon: IndianRupee, color: 'from-amber-500 to-orange-600' },
    { label: 'Pending', value: statusCounts.pending ?? 0, icon: Clock, color: 'from-blue-500 to-indigo-600' },
    { label: 'Approved', value: statusCounts.approved ?? 0, icon: CheckCircle2, color: 'from-violet-500 to-purple-600' },
    { label: 'Paid', value: statusCounts.paid ?? 0, icon: Wallet, color: 'from-emerald-500 to-green-600' },
  ];

  return (
    <div className="text-slate-800 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Commission Ledger</h2>
        </div>
        {statusFilter === 'pending' && commissions.length > 0 && (
          <button onClick={handleApproveAll} disabled={approvingAll} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-500/25 hover:shadow-xl disabled:opacity-60 transition-all active:scale-[0.98]">
            {!approvingAll && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
            <CheckCheck className="w-4 h-4 relative" /> <span className="relative">{approvingAll ? 'Approving...' : 'Approve All Pending'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {kpis.map((kpi, idx) => (
          <div key={kpi.label} className={`group rounded-2xl p-4 sm:p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg transition-transform duration-300 hover:-translate-y-1.5 animate-fade-in-up`} style={{ animationDelay: `${idx * 70}ms` }}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80 transition-transform duration-300 group-hover:scale-110" />
            <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ''} className="block text-lg sm:text-xl font-black leading-none tabular-nums" />
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors ${
              statusFilter === tab.key ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-200'
            }`}
          >
            {tab.label} ({statusCounts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Date</th>
                <th className="pb-3">Earner</th>
                <th className="pb-3">From</th>
                <th className="pb-3">Item</th>
                <th className="pb-3">Level</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 text-slate-400">{c.created_at}</td>
                  <td className="py-3.5 font-bold text-slate-800">{c.earner_name}</td>
                  <td className="py-3.5">{c.buyer_name}</td>
                  <td className="py-3.5">{c.item_name}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">L{c.level}</span>
                  </td>
                  <td className="py-3.5 text-right font-black text-emerald-600">₹{c.commission_amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-right">
                    {c.status === 'pending' ? (
                      <button onClick={() => handleApprove(c.id)} disabled={busyId === c.id} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-100 disabled:opacity-50">
                        {busyId === c.id ? '...' : 'Approve'}
                      </button>
                    ) : (
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                        c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>{c.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 font-medium">No commissions in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {commissions.map((c, idx) => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 leading-snug break-words">{c.earner_name}</p>
                <p className="text-xs text-slate-400 leading-snug break-words mt-0.5">from {c.buyer_name} · {c.item_name}</p>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">L{c.level}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">{c.created_at}</span>
              <span className="font-black text-emerald-600 text-sm">₹{c.commission_amount.toLocaleString('en-IN')}</span>
            </div>
            {c.status === 'pending' ? (
              <button onClick={() => handleApprove(c.id)} disabled={busyId === c.id} className="w-full mt-3 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold disabled:opacity-50">
                {busyId === c.id ? 'Approving...' : 'Approve'}
              </button>
            ) : (
              <div className="mt-3">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                  c.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>{c.status}</span>
              </div>
            )}
          </div>
        ))}
        {commissions.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No commissions in this category.</div>
        )}
      </div>
    </div>
  );
}
