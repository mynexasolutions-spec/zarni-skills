import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, ShieldCheck, Ban, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminKyc() {
  const [kycs, setKycs] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchKycList = async (status) => {
    try {
      const response = await api.get('/admin/kyc', { params: { status } });
      setKycs(response.data.kyc_list || []);
      setStatusCounts(response.data.status_counts || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchKycList(statusFilter);
  }, [statusFilter]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/kyc/${id}/approve`);
      fetchKycList(statusFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const note = window.prompt('Reason for rejecting this KYC submission:');
    if (note === null) return;
    setBusyId(id);
    try {
      await api.post(`/admin/kyc/${id}/reject`, { note });
      fetchKycList(statusFilter);
    } catch (err) {
      console.error(err);
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
    { key: 'pending', label: 'Pending Review', icon: Clock, color: 'from-amber-500 to-orange-600' },
    { key: 'approved', label: 'Approved', icon: ShieldCheck, color: 'from-emerald-500 to-green-600' },
    { key: 'rejected', label: 'Rejected', icon: Ban, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">KYC Document Verification</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.key} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-xl font-black leading-none">{statusCounts[kpi.key] ?? 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors ${
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
                <th className="pb-3">Name</th>
                <th className="pb-3">Bank Details</th>
                <th className="pb-3">UPI ID</th>
                <th className="pb-3">Identity</th>
                <th className="pb-3">Documents</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kycs.map(k => (
                <tr key={k.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <p className="font-bold text-slate-800">{k.full_name}</p>
                    <p className="text-xs text-slate-400">{k.user_name}</p>
                    {k.status === 'rejected' && k.admin_note && (
                      <p className="text-[10px] text-red-500 mt-1 max-w-[160px]">Reason: {k.admin_note}</p>
                    )}
                  </td>
                  <td className="py-4">
                    <p className="font-medium text-slate-800">{k.bank_name}</p>
                    <p className="text-xs text-slate-400">A/C: {k.account_number} | IFSC: {k.ifsc_code}</p>
                  </td>
                  <td className="py-4 font-medium">{k.upi_id || 'N/A'}</td>
                  <td className="py-4 text-xs">
                    <p>PAN: {k.pan_number}</p>
                    <p className="text-slate-400 mt-0.5">Aadhaar: {k.aadhaar_number}</p>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {k.id_proof_url && (
                        <a href={k.id_proof_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100" title="ID Proof">
                          <ImageIcon className="w-4 h-4" />
                        </a>
                      )}
                      {k.bank_proof_url && (
                        <a href={k.bank_proof_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100" title="Bank Proof">
                          <ImageIcon className="w-4 h-4" />
                        </a>
                      )}
                      {!k.id_proof_url && !k.bank_proof_url && <span className="text-xs text-slate-300">None</span>}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    {k.status === 'pending' ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleApprove(k.id)} disabled={busyId === k.id} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleReject(k.id)} disabled={busyId === k.id} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-full ${
                        k.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>{k.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {kycs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">No submissions in this category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {kycs.map(k => (
          <div key={k.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{k.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{k.user_name}</p>
              </div>
              {k.status !== 'pending' && (
                <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                  k.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>{k.status}</span>
              )}
            </div>
            {k.status === 'rejected' && k.admin_note && (
              <p className="text-[10px] text-red-500 mt-1.5">Reason: {k.admin_note}</p>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Bank</span><span className="font-medium text-slate-700 text-right">{k.bank_name} · {k.account_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">IFSC</span><span className="text-slate-600">{k.ifsc_code}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">UPI ID</span><span className="text-slate-600">{k.upi_id || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">PAN</span><span className="text-slate-600">{k.pan_number}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Aadhaar</span><span className="text-slate-600">{k.aadhaar_number}</span></div>
            </div>
            {(k.id_proof_url || k.bank_proof_url) && (
              <div className="flex gap-2 mt-3">
                {k.id_proof_url && (
                  <a href={k.id_proof_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                    <ImageIcon className="w-3.5 h-3.5" /> ID Proof
                  </a>
                )}
                {k.bank_proof_url && (
                  <a href={k.bank_proof_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-50 text-violet-600 text-[10px] font-bold uppercase">
                    <ImageIcon className="w-3.5 h-3.5" /> Bank Proof
                  </a>
                )}
              </div>
            )}
            {k.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleApprove(k.id)} disabled={busyId === k.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => handleReject(k.id)} disabled={busyId === k.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {kycs.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No submissions in this category.</div>
        )}
      </div>
    </div>
  );
}
