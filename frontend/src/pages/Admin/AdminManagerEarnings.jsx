import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

export default function AdminManagerEarnings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/manager-earnings');
        setRows(res.data.managers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const totalAllTime = rows.reduce((sum, r) => sum + (r.alltime || 0), 0);

  return (
    <div className="text-slate-800 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
          <Crown className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-black">Manager Earning</h2>
          <p className="text-xs text-slate-400">Earnings breakdown for every manager on the platform.</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 text-red-600 shrink-0">
          {rows.length} managers
        </span>
      </div>

      <div className="rounded-2xl p-5 mb-6 text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg w-full sm:w-72">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mb-1.5">Total Manager Earnings (All Time)</p>
        <AnimatedNumber value={totalAllTime} prefix="₹" className="block text-2xl font-black leading-none tabular-nums" />
      </div>

      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Manager</th>
                <th className="pb-3 text-right">Today</th>
                <th className="pb-3 text-right">7 Days</th>
                <th className="pb-3 text-right">30 Days</th>
                <th className="pb-3 text-right">All Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{r.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-right tabular-nums">₹{r.today.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-right tabular-nums">₹{r['7days'].toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-right tabular-nums">₹{r['30days'].toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-right font-black text-emerald-600 tabular-nums">₹{r.alltime.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">No managers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {rows.map((r, idx) => (
          <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-2.5">
              <Avatar name={r.name} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{r.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{r.email}</p>
              </div>
              <span className="shrink-0 font-black text-sm text-emerald-600 tabular-nums">₹{r.alltime.toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
              <div><p className="text-[9px] text-slate-400 uppercase font-bold">Today</p><p className="text-xs font-bold text-slate-700">₹{r.today.toLocaleString('en-IN')}</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase font-bold">7d</p><p className="text-xs font-bold text-slate-700">₹{r['7days'].toLocaleString('en-IN')}</p></div>
              <div><p className="text-[9px] text-slate-400 uppercase font-bold">30d</p><p className="text-xs font-bold text-slate-700">₹{r['30days'].toLocaleString('en-IN')}</p></div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No managers found.</div>
        )}
      </div>
    </div>
  );
}
