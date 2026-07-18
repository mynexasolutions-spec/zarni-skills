import React, { useEffect, useState } from 'react';
import { Briefcase, Power, ArrowDownCircle } from 'lucide-react';
import api from '../../utils/api';

function Avatar({ m }) {
  const initials = m.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return m.profile_image_url ? (
    <img src={m.profile_image_url} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-white text-xs font-black flex items-center justify-center shrink-0">
      {initials}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const activeCount = members.filter(m => m.is_active).length;

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">Team Members</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 max-w-xl">
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg">
          <p className="text-xl font-black leading-none">{members.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">Total</p>
        </div>
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
          <p className="text-xl font-black leading-none">{activeCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">Active</p>
        </div>
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
          <p className="text-xl font-black leading-none">{members.length - activeCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">Inactive</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Team Member</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar m={m} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-400 truncate">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">{m.phone || 'N/A'}</td>
                  <td className="py-3.5 text-slate-400">{m.created_at}</td>
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
                      <button onClick={() => handleRemove(m.id)} disabled={busyId === m.id} className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50" title="Remove from team">
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400 font-medium">
                    No team members yet. Assign the "Team Member" role to a user from the Users page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {members.map(m => (
          <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar m={m} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{m.name}</p>
                <p className="text-xs text-slate-400 truncate">{m.email}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">{m.phone || 'No phone'}</span>
              <span className="text-slate-600">{m.created_at}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleToggle(m.id)} disabled={busyId === m.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-50">
                <Power className="w-4 h-4" /> {m.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => handleRemove(m.id)} disabled={busyId === m.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold disabled:opacity-50">
                <ArrowDownCircle className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">
            No team members yet. Assign the "Team Member" role to a user from the Users page.
          </div>
        )}
      </div>
    </div>
  );
}
