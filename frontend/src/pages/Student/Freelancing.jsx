import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, UploadCloud, FileText, CheckCircle2, Clock, XCircle, User, Sparkles, Award, MessageSquare, Paperclip, ExternalLink, X, Users, UserCheck, Zap, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function PdfModal({ url, onClose }) {
  if (!url) return null;
  return createPortal(
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-3xl h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <FileText className="w-4 h-4 text-primary" /> CV / Resume
          </span>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors" title="Open in new tab">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">
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

const STATUS_META = {
  pending: { label: 'Under Review', color: 'bg-amber-50 text-amber-600', Icon: Clock },
  reviewed: { label: 'Reviewed', color: 'bg-blue-50 text-blue-600', Icon: FileText },
  accepted: { label: 'Accepted', color: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 },
  rejected: { label: 'Not Accepted', color: 'bg-red-50 text-red-600', Icon: XCircle },
};

function Field({ icon: Icon, label, textarea, ...props }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <Icon className={`absolute left-3.5 ${textarea ? 'top-3.5' : 'top-1/2 -translate-y-1/2'} w-4 h-4 text-slate-350 pointer-events-none`} />
        <Tag
          {...props}
          className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow disabled:bg-slate-50 disabled:text-slate-400 ${textarea ? 'resize-none' : ''}`}
        />
      </div>
    </div>
  );
}

export default function Freelancing() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [stats, setStats] = useState({ total_applied: 0, total_accepted: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ details: '', skills: '', certification: '' });
  const [cvFile, setCvFile] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  const fetchApplication = async () => {
    try {
      const response = await api.get('/student/freelance-application');
      setApplication(response.data.application);
      setStats(response.data.stats || { total_applied: 0, total_accepted: 0 });
    } catch (err) {
      console.error('Error fetching freelance application', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplication(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.skills.trim()) {
      setError('Please list at least one skill.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('details', form.details);
      fd.append('skills', form.skills);
      fd.append('certification', form.certification);
      if (cvFile) {
        fd.append('cv', cvFile);
        fd.append('resume', cvFile);
      }

      const response = await api.post('/student/freelance-application', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setForm({ details: '', skills: '', certification: '' });
        setCvFile(null);
        fetchApplication();
      } else {
        setError(response.data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Freelance Portal...</p>
        </div>
      </div>
    );
  }

  const statusMeta = application ? STATUS_META[application.status] : null;
  const canEdit = !application || application.status !== 'accepted';
  const cvUrl = application?.cv_url || application?.resume_url;

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-teal-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #0891b2 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-[10px] font-black uppercase tracking-widest text-teal-200 mb-4 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Official Freelancer Portal
            </div>
            
            <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight flex items-center gap-3">
              Freelance Hub <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-teal-300" />
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm font-medium leading-relaxed">
              Submit your skills & portfolio to get verified as an official Zarni Skills freelancer and receive paid client gig assignments.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

        {/* Main column: form or locked state */}
        <div className="lg:col-span-2">
          {canEdit ? (
            <div className="group/card relative rounded-[2rem] p-[1px] bg-gradient-to-br from-teal-200 via-slate-100 to-transparent hover:from-teal-300 hover:via-slate-200 transition-colors duration-300 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-[calc(2rem-1px)] p-5 sm:p-8 shadow-sm group-hover/card:shadow-lg group-hover/card:shadow-teal-100/60 transition-shadow duration-300 space-y-6 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400/[0.05] rounded-full blur-2xl pointer-events-none"></div>
              {error && <div className="relative p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

              <div className="relative">
                <Field icon={User} label="Name" type="text" disabled value={user?.name || ''} />
              </div>

              <div className="relative">
                <Field
                  icon={MessageSquare}
                  label="Details"
                  textarea
                  rows={3}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Tell us a bit about yourself and the kind of freelance work you're looking for."
                />
              </div>

              <div className="relative">
                <Field
                  icon={Sparkles}
                  label="Skills *"
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Graphic Design, Video Editing, Copywriting..."
                />
              </div>

              <div className="relative">
                <Field
                  icon={Award}
                  label="Certifications"
                  type="text"
                  value={form.certification}
                  onChange={(e) => setForm({ ...form, certification: e.target.value })}
                  placeholder="Google Ads Certified, Canva Mastery..."
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">CV / Resume (PDF)</label>
                <label className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
                  cvFile ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5'
                }`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${cvFile ? 'bg-emerald-100' : 'bg-primary/10'}`}>
                    {cvFile ? <CheckCircle2 className="w-4 h-4" /> : <UploadCloud className="w-4 h-4 text-primary" />}
                  </span>
                  <span className="truncate flex-1">{cvFile?.name || (cvUrl ? 'Replace your uploaded CV / Resume (PDF)' : 'Upload your CV / Resume (PDF)')}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                </label>
                {!cvFile && cvUrl && (
                  <button type="button" onClick={() => setShowPdf(true)} className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-primary hover:underline">
                    <Paperclip className="w-3 h-3" /> View currently uploaded file
                  </button>
                )}
              </div>

              <div className="relative text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative inline-flex overflow-hidden px-10 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 active:scale-[0.98]"
                >
                  {!submitting && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                  {submitting && <span className="relative w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                  <span className="relative">{submitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
            </div>
          ) : (
            <Reveal variant="scale-in">
              <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-center text-white shadow-2xl shadow-emerald-950/20 group border border-emerald-400/30" style={{ background: 'linear-gradient(135deg, #022c22 0%, #059669 50%, #10b981 100%)' }}>
                
                {/* Glow lights & animated particles */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/25 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[90px] pointer-events-none"></div>
                <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"></span>

                <div className="relative z-10 flex flex-col items-center">
                  
                  {/* Floating Animated Badge */}
                  <div className="relative mb-6">
                    <span className="absolute -inset-2 rounded-3xl bg-emerald-300/40 blur-xl animate-pulse"></span>
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce-subtle">
                      <Award className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300" strokeWidth={2.2} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg ring-2 ring-emerald-300">
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-black uppercase tracking-widest text-emerald-200 mb-3 backdrop-blur-md shadow-inner">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} /> Verification Approved
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
                    You're an Official Verified Freelancer! 🎉
                  </h3>
                  
                  <p className="text-emerald-100/90 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium mb-8">
                    Congratulations! Your skills portfolio has been verified by the Zarni team. Reach out to your manager for upcoming gig assignments and project opportunities.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setShowPdf(true)}
                      className="group relative overflow-hidden inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-50 hover:-translate-y-0.5 transition-all"
                    >
                      <Paperclip className="w-4 h-4 text-emerald-700" /> View Verified Resume
                    </button>

                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md transition-all hover:-translate-y-0.5"
                    >
                      Contact Manager <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* Sidebar: application summary */}
        <div className="space-y-6">

          {application && (
            <div className="group/card relative rounded-[2rem] p-[1px] bg-gradient-to-br from-teal-200 via-slate-100 to-transparent hover:from-teal-300 hover:via-slate-200 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '90ms' }}>
              <div className="relative overflow-hidden bg-white rounded-[calc(2rem-1px)] p-5 shadow-sm group-hover/card:shadow-lg group-hover/card:shadow-teal-100/60 transition-shadow duration-300">
                <div className="absolute -top-8 -right-8 w-28 h-28 bg-teal-400/[0.06] rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Application</p>
                  <span className={`relative inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${statusMeta.color}`}>
                    {application.status === 'pending' && <span className="absolute inset-0 rounded-full animate-pulse bg-current opacity-10"></span>}
                    <statusMeta.Icon className="w-3 h-3 relative" /> <span className="relative">{statusMeta.label}</span>
                  </span>
                </div>
                <p className="relative text-xs text-slate-400">Submitted {application.submitted_at}</p>

                {application.admin_note && (
                  <p className="relative text-xs text-slate-500 mt-3 bg-slate-50 rounded-lg px-3 py-2">{application.admin_note}</p>
                )}

                <div className="relative mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wide mb-1">Skills</p>
                    <p className="text-slate-700">{application.skills || '—'}</p>
                  </div>
                  {application.certification && (
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wide mb-1">Certifications</p>
                      <p className="text-slate-700">{application.certification}</p>
                    </div>
                  )}
                  {application.details && (
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wide mb-1">About</p>
                      <p className="text-slate-600 leading-relaxed line-clamp-3">{application.details}</p>
                    </div>
                  )}
                </div>

                {cvUrl && (
                  <button type="button" onClick={() => setShowPdf(true)} className="relative w-full inline-flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors">
                    <Paperclip className="w-3.5 h-3.5" /> View CV / Resume
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPdf && <PdfModal url={cvUrl} onClose={() => setShowPdf(false)} />}
    </div>
  );
}
