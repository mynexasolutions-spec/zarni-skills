import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck, Play, Layers, CheckCircle2, Sparkles, ShoppingCart, Award, Infinity as InfinityIcon } from 'lucide-react';
import api from '../../utils/api';

export default function StudentPackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        const [globalRes, dashboardRes] = await Promise.all([
          api.get('/global-data'),
          api.get('/student/dashboard'),
        ]);
        const found = globalRes.data.packages.find(p => String(p.id) === id);
        setPkg(found || null);
        setIsOwned((dashboardRes.data.purchased_package_ids || []).includes(Number(id)));
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Package not found</h3>
      </div>
    );
  }

  const courses = pkg.courses || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-slate-800">

      {/* Back Button */}
      <button onClick={() => navigate('/student/packages')} className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 group font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Packages</span>
      </button>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 text-white mb-12"
        style={{ background: 'linear-gradient(135deg, #0b1428 0%, #101c4a 55%, #1a2f6e 100%)' }}>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-primary/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          {isOwned && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/30 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" /> You own this package
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-5">{pkg.name}</h1>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> {courses.length} Courses
            </span>
            <span className="px-4 py-1.5 bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
              <InfinityIcon className="w-3 h-3" /> {pkg.pkg_duration || 'Lifetime Access'}
            </span>
            <span className="px-4 py-1.5 bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
              <Award className="w-3 h-3" /> Certified
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-12">

          {/* Included Courses */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">What's Inside</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{courses.length} Professional Courses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course, idx) => (
                <div
                  key={course.id}
                  onClick={() => isOwned && navigate(`/student/watch/${course.id}`)}
                  className={`group relative flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 animate-fade-in-up ${isOwned ? 'cursor-pointer' : ''}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[11px] font-black text-slate-400">
                    {idx + 1}
                  </span>
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                    {course.thumbnail_display_url ? (
                      <img src={course.thumbnail_display_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{course.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{course.level || 'All Levels'}</p>
                  </div>
                  {isOwned ? (
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <Play className="w-4 h-4 fill-current" />
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-sm text-slate-400 col-span-2 py-8 text-center">No courses added to this package yet.</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest">Description</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{pkg.description || 'A comprehensive bundle of professional courses designed to accelerate your career growth.'}</p>
          </div>

        </div>

        {/* Right Column: Sidebar Stats */}
        <div>
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm sticky top-24">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-6 bg-slate-50 flex items-center justify-center">
              {pkg.thumbnail_display_url ? (
                <img src={pkg.thumbnail_display_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <Layers className="w-16 h-16 text-primary/20" />
              )}
            </div>

            {!isOwned && (
              <p className="text-3xl font-black text-slate-900 mb-4">₹{pkg.price.toLocaleString('en-IN')}</p>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3.5 border-b">
                <span className="text-xs font-bold text-slate-405 uppercase">Courses</span>
                <span className="text-sm font-black text-slate-900">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b">
                <span className="text-xs font-bold text-slate-405 uppercase">Certificate</span>
                <span className="text-sm font-black text-emerald-500">Yes</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b">
                <span className="text-xs font-bold text-slate-405 uppercase">Access</span>
                <span className="text-sm font-black text-slate-900">Lifetime</span>
              </div>
            </div>

            {isOwned ? (
              <button
                onClick={() => courses[0] && navigate(`/student/watch/${courses[0].id}`)}
                disabled={courses.length === 0}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" /> Continue Learning
              </button>
            ) : (
              <button
                onClick={() => navigate(`/student/checkout?package_id=${pkg.id}`)}
                className="w-full mt-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                <ShoppingCart className="w-4 h-4" /> Buy Now
              </button>
            )}

            <div className="mt-6 p-5 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[11px] text-primary font-black uppercase text-center mb-2 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Affiliate Earning
              </p>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <span className="block text-xl font-black text-primary">{pkg.level1_commission_percent || 0}%</span>
                  <span className="text-[9px] text-primary/60 font-bold uppercase">Direct</span>
                </div>
                <div className="w-px h-8 bg-primary/10"></div>
                <div className="text-center">
                  <span className="block text-xl font-black text-primary">{pkg.level2_commission_percent || 0}%</span>
                  <span className="text-[9px] text-primary/60 font-bold uppercase">Passive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
