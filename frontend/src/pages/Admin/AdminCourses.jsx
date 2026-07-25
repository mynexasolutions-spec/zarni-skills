import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  BookOpen, Plus, Pencil, Ban, X, ImagePlus, Award, ListVideo, CheckCircle2, Languages, Clock, BookOpenCheck, Flame, PlayCircle, ToggleLeft
} from 'lucide-react';
import api from '../../utils/api';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const LEVEL_COLORS = {
  'Beginner': 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
  'Intermediate': 'bg-blue-50 text-blue-600 border-blue-200/50',
  'Advanced': 'bg-purple-50 text-purple-600 border-purple-200/50',
  'All Levels': 'bg-slate-50 text-slate-600 border-slate-200/50',
};

const EMPTY_FORM = {
  title: '', description: '', price: '', thumbnail_url: '',
  level: '', language: '', course_duration: '', certificate: false,
  prerequisites: '', what_you_learn: '', level1_pct: '', level2_pct: '', is_active: true,
  instructor_name: '', instructor_id: '',
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
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

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/admin/instructors');
      setInstructors(response.data.instructors || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

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
      instructor_id: c.instructor_id ?? '',
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

  const handleInstructorSelect = (instructorId) => {
    if (!instructorId) {
      setForm(prev => ({ ...prev, instructor_id: '', instructor_name: '' }));
      setInstructorImagePreview(null);
      setInstructorImageFile(null);
      return;
    }
    const selected = instructors.find(i => String(i.id) === String(instructorId));
    if (selected) {
      setForm(prev => ({
        ...prev,
        instructor_id: selected.id,
        instructor_name: selected.name
      }));
      setInstructorImagePreview(selected.photo_display_url || null);
      setInstructorImageFile(null);
    }
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
      fd.append('instructor_id', form.instructor_id);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-red-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Course List...</p>
      </div>
    );
  }

  const activeCount = courses.filter(c => c.is_active !== false).length;

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header section with top statistics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Courses Catalog</h2>
            <p className="text-xs text-slate-400 font-semibold">Publish and manage expert courses with levels & commissions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {activeCount} / {courses.length} active
          </span>
          <button onClick={openCreate} className="group relative overflow-hidden px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/15 hover:shadow-xl hover:shadow-red-600/20 transition-all active:scale-[0.98]">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            <Plus className="w-4 h-4 relative" /> <span className="relative">Create New Course</span>
          </button>
        </div>
      </div>

      {/* Stats Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-red-900/[0.05] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 overflow-hidden">
          <BookOpen className="absolute -right-4 -bottom-4 w-20 h-20 text-red-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="relative min-w-0">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Total Courses</p>
            <p className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums leading-none">{courses.length}</p>
          </div>
        </div>
        <div className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-blue-900/[0.05] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 overflow-hidden">
          <PlayCircle className="absolute -right-4 -bottom-4 w-20 h-20 text-blue-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div className="relative min-w-0">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Active Lessons</p>
            <p className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums leading-none">{courses.reduce((acc, c) => acc + (c.lesson_count || 0), 0)}</p>
          </div>
        </div>
        <div className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-amber-900/[0.05] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 overflow-hidden">
          <Award className="absolute -right-4 -bottom-4 w-20 h-20 text-amber-500/10 pointer-events-none transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
            <Award className="w-5 h-5" />
          </div>
          <div className="relative min-w-0">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Linked Instructors</p>
            <p className="text-2xl font-black text-slate-900 mt-1.5 tabular-nums leading-none">{instructors.length}</p>
          </div>
        </div>
      </div>

      {/* Grid of Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c, idx) => {
          const levelColorClass = LEVEL_COLORS[c.level] || LEVEL_COLORS['All Levels'];
          return (
            <div key={c.id} className="group bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              
              {/* Card Banner */}
              <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden">
                {c.thumbnail_display_url ? (
                  <img src={c.thumbnail_display_url} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-200">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                
                {/* Float badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${
                    c.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                  }`}>{c.is_active !== false ? 'Active' : 'Inactive'}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${levelColorClass}`}>
                    {c.level || 'All Levels'}
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex gap-1.5">
                  {c.certificate && (
                    <div className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-amber-500 shadow-sm border border-slate-100" title="Certificate provided">
                      <Award className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-slate-100/50 shadow-md">
                  <span className="text-xs font-black text-slate-800 tabular-nums">
                    {c.price ? `₹${c.price.toLocaleString('en-IN')}` : 'Bundle Only'}
                  </span>
                </div>
              </div>

              {/* Card Contents */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">{c.title}</h4>
                  <p className="text-xs text-slate-400 font-semibold line-clamp-2 h-10 leading-relaxed">{c.description || 'Master hands-on industry skills with full references.'}</p>
                </div>

                {/* Details list strip */}
                <div className="flex items-center gap-3.5 text-[11px] text-slate-500 border-y border-slate-50 py-3">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700">{c.lesson_count ?? 0}</span> lessons
                  </span>
                  {c.course_duration && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.course_duration}</span>
                      </span>
                    </>
                  )}
                  {c.language && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                      <span className="flex items-center gap-1 truncate max-w-[80px]">
                        <Languages className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.language}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Instructor Footer */}
                {c.instructor_name && (
                  <div className="flex items-center gap-2.5 pt-1">
                    {c.instructor_image_display_url ? (
                      <img src={c.instructor_image_display_url} className="w-7 h-7 rounded-full object-cover border border-slate-100" alt="" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        {c.instructor_name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-500 truncate">Instructor: <span className="text-slate-800">{c.instructor_name}</span></span>
                  </div>
                )}

                {/* CTA Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link to={`/admin/courses/${c.id}/chapters`} className="flex-1 py-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-black uppercase text-slate-600 hover:bg-red-50/50 hover:border-red-200 hover:text-red-600 flex items-center justify-center gap-1.5 transition-colors">
                    <ListVideo className="w-4 h-4" /> Chapters
                  </Link>
                  <button onClick={() => openEdit(c)} className="flex-1 py-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-black uppercase text-slate-600 hover:bg-red-50/50 hover:border-red-200 hover:text-red-600 flex items-center justify-center gap-1.5 transition-colors">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  {c.is_active !== false && (
                    <button onClick={() => handleDeactivate(c.id)} className="py-2.5 px-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-bold text-slate-500 hover:bg-red-50/50 hover:border-red-200 hover:text-red-600 transition-colors" title="Deactivate">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-semibold shadow-sm">
            <BookOpenCheck className="w-12 h-12 mx-auto text-slate-200 mb-3 animate-pulse" />
            No courses created yet. Get started by clicking Create New Course above!
          </div>
        )}
      </div>

      {/* Create/Edit Modal with portal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.2rem] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black tracking-tight truncate">{editingId ? 'Edit Course Details' : 'Create New Course'}</h3>
                  <p className="text-[11px] text-white/60 font-medium truncate">{editingId ? `Update settings for "${form.title}"` : 'Add a new course catalog record'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form id="course-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-8">
              {error && <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold">{error}</div>}

              {/* SECTION: Media & Header */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">1. Course Cover & Identity</p>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Thumbnail Cover Art</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-36 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                      {thumbPreview ? <img src={thumbPreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-8 h-8 text-slate-300" />}
                    </div>
                    <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-600 cursor-pointer hover:border-red-300 hover:bg-red-50/20 hover:text-red-600 transition-colors">
                      {thumbPreview ? 'Replace Image' : 'Upload Thumbnail'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Course Title *</label>
                      <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Master Instagram Organic Reach" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Course Duration</label>
                      <input value={form.course_duration} onChange={(e) => setForm({ ...form, course_duration: e.target.value })} placeholder="e.g. 12 hours" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description / Overview</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write a short summary showing why students should take this course..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                </div>
              </div>

              {/* SECTION: Pricing & Commissions */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">2. Pricing & Direct Affiliate Rates</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Individually Sold Price (₹) — leave blank if bundle-only</label>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1999" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase">
                    <Award className="w-4 h-4 text-emerald-600" /> Referral Override Commission % (leave blank to use defaults)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[10px] font-extrabold text-emerald-700 mb-1 uppercase">Direct Referral Level 1 %</label>
                      <input type="number" min="0" max="100" step="0.01" value={form.level1_pct} onChange={(e) => setForm({ ...form, level1_pct: e.target.value })} placeholder="e.g. 50" className="w-full px-4 py-2.5 rounded-xl border border-emerald-250/30 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-emerald-700 mb-1 uppercase">Indirect Referral Level 2 %</label>
                      <input type="number" min="0" max="100" step="0.01" value={form.level2_pct} onChange={(e) => setForm({ ...form, level2_pct: e.target.value })} placeholder="e.g. 10" className="w-full px-4 py-2.5 rounded-xl border border-emerald-250/30 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Instructor Profile */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">3. Linked Instructor Profile</p>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Link Instructor Profile Account — optional</label>
                  <select value={form.instructor_id} onChange={(e) => handleInstructorSelect(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow">
                    <option value="">-- None (use plain name/photo below) --</option>
                    {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Auto-populates fields below. Manage templates under Admin → Instructors.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Instructor Name</label>
                    <input value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} placeholder="e.g. Suriya Yadav" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Instructor Card Photo</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                        {instructorImagePreview ? <img src={instructorImagePreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-5 h-5 text-slate-350" />}
                      </div>
                      <label className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-650 transition-colors">
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={handleInstructorImageChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Curriculum Details */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5">4. Curriculum Specifications</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Difficulty Level</label>
                    <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2">
                      <option value="">-- Select --</option>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Spoken Languages</label>
                    <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Hindi, English" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2" />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Prerequisites — one per line</label>
                    <textarea rows={2} value={form.prerequisites} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} placeholder={'Basic smartphone knowledge\nInternet access'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">What Students Will Learn — one per line</label>
                    <textarea rows={3} value={form.what_you_learn} onChange={(e) => setForm({ ...form, what_you_learn: e.target.value })} placeholder={'How to create viral content\nInstagram marketing strategies'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2" />
                  </div>
                </div>

                {/* Toggle switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-800 block">Certificate on Completion</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Award PDF credential upon course completion</span>
                    </div>
                    <span className="relative inline-flex items-center">
                      <input type="checkbox" checked={form.certificate} onChange={(e) => setForm({ ...form, certificate: e.target.checked })} className="sr-only peer" />
                      <span className="w-10 h-6 bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-colors"></span>
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                    </span>
                  </label>

                  <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-800 block">Publish Catalog Active</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Make this course visible inside the student catalog</span>
                    </div>
                    <span className="relative inline-flex items-center">
                      <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                      <span className="w-10 h-6 bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-colors"></span>
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                    </span>
                  </label>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="course-form" disabled={saving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/15 hover:shadow-xl transition-all active:scale-[0.98]">
                {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Create & Add Chapters'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
