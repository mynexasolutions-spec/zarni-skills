import React, { useEffect, useState } from 'react';
import { CreditCard, IndianRupee, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../../utils/api';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/orders', { params: { status: statusFilter } });
        setOrders(response.data.orders || []);
        setStatusCounts(response.data.status_counts || {});
        setTotalRevenue(response.data.total_revenue || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-emerald-500 to-green-600' },
    { label: 'Paid', value: statusCounts.paid ?? 0, icon: CheckCircle2, color: 'from-blue-500 to-indigo-600' },
    { label: 'Pending', value: statusCounts.pending ?? 0, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'Failed', value: statusCounts.failed ?? 0, icon: XCircle, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">Platform Student Orders</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-xl font-black leading-none">{kpi.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors ${
              statusFilter === tab.key ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-200'
            }`}
          >
            {tab.label} ({statusCounts[tab.key || 'all'] ?? 0})
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Item</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-mono text-slate-700">#{o.id}</td>
                  <td className="py-3.5 font-bold text-slate-800">{o.buyer_name}</td>
                  <td className="py-3.5">{o.item_name}</td>
                  <td className="py-3.5 font-semibold text-slate-800">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 capitalize">{o.payment_method || 'N/A'}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : o.payment_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>{o.payment_status}</span>
                  </td>
                  <td className="py-3.5 text-slate-400">{o.created_at}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 font-medium">No orders recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{o.buyer_name}</p>
                <p className="text-xs text-slate-400 truncate">{o.item_name}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : o.payment_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
              }`}>{o.payment_status}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">#{o.id} · {o.payment_method || 'N/A'} · {o.created_at}</span>
              <span className="font-black text-slate-800 text-sm">₹{o.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No orders recorded.</div>
        )}
      </div>
    </div>
  );
}
