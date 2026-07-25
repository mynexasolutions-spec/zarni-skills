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
        const [globalRes, ownedRes] = await Promise.all([
          api.get('/global-data'),
          api.get('/student/purchased-packages'),
        ]);
        setPackages(globalRes.data.packages || []);
        setPurchasedIds(ownedRes.data.purchased_package_ids || []);
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

  const highestOwnedPrice = packages
    .filter(p => purchasedIds.includes(p.id))
    .reduce((max, p) => Math.max(max, p.price || 0), 0);

  const bestUpgradeId = packages
    .filter(p => !purchasedIds.includes(p.id))
    .sort((a, b) => (b.price || 0) - (a.price || 0))[0]?.id;

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white mb-8 sm:mb-10 animate-gradient-x"
        style={{ background: 'linear-gradient(115deg, #0f1f4d 0%, #1e3a8a 30%, #2563eb 55%, #1e3a8a 80%, #0f1f4d 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-amber-400/15 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Level Up
          </div>
          <h1 className="text-xl sm:text-3xl font-black mb-2 flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 animate-float" /> Upgrade Your Package
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">Unlock more premium courses and higher affiliate commission tiers by upgrading to a bigger package.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {packages.map((pkg, idx) => {
          const isOwned = purchasedIds.includes(pkg.id);
          const isBestUpgrade = !isOwned && pkg.id === bestUpgradeId;
          const savings = !isOwned && highestOwnedPrice > 0 ? highestOwnedPrice : 0;
          return (
            <div key={pkg.id} className={`group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up ${
              isBestUpgrade ? 'border-2 border-primary shadow-[0_20px_45px_-15px_rgba(43,128,240,0.3)]' : 'border border-slate-100'
            }`} style={{ animationDelay: `${idx * 70}ms` }}>
              {isBestUpgrade && (
                <span className="absolute top-0 right-6 z-10 bg-gradient-to-r from-primary to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-b-lg shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Best Upgrade
                </span>
              )}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-slate-100/60 to-transparent pointer-events-none"></span>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
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
                  {!isOwned && highestOwnedPrice > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Package Price</p>
                        <p className="text-sm font-bold text-slate-600">₹{(pkg.price || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Already Paid</p>
                        <p className="text-sm font-bold text-emerald-600">−₹{savings.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="border-t border-dashed border-slate-200 mt-2.5 pt-2.5 flex items-center justify-between">
                        <p className="text-[10px] text-slate-500 font-black uppercase">You Pay</p>
                        <p className="text-xl font-black text-primary">
                          ₹{Math.max(0, (pkg.price || 0) - highestOwnedPrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
                      <p className="text-xl font-black text-slate-900">₹{(pkg.price || 0).toLocaleString('en-IN')}</p>
                    </>
                  )}
                </div>
              </div>

              {isOwned ? (
                <button
                  onClick={() => navigate(`/student/packages/${pkg.id}`)}
                  className="relative w-full mt-6 py-3 border border-slate-200 text-slate-700 hover:border-primary hover:text-primary rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  View Package
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/student/checkout?package_id=${pkg.id}`)}
                  className="group/btn relative overflow-hidden w-full mt-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                  <ShoppingCart className="w-4 h-4 relative" /> <span className="relative">Upgrade Now</span>
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
