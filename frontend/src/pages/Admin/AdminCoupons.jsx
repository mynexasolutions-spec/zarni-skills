import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Tag, Plus, Pencil, Trash2, X, CheckCircle2, Percent, IndianRupee
} from 'lucide-react';
import api from '../../utils/api';

const EMPTY_FORM = { code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '', is_active: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.coupons || []);
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
    setError('');
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      max_uses: c.max_uses ? String(c.max_uses) : '',
      expires_at: c.expires_at || '',
      is_active: c.is_active !== false,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) {
      setError('Code and discount value are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      const response = editingId
        ? await api.put(`/admin/coupons/${editingId}`, payload)
        : await api.post('/admin/coupons', payload);

      if (response.data.success) {
        setShowForm(false);
        fetchAll();
      } else {
        setError(response.data.message || 'Failed to save coupon.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this coupon? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
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
            <Tag className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Coupon Codes</h2>
        </div>
        <button onClick={openCreate} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
          <Plus className="w-4 h-4 relative" /> <span className="relative">Add Coupon</span>
        </button>
      </div>

      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Code</th>
                <th className="pb-3">Discount</th>
                <th className="pb-3">Usage</th>
                <th className="pb-3">Expires</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-black text-slate-800">{c.code}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                      {c.discount_type === 'percent' ? <Percent className="w-3.5 h-3.5" /> : <IndianRupee className="w-3.5 h-3.5" />}
                      {c.discount_value}{c.discount_type === 'percent' ? '%' : ''}
                    </span>
                  </td>
                  <td className="py-3.5">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ' / ∞'}</td>
                  <td className="py-3.5">{c.expires_at || 'Never'}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      c.is_valid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{c.is_valid ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">No coupons created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {coupons.map((c, idx) => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center justify-between">
              <p className="font-black text-slate-800">{c.code}</p>
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                c.is_valid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>{c.is_valid ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-1">
              <p>Discount: {c.discount_value}{c.discount_type === 'percent' ? '%' : ' flat'}</p>
              <p>Usage: {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ' / unlimited'}</p>
              <p>Expires: {c.expires_at || 'Never'}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(c)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">Edit</button>
              <button onClick={() => handleDelete(c.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">Delete</button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No coupons created yet.</div>
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
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingId ? 'Edit Coupon' : 'Add Coupon'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Applies at checkout on packages and courses</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="coupon-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6">
              {error && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{error}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Coupon Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editingId} placeholder="WELCOME10" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow disabled:bg-slate-50 disabled:text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Discount Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow">
                    <option value="percent">Percentage Off</option>
                    <option value="flat">Flat Amount Off (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                    Discount Value {form.discount_type === 'percent' ? '(%)' : '(₹)'} *
                  </label>
                  <input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder={form.discount_type === 'percent' ? '10' : '500'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Max Uses</label>
                  <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Expires On</label>
                  <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="coupon-form" disabled={saving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{saving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add Coupon'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
