import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, CheckCircle, XCircle, Clock, ShieldCheck, Ban, X, ExternalLink, CreditCard, Check, Eye, Landmark, User, Shield } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name, size = 'w-11 h-11' }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm`}>
      {initials}
    </div>
  );
}

function DocThumb({ url, label, colorClass }) {
  const [preview, setPreview] = useState(null);
  if (!url) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setPreview(url)}
        title={label}
        className={`group relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200/80 shrink-0 hover:ring-2 hover:ring-offset-1 transition-all shadow-sm ${colorClass}`}
      >
        <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      </button>
      {preview && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreview(null)}>
          <div className="relative max-w-2xl w-full max-h-[85vh] animate-scale-in bg-white rounded-3xl overflow-hidden shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-slate-900 font-extrabold text-sm">{label}</span>
              <div className="flex items-center gap-2">
                <a href={preview} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => setPreview(null)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl overflow-hidden p-2 flex items-center justify-center">
              <img src={preview} alt={label} className="w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const STATUS_TABS = [
  { key: 'pending', label: 'Pending Review' },
  { key: 'approved', label: 'Approved KYC' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminKyc() {
  const [kycs, setKycs] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [selectedKyc, setSelectedKyc] = useState(null);

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
      if (selectedKyc?.id === id) setSelectedKyc(null);
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
      if (selectedKyc?.id === id) setSelectedKyc(null);
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
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading KYC Submissions...</p>
      </div>
    );
  }

  const kpis = [
    { key: 'pending', label: 'Pending Review', icon: Clock, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/15', text: 'text-amber-100' },
    { key: 'approved', label: 'Approved KYC', icon: ShieldCheck, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/15', text: 'text-emerald-100' },
    { key: 'rejected', label: 'Rejected Entries', icon: Ban, color: 'from-rose-600 to-red-700', shadow: 'shadow-red-600/15', text: 'text-red-100' },
  ];

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">KYC Document Verification</h2>
            <p className="text-xs text-slate-400 font-semibold">Audit student identities, bank account details, and government IDs</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {(statusCounts.pending || 0) + (statusCounts.approved || 0) + (statusCounts.rejected || 0)} total submissions
        </span>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={kpi.key} className={`group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.shadow} transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`} style={{ animationDelay: `${idx * 70}ms` }}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80 transition-transform duration-300 group-hover:scale-110" />
            <AnimatedNumber value={statusCounts[kpi.key] ?? 0} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
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
            {tab.label} ({statusCounts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {/* Desktop Data Table - Increased Text Size & Uncluttered */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto admin-scrollbar">
          <table className="w-full text-left text-base text-slate-700">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Student Account</th>
                <th className="px-6 py-4">Bank Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted Proofs</th>
                <th className="px-6 py-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {kycs.map(k => (
                <tr key={k.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3.5">
                      <Avatar name={k.full_name || k.user_name} size="w-12 h-12" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-red-600 transition-colors">{k.full_name}</p>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{k.user_name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4.5 font-bold text-slate-800 text-sm">
                    {k.bank_name || 'N/A'}
                  </td>

                  <td className="px-6 py-4.5">
                    <span className={`inline-flex px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full border ${
                      k.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                      k.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
                    }`}>{k.status}</span>
                  </td>

                  <td className="px-6 py-4.5">
                    <div className="flex gap-2 flex-wrap max-w-[200px]">
                      {(k.documents || []).map((d) => (
                        <DocThumb key={d.id} url={d.file_url} label={d.label} colorClass="ring-red-400" />
                      ))}
                      {(!k.documents || k.documents.length === 0) && <span className="text-xs text-slate-400 font-semibold">None</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4.5 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details Eye Button */}
                      <button
                        onClick={() => setSelectedKyc(k)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shadow-sm"
                        title="View Full KYC Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {k.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(k.id)}
                            disabled={busyId === k.id}
                            className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                            title="Approve Submission"
                          >
                            <Check className="w-5 h-5 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => handleReject(k.id)}
                            disabled={busyId === k.id}
                            className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50"
                            title="Reject Submission"
                          >
                            <X className="w-5 h-5 stroke-[3]" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {kycs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 font-semibold">No KYC submissions found in the "{statusFilter}" category.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {kycs.map((k, idx) => (
          <div key={k.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={k.full_name || k.user_name} />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 leading-snug break-words text-base">{k.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{k.user_name}</p>
                </div>
              </div>

              <span className={`shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                k.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                k.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
              }`}>{k.status}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSelectedKyc(k)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" /> View Details
              </button>
            </div>
          </div>
        ))}
        {kycs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400 font-semibold">No KYC submissions found in the "{statusFilter}" category.</div>
        )}
      </div>

      {/* KYC Full Details Modal */}
      {selectedKyc && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedKyc(null)}>
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-6 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar name={selectedKyc.full_name || selectedKyc.user_name} size="w-12 h-12" />
                <div className="min-w-0">
                  <h3 className="text-xl font-black tracking-tight truncate">{selectedKyc.full_name}</h3>
                  <p className="text-xs text-white/60 font-medium truncate">{selectedKyc.user_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedKyc(null)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Generous Padding */}
            <div className="flex-1 overflow-y-auto admin-scrollbar p-6 sm:p-8 space-y-7 text-sm">
              
              {/* Status & Rejection Note */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-5 sm:p-6 rounded-3xl">
                <span className="text-xs font-black uppercase text-slate-400">Current Status</span>
                <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full border ${
                  selectedKyc.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                  selectedKyc.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
                }`}>{selectedKyc.status}</span>
              </div>

              {selectedKyc.status === 'rejected' && selectedKyc.admin_note && (
                <div className="bg-rose-50 border border-rose-100 p-5 sm:p-6 rounded-3xl text-xs">
                  <p className="font-extrabold text-rose-700 uppercase tracking-wide mb-1.5">Rejection Reason</p>
                  <p className="text-rose-600 font-semibold text-sm leading-relaxed">{selectedKyc.admin_note}</p>
                </div>
              )}

              {/* Bank Account Info */}
              <div className="space-y-3.5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-500" /> Bank & Payout Credentials
                </p>
                <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 sm:p-6 space-y-3.5 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold text-xs uppercase">Bank Name</span><span className="font-extrabold text-slate-900 text-base">{selectedKyc.bank_name || 'N/A'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold text-xs uppercase">Account Number</span><span className="font-mono font-black text-slate-800 text-sm tracking-wide">{selectedKyc.account_number || 'N/A'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold text-xs uppercase">IFSC Code</span><span className="font-mono font-black text-slate-800 text-sm tracking-wide">{selectedKyc.ifsc_code || 'N/A'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold text-xs uppercase">UPI ID</span><span className="font-mono font-black text-slate-800 text-sm tracking-wide">{selectedKyc.upi_id || 'N/A'}</span></div>
                </div>
              </div>

              {/* Government ID Info */}
              <div className="space-y-3.5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" /> Government Identity Numbers
                </p>
                <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 sm:p-6 space-y-3.5 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold text-xs uppercase">PAN Card Number</span><span className="font-mono font-black text-slate-800 text-sm tracking-wide">{selectedKyc.pan_number || 'N/A'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-semibold text-xs uppercase">Aadhaar Number</span><span className="font-mono font-black text-slate-800 text-sm tracking-wide">{selectedKyc.aadhaar_number || 'N/A'}</span></div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3.5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Uploaded Image Proofs</p>
                <div className="flex items-center gap-3.5 flex-wrap bg-slate-50 border border-slate-200/60 rounded-3xl p-5 sm:p-6">
                  {(selectedKyc.documents || []).map((d) => (
                    <DocThumb key={d.id} url={d.file_url} label={d.label} colorClass="ring-red-400" />
                  ))}
                  {(!selectedKyc.documents || selectedKyc.documents.length === 0) && (
                    <span className="text-xs text-slate-400 font-semibold">No uploaded document images.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              {selectedKyc.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleReject(selectedKyc.id)}
                    disabled={busyId === selectedKyc.id}
                    className="flex-1 py-3.5 bg-rose-50 border border-rose-200/60 text-rose-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4 stroke-[3]" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedKyc.id)}
                    disabled={busyId === selectedKyc.id}
                    className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Approve KYC
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedKyc(null)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Close Details
                </button>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
