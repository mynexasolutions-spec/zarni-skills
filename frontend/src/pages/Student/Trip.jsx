import React, { useEffect, useState } from 'react';
import { Compass, Plane, Wallet } from 'lucide-react';
import api from '../../utils/api';

export default function Trip() {
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await api.get('/student/dashboard');
        setEarnings(response.data.all_time_earnings || 0);
      } catch (err) {
        console.error('Error fetching trip achievement data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-800">
      <div className="flex items-center gap-3 mb-8">
        <Compass className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '15s' }} />
        <h2 className="text-2xl font-black">Trip Achievements</h2>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-sky-50 border flex items-center justify-center shrink-0 text-sky-600">
            <Plane className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-md">Not Yet Configured</span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">No Active Trip Reward Program</h3>
            <p className="text-slate-500 text-xs mt-1">Our team hasn't launched a travel rewards campaign yet. Check back soon — your earnings below will count toward it.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Lifetime Earnings</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{earnings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
