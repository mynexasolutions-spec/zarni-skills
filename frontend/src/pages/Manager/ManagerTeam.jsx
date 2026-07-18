import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, ShoppingBag, Hash } from 'lucide-react';
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

export default function ManagerTeam() {
  const [members, setMembers] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/manager/team');
        setMembers(response.data.members || []);
        setReferralCode(response.data.referral_code || '');
      } catch (err) {
        console.error('Error fetching manager team', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const activeCount = members.filter(m => m.is_active).length;
  const totalPurchases = members.reduce((sum, m) => sum + (m.purchases || 0), 0);

  const kpis = [
    { label: 'Total Team', value: members.length, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
    { label: 'Total Purchases', value: totalPurchases, icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="text-slate-800">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black leading-tight">My Team</h2>
            <p className="text-xs text-slate-400 font-medium">Members referred by your code</p>
          </div>
        </div>
        {referralCode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-full text-xs font-bold text-violet-700">
            <Hash className="w-3.5 h-3.5" /> {referralCode}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${kpi.color} shadow-lg`}>
            <kpi.icon className="w-5 h-5 mb-2 text-white/80" />
            <p className="text-xl font-black leading-none">{kpi.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-2 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Purchases</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className={`border-t border-slate-50 hover:bg-slate-50/70 transition-colors ${!m.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar m={m} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-400 truncate">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{m.phone || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">{m.purchases}</td>
                  <td className="px-4 py-3 text-slate-400">{m.created_at}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                    No team members yet. Share your referral link to start building your team.
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
          <div key={m.id} className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm ${!m.is_active ? 'opacity-60' : ''}`}>
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
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
              <div><span className="text-slate-400 block">Phone</span><span className="font-semibold text-slate-700">{m.phone || '—'}</span></div>
              <div><span className="text-slate-400 block">Purchases</span><span className="font-semibold text-slate-700">{m.purchases}</span></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Joined {m.created_at}</p>
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">
            No team members yet. Share your referral link to start building your team.
          </div>
        )}
      </div>
    </div>
  );
}
