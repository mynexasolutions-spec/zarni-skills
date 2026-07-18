import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Trash2, Pencil, X, CheckCircle2, Link as LinkIcon, Upload, Clock } from 'lucide-react';
import api from '../../utils/api';

const EMPTY_FORM = { title: '', description: '', video_url: '', duration: '', is_active: true };

export default function AdminChapters() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchChapters = async () => {
    try {
      const response = await api.get(`/admin/courses/${courseId}/chapters`);
      setCourse(response.data.course || null);
      setChapters(response.data.chapters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChapters(); }, [courseId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setVideoFile(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (ch) => {
    setEditingId(ch.id);
    setForm({
      title: ch.title || '', description: ch.description || '',
      video_url: ch.video_url || '', duration: ch.duration || '', is_active: ch.is_active !== false,
    });
    setVideoFile(null);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('video_url', form.video_url);
      fd.append('duration', form.duration);
      fd.append('is_active', form.is_active ? 'true' : 'false');
      if (videoFile) fd.append('video_file', videoFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingId
        ? await api.put(`/admin/courses/${courseId}/chapters/${editingId}`, fd, headers)
        : await api.post(`/admin/courses/${courseId}/chapters`, fd, headers);

      if (response.data.success) {
        setShowForm(false);
        fetchChapters();
      } else {
        setError(response.data.message || 'Failed to save chapter.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save chapter.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this chapter permanently?')) return;
    try {
      await api.delete(`/admin/courses/${courseId}/chapters/${id}`);
      fetchChapters();
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

  if (!course) {
    return <div className="p-8 text-center text-slate-400">Course not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto text-slate-800">

      <button onClick={() => navigate('/admin/courses')} className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors mb-6 group font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>All Courses</span>
      </button>

      <div className="flex justify-between items-center mb-8 border-b pb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{course.title}</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Syllabus Chapters ({chapters.length})</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25">
          <Plus className="w-4 h-4" /> Add Chapter
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-sm">
        {chapters.map((ch, idx) => (
          <div key={ch.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
              {ch.order || (idx + 1)}
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="font-bold text-sm text-slate-800 truncate">{ch.title}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{ch.description || 'Watch chapter video class.'}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto pl-11 sm:pl-0">
              {ch.duration && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" /> {ch.duration}
                </span>
              )}
              <span className={`text-[10px] shrink-0 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1 ${
                ch.has_uploaded_video ? 'bg-blue-50 text-blue-600' : ch.video_url ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {ch.has_uploaded_video ? <Play className="w-3 h-3" /> : ch.video_url ? <LinkIcon className="w-3 h-3" /> : null}
                {ch.has_uploaded_video ? 'Uploaded' : ch.video_url ? 'External' : 'No Video'}
              </span>
              <span className={`text-[10px] shrink-0 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                ch.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>{ch.is_active !== false ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-1.5 shrink-0 ml-auto">
                <button onClick={() => openEdit(ch)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(ch.id)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {chapters.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400 font-medium">No chapters added yet.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto admin-scrollbar p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Chapter Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="Intro to Web APIs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none" placeholder="Provide details..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Duration</label>
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" placeholder="e.g. 12:45" />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase">Video Source (choose one)</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">External URL (YouTube / Vimeo)</label>
                  <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 flex items-center gap-1.5 bg-white">
                    <Upload className="w-3.5 h-3.5" /> {videoFile ? videoFile.name : 'Upload Video File'}
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-red-600" />
                <span className="text-sm font-bold text-slate-700">Active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Chapter'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
