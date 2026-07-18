import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import api from '../../utils/api';

const TYPE_TABS = [
  { key: '', label: 'All' },
  { key: 'commission', label: 'Commissions' },
  { key: 'withdrawal', label: 'Withdrawals' },
];

function Avatar({ t }) {
  const initials = t.user_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return t.profile_image_url ? (
    <img src={t.profile_image_url} alt={t.user_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

export default function AdminWalletDetails() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ total_commissions: 0, total_withdrawals: 0, net_balance: 0 });
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/wallet-transactions', { params: { type: typeFilter } });
        setTransactions(response.data.transactions || []);
        setTotals({
          total_commissions: response.data.total_commissions || 0,
          total_withdrawals: response.data.total_withdrawals || 0,
          net_balance: response.data.net_balance || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [typeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Commissions', value: totals.total_commissions, icon: ArrowUpRight, color: 'from-emerald-500 to-green-600' },
    { label: 'Total Withdrawals', value: totals.total_withdrawals, icon: ArrowDownRight, color: 'from-red-500 to-rose-600' },
    { label: 'Net Balance', value: totals.net_balance, icon: Scale, color: 'from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">Wallet Ledger</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-xl font-black leading-none">₹{kpi.value.toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors ${
              typeFilter === tab.key ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">User</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Note</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const isCommission = t.type === 'commission';
                return (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar t={t} />
                        <span className="font-bold text-slate-800">{t.user_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 capitalize">{t.type}</td>
                    <td className="py-3.5 text-xs text-slate-400 max-w-[220px] truncate">{t.note || '—'}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                        t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>{t.status}</span>
                    </td>
                    <td className="py-3.5 text-slate-400">{t.created_at}</td>
                    <td className={`py-3.5 text-right font-black ${isCommission ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isCommission ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">No wallet transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {transactions.map(t => {
          const isCommission = t.type === 'commission';
          return (
            <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Avatar t={t} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{t.user_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{t.type}</p>
                </div>
                <span className={`shrink-0 font-black text-sm ${isCommission ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isCommission ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </span>
              </div>
              {t.note && <p className="text-xs text-slate-400 mt-2 truncate">{t.note}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400">{t.created_at}</span>
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                  t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>{t.status}</span>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No wallet transactions found.</div>
        )}
      </div>
    </div>
  );
}
