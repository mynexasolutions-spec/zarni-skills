import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Mail, Trash2, CircleDot, Eye, CheckCircle2, Clock, X, ExternalLink, Send } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

export default function AdminConnectForm() {
  const [submissions, setSubmissions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/admin/contact-submissions');
      setSubmissions(res.data.submissions || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const openItem = async (item) => {
    setSelectedItem(item);
    if (!item.is_read) {
      try {
        await api.put(`/admin/contact-submissions/${item.id}`, { is_read: true });
        fetchSubmissions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.delete(`/admin/contact-submissions/${id}`);
      if (selectedItem?.id === id) setSelectedItem(null);
      fetchSubmissions();
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
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Public Messages...</p>
      </div>
    );
  }

  const readCount = submissions.length - unreadCount;

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Public Contact Submissions</h2>
            <p className="text-xs text-slate-400 font-semibold">Inquiries and messages submitted through the website Contact form</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/60 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {unreadCount} unread
            </span>
          )}
          <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {submissions.length} total
          </span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/15 transition-all duration-300 hover:-translate-y-0.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-100 mb-2">Total Inquiries</p>
          <AnimatedNumber value={submissions.length} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
        </div>
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-rose-600 to-red-700 shadow-lg shadow-red-600/15 transition-all duration-300 hover:-translate-y-0.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-100 mb-2">Unread Messages</p>
          <AnimatedNumber value={unreadCount} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
        </div>
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/15 transition-all duration-300 hover:-translate-y-0.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-100 mb-2">Read Messages</p>
          <AnimatedNumber value={readCount} duration={900} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto admin-scrollbar">
          <table className="w-full text-left text-base text-slate-700">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Received Date</th>
                <th className="px-6 py-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => openItem(s)}
                  className={`cursor-pointer transition-colors duration-150 group ${
                    s.is_read ? 'hover:bg-slate-50/60' : 'bg-rose-50/20 hover:bg-rose-50/40 font-semibold'
                  }`}
                >
                  <td className="px-6 py-4.5">
                    {s.is_read ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200/60">
                        Read
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/60">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        Unread
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} />
                      <div className="min-w-0">
                        <p className={`font-extrabold text-slate-900 text-base leading-snug group-hover:text-red-600 transition-colors ${!s.is_read ? 'text-red-600' : ''}`}>
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4.5 max-w-[260px]">
                    <p className="font-bold text-slate-800 text-sm truncate">{s.subject || 'No Subject'}</p>
                    <p className="text-xs text-slate-400 truncate font-normal mt-0.5">{s.message}</p>
                  </td>

                  <td className="px-6 py-4.5 text-xs text-slate-400 font-medium">
                    {s.created_at}
                  </td>

                  <td className="px-6 py-4.5 text-right pr-6">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openItem(s)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shadow-sm"
                        title="View Full Message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <a
                        href={`mailto:${s.email}`}
                        className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors shadow-sm border border-indigo-100"
                        title="Reply via Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>

                      <button
                        onClick={(e) => handleDelete(s.id, e)}
                        className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 font-semibold">No public contact form messages received yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {submissions.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => openItem(s)}
            className={`bg-white border rounded-2xl p-4.5 shadow-sm animate-fade-in-up cursor-pointer ${
              s.is_read ? 'border-slate-200/80' : 'border-rose-300 ring-1 ring-rose-300/50'
            }`}
            style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={s.name} />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-base leading-snug break-words">{s.name}</p>
                  <p className="text-xs text-slate-400 truncate">{s.email}</p>
                </div>
              </div>

              {s.is_read ? (
                <span className="shrink-0 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-slate-100 text-slate-500">Read</span>
              ) : (
                <span className="shrink-0 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-rose-50 text-rose-600 border border-rose-200">Unread</span>
              )}
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1">
              <p className="font-bold text-slate-800 text-sm">{s.subject}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{s.message}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">{s.created_at}</span>
              
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`mailto:${s.email}`}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> Reply
                </a>
                <button
                  onClick={(e) => handleDelete(s.id, e)}
                  className="p-1.5 bg-rose-50 text-rose-600 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400 font-semibold">No public contact form messages received yet.</div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedItem && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-6 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar name={selectedItem.name} />
                <div className="min-w-0">
                  <h3 className="text-xl font-black tracking-tight truncate">{selectedItem.name}</h3>
                  <p className="text-xs text-white/60 font-medium truncate">{selectedItem.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto admin-scrollbar p-6 sm:p-8 space-y-6 text-sm">
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/40 pb-3">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Subject</span>
                  <span className="text-xs font-semibold text-slate-400">{selectedItem.created_at}</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-snug">{selectedItem.subject || 'No Subject'}</h4>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 sm:p-6 space-y-3">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider block border-b border-slate-200/40 pb-2">Message Body</span>
                <p className="text-slate-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">{selectedItem.message}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button
                onClick={(e) => handleDelete(selectedItem.id, e)}
                className="py-3.5 px-5 bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-100 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <a
                href={`mailto:${selectedItem.email}`}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Reply via Email
              </a>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
