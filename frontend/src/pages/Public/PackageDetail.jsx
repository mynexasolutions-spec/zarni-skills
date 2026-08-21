import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';
import { Package, Layers, Clock, Zap, Languages, List, Check, Video, DollarSign, CheckCircle2, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Star } from 'lucide-react';

function TiltThumbnail({ pkg }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(4);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/90 p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_rgba(37,99,235,0.15)] hover:border-blue-300 transition-[transform,box-shadow,border-color] duration-500 hover:[transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] hover:will-change-transform"
    >
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
        style={{ background: `radial-gradient(300px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(59,130,246,0.15), transparent 70%)` }}
      ></span>
      {pkg.thumbnail_display_url ? (
        <div className="aspect-square w-full relative rounded-[2rem] overflow-hidden">
          <img src={pkg.thumbnail_display_url} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute top-4 left-4 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-blue-100">
            <Layers className="w-3.5 h-3.5" strokeWidth={2.5} />
            Master Package
          </div>
        </div>
      ) : (
        <div className="aspect-square w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center rounded-[2rem] p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest mb-4">Zarni Skills Bundle</span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl uppercase leading-tight">{pkg.name}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PackageDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pricingPreview, setPricingPreview] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/packages/${id}`)
      .then(res => setPkg(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Live "already paid" upgrade-credit preview — same numbers the checkout
  // page will actually charge, shown here so a logged-in student sees their
  // real price before clicking through.
  useEffect(() => {
    if (!user || !pkg || pkg.owned) {
      setPricingPreview(null);
      return;
    }
    api.post('/student/checkout/pricing', { package_id: pkg.id })
      .then(res => setPricingPreview(res.data))
      .catch(() => setPricingPreview(null));
  }, [user, pkg]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Package...</p>
        </div>
      </div>
    );
  }

  if (notFound || !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 -mt-24 pt-24">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <Package className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 mb-2">Package Not Found</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">The learning package you are looking for is unavailable.</p>
          <Link to="/packages" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-500/25 transition-transform active:scale-95">
            Browse All Packages <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  const whatYouGet = (pkg.what_you_get || '').split('\n').map(s => s.trim()).filter(Boolean);

  return (
    <div className="min-h-screen text-slate-800 -mt-24 pt-24 pb-24 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-[10%] left-1/4 w-[420px] h-[420px] bg-blue-400/10 blur-[90px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-1/4 w-[380px] h-[380px] bg-indigo-400/10 blur-[90px] rounded-full pointer-events-none z-0"></div>

      {/* Mesh Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '36px 36px' }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Breadcrumb Navigation */}
        <nav className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 flex-wrap uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/packages" className="hover:text-blue-600 transition-colors">Packages</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">{pkg.name}</span>
        </nav>

        {/* HERO BANNER (Light Glass Header) */}
        <Reveal variant="scale-in" duration={700}>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border border-slate-200/90 p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] mb-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-blue-400/10 to-transparent pointer-events-none rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black tracking-[0.25em] uppercase mb-4 shadow-sm">
                <Package className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                Premium Skill Bundle
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
                {pkg.name}
              </h1>
              {pkg.description && (
                <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-3xl">
                  {pkg.description}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* 3D Tilt Thumbnail Container */}
            <TiltThumbnail pkg={pkg} />

            {/* Technical Specs Grid */}
            {(pkg.level || pkg.language || pkg.pkg_duration || pkg.courses.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {pkg.pkg_duration && (
                  <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 border border-blue-100">
                      <Clock className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Duration</p>
                    <p className="text-sm font-black text-slate-900">{pkg.pkg_duration}</p>
                  </div>
                )}
                {pkg.level && (
                  <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 border border-indigo-100">
                      <Zap className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Skill Level</p>
                    <p className="text-sm font-black text-slate-900">{pkg.level}</p>
                  </div>
                )}
                {pkg.language && (
                  <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 border border-sky-100">
                      <Languages className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Language</p>
                    <p className="text-sm font-black text-slate-900">{pkg.language}</p>
                  </div>
                )}
                <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 border border-purple-100">
                    <List className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Total Courses</p>
                  <p className="text-sm font-black text-slate-900">{pkg.courses.length}</p>
                </div>
              </div>
            )}

            {/* What's Included */}
            {whatYouGet.length > 0 && (
              <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  </span>
                  <h2 className="text-xl font-heading font-black text-slate-900">
                    What's Included In This Package
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {whatYouGet.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-xs sm:text-sm text-slate-700 font-bold leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Courses */}
            {pkg.courses.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                      <List className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <h2 className="text-xl font-heading font-black text-slate-900">
                      Courses Bundled ({pkg.courses.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pkg.courses.map(course => (
                    <Link key={course.id} to={`/courses/${course.slug || course.id}`} className="group relative">
                      <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.15)] hover:border-blue-300 hover:-translate-y-1.5 transition-[transform,box-shadow,border-color] duration-500 overflow-hidden">
                        <div className="aspect-video w-full relative overflow-hidden bg-slate-100">
                          {course.thumbnail_display_url ? (
                            <img src={course.thumbnail_display_url} alt={course.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                              <Video className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-sm border border-white">
                            {course.level || 'All Levels'}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-heading font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors mb-2 leading-snug line-clamp-2">{course.title}</h3>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {course.course_duration && <span>{course.course_duration}</span>}
                            {course.course_duration && course.language && <span>•</span>}
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

          {/* Right Column: Sticky Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="relative bg-white rounded-[2.5rem] border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Pricing Box */}
                  <div className="text-center pb-6 border-b border-slate-100">
                    {pricingPreview?.upgrade_credit > 0 ? (
                      <div className="bg-slate-50 rounded-2xl p-4 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Package Price</p>
                          <p className="text-sm font-bold text-slate-600">₹{Number(Math.round(pricingPreview.base_price)).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Already Paid Credit</p>
                          <p className="text-sm font-bold text-emerald-600">−₹{Number(Math.round(pricingPreview.upgrade_credit)).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="border-t border-dashed border-slate-200 mt-2.5 pt-2.5 flex items-center justify-between">
                          <p className="text-xs text-slate-500 font-black uppercase">You Pay</p>
                          <p className="text-2xl font-black text-blue-600">₹{Number(Math.round(pricingPreview.final_amount)).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-slate-400 line-through font-bold mb-1 uppercase tracking-wider">Original Price: ₹{Number(Math.round(pkg.price * 2)).toLocaleString('en-IN')}</p>
                        <p className="text-4xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight">
                          ₹{Number(Math.round(pkg.price)).toLocaleString('en-IN')}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md shadow-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          Limited Time 50% Off
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    {authLoading ? (
                      <div className="w-full py-4 px-4 bg-slate-100 rounded-2xl animate-pulse h-[52px]"></div>
                    ) : user ? (
                      pkg.owned ? (
                        <Link
                          to={`/student/packages/${pkg.id}`}
                          className="group relative w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 text-center overflow-hidden"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                          <span>Go to My Package</span>
                          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                        </Link>
                      ) : (
                        <Link
                          to={`/student/checkout?package_id=${pkg.public_code}`}
                          className="group relative w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 text-center overflow-hidden"
                        >
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                          <span>Buy Package Now</span>
                          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                        </Link>
                      )
                    ) : (
                      <>
                        <Link
                          to={`/register?package_id=${pkg.public_code || pkg.id}`}
                          className="group relative w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 text-center overflow-hidden"
                        >
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                          <span>Enroll & Get Started</span>
                          <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                        </Link>
                        <Link
                          to="/login"
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs border border-slate-200 uppercase tracking-widest inline-block text-center"
                        >
                          Already Enrolled? Login
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Trust guarantees */}
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 font-bold">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={2.5} />
                      <span>Instant Access & Guaranteed Enrollment</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 font-bold">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={2.5} />
                      <span>Lifetime Access to all {pkg.courses.length} courses</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY PURCHASE BAR — the right-column card ends up below the
          whole course list once the grid stacks to one column, so mobile
          needs its own always-visible buy bar instead of relying on scroll. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            {pricingPreview?.upgrade_credit > 0 ? (
              <>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">You Pay</p>
                <p className="text-lg font-black text-blue-600 leading-none">₹{Number(Math.round(pricingPreview.final_amount)).toLocaleString('en-IN')}</p>
              </>
            ) : (
              <>
                <p className="text-[9px] text-slate-400 line-through font-bold uppercase tracking-wide">₹{Number(Math.round(pkg.price * 2)).toLocaleString('en-IN')}</p>
                <p className="text-lg font-black text-slate-900 leading-none">₹{Number(Math.round(pkg.price)).toLocaleString('en-IN')}</p>
              </>
            )}
          </div>
          <div className="flex-1">
            {authLoading ? (
              <div className="w-full py-3.5 bg-slate-100 rounded-xl animate-pulse h-[46px]"></div>
            ) : user ? (
              pkg.owned ? (
                <Link
                  to={`/student/packages/${pkg.id}`}
                  className="w-full py-3.5 px-4 bg-emerald-600 active:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2.5} /> Go to My Package
                </Link>
              ) : (
                <Link
                  to={`/student/checkout?package_id=${pkg.public_code}`}
                  className="w-full py-3.5 px-4 bg-blue-600 active:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  Buy Package Now <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                </Link>
              )
            ) : (
              <Link
                to={`/register?package_id=${pkg.public_code || pkg.id}`}
                className="w-full py-3.5 px-4 bg-blue-600 active:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Enroll Now <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
