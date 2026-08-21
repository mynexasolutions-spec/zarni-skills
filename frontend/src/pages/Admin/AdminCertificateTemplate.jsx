import React, { useEffect, useRef, useState } from 'react';
import { Award, Save, RotateCcw, Move, Sparkles, Type, Eye, BadgeCheck, Palette, Trash2, UploadCloud } from 'lucide-react';
import api from '../../utils/api';
import ScaledCertificate from '../../components/Certificate/ScaledCertificate';
import { DEFAULT_CERT_TEMPLATE } from '../../components/Certificate/CertificateFace';

function ColorControl({ label, value, onChange }) {
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value || '');
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValidHex ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 cursor-pointer p-0.5 bg-white"
        />
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="#1e56d6"
          className={`w-full px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow ${isValidHex ? 'border-slate-200' : 'border-red-300'}`}
        />
      </div>
    </div>
  );
}

const FIELD_META = {
  name: { label: 'Student Name', accent: 'text-primary' },
  course: { label: 'Course Title', accent: 'text-primary' },
  date: { label: 'Date Field', accent: 'text-slate-500' },
  seal: { label: 'Accreditation Seal', accent: 'text-amber-600' },
  signature: { label: 'Signature Block', accent: 'text-emerald-600' },
  cert_id: { label: 'Certificate ID', accent: 'text-slate-400' },
};

function PositionControl({ label, accent, value, onChange, sized = true }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <p className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${accent}`}>
        <Move className="w-3.5 h-3.5" /> {label}
      </p>
      <div className={`grid gap-3 ${sized ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horizontal (%)</label>
          <input
            type="number" min="0" max="100" value={value.x}
            onChange={(e) => onChange({ ...value, x: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vertical (%)</label>
          <input
            type="number" min="0" max="100" value={value.y}
            onChange={(e) => onChange({ ...value, y: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        </div>
        {sized && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Font Size</label>
            <input
              type="number" min="8" max="96" value={value.font_size}
              onChange={(e) => onChange({ ...value, font_size: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Mirrors _CERT_ASSETS on the server. `fallback` is what the certificate
// shows when nothing has been uploaded.
const ASSETS = [
  {
    key: 'logo',
    label: 'Header Logo',
    hint: 'Shown at the top of the certificate. Transparent PNG works best.',
    fallback: '/static/img/zarni-logo.png',
    box: 'h-16',
  },
  {
    key: 'seal',
    label: 'Accreditation Seal',
    hint: 'Bottom-left badge — MSME by default. Swap for ISO, MCA or any other seal.',
    fallback: '/static/img/msme-logo.jpeg',
    box: 'h-20',
  },
  {
    key: 'signature',
    label: 'CEO Signature',
    hint: 'Scanned signature for the bottom-right, above the signatory title.',
    fallback: '',
    box: 'h-14',
  },
  {
    key: 'medallion',
    label: 'Ribbon Medallion',
    hint: 'Top-left gold badge. Upload a PNG for pixel-perfect downloads — the built-in drawn version can look slightly different in the downloaded PNG.',
    fallback: '',
    box: 'h-20',
  },
];

// Must match _CERT_FONTS on the server.
const CERT_FONTS = ['Playfair Display', 'Sora', 'DM Sans', 'Great Vibes', 'Georgia'];

const SLIDERS = [
  { key: 'logo_height', label: 'Logo Height', min: 0, max: 140 },
  { key: 'seal_height', label: 'Seal Height', min: 0, max: 160 },
  { key: 'signature_height', label: 'Signature Height', min: 0, max: 120 },
  { key: 'name_underline_width', label: 'Name Underline Width', min: 0, max: 640 },
];

const TOGGLES = [
  { key: 'show_medallion', label: 'Gold medallion' },
  { key: 'show_seal', label: 'Accreditation seal' },
  { key: 'show_corners', label: 'Corner brackets' },
  { key: 'show_cert_id', label: 'Certificate ID' },
];

export default function AdminCertificateTemplate() {
  const [template, setTemplate] = useState(DEFAULT_CERT_TEMPLATE);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploadingAsset, setUploadingAsset] = useState('');
  // Last state the server confirmed — comparing against it is what tells us
  // whether there are edits still waiting to be saved.
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const assetRefs = useRef({});

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses((res.data.courses || []).filter((c) => c.certificate)))
      .catch((err) => console.error('Error fetching courses', err));
  }, []);

  const fetchTemplate = async (id) => {
    setSwitching(true);
    try {
      const res = await api.get('/admin/certificate-template', { params: id ? { course_id: id } : {} });
      {
        const fresh = { ...DEFAULT_CERT_TEMPLATE, ...res.data.template };
        setTemplate(fresh);
        setSavedSnapshot(fresh);
      }
    } catch (err) {
      console.error('Error fetching certificate template', err);
    } finally {
      setLoading(false);
      setSwitching(false);
    }
  };

  useEffect(() => { fetchTemplate(courseId); }, [courseId]);

  const handleReset = async () => {
    if (!courseId) {
      setTemplate((prev) => ({
        ...DEFAULT_CERT_TEMPLATE,
        // Uploads are stored separately from the text/layout template, so a
        // reset of the wording and positions leaves them alone.
        logo_url: prev.logo_url,
        seal_url: prev.seal_url,
        signature_url: prev.signature_url,
      }));
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const response = await api.post('/admin/certificate-template', { course_id: courseId, reset: true });
      if (response.data.success) {
        {
          const fresh = { ...DEFAULT_CERT_TEMPLATE, ...response.data.template };
          setTemplate(fresh);
          setSavedSnapshot(fresh);
        }
        setMsg({ type: 'success', text: 'Reverted to the global default certificate for this course.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset template.' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, patch) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: { ...prev[field], ...patch },
    }));
  };

  const updatePosition = (field, value) => {
    updateField(field, {
      x: value.x === '' ? '' : Number(value.x),
      y: value.y === '' ? '' : Number(value.y),
      font_size: value.font_size === '' ? '' : Number(value.font_size),
    });
  };


  // Header logo, accreditation seal and signature all upload through the same
  // keyed endpoint, so one pair of handlers covers them instead of three.
  const handleAssetUpload = async (key, file) => {
    if (!file) return;
    setUploadingAsset(key);
    setMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('image_file', file);
      const res = await api.post(`/admin/certificate-template/asset/${key}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setTemplate((prev) => ({ ...prev, [`${key}_url`]: res.data.image_url }));
        setMsg({ type: 'success', text: `${ASSETS.find((a) => a.key === key).label} updated — applies to every certificate.` });
      } else {
        setMsg({ type: 'error', text: res.data.message || 'Upload failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploadingAsset('');
      if (assetRefs.current[key]) assetRefs.current[key].value = '';
    }
  };

  const handleAssetRemove = async (key) => {
    setUploadingAsset(key);
    setMsg({ type: '', text: '' });
    try {
      await api.delete(`/admin/certificate-template/asset/${key}`);
      setTemplate((prev) => ({ ...prev, [`${key}_url`]: '' }));
      setMsg({ type: 'success', text: `${ASSETS.find((a) => a.key === key).label} reset to the default.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to remove.' });
    } finally {
      setUploadingAsset('');
    }
  };


  const handleSave = async (e) => {
    // Called both as a form submit and directly from the sticky bar.
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const response = await api.post('/admin/certificate-template', { ...template, course_id: courseId || undefined });
      if (response.data.success) {
        {
          const fresh = { ...DEFAULT_CERT_TEMPLATE, ...response.data.template };
          setTemplate(fresh);
          setSavedSnapshot(fresh);
        }
        setMsg({
          type: 'success',
          text: courseId
            ? 'Certificate saved for this course. Students of this course will see the new design immediately.'
            : 'Global default certificate saved. Courses without their own custom certificate will use this design.',
        });
      } else {
        setMsg({ type: 'error', text: response.data.message || 'Failed to save template.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  };

  // Asset uploads persist on their own; everything else waits for Save, so the
  // bar below only watches the fields this form actually submits.
  const isDirty = savedSnapshot != null && JSON.stringify(template) !== JSON.stringify(savedSnapshot);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white mb-6 sm:mb-8 animate-gradient-x"
        style={{ background: 'linear-gradient(115deg, #1c1508 0%, #78530f 30%, #d9a441 55%, #78530f 80%, #1c1508 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-amber-300/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-blue-400/15 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 rounded-2xl bg-white/30 blur-md animate-pulse"></div>
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-md">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-100">
              <Sparkles className="w-3 h-3 animate-pulse" /> Design Studio
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight mt-1">Certificate Template</h2>
            <p className="text-xs sm:text-sm text-amber-50/80 font-medium mt-0.5">
              {courseId ? 'Controls the certificate students earn for this specific course.' : 'Controls the global default certificate used by every course that hasn\'t set its own design.'}
            </p>
          </div>
          </div>

          {/* Always-visible Save — the form's own button is far below the fold. */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || switching}
            className="group relative overflow-hidden shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"></span>}
            <Save className="w-4 h-4 relative" />
            <span className="relative">{saving ? 'Saving...' : 'Save Changes'}</span>
            {isDirty && !saving && (
              <span className="relative flex w-2 h-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-amber-600"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Course selector */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">
          <BadgeCheck className="w-4 h-4 text-primary" /> Editing
        </label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          disabled={switching}
          className="w-full sm:max-w-sm px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow disabled:opacity-60"
        >
          <option value="">Global Default (all courses)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        {courseId && (
          <p className="text-[11px] text-slate-400">Only courses with "Certificate" enabled can have their own design.</p>
        )}
      </div>

      {/* Brand assets — logo, seal, signature. Full width: three uploaders
          were being squeezed into the 2-of-5 controls column. */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 space-y-4">
        <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <span className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
          </span>
          Brand Assets
        </p>
        <p className="text-[11px] text-slate-400">
          Swap the logo, the accreditation seal, the signature and the medallion without touching the layout. Each applies to every certificate site-wide.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ASSETS.map((a) => {
            const current = template[`${a.key}_url`];
            const shown = current || a.fallback;
            const busy = uploadingAsset === a.key;
            return (
              <div key={a.key} className="group relative rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-3.5 flex flex-col transition-all hover:border-amber-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">{a.label}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    current ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {current ? 'Custom' : 'Default'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1 mb-2.5 min-h-[30px]">{a.hint}</p>

                {/* Checkerboard so a transparent PNG's edges are visible */}
                <div className={`rounded-xl border border-slate-200 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] bg-[length:14px_14px] flex items-center justify-center overflow-hidden mb-2.5 ${a.box}`}>
                  {shown ? (
                    <img src={shown} alt={a.label} className="max-h-full max-w-full object-contain p-1.5"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Not set</span>
                  )}
                </div>

                <input
                  ref={(el) => { assetRefs.current[a.key] = el; }}
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleAssetUpload(a.key, e.target.files?.[0])}
                />
                <div className="flex gap-1.5 mt-auto">
                  <button type="button" onClick={() => assetRefs.current[a.key]?.click()} disabled={busy}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 border border-slate-200 rounded-lg font-bold text-[10px] uppercase text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60">
                    <UploadCloud className="w-3.5 h-3.5" /> {busy ? '...' : current ? 'Replace' : 'Upload'}
                  </button>
                  {current && (
                    <button type="button" onClick={() => handleAssetRemove(a.key)} disabled={busy}
                      className="flex items-center justify-center px-2.5 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all disabled:opacity-60"
                      title="Reset to default">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Live preview */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow sticky top-4">
            <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              <span className="relative w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                <span className="absolute inset-0 rounded-md bg-amber-400/30 blur-md animate-pulse"></span>
                <Eye className="relative w-3.5 h-3.5 text-amber-600" />
              </span>
              Live Preview
            </p>
            <div className="relative rounded-2xl p-5 sm:p-8" style={{ background: 'linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
              <div className="rounded-xl overflow-hidden shadow-[0_20px_45px_-15px_rgba(15,23,42,0.35)]">
                <ScaledCertificate template={template} sample />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Sample data shown — real certificates use the student's actual name, course, and issue date.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">
            {msg.text && (
              <div className={`p-4 rounded-xl text-xs font-bold animate-scale-in ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {msg.text}
              </div>
            )}

            <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span className="relative w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-md bg-primary/30 blur-md animate-pulse"></span>
                  <Type className="relative w-3.5 h-3.5 text-primary" />
                </span>
                Header Text
              </p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Certificate Title</label>
                <input type="text" value={template.title} onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtitle</label>
                <input type="text" value={template.subtitle} onChange={(e) => setTemplate({ ...template, subtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tagline (under logo)</label>
                <input type="text" value={template.tagline} onChange={(e) => setTemplate({ ...template, tagline: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issuer / Brand Name</label>
                <input type="text" value={template.issuer} onChange={(e) => setTemplate({ ...template, issuer: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Body Line (under course title)</label>
                <input type="text" value={template.body_line} onChange={(e) => setTemplate({ ...template, body_line: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description Paragraph</label>
                <textarea rows={2} value={template.description} onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Signatory Title (under the signature)</label>
                <input type="text" value={template.signatory_title} onChange={(e) => setTemplate({ ...template, signatory_title: e.target.value })}
                  placeholder="CEO &amp; Founder"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
                <p className="text-[10px] text-slate-400 mt-1.5">The signature itself is an image — upload it under Brand Assets above.</p>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span className="relative w-6 h-6 rounded-md bg-fuchsia-50 flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-md bg-fuchsia-400/30 blur-md animate-pulse"></span>
                  <Palette className="relative w-3.5 h-3.5 text-fuchsia-600" />
                </span>
                Colors
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ColorControl label="Primary (border, title, accents)" value={template.primary_color} onChange={(v) => setTemplate({ ...template, primary_color: v })} />
                <ColorControl label="Gold Accent (medallion, ribbon)" value={template.accent_color} onChange={(v) => setTemplate({ ...template, accent_color: v })} />
                <ColorControl label="Text Color" value={template.text_color} onChange={(v) => setTemplate({ ...template, text_color: v })} />
              </div>
            </div>

            {/* Custom Background */}
            {/* Layout & elements */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span className="w-6 h-6 rounded-md bg-sky-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                </span>
                Layout &amp; Elements
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Student Name Font</label>
                <select value={template.name_font} onChange={(e) => setTemplate({ ...template, name_font: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow">
                  {CERT_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5">Great Vibes is a script face — elegant, but hard to read for long or all-caps names.</p>
              </div>

              {SLIDERS.map((sl) => (
                <div key={sl.key}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{sl.label}</label>
                    <span className="text-[10px] font-black text-slate-500 tabular-nums">{Math.round(template[sl.key])}px</span>
                  </div>
                  <input type="range" min={sl.min} max={sl.max}
                    value={template[sl.key]}
                    onChange={(e) => setTemplate({ ...template, [sl.key]: Number(e.target.value) })}
                    className="w-full accent-primary cursor-pointer" />
                </div>
              ))}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Certificate ID Prefix</label>
                <input type="text" value={template.id_prefix} maxLength={12}
                  onChange={(e) => setTemplate({ ...template, id_prefix: e.target.value.toUpperCase() })}
                  placeholder="ZS"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>

              <div className="pt-1 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Show / Hide</p>
                {TOGGLES.map((tg) => (
                  <label key={tg.key} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer select-none hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={template[tg.key] !== false}
                      onChange={(e) => setTemplate({ ...template, [tg.key]: e.target.checked })}
                      className="w-4 h-4 accent-primary" />
                    <span className="text-xs font-bold text-slate-600">{tg.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span className="relative w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="absolute inset-0 rounded-md bg-indigo-400/30 blur-md animate-pulse"></span>
                <Move className="relative w-3.5 h-3.5 text-indigo-600" />
              </span>
              Text Position &amp; Size
            </p>
            <PositionControl label={FIELD_META.name.label} accent={FIELD_META.name.accent} value={template.name} onChange={(v) => updatePosition('name', v)} />
            <PositionControl label={FIELD_META.course.label} accent={FIELD_META.course.accent} value={template.course} onChange={(v) => updatePosition('course', v)} />
            <PositionControl label={FIELD_META.date.label} accent={FIELD_META.date.accent} value={template.date} onChange={(v) => updatePosition('date', v)} />
            <PositionControl sized={false} label={FIELD_META.seal.label} accent={FIELD_META.seal.accent} value={template.seal} onChange={(v) => updatePosition('seal', v)} />
            <PositionControl sized={false} label={FIELD_META.signature.label} accent={FIELD_META.signature.accent} value={template.signature} onChange={(v) => updatePosition('signature', v)} />
            <PositionControl sized={false} label={FIELD_META.cert_id.label} accent={FIELD_META.cert_id.accent} value={template.cert_id} onChange={(v) => updatePosition('cert_id', v)} />
            <p className="text-[11px] text-slate-400">
              Horizontal/Vertical are percentages of the certificate canvas (0 = top/left edge, 100 = bottom/right edge), measured to the centre of each element.
              Handy when a custom background puts artwork where a default element used to sit.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || switching}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {courseId ? 'Use Global Default' : 'Reset'}
              </button>
              <p className="flex-1 text-[11px] text-slate-400 self-center leading-relaxed">
                Use <strong className="text-slate-500">Save Changes</strong> at the top of the page to publish your edits.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
