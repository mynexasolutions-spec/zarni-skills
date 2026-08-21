import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers, Plus, Pencil, Ban, X, ImagePlus, Percent, CheckCircle2, BookOpen, AlertCircle, Sparkles, Languages, Clock, BookOpenCheck, Loader2
} from 'lucide-react';
import api from '../../utils/api';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const EMPTY_FORM = {
  name: '', description: '', price: '', market_price: '', gst_percent: '18', min_income: '0',
  level1_pct: '10', level2_pct: '5', pkg_duration: '', level: '', language: '',
  what_you_get: '', requirements: '', is_active: true, course_ids: [],
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [pkgRes, coursesRes] = await Promise.all([
        api.get('/global-data'),
        api.get('/courses'),
      ]);
      setPackages(pkgRes.data.packages || []);
      setAllCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setThumbFile(null);
    setThumbPreview(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name || '', description: pkg.description || '', price: pkg.price ?? '',
      market_price: pkg.market_price ?? '', gst_percent: pkg.gst_percent ?? '18',
      min_income: pkg.min_income_for_level2 ?? '0',
      level1_pct: pkg.level1_commission_percent ?? '10', level2_pct: pkg.level2_commission_percent ?? '5',
      pkg_duration: pkg.pkg_duration || '', level: pkg.level || '', language: pkg.language || '',
      what_you_get: pkg.what_you_get || '', requirements: pkg.requirements || '',
      is_active: pkg.is_active !== false, course_ids: (pkg.courses || []).map(c => c.id),
    });
    setThumbFile(null);
    setThumbPreview(pkg.thumbnail_display_url || null);
    setError('');
    setShowForm(true);
  };

  const toggleCourse = (id) => {
    setForm(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(id) ? prev.course_ids.filter(c => c !== id) : [...prev.course_ids, id],
    }));
  };

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('market_price', form.market_price);
      fd.append('gst_percent', form.gst_percent);
      fd.append('min_income', form.min_income);
      fd.append('level1_pct', form.level1_pct);
      fd.append('level2_pct', form.level2_pct);
      fd.append('pkg_duration', form.pkg_duration);
      fd.append('level', form.level);
      fd.append('language', form.language);
      fd.append('what_you_get', form.what_you_get);
      fd.append('requirements', form.requirements);
      fd.append('is_active', form.is_active ? 'true' : 'false');
      form.course_ids.forEach(id => fd.append('course_ids', id));
      if (thumbFile) fd.append('thumbnail_file', thumbFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingId
        ? await api.put(`/admin/packages/${editingId}`, fd, headers)
        : await api.post('/admin/packages', fd, headers);

      if (response.data.success) {
        setShowForm(false);
        fetchAll();
      } else {
        setError(response.data.message || 'Failed to save package.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save package.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this package? It will no longer be visible to students.')) return;
    try {
      await api.post(`/admin/packages/${id}/delete`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-rose-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading catalog packages...</p>
      </div>
    );
  }

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            <Layers className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Packages Catalog</h2>
            <p className="text-xs text-slate-400 font-semibold">Group educational courses into commercial product bundles</p>
          </div>
        </div>
        <button 
          onClick={openCreate} 
          className="group relative overflow-hidden px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-600/25 hover:shadow-xl hover:bg-rose-700 transition-all duration-300 self-start sm:self-center"
        >
          <Plus className="w-5 h-5" /> Create Package
        </button>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.map((pkg, idx) => (
          <div 
            key={pkg.id} 
            className="group bg-white border border-slate-200/80 rounded-[2.2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Image Area */}
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                {pkg.thumbnail_display_url ? (
                  <img src={pkg.thumbnail_display_url} alt={pkg.name} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 bg-slate-50">
                    <Layers className="w-10 h-10" />
                    <span className="text-[10px] font-black uppercase tracking-wider">No visual uploaded</span>
                  </div>
                )}
                
                {/* Active/Inactive badge */}
                <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                  pkg.is_active !== false 
                    ? 'bg-emerald-500/90 border-emerald-400/25 text-white backdrop-blur-md' 
                    : 'bg-slate-900/90 border-slate-800/20 text-slate-300 backdrop-blur-md'
                }`}>{pkg.is_active !== false ? 'Active' : 'Archived'}</span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 uppercase text-sm tracking-tight line-clamp-1">{pkg.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xl font-black text-rose-600">₹{(pkg.price || 0).toLocaleString('en-IN')}</p>
                    {pkg.market_price > pkg.price && (
                      <>
                        <p className="text-xs font-bold text-slate-400 line-through">₹{pkg.market_price.toLocaleString('en-IN')}</p>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                          {Math.round(((pkg.market_price - pkg.price) / pkg.market_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-8">{pkg.description || 'Professional training bundle compiled for advanced learning.'}</p>
                
                {/* Visual Indicators */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    <Percent className="w-3 h-3" /> L1 {pkg.level1_commission_percent}% / L2 {pkg.level2_commission_percent}%
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    <BookOpen className="w-3 h-3" /> {(pkg.courses || []).length} courses
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-6 pt-0">
              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => openEdit(pkg)} 
                  className="flex-1 py-2.5 border border-slate-200 hover:border-rose-500/30 hover:bg-rose-50 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Modify
                </button>
                {pkg.is_active !== false && (
                  <button 
                    onClick={() => handleDeactivate(pkg.id)} 
                    className="flex-1 py-2.5 border border-slate-200 hover:border-slate-800/30 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Ban className="w-3.5 h-3.5" /> Archive
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
        {packages.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-semibold">
            No active bundles created yet. Click "Create Package" to begin.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.2rem] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in border border-slate-100" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #09090b 0%, #1e0e18 50%, #3b0717 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black tracking-tight truncate">{editingId ? 'Modify Package' : 'Create Product Bundle'}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">{editingId ? `Updating "${form.name}"` : 'Configure a learning package target setup'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all shrink-0 hover:scale-105">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable body */}
            <form id="package-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6 bg-slate-50/50">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Thumbnail Upload component */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cover Art / Thumbnail</p>
                <div className="flex items-center gap-4">
                  <div className="w-32 aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm">
                    {thumbPreview ? <img src={thumbPreview} className="w-full h-full object-contain p-1" alt="" /> : <ImagePlus className="w-7 h-7 text-slate-300" />}
                  </div>
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer transition-colors shadow-sm">
                    {thumbPreview ? 'Replace file' : 'Select file'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                  </label>
                </div>
              </div>

              {/* Basic Info input blocks */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard details</p>
                
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">Bundle Title *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">Public Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">Retail Price (₹) — final, GST-inclusive *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">Min Earnings For L2 Overrides (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.min_income} onChange={(e) => setForm({ ...form, min_income: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white" />
                  </div>
                </div>
              </div>

              {/* Market price / discount / GST */}
              <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-2xl p-4 sm:p-5 space-y-4">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Percent className="w-4 h-4" /> Discount &amp; GST Display
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-emerald-700 mb-1.5 uppercase tracking-wide">Market Price / MRP (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.market_price} onChange={(e) => setForm({ ...form, market_price: e.target.value })} placeholder="e.g. 3500 (leave blank to hide discount badge)" className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-emerald-700 mb-1.5 uppercase tracking-wide">GST (%)</label>
                    <input type="number" min="0" max="100" step="0.01" value={form.gst_percent} onChange={(e) => setForm({ ...form, gst_percent: e.target.value })} placeholder="18" className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500" />
                  </div>
                </div>
                {(() => {
                  const priceNum = parseFloat(form.price);
                  const mrpNum = parseFloat(form.market_price);
                  const gstNum = parseFloat(form.gst_percent);
                  if (!priceNum) return null;
                  const gstAmount = gstNum ? priceNum - priceNum / (1 + gstNum / 100) : 0;
                  const baseCost = priceNum - gstAmount;
                  const discountPct = mrpNum && mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : null;
                  return (
                    <div className="text-[11px] text-emerald-800 font-semibold leading-relaxed bg-white border border-emerald-100 rounded-xl p-3.5 space-y-1">
                      {discountPct !== null && <p>Market Price: <strong>₹{mrpNum.toLocaleString('en-IN')}</strong> — <strong>{discountPct}% OFF</strong></p>}
                      <p>Package Cost (pre-GST): <strong>₹{baseCost.toFixed(2)}</strong></p>
                      {gstNum > 0 && <p>GST ({gstNum}%): <strong>₹{gstAmount.toFixed(2)}</strong></p>}
                      <p>Student Pays (Total): <strong>₹{priceNum.toLocaleString('en-IN')}</strong></p>
                    </div>
                  );
                })()}
                <p className="text-[10px] text-emerald-700/80 font-medium">Retail Price above is what the student actually pays — GST is shown as a breakdown, not added on top. Leave Market Price blank to hide the discount badge.</p>
              </div>

              {/* Commission settings */}
              <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-4 sm:p-5 space-y-4">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Commission Structures
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-amber-700 mb-1.5 uppercase tracking-wide">L1 Direct Referrer Percent (%) *</label>
                    <input required type="number" min="0" max="100" step="0.01" value={form.level1_pct} onChange={(e) => setForm({ ...form, level1_pct: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-amber-700 mb-1.5 uppercase tracking-wide">L2 Passive Referrer Percent (%) *</label>
                    <input required type="number" min="0" max="100" step="0.01" value={form.level2_pct} onChange={(e) => setForm({ ...form, level2_pct: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500" />
                  </div>
                  <p className="sm:col-span-2 text-[10px] text-amber-800 font-semibold leading-relaxed">Commission guidelines: L2 commissions are paid out to tier-2 referrers once their direct network earnings exceed the minimum milestone threshold set above.</p>
                </div>

                {/* Live commission breakdown across every package at this rate */}
                {packages.length > 0 && (parseFloat(form.level1_pct) > 0 || parseFloat(form.level2_pct) > 0) && (
                  <div className="pt-1">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">
                      Live Preview — {form.level1_pct || 0}% Active / {form.level2_pct || 0}% Passive, applied to every package
                    </p>
                    <div className="bg-white border border-amber-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-amber-50 text-amber-700 font-black uppercase text-[9px] tracking-wider">
                            <th className="text-left px-3 py-2">Package</th>
                            <th className="text-right px-3 py-2">Price</th>
                            <th className="text-right px-3 py-2">Active ({form.level1_pct || 0}%)</th>
                            <th className="text-right px-3 py-2">Passive ({form.level2_pct || 0}%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100">
                          {packages.map((pkg) => {
                            const price = Number(pkg.price) || 0;
                            const active = price * (parseFloat(form.level1_pct) || 0) / 100;
                            const passive = price * (parseFloat(form.level2_pct) || 0) / 100;
                            const isCurrent = pkg.id === editingId;
                            return (
                              <tr key={pkg.id} className={isCurrent ? 'bg-amber-50/60 font-bold' : ''}>
                                <td className="px-3 py-2 text-slate-700 truncate max-w-[120px]">{pkg.name}{isCurrent && <span className="ml-1 text-amber-600">•</span>}</td>
                                <td className="px-3 py-2 text-right text-slate-600">₹{price.toLocaleString('en-IN')}</td>
                                <td className="px-3 py-2 text-right text-emerald-700 font-bold">₹{active.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                <td className="px-3 py-2 text-right text-indigo-700 font-bold">₹{passive.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Features */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-extrabold">Student Page Specifications</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duration</label>
                    <input value={form.pkg_duration} onChange={(e) => setForm({ ...form, pkg_duration: e.target.value })} placeholder="Lifetime Access" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Level</label>
                    <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                      <option value="">-- Select --</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> Language</label>
                    <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="English, Hindi" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">Included Features / Deliverables</label>
                  <textarea rows={4} value={form.what_you_get} onChange={(e) => setForm({ ...form, what_you_get: e.target.value })} placeholder={'3 Premium Courses\nLifetime Access\nCompletion Certificate'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50" />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">List one item per line. Shows up with checkmarks on details pages.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wide">Course requirements</label>
                  <textarea rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder={'High-speed internet access\nBasic computer skills'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all bg-slate-50/50 hover:bg-slate-50" />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">List one requirement item per line.</p>
                </div>
              </div>

              {/* Course checklists */}
              {allCourses.length > 0 && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><BookOpenCheck className="w-4 h-4 text-rose-500" /> Assign active courses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200/60 rounded-xl p-3 bg-slate-50/30">
                    {allCourses.map(c => (
                      <label key={c.id} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm">
                        <input type="checkbox" checked={form.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 accent-rose-600" />
                        <span className="truncate">{c.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle switch for Visibility */}
              <label className="flex items-center justify-between gap-3 cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block">Catalog Visibility</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Toggle whether student accounts can view and purchase this bundle</span>
                </div>
                <span className="relative inline-flex items-center shrink-0">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-11 h-6.5 bg-slate-200 peer-checked:bg-rose-600 rounded-full transition-colors duration-300"></span>
                  <span className="absolute left-1 top-1 w-4.5 h-4.5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow"></span>
                </span>
              </label>

            </form>

            {/* Modal Footer Controls */}
            <div className="shrink-0 flex gap-3.5 px-6 sm:px-8 py-5 border-t border-slate-150 bg-white">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-bold text-xs uppercase text-slate-500 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="package-form" 
                disabled={saving} 
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-600/10 hover:shadow-lg"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> {editingId ? 'Save Changes' : 'Publish Bundle'}</>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
