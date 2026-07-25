import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck, Play, Layers, CheckCircle2, Sparkles, ShoppingCart, Award, Infinity as InfinityIcon, ChevronRight, Lock, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';

export default function StudentPackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        const [globalRes, ownedRes] = await Promise.all([
          api.get('/global-data'),
          api.get('/student/purchased-packages'),
        ]);
        const found = globalRes.data.packages.find(p => String(p.id) === id);
        setPkg(found || null);
        setIsOwned((ownedRes.data.purchased_package_ids || []).includes(Number(id)));
      } catch (err) {
        console.error('Error fetching student package details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackageDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Package Details...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
          <Layers className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-heading font-black text-slate-900 mb-2">Package Not Found</h3>
        <button
          onClick={() => navigate('/student/packages')}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-500/20"
        >
          Return to Packages
        </button>
      </div>
    );
  }

  const courses = pkg.courses || [];
  const whatYouGet = (pkg.what_you_get || '').split('\n').map(s => s.trim()).filter(Boolean);

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up pb-16">

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/packages')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group font-extrabold text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My Packages</span>
        </button>

        {isOwned && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Package Unlocked
          </span>
        )}
      </div>

      {/* HERO BANNER (Light Premium Styling) */}
      <Reveal variant="scale-in" duration={700}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-blue-50/50 to-slate-50 border border-slate-200/90 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-400/10 to-transparent pointer-events-none rounded-full blur-3xl"></div>

          <div className="relative z-10">
            {isOwned ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-4 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Student Membership
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-700 mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Premium Skill Bundle
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 leading-tight mb-5 tracking-tight">
              {pkg.name}
            </h1>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <span className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> {courses.length} Courses Included
              </span>
              <span className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                <InfinityIcon className="w-3.5 h-3.5 text-indigo-600" /> {pkg.pkg_duration || 'Lifetime Access'}
              </span>
              <span className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Industry Certification
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

        {/* Left Column: Curriculum & Description */}
        <div className="lg:col-span-2 space-y-8">

          {/* Included Courses Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black text-slate-900">What's Inside</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{courses.length} Professional Modules</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course, idx) => (
                <div
                  key={course.id}
                  onClick={() => isOwned && navigate(`/student/watch/${course.id}`)}
                  className={`group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 hover:shadow-md transition-all duration-300 ${isOwned ? 'cursor-pointer' : ''}`}
                >
                  <span className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-[11px] font-black text-slate-500">
                    {idx + 1}
                  </span>
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center border border-slate-100">
                    {course.thumbnail_display_url ? (
                      <img src={course.thumbnail_display_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 leading-snug break-words group-hover:text-blue-600 transition-colors">{course.title}</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{course.level || 'All Levels'}</p>
                  </div>
                  {isOwned ? (
                    <span className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </span>
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>
              ))}
              {courses.length === 0 && (
                <div className="col-span-2 bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-sm text-slate-400 font-medium">No courses added to this package yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">About Package</h3>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">{pkg.description}</p>
            </div>
          )}

          {/* What's Included */}
          {whatYouGet.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Highlights Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whatYouGet.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200/70 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sidebar Action Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.05)] lg:sticky lg:top-24 space-y-6">
            
            {/* Thumbnail preview */}
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80">
              {pkg.thumbnail_display_url ? (
                <img src={pkg.thumbnail_display_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-blue-400" />
                </div>
              )}
            </div>

            {!isOwned && (
              <div>
                <p className="text-xs text-slate-400 line-through font-bold uppercase tracking-wider">₹{Number(pkg.price * 2).toLocaleString()}</p>
                <p className="text-4xl font-heading font-black text-slate-900">₹{pkg.price.toLocaleString('en-IN')}</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-400 uppercase">Courses</span>
                <span className="font-black text-slate-900">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-400 uppercase">Certificate</span>
                <span className="font-black text-emerald-600">Included</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-400 uppercase">Access</span>
                <span className="font-black text-slate-900">Lifetime</span>
              </div>
            </div>

            {/* Action CTA Button */}
            {isOwned ? (
              <button
                onClick={() => courses[0] && navigate(`/student/watch/${courses[0].id}`)}
                disabled={courses.length === 0}
                className="group relative overflow-hidden w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                <Play className="w-4 h-4 fill-current relative" /> <span className="relative">Start Learning</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(`/student/checkout?package_id=${pkg.id}`)}
                className="group relative overflow-hidden w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                <ShoppingCart className="w-4 h-4 relative" /> <span className="relative">Buy This Package</span>
              </button>
            )}

            {/* Affiliate Commission Preview */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-center space-y-2">
              <p className="text-[10px] text-blue-700 font-black uppercase tracking-widest flex items-center justify-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Affiliate Commission Earnings
              </p>
              <div className="flex justify-around items-center pt-1">
                <div>
                  <span className="block text-lg font-black text-emerald-600">{pkg.level1_commission_percent || 0}%</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Direct L1</span>
                </div>
                <div className="w-px h-6 bg-blue-200"></div>
                <div>
                  <span className="block text-lg font-black text-blue-600">{pkg.level2_commission_percent || 0}%</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Passive L2</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
