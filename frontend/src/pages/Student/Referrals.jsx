import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Link as LinkIcon, Check, Copy } from 'lucide-react';
import api from '../../utils/api';

export default function Referrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await api.get('/student/referrals');
        setReferrals(response.data.referrals || []);
      } catch (err) {
        console.error('Error fetching referrals list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const refUrl = `${window.location.origin}/register?ref=${user?.referral_code || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-800">
      
      {/* Referral link box banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-white mb-10"
        style={{
          background: 'linear-gradient(135deg, #0b1428 0%, #101c4a 100%)'
        }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(43,128,240,0.15),transparent_45%)]"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Share your referral link</h2>
          <p className="text-slate-355 text-sm mb-6">Earn up to 30% commission payouts when your referrals enroll in a package.</p>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white/10 p-2 rounded-2xl border border-white/15">
            <input
              type="text"
              readOnly
              value={refUrl}
              className="flex-grow bg-transparent border-0 text-white text-xs sm:text-sm font-semibold focus:outline-none px-3"
            />
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </section>

      {/* Referrals table list */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> People You Referred
          </h3>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {referrals.length} total
          </span>
        </div>

        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="py-3 font-bold">Name</th>
                  <th className="py-3 font-bold">Email</th>
                  <th className="py-3 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-4 font-bold text-slate-800">{r.name}</td>
                    <td className="py-4 text-slate-500">{r.email || 'N/A'}</td>
                    <td className="py-4 text-slate-400">{r.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm font-medium">
            No referrals recorded yet. Copy and share your link to start earning commissions!
          </div>
        )}
      </section>

    </div>
  );
}
