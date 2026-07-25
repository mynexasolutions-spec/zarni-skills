import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, CheckCircle, Upload, Landmark, ShieldCheck, XCircle, Lock, ClipboardList, Clock3, ZoomIn, X, ExternalLink, Plus, Hash, Building2, Smartphone, User, Fingerprint, CreditCard, Tag, ImagePlus, Sparkles, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

const LABEL_SUGGESTIONS = ['Aadhaar Front', 'Aadhaar Back', 'PAN Card', 'Bank Passbook', 'Cancelled Cheque', 'Other'];
const MAX_DOCS = 8;

function Field({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          {...props}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-350"
        />
      </div>
    </div>
  );
}

export default function KYC() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upi, setUpi] = useState('');
  const [documents, setDocuments] = useState([]);
  const [newDocs, setNewDocs] = useState([]);
  const [composerLabel, setComposerLabel] = useState('');
  const [composerFile, setComposerFile] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const [status, setStatus] = useState('not_submitted');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        const response = await api.get('/student/kyc');
        if (response.data.kyc) {
          const kyc = response.data.kyc;
          setFullName(kyc.full_name || '');
          setAadhaar(kyc.aadhaar_number || '');
          setPan(kyc.pan_number || '');
          setBankName(kyc.bank_name || '');
          setAccountNumber(kyc.account_number || '');
          setIfsc(kyc.ifsc_code || '');
          setUpi(kyc.upi_id || '');
          setStatus(kyc.status || 'not_submitted');
          setDocuments(kyc.documents || []);
          setAdminNote(kyc.admin_note || '');
        }
      } catch (err) {
        console.error('Error fetching KYC', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKYCStatus();
  }, []);

  const totalDocCount = documents.length + newDocs.length;

  const handleComposerFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setComposerFile(file);
  };

  const handleAddDocument = () => {
    if (!composerLabel.trim() || !composerFile) return;
    setNewDocs((prev) => [...prev, { label: composerLabel.trim(), file: composerFile, preview: URL.createObjectURL(composerFile) }]);
    setComposerLabel('');
    setComposerFile(null);
  };

  const handleRemoveExisting = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRemoveNew = (idx) => {
    setNewDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('aadhaar_number', aadhaar);
      formData.append('pan_number', pan);
      formData.append('bank_name', bankName);
      formData.append('account_number', accountNumber);
      formData.append('ifsc_code', ifsc);
      formData.append('upi_id', upi);
      documents.forEach((d) => {
        if (typeof d.id === 'number') formData.append('keep_document_ids', d.id);
      });
      newDocs.forEach((d) => {
        formData.append('doc_label', d.label);
        formData.append('doc_file', d.file);
      });

      const response = await api.post('/student/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess(true);
        setStatus('pending');
      } else {
        setError(response.data.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Verification Portal...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'submit', label: 'Submit Details', icon: ClipboardList },
    { key: 'review', label: 'Under Review', icon: Clock3 },
    { key: 'verified', label: 'Verified', icon: ShieldCheck },
  ];
  const activeStepIdx = status === 'approved' ? 2 : status === 'pending' ? 1 : status === 'rejected' ? 1 : 0;
  const stepFailed = status === 'rejected';
  const canEdit = status !== 'pending' && status !== 'approved';

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4 backdrop-blur-md shadow-inner">
              <Lock className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> 256-Bit SSL Encrypted
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight flex items-center justify-center gap-3">
              KYC Verification Hub <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-blue-300" />
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm font-medium leading-relaxed">
              Verify your identity & bank information to enable instant automated wallet payouts.
            </p>
          </div>

          {/* Verification Stepper */}
          <div className="relative z-10 flex items-center justify-center max-w-md mx-auto bg-white/10 border border-white/20 p-4 sm:p-5 rounded-2xl backdrop-blur-md shadow-xl">
            {steps.map((s, idx) => {
              const isDone = idx < activeStepIdx || (idx === activeStepIdx && status === 'approved');
              const isCurrent = idx === activeStepIdx && status !== 'approved';
              const isFailedStep = isCurrent && stepFailed;
              return (
                <React.Fragment key={s.key}>
                  {idx > 0 && (
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-500 mx-2 ${idx <= activeStepIdx ? (stepFailed && idx === activeStepIdx ? 'bg-red-400' : 'bg-emerald-400') : 'bg-white/20'}`}></div>
                  )}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-md ${
                      isFailedStep ? 'bg-red-500 border-red-300 text-white' :
                      isDone ? 'bg-emerald-500 border-emerald-300 text-white' :
                      isCurrent ? 'bg-white text-blue-900 border-white shadow-lg animate-pulse' : 'bg-white/10 border-white/20 text-white/70'
                    }`}>
                      {isFailedStep ? <XCircle className="w-5 h-5" /> : isDone ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/90 whitespace-nowrap">{isFailedStep ? 'Rejected' : s.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Status Alerts */}
      {status === 'approved' && (
        <Reveal variant="scale-in">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-emerald-400/30 flex items-center gap-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[90px] pointer-events-none"></div>
            <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xl backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-emerald-300" strokeWidth={2.2} />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1 border border-emerald-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" /> Account Verified
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white">KYC Verification Approved</h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-medium mt-1">Your profile is fully verified. Automated earnings withdrawals will process directly to your registered UPI or Bank account.</p>
            </div>
          </div>
        </Reveal>
      )}

      {status === 'pending' && (
        <Reveal variant="scale-in">
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-amber-400/30 flex items-center gap-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-[90px] pointer-events-none"></div>
            <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xl backdrop-blur-md">
              <Clock3 className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1 border border-amber-400/30">
                Verification Pending
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white">Review Underway</h3>
              <p className="text-xs sm:text-sm text-amber-100/80 font-medium mt-1">Your details and documents are currently being inspected by our compliance team. Document updates are locked during review.</p>
            </div>
          </div>
        </Reveal>
      )}

      {status === 'rejected' && (
        <Reveal variant="scale-in">
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-950 via-red-950 to-rose-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-red-400/30 flex items-center gap-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/20 rounded-full blur-[90px] pointer-events-none"></div>
            <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xl backdrop-blur-md">
              <ShieldAlert className="w-8 h-8 text-red-300" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-300 mb-1 border border-red-400/30">
                Correction Required
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white">KYC Verification Failed</h3>
              <p className="text-xs sm:text-sm text-red-100/80 font-medium mt-1">Reason: <strong>{adminNote || 'No specific note provided.'}</strong>. Please update your details and re-submit for review.</p>
            </div>
          </div>
        </Reveal>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm mb-6 animate-scale-in">
          <CheckCircle className="w-4 h-4 animate-pop-in shrink-0" /> KYC submitted successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6 animate-scale-in">
          {error}
        </div>
      )}

      <Reveal variant="fade-up" delay={150}>
        <div className="group/card relative rounded-[2.5rem] p-[1px] bg-gradient-to-br from-blue-200 via-slate-100 to-transparent hover:from-blue-300 hover:via-slate-200 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="relative space-y-8 bg-white p-6 sm:p-10 rounded-[calc(2.5rem-1px)] shadow-sm group-hover/card:shadow-xl group-hover/card:shadow-blue-100/60 transition-shadow duration-300 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/[0.05] rounded-full blur-2xl pointer-events-none"></div>

            {/* Bank Details */}
            <div className="relative">
              <h3 className="font-heading font-black text-slate-900 text-lg mb-4 flex items-center gap-3">
                <span className="relative w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Landmark className="w-4.5 h-4.5" />
                </span>
                Bank Account & UPI Details
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <Field
                  icon={Landmark}
                  label="Bank Name"
                  type="text"
                  required
                  disabled={!canEdit || submitting}
                  placeholder="e.g. HDFC Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
                <Field
                  icon={Hash}
                  label="Account Number"
                  type="text"
                  required
                  disabled={!canEdit || submitting}
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <Field
                  icon={Building2}
                  label="IFSC Code"
                  type="text"
                  required
                  disabled={!canEdit || submitting}
                  placeholder="e.g. HDFC0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                />
                <Field
                  icon={Smartphone}
                  label="UPI ID"
                  type="text"
                  disabled={!canEdit || submitting}
                  placeholder="e.g. mobile@ybl"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                />
              </div>
            </div>

            {/* Identity Details */}
            <div className="relative pt-6 border-t border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-lg mb-4 flex items-center gap-3">
                <span className="relative w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-4.5 h-4.5" />
                </span>
                Identity Information
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <Field
                  icon={User}
                  label="Full Name"
                  type="text"
                  required
                  disabled={!canEdit || submitting}
                  placeholder="As on Aadhaar card"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Field
                  icon={Fingerprint}
                  label="Aadhaar Number"
                  type="text"
                  required
                  disabled={!canEdit || submitting}
                  placeholder="12-digit Aadhaar number"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                />
                <div className="md:col-span-2">
                  <Field
                    icon={CreditCard}
                    label="PAN Number"
                    type="text"
                    required
                    disabled={!canEdit || submitting}
                    placeholder="e.g. ABCDE1234F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="relative pt-6 border-t border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-lg mb-1 flex items-center gap-3">
                <span className="relative w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Upload className="w-4.5 h-4.5" />
                </span>
                Supporting Document Attachments
                <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
              </h3>
              <p className="text-xs font-medium text-slate-400 mb-6">Attach clear photos of your Aadhaar (front/back), PAN card, and Bank Passbook / Cancelled Cheque.</p>

              {totalDocCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {documents.map((d) => (
                    <div key={d.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => setLightbox({ url: d.file_url, label: d.label })}
                        className="group/img relative w-full block rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img src={d.file_url} alt={d.label} className="w-full h-32 object-contain bg-slate-50 p-2" />
                        <span className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/40 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </span>
                      </button>
                      <p className="text-[10px] font-black text-slate-600 mt-1.5 truncate text-center uppercase tracking-wider">{d.label}</p>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(d.id)}
                          disabled={submitting}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {newDocs.map((d, idx) => (
                    <div key={`new-${idx}`} className="relative group">
                      <button
                        type="button"
                        onClick={() => setLightbox({ url: d.preview, label: d.label })}
                        className="group/img relative w-full block rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img src={d.preview} alt={d.label} className="w-full h-32 object-contain bg-slate-50 p-2" />
                        <span className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/40 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </span>
                        <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest shadow-md">
                          New
                        </span>
                      </button>
                      <p className="text-[10px] font-black text-slate-600 mt-1.5 truncate text-center uppercase tracking-wider">{d.label}</p>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleRemoveNew(idx)}
                          disabled={submitting}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canEdit && totalDocCount < MAX_DOCS && (
                <div className={`relative overflow-hidden rounded-2xl border border-dashed border-blue-300 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 sm:p-5 transition-opacity ${submitting ? 'opacity-60 pointer-events-none' : ''}`}>
                  <div className="relative flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Document Label</label>
                      <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          list="kyc-label-suggestions"
                          value={composerLabel}
                          onChange={(e) => setComposerLabel(e.target.value)}
                          placeholder="e.g. Aadhaar Front"
                          disabled={submitting}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <datalist id="kyc-label-suggestions">
                        {LABEL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Image</label>
                      <label className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
                        <span className="relative w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          {composerFile ? <ImagePlus className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        </span>
                        <span className="text-xs font-bold text-slate-600 truncate flex-1">{composerFile?.name || 'Choose image file'}</span>
                        <input type="file" accept="image/*" disabled={submitting} onChange={handleComposerFileChange} className="hidden" />
                      </label>
                    </div>
                    <div className="flex sm:items-end">
                      <button
                        type="button"
                        onClick={handleAddDocument}
                        disabled={!composerLabel.trim() || !composerFile || submitting}
                        className="group relative overflow-hidden w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 transition-all disabled:opacity-40 disabled:shadow-none hover:-translate-y-0.5"
                      >
                        <Plus className="w-4 h-4" /> <span>Add File</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {canEdit && (
              <div className="relative text-center pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative inline-flex overflow-hidden px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest items-center justify-center gap-2.5 shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
                >
                  {!submitting && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                  {submitting ? (
                    <span className="relative w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-5 h-5 relative" />
                  )}
                  <span className="relative">{submitting ? 'Submitting KYC...' : 'Submit KYC Verification'}</span>
                </button>
                <p className="text-center text-[11px] font-bold text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" /> Your information is encrypted and strictly used for payout processing.
                </p>
              </div>
            )}
          </form>
        </div>
      </Reveal>

      {lightbox && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
          <div className="relative max-w-2xl w-full max-h-[85vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-sm">{lightbox.label}</span>
              <div className="flex items-center gap-2">
                <a href={lightbox.url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => setLightbox(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img src={lightbox.url} alt={lightbox.label} className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl bg-white" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
