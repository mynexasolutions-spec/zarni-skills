import React, { useEffect, useState } from 'react';
import { UserCog, CheckCircle, XCircle, Clock, Check, X, Shield, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

export default function AdminManagerRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/manager-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status, promptNote) => {
    let admin_note;
    if (promptNote) {
      admin_note = window.prompt('Note for this decision (optional):') || '';
    }
    if (status === 'approved' && !window.confirm('Approve this request? The user will immediately be promoted to Manager role.')) return;
    setBusyId(id);
    try {
      await api.post(`/admin/manager-requests/${id}/status`, { status, admin_note });
      fetchRequests();
    } catch (err) {
      console.error(err);
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
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Manager Applications...</p>
      </div>
    );
  }

  const statusCounts = requests.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  const filtered = requests.filter(r => r.status === statusFilter);

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <UserCog className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Manager Applications</h2>
            <p className="text-xs text-slate-400 font-semibold">Review and approve role upgrades submitted by team members</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {requests.length} total applications
        </span>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'pending', label: 'Pending Review', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/15', text: 'text-amber-100' },
          { key: 'approved', label: 'Approved Managers', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/15', text: 'text-emerald-100' },
          { key: 'rejected', label: 'Rejected Requests', color: 'from-rose-600 to-red-700', shadow: 'shadow-red-600/15', text: 'text-red-100' },
        ].map((kpi, idx) => (
          <div key={kpi.key} className={`group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.shadow} transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`} style={{ animationDelay: `${idx * 70}ms` }}>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest ${kpi.text} mb-2`}>{kpi.label}</p>
            <AnimatedNumber value={statusCounts[kpi.key] ?? 0} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
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
            {tab.label} ({statusCounts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((r, idx) => (
          <div key={r.id} className="group bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up flex flex-col justify-between" style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}>
            <div className="space-y-4">
              {/* Header user info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={r.user_name} />
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-red-600 transition-colors truncate">{r.user_name || 'Applicant'}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{r.user_email}</p>
                  </div>
                </div>
                
                <span className={`shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border shadow-sm ${
                  r.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                  r.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
                }`}>{r.status}</span>
              </div>

              {/* Message block */}
              <div className="bg-slate-50/80 border border-slate-200/40 rounded-2xl p-4 space-y-2 text-xs">
                {r.message ? (
                  <p className="text-slate-650 leading-relaxed font-medium">"{r.message}"</p>
                ) : (
                  <p className="text-slate-400 italic font-medium">No application statement submitted.</p>
                )}
                
                {r.admin_note && (
                  <div className="pt-2 border-t border-slate-200/40 text-slate-500 font-semibold">
                    <span className="font-extrabold text-slate-700">Admin Note:</span> {r.admin_note}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Submitted on {r.submitted_at}</span>
              </div>
            </div>

            {/* Actions for pending requests */}
            {r.status === 'pending' && (
              <div className="flex gap-2.5 pt-5 mt-5 border-t border-slate-50 shrink-0">
                <button
                  onClick={() => updateStatus(r.id, 'approved', false)}
                  disabled={busyId === r.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Approve
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'rejected', true)}
                  disabled={busyId === r.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 stroke-[3]" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-semibold shadow-sm">
            <UserCog className="w-12 h-12 mx-auto text-slate-200 mb-3 animate-pulse" />
            No applications in the "{statusFilter}" category.
          </div>
        )}
      </div>

    </div>
  );
}
