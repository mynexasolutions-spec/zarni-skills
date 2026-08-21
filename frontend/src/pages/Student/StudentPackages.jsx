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
  // Checkout credits the highest package already paid for, so the same figure
  // drives every "you pay" line here — the page can't disagree with checkout.
  const currentPackage = packages
    .filter(p => purchasedIds.includes(p.id))
    .reduce((best, p) => ((p.price || 0) > (best?.price || 0) ? p : best), null);
  const credit = currentPackage?.price || 0;

  // Packages are cumulative, so a cheaper tier is already covered by the one
  // they own — offering it for sale would be selling them nothing.
  const isSuperseded = (pkg) => !purchasedIds.includes(pkg.id) && (pkg.price || 0) <= credit && credit > 0;

  const upgradable = packages.filter(p => !purchasedIds.includes(p.id) && (p.price || 0) > credit);
  const bestValueId = upgradable.length > 1
    ? [...upgradable].sort((a, b) => (b.price || 0) - (a.price || 0))[0].id
    : null;

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── HERO — aurora field behind a glass panel, matching the rest of the
             dashboard. Tilt is scoped to hover so an idle card carries no
             transform layer. ─────────────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div className="relative">
          <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[#070d20]"></div>
            <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-blue-600/55 blur-[80px] animate-blob"></div>
            <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-indigo-600/45 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(7,13,32,0.70) 0%, rgba(7,13,32,0.45) 45%, rgba(7,13,32,0.94) 100%)' }}></div>
          </div>

          <div
            ref={tiltHeroRef}
            onMouseMove={onHeroMove}
            onMouseLeave={onHeroLeave}
            className="relative rounded-[2.5rem] p-6 sm:p-10 text-white overflow-hidden bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(8,15,40,0.45)] transition-transform duration-300 hover:[transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] hover:will-change-transform"
          >
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
            <Layers className="absolute right-5 top-5 w-28 h-28 sm:w-44 sm:h-44 text-blue-300/[0.07] rotate-6 pointer-events-none" strokeWidth={1} />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
              <div className="max-w-xl min-w-0">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Official Skill Bundles
                </div>
                <h1 className="text-3xl sm:text-5xl font-heading font-black leading-[1.08] tracking-tight">
                  <span className="bg-gradient-to-b from-white to-blue-100 bg-clip-text text-transparent">Explore &amp; Upgrade Your </span>
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">Packages</span>
                </h1>
                <p className="text-blue-100/75 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mt-3">
                  {currentPackage
                    ? `You're on ${currentPackage.name}. Everything you've paid comes off the price of any bigger bundle.`
                    : 'Unlock high-ticket courses, student perks, and a higher referral commission tier.'}
                </p>
              </div>

              {/* Three counts, so nothing has to be inferred */}
              <div className="grid grid-cols-3 gap-2.5 shrink-0 lg:w-[330px]">
                {[
                  { label: 'Bundles', value: packages.length, color: '#60a5fa', Icon: Package },
                  { label: 'Owned', value: ownedCount, color: '#34d399', Icon: CheckCircle },
                  { label: 'To Go', value: upgradable.length, color: '#fbbf24', Icon: TrendingUp },
                ].map(({ label, value, color, Icon }) => (
                  <div key={label} className="rounded-2xl bg-black/35 border border-white/10 px-3 py-3.5 text-center">
                    <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} strokeWidth={2.4} />
                    <p className="font-heading text-2xl font-black leading-none tabular-nums" style={{ color }}>{value}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45 mt-1.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {credit > 0 && (
              <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-400/15 border border-emerald-300/30 flex items-center justify-center shrink-0">
                  <Wallet className="w-4.5 h-4.5 text-emerald-300" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45">Your Upgrade Credit</p>
                  <p className="font-heading text-xl sm:text-2xl font-black text-emerald-300 leading-none tabular-nums mt-1">
                    ₹{credit.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-[10px] text-white/45 leading-relaxed ml-auto text-right hidden sm:block max-w-[220px]">
                  Deducted automatically at checkout on any bigger bundle.
                </p>
              </div>
            )}
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
                const superseded = isSuperseded(pkg);
                const isBestValue = pkg.id === bestValueId;
                const payable = Math.max(0, (pkg.price || 0) - credit);
                return (
                  <div
                    key={pkg.id}
                    className="group relative flex flex-col justify-between bg-white rounded-[2.5rem] border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  >
                    {isBestValue && (
                      <div className="absolute top-0 right-0 z-20">
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-slate-950" /> Best value
                        </span>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 pb-0">
                      {/* Package Thumbnail display - 3:4 aspect ratio without cutting off */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-500">
                        {pkg.thumbnail_display_url ? (
                          <img
                            src={pkg.thumbnail_display_url}
                            alt={pkg.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <Layers className="w-14 h-14 text-white/20" strokeWidth={1.5} />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-transparent to-slate-950/75 pointer-events-none"></div>

                        {isOwned ? (
                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" /> Owned
                          </span>
                        ) : superseded ? (
                          <span className="absolute top-3 left-3 bg-slate-800 text-slate-200 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/10">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Already covered
                          </span>
                        ) : (
                          <span className="absolute top-3 left-3 bg-white text-slate-900 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
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

                        {isOwned ? (
                          <p className="text-2xl font-heading font-black text-emerald-600">
                            ₹{(pkg.price || 0).toLocaleString('en-IN')}
                            <span className="text-xs font-bold text-slate-400 ml-1.5 align-middle font-sans">paid</span>
                          </p>
                        ) : superseded ? (
                          <p className="text-sm font-bold text-slate-500 leading-relaxed">
                            Included in <strong className="text-slate-700">{currentPackage.name}</strong> — no need to buy this.
                          </p>
                        ) : credit > 0 ? (
                          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide">Package price</span>
                              <span className="text-sm font-bold text-slate-600 tabular-nums">₹{(pkg.price || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide">Your credit</span>
                              <span className="text-sm font-bold text-emerald-600 tabular-nums">&minus;₹{credit.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="border-t border-dashed border-slate-300 mt-2.5 pt-2.5 flex items-baseline justify-between">
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wide">You pay</span>
                              <span className="font-heading text-2xl font-black text-blue-600 tabular-nums leading-none">₹{payable.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-3xl font-heading font-black text-slate-900">
                            ₹{(pkg.price || 0).toLocaleString('en-IN')}
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

                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        {isOwned || superseded ? (
                          <button
                            onClick={() => navigate(`/student/packages/${superseded ? currentPackage.id : pkg.id}`)}
                            className="group/btn w-full py-3.5 border-2 border-slate-200 text-slate-800 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300"
                          >
                            <Eye className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" /> {superseded ? `Open ${currentPackage.name}` : 'Access Bundle Content'}
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/student/checkout?package_id=${pkg.public_code}`)}
                            className="group/btn relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                          >
                            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></span>
                            <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" /> {credit > 0 ? `Upgrade for ₹${payable.toLocaleString('en-IN')}` : 'Unlock Package Now'} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
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

