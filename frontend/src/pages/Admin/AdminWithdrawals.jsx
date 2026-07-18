import React, { useEffect, useState } from 'react';
import { Landmark, IndianRupee, CheckCircle2, Clock, XCircle, Wallet } from 'lucide-react';
import api from '../../utils/api';

const STATUS_TABS = [
  { key: 'requested', label: 'Requested' },
  { key: 'paid', label: 'Approved & Paid' },
  { key: 'rejected', label: 'Rejected' },
  { key: '', label: 'All' },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const kpis = [
    { key: 'requested_total', label: 'Requested Total', value: `₹${requestedTotal.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-amber-500 to-orange-600' },
    { key: 'requested', label: 'Pending', value: statusCounts.requested ?? 0, icon: Clock, color: 'from-blue-500 to-indigo-600' },
    { key: 'paid', label: 'Paid', value: statusCounts.paid ?? 0, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
    { key: 'rejected', label: 'Rejected', value: statusCounts.rejected ?? 0, icon: XCircle, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Landmark className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">Student Withdrawal Requests</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.key} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-xl font-black leading-none">{kpi.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide shrink-0 transition-colors ${
              statusFilter === tab.key ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Student</th>
                <th className="pb-3">UPI ID</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Requested</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-bold text-slate-800">{w.user_name}</td>
                  <td className="py-4 font-mono">{w.upi_id || 'N/A'}</td>
                  <td className="py-4 font-black text-slate-800">₹{w.amount.toLocaleString('en-IN')}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      w.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : w.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{w.status}</span>
                    {w.note && w.status === 'rejected' && <p className="text-[10px] text-slate-400 mt-1 max-w-[160px]">{w.note}</p>}
                  </td>
                  <td className="py-4 text-slate-400">{w.created_at}</td>
                  <td className="py-4 text-right">
                    {w.status === 'requested' ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleProcess(w.id, 'approve')} disabled={busyId === w.id} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50" title="Approve & Pay">
                          <Wallet className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleProcess(w.id, 'reject')} disabled={busyId === w.id} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">No withdrawal requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {withdrawals.map(w => (
          <div key={w.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{w.user_name}</p>
                <p className="text-xs text-slate-400 font-mono truncate">{w.upi_id || 'N/A'}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                w.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : w.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}>{w.status}</span>
            </div>
            {w.note && w.status === 'rejected' && <p className="text-[10px] text-slate-400 mt-1.5">{w.note}</p>}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">{w.created_at}</span>
              <span className="font-black text-slate-800 text-sm">₹{w.amount.toLocaleString('en-IN')}</span>
            </div>
            {w.status === 'requested' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleProcess(w.id, 'approve')} disabled={busyId === w.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold disabled:opacity-50">
                  <Wallet className="w-4 h-4" /> Approve & Pay
                </button>
                <button onClick={() => handleProcess(w.id, 'reject')} disabled={busyId === w.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {withdrawals.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No withdrawal requests found.</div>
        )}
      </div>
    </div>
  );
}
