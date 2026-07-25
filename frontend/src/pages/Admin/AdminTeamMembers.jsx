import React, { useEffect, useState } from 'react';
import { Briefcase, Power, ArrowDownCircle, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

function Avatar({ m }) {
  const initials = m.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
  return (
    <div className="relative shrink-0 rounded-full ring-2 ring-cyan-500/20 transition-all duration-300">
      {m.profile_image_url ? (
        <img src={m.profile_image_url} alt={m.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-white text-xs font-black flex items-center justify-center shrink-0">
          {initials}
        </div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${m.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-white ${m.is_active ? 'animate-pulse' : ''}`}></span>
      </span>
    </div>
  );
}

export default function AdminTeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/admin/team-members');
      setMembers(response.data.team_members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/users/${id}/toggle`);
      fetchMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this team member (revert to student)?')) return;
    setBusyId(id);
    try {
      await api.post(`/admin/users/${id}/set-role`, { role: 'student' });
      fetchMembers();
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-cyan-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading staff database...</p>
      </div>
    );
  }

  const activeCount = members.filter(m => m.is_active).length;

  return (
    <div className="text-slate-800 space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
          <Briefcase className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Team Members</h2>
          <p className="text-xs text-slate-400 font-semibold">Assign permissions and audit core platform support staff</p>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-cyan-600 to-teal-600 shadow-lg border border-white/5 transition-all">
          <Briefcase className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10">
            <AnimatedNumber value={members.length} duration={800} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Total Staff</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg border border-white/5 transition-all">
          <Power className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10">
            <AnimatedNumber value={activeCount} duration={800} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Active</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-[1.8rem] p-5 text-white bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg border border-white/5 transition-all">
          <Power className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 group-hover:scale-105 transition-transform" />
          <div className="relative z-10">
            <AnimatedNumber value={members.length - activeCount} duration={800} className="block text-2xl sm:text-3xl font-black leading-none tracking-tight tabular-nums" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 mt-2">Inactive</p>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-[2.2rem] p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Team Profile</th>
                <th className="px-6 py-4">Phone Contact</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar m={m} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-tight">{m.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">{m.phone || 'N/A'}</td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs">{m.created_at}</td>
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
                        title={m.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemove(m.id)} 
                        disabled={busyId === m.id} 
                        className="p-2 bg-slate-50 hover:bg-rose-600 border border-slate-200 text-slate-500 hover:text-white rounded-xl transition-all hover:scale-105" 
                        title="Remove from team"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 font-semibold">
                    No team members yet. Assign the "Team Member" role to a user from the Users page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards view */}
      <div className="lg:hidden space-y-4">
        {members.map((m, idx) => (
          <div key={m.id} className="bg-white border border-slate-200/85 rounded-2xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar m={m} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{m.email}</p>
                </div>
              </div>
              <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                m.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-500'
              }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">{m.phone || 'No phone'}</span>
              <span className="text-slate-600">{m.created_at}</span>
            </div>
            
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <button 
                onClick={() => handleToggle(m.id)} 
                disabled={busyId === m.id} 
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border ${
                  m.is_active ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" /> {m.is_active ? 'Freeze' : 'Unfreeze'}
              </button>
              <button 
                onClick={() => handleRemove(m.id)} 
                disabled={busyId === m.id} 
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" /> Revert
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 font-semibold">
            No team members yet. Assign the "Team Member" role to a user from the Users page.
          </div>
        )}
      </div>
    </div>
  );
}
