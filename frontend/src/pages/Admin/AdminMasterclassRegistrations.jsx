import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GraduationCap, Mail, Phone, Zap, Share2, X,
  Cake, Briefcase, MapPin, BarChart3, Target, IndianRupee, Users,
  Calendar, Clock, Video, Globe,
} from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const FORM_FIELD_META = [
  { key: 'age', label: 'Age', Icon: Cake },
  { key: 'occupation', label: 'Occupation', Icon: Briefcase },
  { key: 'city_state', label: 'City / State', Icon: MapPin },
  { key: 'experience_level', label: 'Experience Level', Icon: BarChart3 },
  { key: 'goal', label: 'Goal', Icon: Target },
];

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
      {initials}
    </div>
  );
}

export default function AdminMasterclassRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [totals, setTotals] = useState({ total_count: 0, total_income: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/masterclass-registrations');
        setRegistrations(res.data.registrations || []);
        setTotals({
          total_count: res.data.total_count || 0,
          total_income: res.data.total_income || 0,
        });
      } catch (err) {
        console.error('Error fetching masterclass registrations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-emerald-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Masterclass Registrations...</p>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Registrations', value: totals.total_count, Icon: Users, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-600/15' },
    { label: 'Registration Income', value: totals.total_income, prefix: '₹', Icon: IndianRupee, color: 'from-purple-600 to-fuchsia-600', shadow: 'shadow-purple-600/15' },
  ];

  return (
    <div className="text-slate-800 space-y-6 pb-10 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Masterclass Registrations</h2>
            <p className="text-xs text-slate-400 font-semibold">Every ₹99 masterclass sign-up across all referral links, in one place</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {kpis.map((kpi, idx) => (
          <div key={kpi.label} className={`group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.shadow} transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up`} style={{ animationDelay: `${idx * 70}ms` }}>
            <kpi.Icon className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10 pointer-events-none" strokeWidth={1.5} />
            <p className="relative text-[10px] font-extrabold uppercase tracking-widest text-white/85 mb-2">{kpi.label}</p>
            <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ''} duration={900} className="relative block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
          </div>
        ))}
      </div>

      {/* Registrations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {registrations.map((r, idx) => (
          <div
            key={r.order_id}
            onClick={() => setSelected(r)}
            className="group bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
          >
            <div className="flex items-center gap-3.5 min-w-0 mb-4">
              <Avatar name={r.name} />
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors truncate">{r.name}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{r.email}</p>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/40 rounded-2xl p-4 space-y-2.5 text-xs">
              {r.phone && (
                <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 shrink-0" />{r.phone}</div>
              )}
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Zap className="w-3.5 h-3.5 shrink-0" /> ₹{r.amount_paid} paid on {r.paid_at}
              </div>
              <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-200/40">
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                Referred by <span className="font-bold text-slate-700">{r.referrer_name || 'Unknown'}</span>
              </div>
            </div>
          </div>
        ))}

        {registrations.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-semibold shadow-sm">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-200 mb-3 animate-pulse" />
            No masterclass registrations yet.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selected && createPortal(
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-[2rem] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #052e2b 0%, #065f46 60%, #10b981 100%)' }}>
              <div className="min-w-0">
                <h3 className="text-lg font-black tracking-tight truncate">{selected.name}</h3>
                <p className="text-xs text-emerald-50/70 font-medium truncate">Masterclass registration details</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{selected.email}</span></div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 shrink-0" />{selected.phone}</div>
                )}
                <div className="flex items-center gap-2 text-slate-600"><Share2 className="w-3.5 h-3.5 shrink-0" />Referred by <span className="font-bold text-slate-800">{selected.referrer_name || 'Unknown'}</span></div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-400 font-semibold">Paid on {selected.paid_at}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> ₹{selected.amount_paid}
                  </span>
                </div>
              </div>

              {selected.session && (selected.session.date || selected.session.time || selected.session.mode || selected.session.language) && (
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Session They Were Told</p>
                  <p className="text-[11px] text-slate-400 font-medium mb-2.5 -mt-1.5">
                    Snapshot at registration time — the funnel's Date/Time/Mode/Language may have changed since.
                  </p>
                  <div className="space-y-2">
                    {[
                      { key: 'date', label: 'Date', Icon: Calendar },
                      { key: 'time', label: 'Time', Icon: Clock },
                      { key: 'mode', label: 'Mode', Icon: Video },
                      { key: 'language', label: 'Language', Icon: Globe },
                    ].filter(({ key }) => selected.session[key]).map(({ key, label, Icon }) => (
                      <div key={key} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0"><Icon className="w-3.5 h-3.5 text-emerald-500" />{label}</span>
                        <span className="text-sm font-bold text-slate-900 text-right truncate">{selected.session[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Form Answers</p>
                {selected.form_details ? (
                  <div className="space-y-2">
                    {FORM_FIELD_META.map(({ key, label, Icon }) => (
                      <div key={key} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0"><Icon className="w-3.5 h-3.5 text-emerald-500" />{label}</span>
                        <span className="text-sm font-bold text-slate-900 text-right truncate">{selected.form_details[key] || '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No form answers were recorded for this registration.</p>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
