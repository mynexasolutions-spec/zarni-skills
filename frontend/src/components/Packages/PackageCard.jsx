import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, Image, Check, ArrowRight, Sparkles, Flame, ShieldCheck, CheckCircle2 } from 'lucide-react';
import useTilt from '../../hooks/useTilt';

export default function PackageCard({ pkg, index, owned = false }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(5);
  const isPopular = index === 1;
  let features = pkg.what_you_get
    ? pkg.what_you_get.split('\n').filter(item => item.trim()).slice(0, 5)
    : (pkg.courses || []).slice(0, 5).map(c => c.title);
  const isCourseFallback = !pkg.what_you_get && pkg.courses;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`group relative flex flex-col h-full bg-white rounded-[2.25rem] overflow-hidden border-2 ${
        isPopular ? 'border-blue-500 shadow-[0_20px_50px_rgba(37,99,235,0.18)]' : 'border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.03)]'
      } hover:shadow-[0_25px_65px_rgba(37,99,235,0.22)] hover:border-blue-400 transition-all duration-500 [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform`}
    >
      {/* Top Shimmer line for popular card */}
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 z-30"></div>
      )}

      {/* Glare spotlight */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
        style={{ background: `radial-gradient(280px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(59,130,246,0.14), transparent 70%)` }}
      ></span>

      {isPopular && !owned && (
        <span className="absolute top-4 right-4 z-30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
          <Star className="w-3 h-3 fill-current" />
          Best Value Bundle
        </span>
      )}
      {owned && (
        <span className="absolute top-4 right-4 z-30 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={3} />
          Already Purchased
        </span>
      )}

      {/* Package Thumbnail Display */}
      <div className="p-4 pt-5 relative z-10">
        <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center relative shadow-inner">
          {pkg.thumbnail_display_url ? (
            <img
              src={pkg.thumbnail_display_url}
              alt={pkg.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center">
              <Package className="w-16 h-16 text-white/40" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-6 pb-6 relative z-10">
        <div className="inline-flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2">
          <Sparkles className="w-3 h-3 shrink-0 text-blue-500 animate-spin-slow" strokeWidth={2.5} />
          Certified Skill Bundle
        </div>

        <h3 className="text-xl font-heading font-black text-slate-900 uppercase leading-snug group-hover:text-blue-600 transition-colors duration-300">
          {pkg.name}
        </h3>
        <p className="text-xs text-slate-400 font-bold mt-1 mb-4">
          {index === 0 ? 'Kickstart your learning journey' : index === 1 ? 'Accelerate career & freelance income' : 'Master high-income skills'}
        </p>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-heading font-black text-slate-900">₹{Number(pkg.price).toLocaleString()}</span>
          <span className="text-xs text-slate-400 line-through font-bold">₹{Number(pkg.price * 2).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            50% Off Limited Deal
          </span>
          {pkg.courses?.length > 0 && (
            <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {pkg.courses.length} Courses Inside
            </span>
          )}
        </div>

        {features.length > 0 && (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Included Skill Modules</p>
            <ul className="space-y-2 flex-1 mb-6">
              {features.map((item, fidx) => (
                <li key={fidx} className="flex items-center gap-2.5 text-xs text-slate-700 font-bold py-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                  <span className="truncate">{isCourseFallback ? item : item.replace('✓', '').trim()}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          to={owned ? `/student/packages/${pkg.id}` : `/packages/${pkg.public_code || pkg.id}`}
          className={`group/btn relative w-full py-4 px-6 rounded-2xl font-black text-xs inline-flex items-center justify-center gap-2 text-center transition-all duration-300 uppercase tracking-widest overflow-hidden ${
            owned
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-95'
              : isPopular
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95'
              : 'bg-slate-900 hover:bg-blue-600 text-white shadow-md active:scale-95'
          }`}
        >
          {owned ? <CheckCircle2 className="relative z-10 w-4 h-4 shrink-0" strokeWidth={2.5} /> : null}
          <span className="relative z-10">{owned ? 'View in My Packages' : 'Choose Package'}</span>
          <ArrowRight className="relative z-10 w-4 h-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

