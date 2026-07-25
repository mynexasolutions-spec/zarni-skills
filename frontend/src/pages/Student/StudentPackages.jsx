import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShoppingCart, CheckCircle, Eye, Sparkles, Clock, BookOpen, TrendingUp, Wallet, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

export default function StudentPackages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  useEffect(() => {
    const fetchStudentPackages = async () => {
      try {
        const [globalRes, ownedRes] = await Promise.all([
          api.get('/global-data'),
          api.get('/student/purchased-packages'),
        ]);
        setPackages(globalRes.data.packages || []);
        setPurchasedIds(ownedRes.data.purchased_package_ids || []);
      } catch (err) {
        console.error('Error fetching student packages layout', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentPackages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Premium Packages...</p>
        </div>
      </div>
    );
  }

  const ownedCount = packages.filter(p => purchasedIds.includes(p.id)).length;
  const totalInvested = packages
    .filter(p => purchasedIds.includes(p.id))
    .reduce((sum, p) => sum + (p.price || 0), 0);
  const bestValueId = packages.length > 0
    ? [...packages].sort((a, b) => (b.price || 0) - (a.price || 0))[0].id
    : null;

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO BANNER ────────────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-12 text-white shadow-2xl shadow-blue-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Glows & Shimmer */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-5 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Official Skill Bundles
              </div>
              <h1 className="text-3xl sm:text-5xl font-heading font-black leading-tight tracking-tight mb-4 text-white">
                Explore & Upgrade Your <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">Packages</span>
              </h1>
              <p className="text-blue-100/80 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                Unlock high-ticket digital mastery courses, access exclusive student perks, and maximize your referral commission potential.
              </p>
            </div>

            {/* Micro Quick Status Card */}
            <div className="group relative w-full lg:w-72 shrink-0 rounded-3xl p-5 bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Catalog Tier</span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  <ShieldCheck className="w-3 h-3" /> Partner Access
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70 font-medium">Bundles Available</span>
                  <span className="font-heading font-black text-white">{packages.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70 font-medium">Owned Bundles</span>
                  <span className="font-heading font-black text-emerald-400">{ownedCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
      <Reveal variant="fade-up" delay={150}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="group relative bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <AnimatedNumber value={packages.length} duration={800} className="block text-2xl font-heading font-black text-slate-900 leading-none" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Available Catalog</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-inner">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <AnimatedNumber value={ownedCount} duration={800} className="block text-2xl font-heading font-black text-slate-900 leading-none" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Unlocked Packages</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-inner">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <AnimatedNumber value={totalInvested} prefix="₹" duration={1200} className="block text-2xl font-heading font-black text-slate-900 leading-none truncate" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Total Learning Value</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── PACKAGES GRID ───────────────────────────────────────────────── */}
      <Reveal variant="fade-up" delay={250}>
        <section>
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {packages.map((pkg, idx) => {
                const isOwned = purchasedIds.includes(pkg.id);
                const isBestValue = pkg.id === bestValueId && !isOwned;
                return (
                  <div
                    key={pkg.id}
                    className="group relative flex flex-col justify-between bg-white rounded-[2.5rem] border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  >
                    {isBestValue && (
                      <div className="absolute top-0 right-0 z-20">
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-slate-950" /> Popular Choice
                        </span>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 pb-0">
                      {/* Package Thumbnail display - 3:4 aspect ratio without cutting off */}
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-500">
                        {pkg.thumbnail_display_url ? (
                          <img
                            src={pkg.thumbnail_display_url}
                            alt={pkg.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <Layers className="w-14 h-14 text-white/20" strokeWidth={1.5} />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80"></div>

                        {isOwned ? (
                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" /> Unlocked & Owned
                          </span>
                        ) : (
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                            Premium Bundle
                          </span>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-amber-300" /> {(pkg.courses || []).length} Included Courses
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-6">
                      <div>
                        <h3 className="font-heading font-black text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors duration-300 mb-2">
                          {pkg.name}
                        </h3>

                        {!isOwned && (
                          <p className="text-3xl font-heading font-black text-slate-900">
                            ₹{pkg.price.toLocaleString('en-IN')}
                            <span className="text-xs font-bold text-slate-400 ml-1.5 align-middle font-sans">one-time investment</span>
                          </p>
                        )}

                        <p className="text-xs font-medium text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                          {pkg.description || 'Actionable digital mastery curriculum designed for rapid growth.'}
                        </p>

                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                          {pkg.pkg_duration && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full">
                              <Clock className="w-3 h-3 text-slate-400" /> {pkg.pkg_duration}
                            </span>
                          )}
                          {pkg.level1_commission_percent > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                              <TrendingUp className="w-3 h-3 text-emerald-600" /> Earn {pkg.level1_commission_percent}% Commission
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        {isOwned ? (
                          <button
                            onClick={() => navigate(`/student/packages/${pkg.id}`)}
                            className="group/btn w-full py-3.5 border-2 border-slate-200 text-slate-800 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300"
                          >
                            <Eye className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" /> Access Bundle Content
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/student/checkout?package_id=${pkg.id}`)}
                            className="group/btn relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                          >
                            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></span>
                            <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" /> Unlock Package Now <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-blue-500">
                <Layers className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-500">No packages catalog listed yet.</p>
            </div>
          )}
        </section>
      </Reveal>

    </div>
  );
}

