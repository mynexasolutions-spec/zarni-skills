import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpCircle, Layers, CheckCircle2, ShoppingCart, Sparkles, Crown,
  TrendingUp, Wallet, ArrowRight, PartyPopper, BookOpen,
} from 'lucide-react';
import api from '../../utils/api';

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

export default function Upgrade() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const owned = packages.filter((p) => purchasedIds.includes(p.id));
  const currentPackage = owned.reduce(
    (best, p) => ((p.price || 0) > (best?.price || 0) ? p : best), null);
  // The server credits the highest package already paid for, whichever tier is
  // being bought — so that same figure drives every breakdown on this page.
  const credit = currentPackage?.price || 0;

  // Only tiers above what's already owned: anything at or below is either
  // already theirs or a downgrade, and neither is an upgrade offer.
  const upgrades = packages
    .filter((p) => !purchasedIds.includes(p.id) && (p.price || 0) > credit)
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  // Credit is a flat carry-over, so jumping straight to the top tier costs less
  // in total than stepping through each one — that's the real best value.
  const bestValueId = upgrades.length > 1 ? upgrades[upgrades.length - 1].id : null;

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up pb-12">

      <div className="flex items-center gap-3">
        <ArrowUpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
        <h2 className="text-xl sm:text-2xl font-black">Upgrade Package</h2>
      </div>

      {/* Where they stand today */}
      <div className="relative">
        <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#070d20]"></div>
          <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-blue-600/55 blur-[80px] animate-blob"></div>
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-indigo-600/45 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(7,13,32,0.70) 0%, rgba(7,13,32,0.45) 45%, rgba(7,13,32,0.94) 100%)' }}></div>
        </div>

        <div className="relative overflow-hidden rounded-[2.2rem] p-5 sm:p-8 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(8,15,40,0.45)]">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
          <Layers className="absolute right-5 top-5 w-28 h-28 sm:w-40 sm:h-40 text-blue-300/[0.07] rotate-6 pointer-events-none" strokeWidth={1} />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3 text-amber-300" /> Level Up
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-black leading-tight bg-gradient-to-b from-white to-blue-100 bg-clip-text text-transparent">
                {currentPackage
                  ? `You're on ${currentPackage.name}`
                  : 'Start with your first package'}
              </h3>
              <p className="text-blue-100/75 text-xs sm:text-sm font-medium mt-2 max-w-lg">
                {currentPackage
                  ? 'Everything you already paid comes off the price of any higher package — you never pay twice for the same tier.'
                  : 'Pick a package to unlock its courses and start earning affiliate commission.'}
              </p>
            </div>

            {currentPackage && (
              <div className="shrink-0 lg:w-[300px] rounded-2xl bg-black/35 border border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-400/15 border border-emerald-300/30 flex items-center justify-center shrink-0">
                    <Wallet className="w-4.5 h-4.5 text-emerald-300" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45">Your Upgrade Credit</p>
                    <p className="font-heading text-2xl font-black text-emerald-300 leading-none tabular-nums mt-1">{inr(credit)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/45 leading-relaxed mt-3">
                  Deducted automatically at checkout on any package above this one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {upgrades.length === 0 ? (
        /* Two different "nothing to show" cases — owning the top tier is a win
           and should not look like an error. */
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
          <span className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></span>
          <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></span>

          <div className="relative">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <span className="absolute inset-0 rounded-3xl bg-amber-400/25 blur-xl animate-pulse"></span>
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                {currentPackage ? <Crown className="w-9 h-9 text-white" fill="currentColor" /> : <BookOpen className="w-9 h-9 text-white" />}
              </div>
            </div>

            {currentPackage ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-3">
                  <PartyPopper className="w-3 h-3" /> Top Tier Unlocked
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900">
                  You're already on the highest package
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-2.5 max-w-md mx-auto leading-relaxed">
                  <strong className="text-slate-700">{currentPackage.name}</strong> is the biggest bundle we offer right now, so there's nothing left to upgrade to.
                  When a new package launches it will show up here automatically.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-6">
                  <button
                    onClick={() => navigate('/student/packages')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/25 hover:-translate-y-0.5 transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" /> Go to my packages
                  </button>
                  <button
                    onClick={() => navigate('/student/referrals')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Start earning
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900">No packages available yet</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-2.5 max-w-sm mx-auto leading-relaxed">
                  Our team hasn't published any packages right now. Check back soon.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ArrowUpCircle className="w-4.5 h-4.5" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Available Upgrades
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                {currentPackage ? `Packages above ${currentPackage.name}` : 'Every package you can start with'}
              </p>
            </div>
            <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 tabular-nums">
              {upgrades.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {upgrades.map((pkg) => {
              const price = pkg.price || 0;
              const payable = Math.max(0, price - credit);
              const isBest = pkg.id === bestValueId;
              const extraCourses = (pkg.courses?.length || 0) - (currentPackage?.courses?.length || 0);

              return (
                <div
                  key={pkg.id}
                  className={`group relative overflow-hidden bg-white rounded-3xl shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                    isBest ? 'border-2 border-amber-300 shadow-[0_16px_40px_-16px_rgba(217,164,65,0.5)]' : 'border border-slate-200/80'
                  }`}
                >
                  {isBest && (
                    <>
                      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-20"></span>
                      <span className="absolute top-0 right-5 z-20 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-b-lg shadow-md flex items-center gap-1">
                        <Crown className="w-3 h-3" fill="currentColor" /> Best value
                      </span>
                    </>
                  )}

                  <div className="p-6 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 mb-4">
                      <Layers className="w-5 h-5" />
                    </div>

                    <h3 className="font-heading font-black text-slate-900 text-base uppercase tracking-wide">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {pkg.description || 'Unlock more courses and a higher affiliate commission tier.'}
                    </p>

                    {extraCourses > 0 && (
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full mt-3">
                        <CheckCircle2 className="w-3 h-3" /> +{extraCourses} more courses
                      </p>
                    )}

                    {/* Price breakdown — the whole point of this page */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide">Package price</p>
                        <p className="text-sm font-bold text-slate-600 tabular-nums">{inr(price)}</p>
                      </div>
                      {credit > 0 && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide">Your credit</p>
                          <p className="text-sm font-bold text-emerald-600 tabular-nums">&minus;{inr(credit)}</p>
                        </div>
                      )}
                      <div className="border-t border-dashed border-slate-300 mt-3 pt-3 flex items-baseline justify-between gap-2">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wide">You pay</p>
                        <p className="font-heading text-2xl font-black text-primary tabular-nums leading-none">{inr(payable)}</p>
                      </div>
                      {credit > 0 && (
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                          You save {inr(credit)} because {currentPackage.name} is already paid for.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      onClick={() => navigate(`/student/checkout?package_id=${pkg.public_code}`)}
                      className={`group/btn relative overflow-hidden w-full py-3.5 rounded-2xl text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 ring-1 ring-inset ring-white/25 shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                        isBest ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/30' : 'bg-gradient-to-r from-primary to-indigo-600 shadow-primary/25'
                      }`}
                    >
                      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></span>
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                      <ShoppingCart className="w-4 h-4 relative" />
                      <span className="relative">Upgrade for {inr(payable)}</span>
                      <ArrowRight className="w-4 h-4 relative" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
