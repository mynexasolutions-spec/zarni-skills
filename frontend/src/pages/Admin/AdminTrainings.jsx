import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GraduationCap, Plus, Pencil, Trash2, X, CheckCircle2, PlayCircle, ExternalLink, Youtube, UploadCloud, Link2, Film
} from 'lucide-react';
import api from '../../utils/api';

const EMPTY_FORM = { title: '', description: '', link_url: '', video_type: 'youtube', display_order: '0', is_active: true };

const VIDEO_TYPES = [
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'upload', label: 'Upload File', Icon: UploadCloud },
  { key: 'link', label: 'External Link', Icon: Link2 },
];

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const res = await api.get('/admin/trainings');
      setTrainings(res.data.trainings || []);
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
    setVideoFile(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      title: t.title || '',
      description: t.description || '',
      link_url: t.link_url || '',
      video_type: t.video_type || 'link',
      display_order: String(t.display_order ?? 0),
      is_active: t.is_active !== false,
    });
    setVideoFile(null);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (form.video_type !== 'upload' && !form.link_url.trim()) {
      setError('Please provide a video link.');
      return;
    }
    if (form.video_type === 'upload' && !videoFile && !editingId) {
      setError('Please choose a video file to upload.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('video_type', form.video_type);
      fd.append('link_url', form.video_type === 'upload' ? '' : form.link_url);
      fd.append('display_order', form.display_order || '0');
      fd.append('is_active', form.is_active ? 'true' : 'false');
      if (videoFile) fd.append('video_file', videoFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingId
        ? await api.put(`/admin/trainings/${editingId}`, fd, headers)
        : await api.post('/admin/trainings', fd, headers);

      if (response.data.success) {
        setShowForm(false);
        fetchAll();
      } else {
        setError(response.data.message || 'Failed to save training session.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save training session.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this training session? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/trainings/${id}`);
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
    <div className="text-slate-800 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Trainings & Webinars</h2>
        </div>
        <button onClick={openCreate} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
          <Plus className="w-4 h-4 relative" /> <span className="relative">Add Training</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {trainings.map((t, idx) => {
          const vType = t.video_type || 'link';
          const typeMeta = VIDEO_TYPES.find((v) => v.key === vType) || VIDEO_TYPES[2];
          return (
            <div key={t.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 70}ms` }}>
              <div className={`aspect-video flex items-center justify-center relative ${vType === 'youtube' ? 'bg-gradient-to-br from-red-500/10 to-red-600/5' : vType === 'upload' ? 'bg-gradient-to-br from-violet-50 to-indigo-100' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
                {vType === 'youtube' ? <PlayCircle className="w-10 h-10 text-red-500/60 transition-transform duration-500 group-hover:scale-110" /> :
                  vType === 'upload' ? <Film className="w-10 h-10 text-violet-500/60 transition-transform duration-500 group-hover:scale-110" /> :
                  <ExternalLink className="w-10 h-10 text-blue-400/60 transition-transform duration-500 group-hover:scale-110" />}
                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  t.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                }`}>{t.is_active !== false ? 'Active' : 'Inactive'}</span>
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/70 text-white">
                  Order {t.display_order}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <typeMeta.Icon className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{typeMeta.label}</span>
                </div>
                <h3 className="font-black text-slate-900 leading-snug break-words">{t.title}</h3>
                {t.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{t.description}</p>}
                <p className="text-[11px] text-primary mt-2 truncate">{t.link_url}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(t)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {trainings.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No training sessions yet. They'll appear on the student "Trainings & Webinars" page.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>

            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingId ? 'Edit Training' : 'Add Training Session'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown on the student "Trainings & Webinars" page</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="training-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Getting Started with Affiliate Marketing" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Video Source *</label>
                <div className="grid grid-cols-3 gap-2">
                  {VIDEO_TYPES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setForm({ ...form, video_type: v.key })}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wide transition-all ${
                        form.video_type === v.key
                          ? 'border-red-400 bg-red-50 text-red-600 shadow-sm'
                          : 'border-slate-200 text-slate-500 hover:border-red-200'
                      }`}
                    >
                      <v.Icon className="w-4 h-4" /> {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.video_type === 'upload' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Video File *</label>
                  <label className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
                    videoFile ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500 hover:border-red-300 hover:bg-red-50/50'
                  }`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${videoFile ? 'bg-emerald-100' : 'bg-red-50'}`}>
                      {videoFile ? <CheckCircle2 className="w-4 h-4" /> : <UploadCloud className="w-4 h-4 text-red-500" />}
                    </span>
                    <span className="truncate flex-1">{videoFile?.name || (editingId && form.link_url ? 'Replace the uploaded video file' : 'Choose a video file (mp4, webm, mov...)')}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                  </label>
                  {editingId && form.link_url && !videoFile && (
                    <a href={form.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> View currently uploaded video
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                    {form.video_type === 'youtube' ? 'YouTube Link *' : 'External Video Link *'}
                  </label>
                  <input type="url" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder={form.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short summary of what this session covers." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first.</p>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible to students)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="training-form" disabled={saving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Training'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
