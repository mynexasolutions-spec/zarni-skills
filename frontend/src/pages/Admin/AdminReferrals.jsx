import React, { useEffect, useState } from 'react';
import { Share2, Users, UserCheck } from 'lucide-react';
import api from '../../utils/api';

function Avatar({ r }) {
  const initials = r.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return r.profile_image_url ? (
    <img src={r.profile_image_url} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white text-xs font-black flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [totalReferred, setTotalReferred] = useState(0);
  const [totalReferrers, setTotalReferrers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await api.get('/admin/referrals');
        setReferrals(response.data.referrals || []);
        setTotalReferred(response.data.total_referred || 0);
        setTotalReferrers(response.data.total_referrers || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-7 h-7 text-red-600" />
        <h2 className="text-2xl font-black">All Referrals</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg">
          <Users className="w-5 h-5 mb-2 text-white/80" />
          <p className="text-xl font-black leading-none">{totalReferred}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">Total Referred Users</p>
        </div>
        <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <UserCheck className="w-5 h-5 mb-2 text-white/80" />
          <p className="text-xl font-black leading-none">{totalReferrers}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-1.5">Active Referrers</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b text-slate-400 font-bold text-xs uppercase tracking-wide">
                <th className="pb-3">Referred User</th>
                <th className="pb-3">Referred By</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar r={r} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{r.name}</p>
                        <p className="text-xs text-slate-400 truncate">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-semibold text-blue-600">{r.referrer_name || 'N/A'}</td>
                  <td className="py-3.5 text-slate-400">{r.created_at}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                      r.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{r.is_paid ? 'Paid' : 'Unpaid'}</span>
                  </td>
                </tr>
              ))}
              {referrals.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">No referrals recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {referrals.map(r => (
          <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar r={r} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 truncate">{r.name}</p>
                <p className="text-xs text-slate-400 truncate">{r.email}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                r.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>{r.is_paid ? 'Paid' : 'Unpaid'}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Referred by</span>
              <span className="font-semibold text-blue-600">{r.referrer_name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-slate-400">Joined</span>
              <span className="text-slate-600">{r.created_at}</span>
            </div>
          </div>
        ))}
        {referrals.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400 font-medium">No referrals recorded yet.</div>
        )}
      </div>
    </div>
  );
}
