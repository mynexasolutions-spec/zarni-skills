import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, ShoppingBag, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white text-xs font-black flex items-center justify-center shrink-0 ring-2 ring-rose-500/20">
      {initials}
    </div>
  );
}

export default function AdminPackageUpgrades() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/package-upgrades');
        setOrders(res.data.orders || []);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-rose-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading package logs...</p>
      </div>
    );
  }

  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalVolume = paidOrders.reduce((sum, o) => sum + (o.amount_paid || 0), 0);

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            <ArrowUpCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Package Upgrades</h2>
            <p className="text-xs text-slate-400 font-semibold">Monitor premium upgrades and checkout activations</p>
          </div>
        </div>
        <span className="inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
          {orders.length} transaction logs
        </span>
      </div>

      {/* Summary KPI widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-rose-600 to-red-600 shadow-lg border border-white/5 transition-all">
          <ShoppingBag className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10">
            <AnimatedNumber value={paidOrders.length} duration={1000} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Successful upgrades</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg border border-white/5 transition-all">
          <TrendingUp className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10 flex items-baseline">
            <span className="text-xl font-bold mr-0.5">₹</span>
            <AnimatedNumber value={totalVolume} duration={1000} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Aggregated volume</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Student account</th>
                <th className="px-6 py-4">Selected Bundle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right pr-6">Amount paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={o.user_name} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight">{o.user_name || '—'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{o.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-700 flex items-center gap-1 mt-2.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{o.package_name || '—'}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                      o.payment_status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : o.payment_status === 'failed' 
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>{o.payment_status}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs">{o.created_at}</td>
                  <td className="px-6 py-3.5 text-right pr-6 font-black text-slate-800 tabular-nums">₹{o.amount_paid.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 font-semibold">No upgrade transactions logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-4">
        {orders.map((o, idx) => (
          <div key={o.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={o.user_name} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{o.user_name || '—'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{o.package_name}</p>
                </div>
              </div>
              <span className="shrink-0 font-black text-sm text-slate-800 tabular-nums">₹{o.amount_paid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">{o.created_at}</span>
              <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : o.payment_status === 'failed' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
              }`}>{o.payment_status}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 font-semibold">No upgrade transactions logged.</div>
        )}
      </div>
    </div>
  );
}
