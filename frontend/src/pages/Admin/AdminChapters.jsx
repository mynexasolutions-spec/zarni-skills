import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Trash2, Pencil, X, CheckCircle2, Link as LinkIcon, Upload, Clock, Film, Layers, Sparkles, FileVideo, Youtube, Eye } from 'lucide-react';
import api from '../../utils/api';

const EMPTY_FORM = { title: '', description: '', video_url: '', duration: '', is_active: true };

function VideoPlayer({ chapter }) {
  if (!chapter) return null;
  if (chapter.video_type === 'file' || chapter.video_type === 'direct') {
    return (
      <video key={chapter.id} className="w-full h-full" controls preload="metadata">
        <source src={chapter.video_src} type="video/mp4" />
      </video>
    );
  }
  if (chapter.video_type === 'embed') {
    return (
      <iframe
        key={chapter.id}
        src={chapter.video_src}
        title={chapter.title}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <Film className="w-10 h-10 mb-2 text-slate-500" strokeWidth={1.5} />
      <p className="text-xs font-bold">No video set for this chapter yet.</p>
    </div>
  );
}

export default function AdminChapters() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewChapter, setPreviewChapter] = useState(null);

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
    setEditingChapter(null);
    setForm(EMPTY_FORM);
    setVideoFile(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (ch) => {
    setEditingId(ch.id);
    setEditingChapter(ch);
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
    <div className="max-w-4xl mx-auto text-slate-800 pb-10">

      <button onClick={() => navigate('/admin/courses')} className="inline-flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors mb-5 group font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>All Courses</span>
      </button>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-[0_20px_50px_-20px_rgba(190,18,60,0.45)]"
        style={{ background: 'linear-gradient(135deg, #1c0b14 0%, #7f1d1d 45%, #dc2626 100%)' }}>
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-rose-400/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-red-400/15 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-rose-200 mb-2.5">
              <Layers className="w-3 h-3" /> Course Curriculum
            </div>
            <h1 className="text-xl sm:text-2xl font-black truncate">{course.title}</h1>
            <p className="text-rose-100/70 text-xs sm:text-sm mt-1">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''} in this syllabus</p>
          </div>
          <button
            onClick={openCreate}
            className="group relative overflow-hidden shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-red-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-red-100/60 to-transparent"></span>
            <Plus className="w-4 h-4 relative" strokeWidth={2.5} /> <span className="relative">Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Chapter list */}
      <div className="space-y-3">
        {chapters.map((ch, idx) => (
          <div
            key={ch.id}
            className="group relative bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:shadow-red-900/[0.06] hover:-translate-y-0.5 hover:border-red-100 transition-all duration-300 flex items-center gap-3 sm:gap-4 animate-fade-in-up"
            style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
          >
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-red-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-red-500/25">
                {ch.order || (idx + 1)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug break-words truncate">{ch.title}</p>
              <p className="text-xs text-slate-400 leading-snug break-words mt-0.5 truncate">{ch.description || 'Watch chapter video class.'}</p>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {ch.duration && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full font-semibold">
                    <Clock className="w-3 h-3" /> {ch.duration}
                  </span>
                )}
                {ch.video_type && ch.video_type !== 'none' ? (
                  <button
                    onClick={() => setPreviewChapter(ch)}
                    className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black flex items-center gap-1 transition-colors ${
                      ch.has_uploaded_video ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100' : 'bg-violet-50 text-violet-600 border border-violet-100 hover:bg-violet-100'
                    }`}
                  >
                    {ch.has_uploaded_video ? <FileVideo className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                    {ch.has_uploaded_video ? 'Uploaded' : 'External'}
                    <Eye className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black bg-slate-100 text-slate-400 border border-slate-200">
                    No Video
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black ${
                  ch.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>{ch.is_active !== false ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => openEdit(ch)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(ch.id)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {chapters.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-red-300" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-slate-500">No chapters added yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Chapter" to build this course's syllabus.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Chapter Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <div
            className="relative rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white max-h-[90vh] overflow-y-auto admin-scrollbar">

              {/* Gradient header */}
              <div className="relative overflow-hidden px-6 sm:px-8 py-5 sm:py-6"
                style={{ background: 'linear-gradient(135deg, #1c0b14 0%, #7f1d1d 45%, #dc2626 100%)' }}>
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h3>
                      <p className="text-[11px] text-rose-200/80 font-medium">{course.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {error && (
                  <div className="p-3.5 mb-5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-scale-in">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Chapter Title *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-shadow"
                      placeholder="Intro to Web APIs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-shadow"
                      placeholder="Provide details..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </label>
                    <input
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-shadow"
                      placeholder="e.g. 12:45"
                    />
                  </div>

                  {/* Video source — glass panel */}
                  <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-red-300/50 via-rose-200/30 to-transparent">
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-[calc(1rem-1.5px)] p-4 sm:p-5 space-y-3.5">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-red-500" /> Video Source <span className="text-slate-400 font-medium normal-case">(choose one)</span>
                      </p>

                      {editingChapter && editingChapter.video_type && editingChapter.video_type !== 'none' && !videoFile && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
                          <div className="aspect-video">
                            <VideoPlayer chapter={editingChapter} />
                          </div>
                          <p className="px-3 py-2 text-[10px] font-bold text-slate-300 bg-slate-900 flex items-center gap-1.5">
                            <Eye className="w-3 h-3" /> Currently playing — pick a new URL or file below to replace it.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-red-400" /> External URL (YouTube / Vimeo)
                        </label>
                        <input
                          value={form.video_url}
                          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-shadow"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                      </div>

                      <label className={`group/upload flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all bg-white ${
                        videoFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30'
                      }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          videoFile ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500 group-hover/upload:bg-red-100'
                        }`}>
                          {videoFile ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${videoFile ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {videoFile ? videoFile.name : 'Upload Video File'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{videoFile ? 'Ready to upload' : 'MP4, WebM, MOV — click to browse'}</p>
                        </div>
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-red-600" />
                    <span className="text-sm font-bold text-slate-700">Active</span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                      {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                      <span className="relative flex items-center gap-2">
                        {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Chapter'}</>}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Video preview modal */}
      {previewChapter && createPortal(
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewChapter(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Preview</p>
                <h3 className="font-black text-slate-900 truncate">{previewChapter.title}</h3>
              </div>
              <button onClick={() => setPreviewChapter(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black aspect-video">
              <VideoPlayer chapter={previewChapter} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
