import React, { useEffect, useState } from 'react';
import { Network, Users, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function MyTeam() {
  const [data, setData] = useState({ level1: [], level2: [], stats: { l1_total: 0, l1_active: 0, l2_total: 0, l2_active: 0, total_network: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/student/my-team');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching team:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const { stats } = data;

  const StatusBadge = ({ paid }) => (
    <span className={`inline-block px-3 py-1 rounded-full text-[0.7rem] font-bold ${
      paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
    }`}>
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );

  const Avatar = ({ user }) => {
    const initials = user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return user.profile_image_url ? (
      <img src={user.profile_image_url} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[0.65rem] font-bold flex items-center justify-center flex-shrink-0">
        {initials}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto">

      <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900 mb-7">
        <Network className="w-6 h-6 text-blue-600" />
        My Team Network
      </h1>

      {/* KPI cards */}
      <section className="mb-8">
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <div className="rounded-2xl p-6 border border-white/30" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', boxShadow: '0 10px 28px rgba(59,130,246,0.35)' }}>
            <p className="flex items-center gap-2 text-[0.7rem] font-bold text-white/85 uppercase tracking-widest mb-3.5">
              <Network className="w-4 h-4" strokeWidth={2.5} /> Total Network
            </p>
            <p className="text-[2.15rem] font-black text-white leading-none mb-2.5">{stats.total_network}</p>
            <p className="text-[0.7rem] text-white/75 font-medium">Members across your network</p>
          </div>
          <div className="rounded-2xl p-6 border border-white/30" style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', boxShadow: '0 10px 28px rgba(16,185,129,0.35)' }}>
            <p className="flex items-center gap-2 text-[0.7rem] font-bold text-white/85 uppercase tracking-widest mb-3.5">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> Active (Level 1)
            </p>
            <p className="text-[2.15rem] font-black text-white leading-none mb-2.5">{stats.l1_active} / {stats.l1_total}</p>
            <p className="text-[0.7rem] text-white/75 font-medium">Direct referrals paid</p>
          </div>
          <div className="rounded-2xl p-6 border border-white/30" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', boxShadow: '0 10px 28px rgba(139,92,246,0.35)' }}>
            <p className="flex items-center gap-2 text-[0.7rem] font-bold text-white/85 uppercase tracking-widest mb-3.5">
              <Users className="w-4 h-4" strokeWidth={2.5} /> Active (Level 2)
            </p>
            <p className="text-[2.15rem] font-black text-white leading-none mb-2.5">{stats.l2_active} / {stats.l2_total}</p>
            <p className="text-[0.7rem] text-white/75 font-medium">Indirect referrals paid</p>
          </div>
        </div>
      </section>

      {/* Level 1 */}
      <section className="mb-7">
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="font-bold text-[1.05rem] text-slate-900 m-0">Direct Referrals (Level 1)</h2>
            <span className="text-[0.65rem] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">Direct Payouts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.875rem]">
              <thead style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }}>
                <tr>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Student</th>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Joined</th>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Level 2 Count</th>
                </tr>
              </thead>
              <tbody>
                {data.level1.length > 0 ? data.level1.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-[0.7rem] text-slate-400 font-mono">{u.referral_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{u.created_at}</td>
                    <td className="px-4 py-3.5"><StatusBadge paid={u.is_paid} /></td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{u.referral_count}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-400 text-sm">No direct referrals yet. Start sharing your link!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Level 2 */}
      <section>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
            <h2 className="font-bold text-[1.05rem] text-slate-900 m-0">Indirect Referrals (Level 2)</h2>
            <span className="text-[0.65rem] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">Network Payouts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.875rem]">
              <thead style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)' }}>
                <tr>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Student</th>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Referred By</th>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Joined</th>
                  <th className="text-left font-bold text-[0.7rem] text-slate-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.level2.length > 0 ? data.level2.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <p className="font-semibold text-slate-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-blue-600 font-semibold">{u.referrer_name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{u.created_at}</td>
                    <td className="px-4 py-3.5"><StatusBadge paid={u.is_paid} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-400 text-sm">Your network hasn't grown to Level 2 yet. Help your direct referrals succeed!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
