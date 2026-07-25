import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users2, CheckCircle2, Youtube, Instagram, Link2, Plus, Pencil, Trash2, X, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaDiscord, FaFacebook } from 'react-icons/fa';
import api from '../../utils/api';

const LINKS_META = [
  { key: 'community_whatsapp_url', label: 'WhatsApp Group URL', placeholder: 'https://chat.whatsapp.com/...', Icon: FaWhatsapp, color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
  { key: 'community_youtube_url', label: 'YouTube Channel URL', placeholder: 'https://youtube.com/@zarniskills', Icon: Youtube, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20' },
  { key: 'community_instagram_url', label: 'Instagram Profile URL', placeholder: 'https://instagram.com/zarniskills', Icon: Instagram, color: 'from-pink-500 to-purple-600', shadow: 'shadow-pink-500/20' },
  { key: 'community_telegram_url', label: 'Telegram Group/Channel URL', placeholder: 'https://t.me/zarniskills', Icon: FaTelegram, color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
  { key: 'community_discord_url', label: 'Discord Server URL', placeholder: 'https://discord.gg/...', Icon: FaDiscord, color: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/20' },
  { key: 'community_facebook_url', label: 'Facebook Community URL', placeholder: 'https://facebook.com/groups/...', Icon: FaFacebook, color: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-600/20' },
];

const EMPTY_LINKS = LINKS_META.reduce((acc, l) => ({ ...acc, [l.key]: '' }), {});
const EMPTY_CUSTOM_FORM = { title: '', url: '', description: '', display_order: '0', is_active: true };

export default function AdminCommunityLinks() {
  const [links, setLinks] = useState(EMPTY_LINKS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Custom links state ───────────────────────────────────────
  const [customLinks, setCustomLinks] = useState([]);
  const [customLoading, setCustomLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState(null);
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM_FORM);
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError] = useState('');

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await api.get('/admin/settings');
        const next = { ...EMPTY_LINKS };
        LINKS_META.forEach((l) => { next[l.key] = res.data.settings?.[l.key] || ''; });
        setLinks(next);
      } catch (err) {
        console.error('Error fetching community links', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
    fetchCustomLinks();
  }, []);

  const fetchCustomLinks = async () => {
    try {
      const res = await api.get('/admin/community-links');
      setCustomLinks(res.data.links || []);
    } catch (err) {
      console.error('Error fetching custom community links', err);
    } finally {
      setCustomLoading(false);
    }
  };

  const set = (key) => (e) => setLinks((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await api.post('/admin/settings', links);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving community links', err);
    } finally {
      setSaving(false);
    }
  };

  const openCreateCustom = () => {
    setEditingCustomId(null);
    setCustomForm({ ...EMPTY_CUSTOM_FORM, display_order: String(customLinks.length) });
    setCustomError('');
    setShowCustomForm(true);
  };

  const openEditCustom = (item) => {
    setEditingCustomId(item.id);
    setCustomForm({
      title: item.title || '',
      url: item.url || '',
      description: item.description || '',
      display_order: String(item.display_order ?? 0),
      is_active: item.is_active !== false,
    });
    setCustomError('');
    setShowCustomForm(true);
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customForm.title.trim() || !customForm.url.trim()) {
      setCustomError('A title and URL are required.');
      return;
    }
    setCustomSaving(true);
    setCustomError('');
    try {
      const payload = { ...customForm, display_order: customForm.display_order || '0' };
      const response = editingCustomId
        ? await api.put(`/admin/community-links/${editingCustomId}`, payload)
        : await api.post('/admin/community-links', payload);
      if (response.data.success) {
        setShowCustomForm(false);
        fetchCustomLinks();
      } else {
        setCustomError(response.data.message || 'Failed to save link.');
      }
    } catch (err) {
      setCustomError(err.response?.data?.message || 'Failed to save link.');
    } finally {
      setCustomSaving(false);
    }
  };

  const handleCustomDelete = async (id) => {
    if (!window.confirm('Permanently delete this link? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/community-links/${id}`);
      fetchCustomLinks();
    } catch (err) {
      console.error('Error deleting custom community link', err);
    }
  };

  const activeCount = LINKS_META.filter((l) => links[l.key]).length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-red-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Community Rooms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-slate-800 space-y-8 animate-fade-in-up pb-10">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <Users2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Community Rooms & Channels</h2>
            <p className="text-xs text-slate-400 font-semibold">Powers the social community hub on the student dashboard</p>
          </div>
        </div>

        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {activeCount} / {LINKS_META.length} active channels
        </span>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm animate-scale-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Community channel links saved successfully!</span>
        </div>
      )}

      {/* Primary 6 Social Channels Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-[2.2rem] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Primary Official Channels</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Leave blank to hide channel card</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LINKS_META.map((l, idx) => (
            <div key={l.key} className="space-y-1.5 animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                <span className={`w-7 h-7 rounded-xl bg-gradient-to-br ${l.color} text-white flex items-center justify-center shrink-0 shadow-sm ${l.shadow}`}>
                  <l.Icon className="w-3.5 h-3.5" />
                </span>
                {l.label}
              </label>
              <input
                type="text"
                value={links[l.key]}
                onChange={set(l.key)}
                placeholder={l.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow font-medium"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 text-right">
          <button
            type="submit"
            disabled={saving}
            className="group relative inline-flex overflow-hidden px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider items-center justify-center gap-2 shadow-md shadow-red-600/15 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>}
            <span className="relative flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Primary Channels'}
            </span>
          </button>
        </div>
      </form>

      {/* Custom Extra Links Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Custom Community Rooms</h3>
              <p className="text-xs text-slate-400 font-semibold">Add additional custom links, groups, or secret VIP room URLs</p>
            </div>
          </div>
          <button onClick={openCreateCustom} className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/15 hover:shadow-xl transition-all active:scale-[0.98] shrink-0">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            <Plus className="w-4 h-4 relative" /> <span className="relative">Add Custom Link</span>
          </button>
        </div>

        {customLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customLinks.map((item, idx) => (
              <div key={item.id} className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up flex flex-col justify-between" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      item.is_active !== false ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' : 'bg-slate-100 text-slate-500 border border-slate-200/40'
                    }`}>{item.is_active !== false ? 'Active' : 'Inactive'}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Order #{item.display_order}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug break-words">{item.title}</h3>
                  
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-rose-600 hover:text-red-700 inline-flex items-center gap-1 break-all">
                    {item.url} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>

                  {item.description && <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1">{item.description}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-50">
                  <button onClick={() => openEditCustom(item)} className="p-2 border border-slate-200/60 rounded-xl text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors" title="Edit Link">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleCustomDelete(item.id)} className="p-2 border border-slate-200/60 rounded-xl text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors" title="Delete Link">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {customLinks.length === 0 && (
              <div className="col-span-full text-center py-14 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-semibold text-sm shadow-sm">
                No custom links added yet. Click Add Custom Link to feature special rooms!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Link Create/Edit Modal */}
      {showCustomForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.2rem] max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5.5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black tracking-tight truncate">{editingCustomId ? 'Edit Custom Link' : 'Add Custom Link'}</h3>
                  <p className="text-[11px] text-white/60 font-medium truncate">Shown on the student Community Rooms page</p>
                </div>
              </div>
              <button onClick={() => setShowCustomForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="custom-link-form" onSubmit={handleCustomSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-5">
              {customError && <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold">{customError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Link Title *</label>
                <input type="text" value={customForm.title} onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })} placeholder="e.g. VIP Telegram Discussion Group" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Destination URL *</label>
                <input type="text" value={customForm.url} onChange={(e) => setCustomForm({ ...customForm, url: e.target.value })} placeholder="https://t.me/yourgroup" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                <input type="text" value={customForm.description} onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })} placeholder="Short one-line summary shown under the title" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={customForm.display_order} onChange={(e) => setCustomForm({ ...customForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[10px] text-slate-400 font-medium mt-1">Lower numbers appear first.</p>
              </div>

              {/* Active Toggle Switch */}
              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div>
                  <span className="text-xs font-black uppercase text-slate-800 block">Link Active</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Make visible to students on the Community Rooms page</span>
                </div>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={customForm.is_active} onChange={(e) => setCustomForm({ ...customForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowCustomForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="custom-link-form" disabled={customSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/15 hover:shadow-xl transition-all active:scale-[0.98]">
                {!customSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{customSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingCustomId ? 'Save Changes' : 'Add Custom Link'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
