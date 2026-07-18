import React, { useEffect, useState } from 'react';
import {
  Layers, Plus, Pencil, Ban, X, ImagePlus, Percent, CheckCircle2, BookOpen
} from 'lucide-react';
import api from '../../utils/api';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const EMPTY_FORM = {
  name: '', description: '', price: '', min_income: '0',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Layers className="w-7 h-7 text-red-600" />
          <h2 className="text-2xl font-black">Learning Packages Catalog</h2>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25">
          <Plus className="w-4 h-4" /> Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-slate-100 relative">
              {pkg.thumbnail_display_url ? (
                <img src={pkg.thumbnail_display_url} alt={pkg.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-red-200">
                  <Layers className="w-10 h-10" />
                </div>
              )}
              <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                pkg.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
              }`}>{pkg.is_active !== false ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 uppercase text-sm">{pkg.name}</h4>
              <p className="text-lg font-black text-red-600 mt-1">₹{(pkg.price || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pkg.description || 'Professional training package.'}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Percent className="w-3 h-3" /> L1 {pkg.level1_commission_percent}% / L2 {pkg.level2_commission_percent}%
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <BookOpen className="w-3 h-3" /> {(pkg.courses || []).length} courses
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button onClick={() => openEdit(pkg)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                {pkg.is_active !== false && (
                  <button onClick={() => handleDeactivate(pkg.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Deactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No packages created yet.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingId ? 'Edit Package' : 'Create New Package'}</h3>
                  <p className="text-[11px] text-white/60 truncate">{editingId ? `Updating "${form.name}"` : 'Set up a new learning bundle for students'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Scrollable body */}
            <form id="package-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-7">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

              {/* Thumbnail */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Thumbnail</p>
                <div className="flex items-center gap-4">
                  <div className="w-32 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {thumbPreview ? <img src={thumbPreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-7 h-7 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {thumbPreview ? 'Replace Image' : 'Upload Thumbnail'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Package Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Price (₹) *</label>
                      <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Min Income for L2 (₹)</label>
                      <input type="number" min="0" step="0.01" value={form.min_income} onChange={(e) => setForm({ ...form, min_income: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-500" /> Commission Settings
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-1.5 uppercase">Level 1 % — direct referrer</label>
                    <input required type="number" min="0" max="100" step="0.01" value={form.level1_pct} onChange={(e) => setForm({ ...form, level1_pct: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-1.5 uppercase">Level 2 % — passive income</label>
                    <input required type="number" min="0" max="100" step="0.01" value={form.level2_pct} onChange={(e) => setForm({ ...form, level2_pct: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-amber-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200" />
                  </div>
                  <p className="sm:col-span-2 text-[11px] text-amber-700/80">L2 is only awarded once the L2 earner's total income exceeds the Min Income threshold above.</p>
                </div>
              </div>

              {/* Details */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Package Details — shown to students</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Duration</label>
                      <input value={form.pkg_duration} onChange={(e) => setForm({ ...form, pkg_duration: e.target.value })} placeholder="Lifetime Access" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Level</label>
                      <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow">
                        <option value="">-- Select --</option>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Language</label>
                      <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Hindi, English" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">What You Get</label>
                    <textarea rows={4} value={form.what_you_get} onChange={(e) => setForm({ ...form, what_you_get: e.target.value })} placeholder={'3 Premium Courses\nLifetime Access\nCertificate\nCommunity Access'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    <p className="text-[11px] text-slate-400 mt-1">One item per line. Shown as checkmarks on the package page.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Requirements</label>
                    <textarea rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder={'Smartphone with internet\nBasic English understanding'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    <p className="text-[11px] text-slate-400 mt-1">One item per line.</p>
                  </div>
                </div>
              </div>

              {/* Courses */}
              {allCourses.length > 0 && (
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assign Courses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-3">
                    {allCourses.map(c => (
                      <label key={c.id} className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg">
                        <input type="checkbox" checked={form.course_ids.includes(c.id)} onChange={() => toggleCourse(c.id)} className="w-4 h-4 rounded accent-red-600" />
                        {c.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish */}
              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible to students)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            {/* Sticky footer */}
            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="package-form" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-lg transition-all">
                {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create Package'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
