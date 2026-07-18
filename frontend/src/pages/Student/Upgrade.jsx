import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpCircle, Layers, CheckCircle2, ShoppingCart, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function Upgrade() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpgradePackages = async () => {
      try {
        const [globalRes, dashboardRes] = await Promise.all([
          api.get('/global-data'),
          api.get('/student/dashboard'),
        ]);
        setPackages(globalRes.data.packages || []);
        setPurchasedIds(dashboardRes.data.purchased_package_ids || []);
      } catch (err) {
        console.error('Error loading upgrade options', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpgradePackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-slate-800">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-white mb-10"
        style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 45%, #2563eb 100%)' }}>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Level Up
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2">
            <ArrowUpCircle className="w-7 h-7" /> Upgrade Your Package
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">Unlock more premium courses and higher affiliate commission tiers by upgrading to a bigger package.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map(pkg => {
          const isOwned = purchasedIds.includes(pkg.id);
          return (
            <div key={pkg.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  {isOwned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Owned
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm uppercase">{pkg.name}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">{pkg.description || 'Unlock advanced practical capabilities.'}</p>

                <div className="bg-slate-50 p-4 rounded-xl mt-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
                  <p className="text-xl font-black text-slate-900">₹{(pkg.price || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {isOwned ? (
                <button
                  onClick={() => navigate(`/student/packages/${pkg.id}`)}
                  className="w-full mt-6 py-3 border border-slate-200 text-slate-700 hover:border-primary hover:text-primary rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  View Package
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/checkout?package_id=${pkg.id}`)}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Upgrade Now
                </button>
              )}
            </div>
          );
        })}
        {packages.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
            No upgrade packages available right now.
          </div>
        )}
      </div>
    </div>
  );
}
