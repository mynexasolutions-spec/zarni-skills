import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Users, Plus, Pencil, Trash2, X, ImagePlus, CheckCircle2, GraduationCap, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

const EMPTY_FORM = {
  name: '', roles: '', about: '', achievements: '', display_order: '', is_active: true,
};

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/admin/instructors');
      setInstructors(response.data.instructors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstructors(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (i) => {
    setEditingId(i.id);
    setForm({
      name: i.name || '',
      roles: (i.roles || []).join('\n'),
      about: i.about || '',
      achievements: i.achievements || '',
      display_order: i.display_order ?? '',
      is_active: i.is_active !== false,
    });
    setPhotoFile(null);
    setPhotoPreview(i.photo_display_url || null);
    setError('');
    setShowForm(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('roles', form.roles);
      fd.append('about', form.about);
      fd.append('achievements', form.achievements);
      fd.append('display_order', form.display_order);
      fd.append('is_active', form.is_active ? 'true' : 'false');
      if (photoFile) fd.append('photo_file', photoFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingId
        ? await api.put(`/admin/instructors/${editingId}`, fd, headers)
        : await api.post('/admin/instructors', fd, headers);

      if (response.data.success) {
        setShowForm(false);
        fetchInstructors();
      } else {
        setError(response.data.message || 'Failed to save instructor.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save instructor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this instructor? Courses linked to them will be unlinked, not deleted.')) return;
    try {
      await api.delete(`/admin/instructors/${id}`);
      fetchInstructors();
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
    <div className="text-slate-800 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Instructors</h2>
        </div>
        <button onClick={openCreate} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
          <Plus className="w-4 h-4 relative" /> <span className="relative">Add Instructor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {instructors.map((i, idx) => (
          <div key={i.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up p-5" style={{ animationDelay: `${idx * 70}ms` }}>
            <div className="flex items-center gap-3 mb-4">
              {i.photo_display_url ? (
                <img src={i.photo_display_url} alt={i.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-lg font-black flex items-center justify-center shrink-0">
                  {i.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 truncate">{i.name}</h4>
                <p className="text-xs text-slate-400 truncate">{(i.roles || []).join(' · ') || 'No roles set'}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${i.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>{i.is_active !== false ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-3 mb-4">{i.about || 'No bio added yet.'}</p>
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <Link to={`/instructor/${i.slug || i.id}`} target="_blank" rel="noreferrer" className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> View Profile
              </Link>
              <button onClick={() => openEdit(i)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(i.id)} className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {instructors.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No instructors added yet.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingId ? 'Edit Instructor' : 'Add New Instructor'}</h3>
                  <p className="text-[11px] text-white/60 truncate">{editingId ? `Updating "${form.name}"` : 'Create a public instructor profile page'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Scrollable body */}
            <form id="instructor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-7">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

              {/* Photo */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Photo</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-6 h-6 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {photoPreview ? 'Replace Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Roles / Titles</label>
                  <textarea rows={3} value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} placeholder={'Instructor\nProduct Designer\nUX Researcher'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  <p className="text-[11px] text-slate-400 mt-1">One per line. Shown as pills on the instructor's profile page.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">About</label>
                  <textarea rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="A short bio describing who they are and their background." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Achievements</label>
                  <textarea rows={4} value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} placeholder="Notable milestones, recognitions, subscriber counts, etc." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              {/* Publish */}
              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active</span>
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
              <button type="submit" form="instructor-form" disabled={saving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create Instructor'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
