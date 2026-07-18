import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShoppingCart, CheckCircle, Eye, Sparkles, Clock, BookOpen, TrendingUp, Wallet, Package } from 'lucide-react';
import api from '../../utils/api';

export default function StudentPackages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentPackages = async () => {
      try {
        const response = await api.get('/global-data');
        setPackages(response.data.packages || []);
        // Match user's order lists to identify owned packages
        const userDetails = await api.get('/student/dashboard');
        setPurchasedIds(userDetails.data.purchased_package_ids || []);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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
    <div className="max-w-7xl mx-auto px-6 py-12 text-slate-800">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-white mb-8 shadow-[0_25px_60px_-20px_rgba(11,20,40,0.55)]"
        style={{ background: 'linear-gradient(135deg, #0b1428 0%, #101c4a 55%, #1a2f6e 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}>
        </div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-primary/25 rounded-full blur-[100px] pointer-events-none animate-[blob_7s_infinite]"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none animate-[blob_7s_infinite_reverse]"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-primary-light mb-4 shadow-sm shadow-primary/10">
            <Sparkles className="w-3.5 h-3.5" /> Premium Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
            Explore & Upgrade Your <span className="bg-gradient-to-r from-primary-light via-indigo-300 to-primary-light bg-clip-text text-transparent">Packages</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">Pick a package below to unlock its courses and start earning commissions on every referral.</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="group bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{packages.length}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">Available</p>
          </div>
        </div>
        <div className="group bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{ownedCount}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">Owned</p>
          </div>
        </div>
        <div className="group bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-black text-slate-900 leading-none truncate">₹{totalInvested.toLocaleString('en-IN')}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">Invested</p>
          </div>
        </div>
      </div>

      <section>
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => {
              const isOwned = purchasedIds.includes(pkg.id);
              const isBestValue = pkg.id === bestValueId && !isOwned;
              return (
                <div
                  key={pkg.id}
                  className="group relative animate-fade-in-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Glow border on hover */}
                  <div className={`absolute -inset-0.5 rounded-[1.7rem] bg-gradient-to-r from-primary to-indigo-600 opacity-0 group-hover:opacity-100 blur-[6px] transition-opacity duration-500 pointer-events-none ${isBestValue ? 'opacity-40' : ''}`}></div>

                  <div className={`relative flex flex-col justify-between bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
                    isBestValue
                      ? 'border-2 border-primary shadow-[0_20px_45px_-15px_rgba(43,128,240,0.35)] group-hover:-translate-y-2'
                      : 'border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-900/[0.06] group-hover:-translate-y-1.5'
                  }`}>
                    {isBestValue && (
                      <span className="absolute top-0 right-6 z-10 bg-gradient-to-r from-primary to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-b-lg shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Best Value
                      </span>
                    )}

                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {pkg.thumbnail_display_url ? (
                        <img
                          src={pkg.thumbnail_display_url}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30 bg-gradient-to-br from-primary/5 to-indigo-50">
                          <Layers className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/5 to-transparent group-hover:from-slate-900/70 transition-colors duration-500"></div>
                      {isOwned ? (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <CheckCircle className="w-3.5 h-3.5" /> Owned
                        </span>
                      ) : (
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                          Premium
                        </span>
                      )}
                      <h3 className="absolute bottom-3 left-4 right-4 font-heading font-black text-white text-base leading-snug drop-shadow-md line-clamp-1">{pkg.name}</h3>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        {!isOwned && (
                          <p className="text-3xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                            ₹{pkg.price.toLocaleString('en-IN')}
                            <span className="text-[11px] font-bold text-slate-400 ml-1.5 align-middle">one-time</span>
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">{pkg.description || 'Gain actionable professional capabilities.'}</p>

                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/70 px-2.5 py-1 rounded-full">
                            <BookOpen className="w-3 h-3" /> {(pkg.courses || []).length} Courses
                          </span>
                          {pkg.pkg_duration && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                              <Clock className="w-3 h-3" /> {pkg.pkg_duration}
                            </span>
                          )}
                          {pkg.level1_commission_percent > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                              <TrendingUp className="w-3 h-3" /> Earn {pkg.level1_commission_percent}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                        {isOwned ? (
                          <button
                            onClick={() => navigate(`/student/packages/${pkg.id}`)}
                            className="group/btn w-full py-3 border border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:bg-primary/5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300"
                          >
                            <Eye className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" /> View Details
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/student/checkout?package_id=${pkg.id}`)}
                            className="group/btn w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                          >
                            <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" /> Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-primary/40" />
            </div>
            No packages catalog listed yet.
          </div>
        )}
      </section>

    </div>
  );
}
