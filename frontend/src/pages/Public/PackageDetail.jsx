import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Package, Layers, Clock, Zap, Languages, List, Check, Video, DollarSign, CheckCircle2 } from 'lucide-react';

export default function PackageDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/packages/${id}`)
      .then(res => setPkg(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !pkg) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h3 className="text-lg font-bold">Package not found</h3>
        <Link to="/packages" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest">
          Browse Packages
        </Link>
      </div>
    );
  }

  const whatYouGet = (pkg.what_you_get || '').split('\n').map(s => s.trim()).filter(Boolean);
  const l1 = pkg.level1_commission_percent || 0;
  const l2 = pkg.level2_commission_percent || 0;

  return (
    <div className="bg-slate-50 min-h-screen -mt-24 pt-24">
      {/* Page Banner */}
      <section className="relative py-20 md:py-28 flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, #eef6ff 0%, #f8faff 60%, #f8faff 100%)' }}>
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(43,128,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43,128,240,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px'
          }}>
        </div>
        <div className="absolute -top-16 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute -top-16 right-1/4 w-72 h-72 bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <Package className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            Premium Learning Package
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tight leading-[1.1]">
            {pkg.name}
          </h1>
          {pkg.description && (
            <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto mt-4">
              {pkg.description}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-10 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
          <span className="text-slate-300">/</span>
          <Link to="/packages" className="hover:text-primary transition-colors font-medium">Packages</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">{pkg.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Square Thumbnail with glow */}
            <div className="group relative">
              <div className="absolute -inset-[2px] rounded-[1.9rem] bg-gradient-to-br from-primary via-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-60 blur-[6px] transition-all duration-500 pointer-events-none z-0"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] group-hover:shadow-[0_24px_60px_-12px_rgba(43,128,240,0.2)] transition-all duration-500 z-10 bg-white p-3 border border-slate-100">
                {pkg.thumbnail_display_url ? (
                  <div className="aspect-square w-full relative rounded-[1.5rem] overflow-hidden">
                    <img src={pkg.thumbnail_display_url} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <Layers className="w-3 h-3" strokeWidth={2.5} />
                      Bundle Package
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-gradient-to-br from-primary/80 via-blue-600 to-indigo-700 flex items-center justify-center rounded-[1.5rem]">
                    <div className="text-center text-white p-8">
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-4 font-bold">Zarni Skills</p>
                      <h2 className="font-heading font-black text-4xl md:text-5xl uppercase leading-tight">{pkg.name}</h2>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical details grid */}
            {(pkg.level || pkg.language || pkg.pkg_duration || pkg.courses.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {pkg.pkg_duration && (
                  <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <Clock className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Duration</p>
                    <p className="text-sm font-bold text-slate-800">{pkg.pkg_duration}</p>
                  </div>
                )}
                {pkg.level && (
                  <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <Zap className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Level</p>
                    <p className="text-sm font-bold text-slate-800">{pkg.level}</p>
                  </div>
                )}
                {pkg.language && (
                  <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <Languages className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Language</p>
                    <p className="text-sm font-bold text-slate-800">{pkg.language}</p>
                  </div>
                )}
                <div className="group bg-white border border-slate-100 rounded-2xl p-4 text-center hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <List className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Courses</p>
                  <p className="text-sm font-bold text-slate-800">{pkg.courses.length}</p>
                </div>
              </div>
            )}

            {/* What You Get */}
            {whatYouGet.length > 0 && (
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-indigo-600/5 border border-primary/10 rounded-3xl p-7 sm:p-8">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[70px] pointer-events-none"></div>
                <h2 className="relative text-lg font-heading font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <Check className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </span>
                  What's Included
                </h2>
                <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {whatYouGet.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-sm text-slate-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Courses */}
            {pkg.courses.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-black text-slate-900 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <List className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </span>
                  Comprehensive Curriculum
                  <span className="text-primary ml-auto">{pkg.courses.length} Courses</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pkg.courses.map(course => (
                    <Link key={course.id} to={`/courses/${course.id}`} className="group relative">
                      <div className="absolute -inset-[2px] rounded-[1.9rem] bg-gradient-to-br from-primary via-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-40 blur-[4px] transition-all duration-500 pointer-events-none z-0"></div>

                      <div className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] group-hover:shadow-[0_24px_60px_-12px_rgba(43,128,240,0.2)] group-hover:-translate-y-1.5 transition-all duration-500 z-10 overflow-hidden">
                        <div className="aspect-video w-full relative overflow-hidden">
                          {course.thumbnail_display_url ? (
                            <img src={course.thumbnail_display_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-indigo-600/10 flex items-center justify-center">
                              <Video className="w-12 h-12 text-primary/40" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                            {course.level || 'All Levels'}
                          </div>
                        </div>
                        <div className="p-5 sm:p-6">
                          <h3 className="font-heading font-black text-slate-900 text-sm sm:text-base group-hover:text-primary transition-colors mb-3 uppercase leading-tight line-clamp-2">{course.title}</h3>
                          <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex-wrap">
                            {course.course_duration && <span>{course.course_duration}</span>}
                            {course.course_duration && course.language && <span className="w-1 h-1 rounded-full bg-slate-300"></span>}
                            {course.language && <span>{course.language}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky enrollment card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 group relative">

              <div className="absolute -inset-[1.5px] rounded-[1.9rem] bg-gradient-to-br from-primary via-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-40 blur-[8px] transition-all duration-500 pointer-events-none z-0"></div>

              <div className="relative z-10 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-hover:shadow-[0_24px_60px_-12px_rgba(43,128,240,0.15)] transition-all duration-500 overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-indigo-600"></div>
                <div className="p-6 sm:p-7 space-y-6">

                {/* Price */}
                <div className="text-center pb-6 border-b border-slate-100">
                  <p className="text-sm text-slate-400 line-through font-bold mb-2">₹{Number(pkg.price * 2).toLocaleString()}</p>
                  <p className="text-5xl font-heading font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">₹{Number(pkg.price).toLocaleString()}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping"></span>
                    Save 50%
                  </div>
                </div>

                {/* Commission info */}
                <div className="space-y-3">
                  <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-4 h-4" strokeWidth={2.5} />
                    Referral Earnings
                  </p>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Direct (L1)</span>
                      <span className="font-black text-emerald-600 text-lg">{l1}%</span>
                    </div>
                    <div className="border-t border-slate-200"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Passive (L2)</span>
                      <span className="font-black text-blue-600 text-lg">{l2}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Direct: ₹{Number(pkg.price * l1 / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} | Passive: ₹{Number(pkg.price * l2 / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  {user ? (
                    <Link to={`/student/checkout?package_id=${pkg.id}`}
                      className="group/btn relative w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-primary/20 uppercase tracking-wider overflow-hidden inline-flex items-center justify-center">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></span>
                      Buy This Package
                    </Link>
                  ) : (
                    <>
                      <Link to="/register"
                        className="group/btn relative w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-primary/20 uppercase tracking-wider overflow-hidden inline-flex items-center justify-center">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></span>
                        Enroll Now
                      </Link>
                      <Link to="/login"
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs border border-slate-200 uppercase tracking-wider inline-block text-center">
                        Already Enrolled? Login
                      </Link>
                    </>
                  )}
                </div>

                {/* Trust badges */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                    <span className="text-xs text-slate-600 font-medium">Secure &amp; verified checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                    <span className="text-xs text-slate-600 font-medium">Lifetime access to all {pkg.courses.length} courses</span>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
