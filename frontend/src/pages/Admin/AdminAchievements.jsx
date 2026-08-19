import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Award, Plus, Pencil, Trash2, X, CheckCircle2, Trophy, Users, Rocket, Star, Crown,
  Medal, Target, Flame, Gem, Zap, ShieldCheck, Plane, Save, Upload, Image as ImageIcon, Lock
} from 'lucide-react';
import api from '../../utils/api';

const ICON_MAP = { Trophy, Users, Rocket, Star, Crown, Medal, Target, Flame, Gem, Zap, ShieldCheck, Award };
const ICON_OPTIONS = Object.keys(ICON_MAP);

const GRADIENT_OPTIONS = [
  { label: 'Amber → Orange', value: 'from-amber-400 to-orange-500' },
  { label: 'Emerald → Teal', value: 'from-emerald-400 to-teal-600' },
  { label: 'Blue → Indigo', value: 'from-blue-400 to-indigo-600' },
  { label: 'Violet → Purple', value: 'from-violet-400 to-purple-600' },
  { label: 'Pink → Rose', value: 'from-pink-400 to-rose-600' },
  { label: 'Sky → Blue', value: 'from-sky-400 to-blue-600' },
  { label: 'Lime → Green', value: 'from-lime-400 to-green-600' },
  { label: 'Fuchsia → Pink', value: 'from-fuchsia-400 to-pink-600' },
];

const METRIC_OPTIONS = [
  { value: 'earnings', label: 'Lifetime Earnings (₹)' },
  { value: 'referrals', label: 'Referral Count' },
  { value: 'rank', label: 'Leaderboard Rank (top N)' },
];

const EMPTY_FORM = {
  title: '', description: '', icon: 'Trophy', gradient: GRADIENT_OPTIONS[0].value,
  metric: 'earnings', target: '', display_order: '0', is_active: true,
};

export default function AdminAchievements() {
  const [tab, setTab] = useState('milestones');

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">Achievements</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { key: 'milestones', label: 'My Achievements' },
          { key: 'trip', label: 'Trip Achievement' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'milestones' ? <MilestonesTab /> : <TripGoalTab />}
    </div>
  );
}

function MilestonesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const res = await api.get('/admin/achievements');
      setItems(res.data.achievements || []);
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
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || 'Trophy',
      gradient: item.gradient || GRADIENT_OPTIONS[0].value,
      metric: item.metric || 'earnings',
      target: String(item.target ?? ''),
      display_order: String(item.display_order ?? 0),
      is_active: item.is_active !== false,
    });
    setImageFile(null);
    setImagePreview(item.image_display_url || null);
    setError('');
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.target === '') {
      setError('Title and target are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('icon', form.icon);
      fd.append('gradient', form.gradient);
      fd.append('metric', form.metric);
      fd.append('target', form.target || '0');
      fd.append('display_order', form.display_order || '0');
      fd.append('is_active', form.is_active ? 'true' : 'false');
      if (imageFile) fd.append('image_file', imageFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingId
        ? await api.put(`/admin/achievements/${editingId}`, fd, headers)
        : await api.post('/admin/achievements', fd, headers);

      if (response.data.success) {
        setShowForm(false);
        fetchAll();
      } else {
        setError(response.data.message || 'Failed to save achievement.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this achievement milestone? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/achievements/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-5">
        <button onClick={openCreate} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25">
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(item => {
          const Icon = ICON_MAP[item.icon] || Trophy;
          const metricLabel = METRIC_OPTIONS.find(m => m.value === item.metric)?.label || item.metric;
          return (
            <div key={item.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`relative h-36 overflow-hidden ${item.image_display_url ? '' : `bg-gradient-to-br ${item.gradient}`}`}>
                {item.image_display_url ? (
                  <>
                    <img src={item.image_display_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  </>
                ) : null}
                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  item.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                }`}>{item.is_active !== false ? 'Active' : 'Inactive'}</span>
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/50 text-white">
                  Order {item.display_order}
                </span>
                <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mt-6">
                  <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-900 truncate">{item.title}</h3>
                {item.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.description}</p>}
                <p className="text-[11px] text-primary mt-2 font-bold">{metricLabel} • target {item.target}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(item)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No achievement milestones yet. Add one — it'll appear on the student "My Achievements" page.
          </div>
        )}
      </div>

      {showForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingId ? 'Edit Milestone' : 'Add Achievement Milestone'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown on the student "My Achievements" page</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="achievement-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Reward Image</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="w-6 h-6 text-red-200" />}
                    {imagePreview && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-block px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                      {imagePreview ? 'Replace Photo' : 'Upload Photo'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-2">Shown behind a lock icon until the student unlocks this milestone (falls back to the icon/color below if left empty).</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Rising Earner" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Cross ₹5,000 in lifetime commission earnings." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Icon</label>
                  <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow">
                    {ICON_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Color</label>
                  <select value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow">
                    {GRADIENT_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>

              <div className={`rounded-2xl p-4 bg-gradient-to-br ${form.gradient} flex items-center gap-3`}>
                {React.createElement(ICON_MAP[form.icon] || Trophy, { className: 'w-6 h-6 text-white' })}
                <span className="text-white text-xs font-bold">Preview</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Metric</label>
                  <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow">
                    {METRIC_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Target *</label>
                  <input type="number" step="any" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="5000" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 -mt-4">
                {form.metric === 'earnings' && 'Unlocked once the student\'s lifetime earnings reach this amount (₹).'}
                {form.metric === 'referrals' && 'Unlocked once the student has referred this many people.'}
                {form.metric === 'rank' && 'Unlocked once the student\'s leaderboard rank is this number or better (e.g. 10 = top 10).'}
              </p>

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
              <button type="submit" form="achievement-form" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-lg transition-all">
                {saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Milestone'}</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function TripGoalTab() {
  const [form, setForm] = useState({ title: '', goal_amount: '', goal_date: '' });
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);

  const fetchGoal = async () => {
    try {
      const res = await api.get('/admin/trip-goal');
      setForm({
        title: res.data.title || '',
        goal_amount: res.data.goal_amount || '',
        goal_date: res.data.goal_date || '',
      });
      setImageUrl(res.data.image_url || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoal(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const response = await api.post('/admin/trip-goal', form);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        setError(response.data.message || 'Failed to save trip goal.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save trip goal.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    setImageFile(file);
    setImageError('');
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    setImageError('');
    setImageSuccess(false);
    try {
      const fd = new FormData();
      fd.append('image_file', imageFile);
      const response = await api.post('/admin/trip-goal/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setImageUrl(response.data.image_url);
        setImageFile(null);
        setImagePreview('');
        setImageSuccess(true);
        setTimeout(() => setImageSuccess(false), 2500);
      } else {
        setImageError(response.data.message || 'Failed to upload image.');
      }
    } catch (err) {
      setImageError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Trip image */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900">Trip Reward Image</h3>
            <p className="text-xs text-slate-400">Shown alongside the trip title on the student page</p>
          </div>
        </div>

        {imageError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold mb-4">{imageError}</div>}
        {imageSuccess && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold mb-4">Image updated.</div>}

        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {imagePreview || imageUrl ? (
              <img src={imagePreview || imageUrl} alt="Trip reward" className="w-full h-full object-contain" />
            ) : (
              <Plane className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="text-xs text-slate-500 truncate">{imageFile?.name || 'Choose PNG/JPG (transparent PNG looks best)'}</span>
              <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={!imageFile || uploadingImage}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              {uploadingImage ? 'Uploading...' : <><Upload className="w-3.5 h-3.5" /> Upload Image</>}
            </button>
          </div>
        </div>
      </div>

      {/* Trip goal details */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900">Trip Reward Program</h3>
            <p className="text-xs text-slate-400">Single site-wide travel goal shown on the student "Trip Achievements" page</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">Trip goal saved.</div>}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Trip Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Bali Rewards Trip 2026" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Income Goal (₹)</label>
            <input type="number" step="any" value={form.goal_amount} onChange={(e) => setForm({ ...form, goal_amount: e.target.value })} placeholder="50000" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Target Date</label>
            <input type="date" value={form.goal_date} onChange={(e) => setForm({ ...form, goal_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
          </div>

          <p className="text-[11px] text-slate-400">
            Leave the title, amount, or date empty to hide the trip program from students — they'll instead see a "not yet configured" placeholder with their current earnings.
          </p>

          <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-lg transition-all">
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Trip Goal</>}
          </button>
        </form>
      </div>
    </div>
  );
}
