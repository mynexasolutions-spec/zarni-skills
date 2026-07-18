import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Star, Image, Check, ArrowRight } from 'lucide-react';

export default function PackageCard({ pkg, index }) {
  const isPopular = index === 1;
  let features = pkg.what_you_get
    ? pkg.what_you_get.split('\n').filter(item => item.trim()).slice(0, 5)
    : (pkg.courses || []).slice(0, 5).map(c => c.title);
  const isCourseFallback = !pkg.what_you_get && pkg.courses;

  return (
    <div className={`relative flex flex-col h-full bg-white rounded-[1.75rem] overflow-visible border-2 ${
      isPopular ? 'border-primary shadow-[0_20px_50px_-15px_rgba(43,128,240,0.3)]' : 'border-slate-100 shadow-sm'
    } hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-15px_rgba(43,128,240,0.22)] transition-all duration-500 group`}>

      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-primary to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5 whitespace-nowrap">
          <Star className="w-3 h-3" fill="currentColor" />
          Best Seller
        </span>
      )}

      {/* Display panel — real package artwork */}
      <div className="p-4 pt-6">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 flex items-center justify-center relative">
          {pkg.thumbnail_display_url ? (
            <img
              src={pkg.thumbnail_display_url}
              alt={pkg.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <Image className="w-16 h-16 text-white/25" strokeWidth={1.5} />
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-6 pb-6">
        <div className="inline-flex items-center gap-1.5 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2.5">
          <Package className="w-2.5 h-2.5 shrink-0" strokeWidth={2.5} />
          Bundle Package
        </div>

        <h3 className="text-lg font-black text-slate-900 uppercase leading-snug group-hover:text-primary transition-colors duration-300">
          {pkg.name}
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-4">
          {index === 0 ? 'Kickstart your learning journey' : index === 1 ? 'Advance your career skills' : 'Master in-demand high income skills'}
        </p>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className={`text-2xl font-black ${isPopular ? 'text-primary' : 'text-slate-900'}`}>₹{Number(pkg.price).toLocaleString()}</span>
          <span className="text-xs text-slate-400 line-through">₹{Number(pkg.price * 2).toLocaleString()}</span>
        </div>
        <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mb-5 inline-block w-fit">SAVE 50% TODAY</span>

        {features.length > 0 && (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What you get</p>
            <ul className="space-y-2 flex-1 mb-6">
              {features.map((item, fidx) => (
                <li key={fidx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium py-0.5">
                  <div className={`w-4 h-4 rounded-full ${isPopular ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-slate-400'} flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300`}>
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                  <span>{isCourseFallback ? item : item.replace('✓', '').trim()}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          to={`/packages/${pkg.id}`}
          className={`group/btn relative w-full py-3.5 px-6 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 text-center transition-all duration-300 hover:-translate-y-0.5 uppercase tracking-widest overflow-hidden ${
            isPopular ? 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40' : 'bg-white border-2 border-slate-200 hover:border-primary text-slate-700 hover:text-primary'
          }`}
        >
          {isPopular && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
          )}
          Choose Package
          <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
