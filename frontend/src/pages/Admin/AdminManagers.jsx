import React, { useEffect, useState } from 'react';
import { UserCog, Network, Wallet, Power, ArrowDownCircle, Percent, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ m }) {
  const initials = m.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="relative shrink-0 rounded-full ring-2 ring-purple-500/20 transition-all duration-300">
      {m.profile_image_url ? (
        <img src={m.profile_image_url} alt={m.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
          {initials}
        </div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${m.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-white ${m.is_active ? 'animate-pulse' : ''}`}></span>
      </span>
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-purple-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading manager roster...</p>
      </div>
    );
  }

  const totalTeamSize = managers.reduce((sum, m) => sum + (m.team_count || 0), 0);
  const totalEarnings = managers.reduce((sum, m) => sum + (m.total_earnings || 0), 0);
  const activeCount = managers.filter(m => m.is_active).length;

  const kpis = [
    { label: 'Total Managers', value: managers.length, icon: UserCog, color: 'from-violet-600 to-purple-600', glow: 'shadow-purple-500/10' },
    { label: 'Active Status', value: activeCount, icon: Power, color: 'from-emerald-600 to-green-600', glow: 'shadow-emerald-500/10' },
    { label: 'Total Team Size', value: totalTeamSize, icon: Network, color: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-500/10' },
    { label: 'Total Payouts', value: totalEarnings, prefix: '₹', icon: Wallet, color: 'from-amber-600 to-orange-600', glow: 'shadow-amber-500/10' },
  ];

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
          <UserCog className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Managers Directory</h2>
          <p className="text-xs text-slate-400 font-semibold">Oversee regional sales nodes and assign overrides</p>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div 
            key={kpi.label} 
            className={`group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg ${kpi.glow} border border-white/5 transition-all duration-300 hover:-translate-y-1`}
          >
            <kpi.icon className="absolute -right-5 -bottom-5 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" strokeWidth={1} />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center mb-3.5 backdrop-blur-md">
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
              <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ''} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Manager Profile</th>
                <th className="px-6 py-4">Direct Team Size</th>
                <th className="px-6 py-4">Commission overrides</th>
                <th className="px-6 py-4">Total Earnings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {managers.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar m={m} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight">{m.name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 tracking-wider truncate">{m.referral_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-700">{m.team_count} members</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2 max-w-[170px]">
                      <div className="relative flex-1">
                        <input
                          type="number" min="0" max="100" step="0.5"
                          defaultValue={m.manager_commission_percent ?? ''}
                          placeholder="Default"
                          onChange={(e) => setPctDraft(prev => ({ ...prev, [m.id]: e.target.value }))}
                          className="w-full pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all bg-slate-50 hover:bg-slate-50 focus:bg-white"
                        />
                        <Percent className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                      <button
                        onClick={() => handleSaveCommission(m.id)}
                        disabled={busyId === m.id || pctDraft[m.id] === undefined}
                        className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-violet-700 disabled:opacity-40 transition-colors shrink-0"
                      >
                        Set
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-black text-slate-800">₹{(m.total_earnings || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                      m.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right pr-6">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleToggle(m.id)} 
                        disabled={busyId === m.id} 
                        className={`p-2 rounded-xl border transition-all hover:scale-105 ${m.is_active ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-600 hover:text-white' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-600 hover:text-white'}`} 
                        title={m.is_active ? 'Freeze Manager' : 'Activate Manager'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDemote(m.id)} 
                        disabled={busyId === m.id} 
                        className="p-2 bg-slate-50 hover:bg-amber-600 border border-slate-200 text-slate-500 hover:text-white rounded-xl transition-all hover:scale-105" 
                        title="Demote to student"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-semibold">No managers recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards view */}
      <div className="lg:hidden space-y-4">
        {managers.map((m, idx) => (
          <div key={m.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar m={m} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{m.referral_code}</p>
                </div>
              </div>
              <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                m.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'
              }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div><span className="text-slate-400 block">Team Size</span><span className="font-bold text-slate-800">{m.team_count} members</span></div>
              <div><span className="text-slate-400 block">Earnings</span><span className="font-black text-slate-800">₹{(m.total_earnings || 0).toLocaleString('en-IN')}</span></div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <div className="relative flex-1">
                <input
                  type="number" min="0" max="100" step="0.5"
                  defaultValue={m.manager_commission_percent ?? ''}
                  placeholder="Comm %"
                  onChange={(e) => setPctDraft(prev => ({ ...prev, [m.id]: e.target.value }))}
                  className="w-full px-3 py-2 pr-7 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-4 focus:ring-violet-500/10"
                />
                <Percent className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => handleSaveCommission(m.id)}
                disabled={busyId === m.id || pctDraft[m.id] === undefined}
                className="px-3 py-2 bg-violet-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider disabled:opacity-40 shrink-0"
              >
                Set
              </button>
              <button 
                onClick={() => handleToggle(m.id)} 
                disabled={busyId === m.id} 
                className={`p-2.5 border rounded-xl shrink-0 ${m.is_active ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}
              >
                <Power className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDemote(m.id)} 
                disabled={busyId === m.id} 
                className="p-2.5 bg-slate-50 hover:bg-amber-600 border border-slate-200 text-slate-500 rounded-xl shrink-0"
              >
                <ArrowDownCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {managers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 font-semibold">No managers recorded.</div>
        )}
      </div>
    </div>
  );
}
