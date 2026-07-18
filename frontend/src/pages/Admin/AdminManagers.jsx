import React, { useEffect, useState } from 'react';
import { UserCog, Network, Wallet, Power, ArrowDownCircle } from 'lucide-react';
import api from '../../utils/api';

function Avatar({ m }) {
  const initials = m.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return m.profile_image_url ? (
    <img src={m.profile_image_url} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

export default function AdminManagers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [pctDraft, setPctDraft] = useState({});

  const fetchManagers = async () => {
    try {
      const response = await api.get('/admin/managers');
      setManagers(response.data.managers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchManagers(); }, []);

  const handleSaveCommission = async (id) => {
    const pct = parseFloat(pctDraft[id]);
    if (Number.isNaN(pct)) return;
    setBusyId(id);
    try {
      await api.post(`/admin/users/${id}/set-commission`, { commission_percent: pct });
      fetchManagers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update commission.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/users/${id}/toggle`);
      fetchManagers();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDemote = async (id) => {
    if (!window.confirm('Demote this manager back to student?')) return;
    setBusyId(id);
    try {
      await api.post(`/admin/users/${id}/set-role`, { role: 'student' });
      fetchManagers();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const totalTeamSize = managers.reduce((sum, m) => sum + (m.team_count || 0), 0);
  const totalEarnings = managers.reduce((sum, m) => sum + (m.total_earnings || 0), 0);
  const activeCount = managers.filter(m => m.is_active).length;

  const kpis = [
    { label: 'Total Managers', value: managers.length, icon: UserCog, color: 'from-violet-500 to-purple-600' },
    { label: 'Active', value: activeCount, icon: Power, color: 'from-emerald-500 to-green-600' },
    { label: 'Total Team Size', value: totalTeamSize, icon: Network, color: 'from-blue-500 to-indigo-600' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: Wallet, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <UserCog className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">Managers</h2>
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

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Manager</th>
                <th className="pb-3">Team Size</th>
                <th className="pb-3">Commission %</th>
                <th className="pb-3">Total Earnings</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar m={m} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-400 font-mono truncate">{m.referral_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-slate-700">{m.team_count}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" max="100" step="0.5"
                        defaultValue={m.manager_commission_percent ?? ''}
                        placeholder="Default"
                        onChange={(e) => setPctDraft(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <button
                        onClick={() => handleSaveCommission(m.id)}
                        disabled={busyId === m.id || pctDraft[m.id] === undefined}
                        className="px-2.5 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase hover:bg-violet-100 disabled:opacity-40"
                      >
                        Set
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">₹{(m.total_earnings || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleToggle(m.id)} disabled={busyId === m.id} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50" title={m.is_active ? 'Deactivate' : 'Activate'}>
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDemote(m.id)} disabled={busyId === m.id} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50" title="Demote to student">
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">No managers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {managers.map(m => (
          <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar m={m} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{m.name}</p>
                <p className="text-xs text-slate-400 font-mono truncate">{m.referral_code}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
              <div><span className="text-slate-400 block">Team Size</span><span className="font-bold text-slate-700">{m.team_count}</span></div>
              <div><span className="text-slate-400 block">Earnings</span><span className="font-semibold text-slate-700">₹{(m.total_earnings || 0).toLocaleString('en-IN')}</span></div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="number" min="0" max="100" step="0.5"
                defaultValue={m.manager_commission_percent ?? ''}
                placeholder="Commission %"
                onChange={(e) => setPctDraft(prev => ({ ...prev, [m.id]: e.target.value }))}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <button
                onClick={() => handleSaveCommission(m.id)}
                disabled={busyId === m.id || pctDraft[m.id] === undefined}
                className="px-3 py-2 bg-violet-50 text-violet-600 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 shrink-0"
              >
                Set
              </button>
              <button onClick={() => handleToggle(m.id)} disabled={busyId === m.id} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl disabled:opacity-50 shrink-0" title={m.is_active ? 'Deactivate' : 'Activate'}>
                <Power className="w-4 h-4" />
              </button>
              <button onClick={() => handleDemote(m.id)} disabled={busyId === m.id} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl disabled:opacity-50 shrink-0" title="Demote to student">
                <ArrowDownCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {managers.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No managers yet.</div>
        )}
      </div>
    </div>
  );
}
