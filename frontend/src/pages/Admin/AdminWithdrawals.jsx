import React, { useEffect, useState } from 'react';
import { Landmark, IndianRupee, CheckCircle2, Clock, XCircle, Wallet, Check, X, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

const STATUS_TABS = [
  { key: 'requested', label: 'Pending Requests' },
  { key: 'paid', label: 'Approved & Paid' },
  { key: 'rejected', label: 'Rejected' },
  { key: '', label: 'All Withdrawals' },
];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [requestedTotal, setRequestedTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('requested');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchWithdrawals = async (status) => {
    try {
      const response = await api.get('/admin/withdrawals', { params: { status } });
      setWithdrawals(response.data.withdrawals || []);
      setStatusCounts(response.data.status_counts || {});
      setRequestedTotal(response.data.requested_total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchWithdrawals(statusFilter);
  }, [statusFilter]);

  const handleProcess = async (id, action) => {
    let note = '';
    if (action === 'reject') {
      note = window.prompt('Reason for rejecting this withdrawal:') || '';
    }
    setBusyId(id);
    try {
      await api.post(`/admin/withdrawals/${id}/process`, { action, note });
      fetchWithdrawals(statusFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process withdrawal.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-red-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Withdrawal Ledger...</p>
      </div>
    );
  }

  const kpis = [
    { key: 'requested_total', label: 'Total Pending Payout', value: requestedTotal, prefix: '₹', icon: IndianRupee, color: 'from-amber-500 via-orange-500 to-amber-600', shadow: 'shadow-amber-500/15', text: 'text-amber-100' },
    { key: 'requested', label: 'Pending Requests', value: statusCounts.requested ?? 0, icon: Clock, color: 'from-indigo-600 to-blue-600', shadow: 'shadow-indigo-600/15', text: 'text-indigo-100' },
    { key: 'paid', label: 'Successfully Paid', value: statusCounts.paid ?? 0, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/15', text: 'text-emerald-100' },
    { key: 'rejected', label: 'Rejected Requests', value: statusCounts.rejected ?? 0, icon: XCircle, color: 'from-rose-600 to-red-700', shadow: 'shadow-red-600/15', text: 'text-rose-100' },
  ];

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <Landmark className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Student Payout Requests</h2>
            <p className="text-xs text-slate-400 font-semibold">Review, process, and disburse wallet withdrawal payouts</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {withdrawals.length} entries shown
        </span>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={kpi.key} className={`group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.shadow} transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`} style={{ animationDelay: `${idx * 70}ms` }}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80 transition-transform duration-300 group-hover:scale-110" />
            <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ''} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className={`text-[10px] font-extrabold uppercase tracking-widest ${kpi.text} mt-2`}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-slate-100/70 border border-slate-200/60 rounded-2xl">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`shrink-0 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${
              statusFilter === tab.key 
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 translate-y-0' 
                : 'bg-white border border-slate-200/80 text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto admin-scrollbar">
          <table className="w-full text-left text-base text-slate-700">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">UPI ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Requested On</th>
                <th className="px-6 py-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={w.user_name} />
                      <span className="font-extrabold text-slate-900 text-base group-hover:text-red-600 transition-colors">{w.user_name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-700">
                      {w.upi_id || 'N/A'}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-black text-slate-900 text-lg tabular-nums">
                    ₹{w.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full border ${
                      w.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                      w.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
                    }`}>{w.status}</span>
                    {w.note && w.status === 'rejected' && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 max-w-[180px]">Reason: {w.note}</p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                    {w.created_at}
                  </td>

                  <td className="px-6 py-4 text-right pr-6">
                    {w.status === 'requested' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleProcess(w.id, 'approve')}
                          disabled={busyId === w.id}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                          title="Approve & Pay Payout"
                        >
                          <Wallet className="w-4 h-4" /> Approve & Pay
                        </button>
                        <button
                          onClick={() => handleProcess(w.id, 'reject')}
                          disabled={busyId === w.id}
                          className="px-3 py-2 bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Reject Request"
                        >
                          <X className="w-4 h-4 stroke-[3]" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 font-bold uppercase">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">No withdrawal requests found in this view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {withdrawals.map((w, idx) => (
          <div key={w.id} className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={w.user_name} />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-base leading-snug break-words">{w.user_name}</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{w.upi_id || 'N/A'}</p>
                </div>
              </div>

              <span className={`shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                w.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                w.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
              }`}>{w.status}</span>
            </div>

            {w.note && w.status === 'rejected' && (
              <p className="text-[10px] font-bold text-rose-500 mt-2 bg-rose-50 p-2 rounded-xl border border-rose-100">Reason: {w.note}</p>
            )}

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/60 rounded-xl p-3">
              <span className="text-slate-400 font-semibold">{w.created_at}</span>
              <span className="font-black text-slate-900 text-base tabular-nums">₹{w.amount.toLocaleString('en-IN')}</span>
            </div>

            {w.status === 'requested' && (
              <div className="flex gap-2 mt-4 pt-2">
                <button
                  onClick={() => handleProcess(w.id, 'approve')}
                  disabled={busyId === w.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" /> Approve & Pay
                </button>
                <button
                  onClick={() => handleProcess(w.id, 'reject')}
                  disabled={busyId === w.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 border border-rose-200/60 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50"
                >
                  <X className="w-4 h-4 stroke-[3]" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {withdrawals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400 font-semibold">No withdrawal requests found in this view.</div>
        )}
      </div>

    </div>
  );
}
