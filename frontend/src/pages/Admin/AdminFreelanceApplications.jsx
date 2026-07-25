import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, CheckCircle, XCircle, Clock, FileText, ExternalLink, X, Paperclip, Check, Eye, Award } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

function PdfModal({ url, onClose }) {
  if (!url) return null;
  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-4xl h-[88vh] bg-white rounded-[2.2rem] overflow-hidden shadow-2xl animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <span className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-red-600" /> Candidate CV / Resume Preview
          </span>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors" title="Open in new tab">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <iframe src={url} title="CV / Resume preview" className="flex-1 w-full bg-slate-100" />
      </div>
    </div>,
    document.body
  );
}

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminFreelanceApplications() {
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const fetchApplications = async (status) => {
    try {
      const response = await api.get('/admin/freelance-applications', { params: { status } });
      setApplications(response.data.applications || []);
      setStatusCounts(response.data.status_counts || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchApplications(statusFilter);
  }, [statusFilter]);

  const updateStatus = async (id, status, promptNote) => {
    let admin_note;
    if (promptNote) {
      admin_note = window.prompt('Note for this decision (optional):') || '';
    }
    setBusyId(id);
    try {
      await api.post(`/admin/freelance-applications/${id}/status`, { status, admin_note });
      fetchApplications(statusFilter);
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
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Freelance Applications...</p>
      </div>
    );
  }

  const kpis = [
    { key: 'pending', label: 'Pending Review', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/15', text: 'text-amber-100' },
    { key: 'reviewed', label: 'Under Review', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-600/15', text: 'text-blue-100' },
    { key: 'accepted', label: 'Accepted Hires', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/15', text: 'text-emerald-100' },
    { key: 'rejected', label: 'Rejected Applications', color: 'from-rose-600 to-red-700', shadow: 'shadow-red-600/15', text: 'text-rose-100' },
  ];

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <Briefcase className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Freelance Talent Applications</h2>
            <p className="text-xs text-slate-400 font-semibold">Review candidate skills, certifications, and submitted CV resumes</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {(statusCounts.pending || 0) + (statusCounts.reviewed || 0) + (statusCounts.accepted || 0) + (statusCounts.rejected || 0)} total candidates
        </span>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={kpi.key} className={`group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.shadow} transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`} style={{ animationDelay: `${idx * 70}ms` }}>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest ${kpi.text} mb-2`}>{kpi.label}</p>
            <AnimatedNumber value={statusCounts[kpi.key] ?? 0} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
          </div>
        ))}
      </div>

      {/* Filter Navigation Tabs */}
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

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((a, idx) => (
          <div key={a.id} className="group bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up flex flex-col justify-between" style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}>
            <div className="space-y-4">
              
              {/* Applicant Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={a.user_name} />
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-red-600 transition-colors truncate">{a.user_name || 'Candidate'}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{a.user_email}</p>
                  </div>
                </div>

                <span className={`shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                  a.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40' :
                  a.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200/40' :
                  a.status === 'reviewed' ? 'bg-blue-50 text-blue-600 border-blue-200/40' : 'bg-amber-50 text-amber-600 border-amber-200/40'
                }`}>{a.status}</span>
              </div>

              {/* Skills & Details Box */}
              <div className="bg-slate-50/80 border border-slate-200/40 rounded-2xl p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Skills & Expertise</span>
                  <div className="flex flex-wrap gap-1.5">
                    {a.skills?.split(',').map((skill, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-0.5 bg-white border border-slate-200/80 rounded-lg font-extrabold text-slate-700 text-[11px]">
                        {skill.trim()}
                      </span>
                    )) || <span className="text-slate-500 font-semibold">{a.skills}</span>}
                  </div>
                </div>

                {a.certification && (
                  <div className="pt-2 border-t border-slate-200/40">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-0.5">Certifications</span>
                    <p className="text-slate-700 font-bold text-xs">{a.certification}</p>
                  </div>
                )}

                {a.details && (
                  <div className="pt-2 border-t border-slate-200/40">
                    <p className="text-slate-650 leading-relaxed font-medium">"{a.details}"</p>
                  </div>
                )}

                {a.admin_note && (
                  <div className="pt-2 border-t border-slate-200/40 text-slate-500 font-semibold">
                    <span className="font-extrabold text-slate-700">Admin Note:</span> {a.admin_note}
                  </div>
                )}
              </div>

              {/* Resume / CV Attachment Button */}
              {(a.cv_url || a.resume_url) && (
                <button
                  type="button"
                  onClick={() => setPdfUrl(a.cv_url || a.resume_url)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Paperclip className="w-4 h-4" /> View Submitted CV / Resume
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-5 mt-5 border-t border-slate-50 shrink-0">
              <button
                onClick={() => updateStatus(a.id, 'reviewed', false)}
                disabled={busyId === a.id}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-50 border border-blue-200/60 text-blue-600 hover:bg-blue-100 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" /> Reviewed
              </button>
              <button
                onClick={() => updateStatus(a.id, 'accepted', false)}
                disabled={busyId === a.id}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept
              </button>
              <button
                onClick={() => updateStatus(a.id, 'rejected', true)}
                disabled={busyId === a.id}
                className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" /> Reject
              </button>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-semibold shadow-sm">
            <Briefcase className="w-12 h-12 mx-auto text-slate-200 mb-3 animate-pulse" />
            No applications found in the "{statusFilter}" category.
          </div>
        )}
      </div>

      {pdfUrl && <PdfModal url={pdfUrl} onClose={() => setPdfUrl(null)} />}
    </div>
  );
}
