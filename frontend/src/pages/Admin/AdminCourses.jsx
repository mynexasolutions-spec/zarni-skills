import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Plus, Pencil, Ban, X, ImagePlus, Award, ListVideo, CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const EMPTY_FORM = {
  title: '', description: '', price: '', thumbnail_url: '',
  level: '', language: '', course_duration: '', certificate: false,
  prerequisites: '', what_you_learn: '', level1_pct: '', level2_pct: '', is_active: true,
  instructor_name: '',
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [instructorImageFile, setInstructorImageFile] = useState(null);
  const [instructorImagePreview, setInstructorImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setThumbFile(null);
    setThumbPreview(null);
    setInstructorImageFile(null);
    setInstructorImagePreview(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      title: c.title || '', description: c.description || '', price: c.price ?? '',
      thumbnail_url: '', level: c.level || '', language: c.language || '',
      course_duration: c.course_duration || '', certificate: !!c.certificate,
      prerequisites: c.prerequisites || '', what_you_learn: c.what_you_learn || '',
      level1_pct: c.level1_commission_percent ?? '', level2_pct: c.level2_commission_percent ?? '',
      is_active: c.is_active !== false,
      instructor_name: c.instructor_name || '',
    });
    setThumbFile(null);
    setThumbPreview(c.thumbnail_display_url || null);
    setInstructorImageFile(null);
    setInstructorImagePreview(c.instructor_image_display_url || null);
    setError('');
    setShowForm(true);
  };

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleInstructorImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInstructorImageFile(file);
    setInstructorImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('thumbnail_url', form.thumbnail_url);
      fd.append('level', form.level);
      fd.append('language', form.language);
      fd.append('course_duration', form.course_duration);
      fd.append('certificate', form.certificate ? 'true' : 'false');
      fd.append('prerequisites', form.prerequisites);
      fd.append('what_you_learn', form.what_you_learn);
      fd.append('level1_pct', form.level1_pct);
      fd.append('level2_pct', form.level2_pct);
      fd.append('is_active', form.is_active ? 'true' : 'false');
      fd.append('instructor_name', form.instructor_name);
      if (thumbFile) fd.append('thumbnail_file', thumbFile);
      if (instructorImageFile) fd.append('instructor_image_file', instructorImageFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingId
        ? await api.put(`/admin/courses/${editingId}`, fd, headers)
        : await api.post('/admin/courses', fd, headers);

      if (response.data.success) {
        setShowForm(false);
        fetchCourses();
      } else {
        setError(response.data.message || 'Failed to save course.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this course? It will no longer be visible to students.')) return;
    try {
      await api.post(`/admin/courses/${id}/delete`);
      fetchCourses();
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
          <BookOpen className="w-7 h-7 text-red-600" />
          <h2 className="text-2xl font-black">Expert Courses Catalog</h2>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25">
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map(c => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-video bg-slate-100 relative">
              {c.thumbnail_display_url ? (
                <img src={c.thumbnail_display_url} alt={c.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-red-200">
                  <BookOpen className="w-10 h-10" />
                </div>
              )}
              <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                c.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
              }`}>{c.is_active !== false ? 'Active' : 'Inactive'}</span>
              {c.certificate && (
                <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-amber-500" title="Certificate on completion">
                  <Award className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-900 uppercase text-sm">{c.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{c.level || 'Beginner'} · {c.price ? `₹${c.price}` : 'Bundle only'} · {c.lesson_count ?? 0} lessons</p>
              <p className="text-xs text-slate-405 mt-2 line-clamp-2">{c.description || 'Master hands-on industry skills.'}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link to={`/admin/courses/${c.id}/chapters`} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                  <ListVideo className="w-3.5 h-3.5" /> Chapters
                </Link>
                <button onClick={() => openEdit(c)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                {c.is_active !== false && (
                  <button onClick={() => handleDeactivate(c.id)} className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No courses created yet.
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
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingId ? 'Edit Course' : 'Create New Course'}</h3>
                  <p className="text-[11px] text-white/60 truncate">{editingId ? `Updating "${form.title}"` : 'Add a new course to your catalog'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* Scrollable body */}
            <form id="course-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-7">
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

              {/* Instructor */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Instructor — shown on the course card</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {instructorImagePreview ? <img src={instructorImagePreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-6 h-6 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {instructorImagePreview ? 'Replace Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleInstructorImageChange} />
                  </label>
                </div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Instructor Name — leave blank to hide from the card</label>
                <input value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} placeholder="e.g. Suriya Yadav" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>

              {/* Basic Info */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Course Title *</label>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Price (₹) — leave blank if not sold individually</label>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                </div>
              </div>

              {/* Commission */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" /> Commission Settings — overrides global rates
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase">Level 1 % (blank = default)</label>
                    <input type="number" min="0" max="100" step="0.01" value={form.level1_pct} onChange={(e) => setForm({ ...form, level1_pct: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-emerald-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase">Level 2 % (blank = default)</label>
                    <input type="number" min="0" max="100" step="0.01" value={form.level2_pct} onChange={(e) => setForm({ ...form, level2_pct: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-emerald-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Details — shown to students</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Duration</label>
                      <input value={form.course_duration} onChange={(e) => setForm({ ...form, course_duration: e.target.value })} placeholder="12 hours" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
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

                  <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-sm font-bold text-slate-700">Certificate on Completion</span>
                    <span className="relative inline-flex items-center">
                      <input type="checkbox" checked={form.certificate} onChange={(e) => setForm({ ...form, certificate: e.target.checked })} className="sr-only peer" />
                      <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Prerequisites</label>
                    <textarea rows={2} value={form.prerequisites} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} placeholder={'Basic smartphone knowledge\nInternet access'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    <p className="text-[11px] text-slate-400 mt-1">One item per line.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">What Students Will Learn</label>
                    <textarea rows={4} value={form.what_you_learn} onChange={(e) => setForm({ ...form, what_you_learn: e.target.value })} placeholder={'How to create viral content\nInstagram marketing strategies\nAffiliate marketing basics'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    <p className="text-[11px] text-slate-400 mt-1">One item per line. These appear as bullet points.</p>
                  </div>
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
              <button type="submit" form="course-form" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-lg transition-all">
                {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create & Add Chapters'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
