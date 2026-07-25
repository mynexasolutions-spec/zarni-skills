import React, { useEffect, useState } from 'react';
import { Award, Save, RotateCcw, Move, Sparkles, Type, Eye } from 'lucide-react';
import api from '../../utils/api';
import ScaledCertificate from '../../components/Certificate/ScaledCertificate';
import { DEFAULT_CERT_TEMPLATE } from '../../components/Certificate/CertificateFace';

const FIELD_META = {
  name: { label: 'Student Name', accent: 'text-primary' },
  course: { label: 'Course Title', accent: 'text-primary' },
  date: { label: 'Issued Date', accent: 'text-slate-500' },
};

function PositionControl({ label, accent, value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <p className={`text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 ${accent}`}>
        <Move className="w-3.5 h-3.5" /> {label}
      </p>
      <div className="grid grid-cols-3 gap-3">
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
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Font Size</label>
          <input
            type="number" min="8" max="96" value={value.font_size}
            onChange={(e) => onChange({ ...value, font_size: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminCertificateTemplate() {
  const [template, setTemplate] = useState(DEFAULT_CERT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchTemplate = async () => {
    try {
      const res = await api.get('/admin/certificate-template');
      setTemplate({ ...DEFAULT_CERT_TEMPLATE, ...res.data.template });
    } catch (err) {
      console.error('Error fetching certificate template', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplate(); }, []);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const response = await api.post('/admin/certificate-template', template);
      if (response.data.success) {
        setTemplate({ ...DEFAULT_CERT_TEMPLATE, ...response.data.template });
        setMsg({ type: 'success', text: 'Certificate template saved. Students will see the new layout immediately.' });
      } else {
        setMsg({ type: 'error', text: response.data.message || 'Failed to save template.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setTemplate(DEFAULT_CERT_TEMPLATE);

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

        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
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
            <p className="text-xs sm:text-sm text-amber-50/80 font-medium mt-0.5">Controls the layout every student's certificate uses on the "My Certificates" page.</p>
          </div>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issuer / Brand Name</label>
                <input type="text" value={template.issuer} onChange={(e) => setTemplate({ ...template, issuer: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Presented-To Line</label>
                <input type="text" value={template.presented_line} onChange={(e) => setTemplate({ ...template, presented_line: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Completion Line</label>
                <input type="text" value={template.completion_line} onChange={(e) => setTemplate({ ...template, completion_line: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow" />
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
            <p className="text-[11px] text-slate-400">Horizontal/Vertical are percentages of the certificate canvas (0 = top/left edge, 100 = bottom/right edge).</p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <Save className="w-4 h-4 relative" /> <span className="relative">{saving ? 'Saving...' : 'Save Template'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
