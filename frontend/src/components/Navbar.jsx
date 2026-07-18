import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ChevronDown, Layers, ChevronRight, ArrowRight, GraduationCap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePackagesOpen, setMobilePackagesOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);

  const isActive = (path) => location.pathname === path;
  const isActiveGroup = (...paths) => paths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.get('/global-data').then(r => {
      setPackages(r.data.packages || []);
      setCourses(r.data.courses || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [mobileOpen]);

  const dashboardLink = user
    ? user.role === 'admin' ? '/admin'
      : user.role === 'manager' ? '/manager'
        : '/student'
    : null;

  const navH = scrolled ? 'lg:h-16' : 'lg:h-[84px]';
  const logoH = scrolled ? 'h-10 lg:h-16' : 'h-10 lg:h-[84px]';
  const shadow = scrolled
    ? 'shadow-[0_4px_30px_rgba(0,0,0,0.1)] bg-white/98'
    : 'shadow-[0_1px_20px_rgba(0,0,0,0.06)] bg-white/90';

  return (
    <nav className="fixed w-full z-50 top-0 left-0">
      {/* Top accent gradient line */}
      <div className="w-full h-[2px] bg-gradient-to-r from-primary via-indigo-500 to-primary"></div>

      {/* Nav Bar */}
      <div className={`w-full flex items-center justify-between gap-4 lg:gap-8 xl:gap-12 py-2.5 lg:py-0 px-5 sm:px-8 lg:px-10 xl:px-14 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300 ${shadow}`}>

        {/* Logo */}
        <Link to="/" className={`flex items-center flex-shrink-0 overflow-hidden transition-all duration-300 ${logoH}`}>
          <img src="/static/img/zarni-logo.png" alt="Zarni Skills"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="h-full w-auto object-contain scale-90" />
          <span className="hidden items-center font-black text-xl text-primary">ZS</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">

          {/* Home */}
          <li>
            <Link to="/" className={`relative group flex items-center px-4 py-2 text-[15px] font-bold transition-colors duration-200 rounded-lg hover:bg-primary/5 ${isActive('/') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
              Home
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActive('/') ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
            </Link>
          </li>

          {/* Packages Dropdown */}
          <li className="relative group">
            <button className={`flex items-center focus:outline-none ${navH}`}>
              <span className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-bold transition-colors duration-200 hover:bg-primary/5 ${isActiveGroup('/packages') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                Packages
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 opacity-60" strokeWidth={2.5} />
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActiveGroup('/packages') ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
              </span>
            </button>
            {/* Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[360px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] ring-1 ring-slate-100/80 overflow-hidden opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-[opacity,transform] duration-150 ease-out will-change-transform z-50">
              <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-slate-100/80 rotate-45"></div>
              <div className="relative px-4 pt-4 pb-3 bg-gradient-to-br from-primary/5 via-white to-indigo-50/60 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-heading font-black text-sm text-slate-900 leading-tight">Premium Bundles</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{packages.length} package{packages.length !== 1 ? 's' : ''} available</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3">
                {packages.map((pkg, idx) => (
                  <Link key={pkg.id} to={`/packages/${pkg.id}`}
                    className="relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group/item hover:bg-gradient-to-r hover:from-primary/[0.06] hover:to-indigo-50/60 hover:shadow-[inset_2px_0_0_0_#2b80f0]">
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100 shadow-sm transition-transform duration-300 group-hover/item:scale-105">
                      {pkg.thumbnail_display_url
                        ? <img src={pkg.thumbnail_display_url} alt={pkg.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">Z</div>
                      }
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-800 text-sm group-hover/item:text-primary transition-colors truncate">{pkg.name}</p>
                        {idx === 1 && <span className="shrink-0 text-[8px] font-black uppercase tracking-wide text-white bg-gradient-to-r from-primary to-indigo-600 px-1.5 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <p className="text-xs text-primary font-bold mt-0.5">₹{pkg.price?.toLocaleString()}/-</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-primary group-hover/item:translate-x-0.5 transition-all shrink-0" strokeWidth={2} />
                  </Link>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-2">
                  <Link to="/packages" className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider bg-primary/5 hover:bg-primary/10 rounded-xl">
                    See All Packages
                    <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          </li>

          {/* Courses Dropdown */}
          <li className="relative group">
            <button className={`flex items-center focus:outline-none ${navH}`}>
              <span className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-bold transition-colors duration-200 hover:bg-primary/5 ${isActiveGroup('/courses') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
                Courses
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 opacity-60" strokeWidth={2.5} />
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActiveGroup('/courses') ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
              </span>
            </button>
            {/* Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] ring-1 ring-slate-100/80 overflow-hidden opacity-0 scale-95 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-[opacity,transform] duration-150 ease-out will-change-transform z-50">
              <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-slate-100/80 rotate-45"></div>
              <div className="relative px-5 pt-4 pb-3 bg-gradient-to-br from-sky-50 via-white to-primary/5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-heading font-black text-sm text-slate-900 leading-tight">Popular Courses</p>
                    <p className="text-[11px] text-slate-400 font-semibold">Handpicked to get you started fast</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-1.5">
                  {courses.slice(0, 6).map(course => (
                    <Link key={course.id} to={`/courses/${course.id}`}
                      className="flex items-center gap-2.5 p-2 rounded-xl transition-all duration-200 group/item hover:bg-gradient-to-r hover:from-primary/[0.06] hover:to-sky-50/60 hover:shadow-[inset_2px_0_0_0_#2b80f0]">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-100 shadow-sm transition-transform duration-300 group-hover/item:scale-105">
                        {course.thumbnail_display_url
                          ? <img src={course.thumbnail_display_url} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                          : <div className="w-full h-full bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-[10px] font-bold text-white">C</div>
                        }
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 text-xs truncate group-hover/item:text-primary transition-colors leading-snug">{course.title}</p>
                        <span className="inline-block text-[8px] font-black uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-1">Course</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-100 mt-3 pt-3">
                  <Link to="/courses" className="group/see-all flex items-center justify-center gap-2 py-2.5 bg-primary/5 hover:bg-primary/10 border border-dashed border-primary/20 hover:border-primary/40 rounded-xl transition-all">
                    <span className="font-extrabold text-xs text-primary uppercase tracking-wider">See All Courses</span>
                    <ArrowRight className="w-[13px] h-[13px] text-primary group-hover/see-all:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          </li>

          <li>
            <Link to="/about" className={`relative group flex items-center px-4 py-2 text-[15px] font-bold transition-colors duration-200 rounded-lg hover:bg-primary/5 ${isActive('/about') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
              About
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActive('/about') ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
            </Link>
          </li>
          <li>
            <Link to="/contact" className={`relative group flex items-center px-4 py-2 text-[15px] font-bold transition-colors duration-200 rounded-lg hover:bg-primary/5 ${isActive('/contact') ? 'text-primary' : 'text-slate-600 hover:text-primary'}`}>
              Contact
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActive('/contact') ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
            </Link>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {user ? (
            <Link to={dashboardLink} className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex items-center text-sm font-bold text-slate-600 hover:text-primary px-4 py-2.5 transition-colors duration-200 rounded-xl hover:bg-slate-100">Login</Link>
              <Link to="/register" className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden whitespace-nowrap">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                Get Started
                <ArrowRight className="w-3.5 h-3.5 shrink-0 hidden sm:block" strokeWidth={2.5} />
              </Link>
            </>
          )}

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-600 hover:text-primary hover:bg-slate-100 transition-all duration-200 focus:outline-none flex items-center justify-center rounded-xl">
            <Menu className="w-[22px] h-[22px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[310px] sm:w-[360px] bg-white shadow-2xl z-[9999] transition-transform duration-300 flex flex-col overflow-hidden lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0 bg-slate-50/80">
          <img src="/static/img/zarni-logo.png" alt="Zarni Skills" className="h-9 w-auto object-contain"
            onError={e => { e.target.style.display = 'none'; }} />
          <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400 hover:text-primary hover:bg-white transition-all duration-200 focus:outline-none flex items-center justify-center rounded-xl">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-1">
          <nav className="flex flex-col gap-0.5">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:text-primary hover:bg-primary/5 transition-all duration-150 rounded-xl">Home</Link>

            {/* Packages Accordion */}
            <div className="flex flex-col">
              <button onClick={() => setMobilePackagesOpen(v => !v)} className="flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:text-primary hover:bg-primary/5 transition-all duration-150 rounded-xl w-full text-left">
                <span>Packages</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobilePackagesOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
              </button>
              <div className="overflow-hidden transition-all duration-300 bg-slate-50 rounded-xl mt-1 mx-1" style={{ maxHeight: mobilePackagesOpen ? '600px' : '0px' }}>
                <div className="flex flex-col gap-2 p-3">
                  {packages.map(pkg => (
                    <Link key={pkg.id} to={`/packages/${pkg.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all duration-150">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-sm">
                        {pkg.thumbnail_display_url ? <img src={pkg.thumbnail_display_url} alt={pkg.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-[8px] font-black text-white">Z</div>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 text-xs truncate">{pkg.name}</p>
                        <p className="text-[10px] text-primary font-bold">₹{pkg.price?.toLocaleString()}/-</p>
                      </div>
                    </Link>
                  ))}
                  <Link to="/packages" onClick={() => setMobileOpen(false)} className="block text-center py-2 text-[10px] font-bold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors uppercase tracking-wider mt-1">See All Packages</Link>
                </div>
              </div>
            </div>

            {/* Courses Accordion */}
            <div className="flex flex-col">
              <button onClick={() => setMobileCoursesOpen(v => !v)} className="flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:text-primary hover:bg-primary/5 transition-all duration-150 rounded-xl w-full text-left">
                <span>Courses</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileCoursesOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
              </button>
              <div className="overflow-hidden transition-all duration-300 bg-slate-50 rounded-xl mt-1 mx-1" style={{ maxHeight: mobileCoursesOpen ? '600px' : '0px' }}>
                <div className="flex flex-col gap-2 p-3">
                  {courses.slice(0, 7).map(course => (
                    <Link key={course.id} to={`/courses/${course.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all duration-150">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-sm">
                        {course.thumbnail_display_url ? <img src={course.thumbnail_display_url} alt={course.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-[8px] font-bold text-white">C</div>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 text-xs truncate leading-snug">{course.title}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Course</p>
                      </div>
                    </Link>
                  ))}
                  <Link to="/courses" onClick={() => setMobileOpen(false)} className="block text-center py-2 text-[10px] font-bold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors uppercase tracking-wider mt-1">See All Courses</Link>
                </div>
              </div>
            </div>

            <Link to="/about" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:text-primary hover:bg-primary/5 transition-all duration-150 rounded-xl">About</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 text-sm font-bold text-slate-700 hover:text-primary hover:bg-primary/5 transition-all duration-150 rounded-xl">Contact</Link>
          </nav>

          <div className="pt-5 border-t border-slate-100 flex flex-col gap-3 mt-4">
            {user ? (
              <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="block text-center py-3.5 font-bold text-white bg-gradient-to-r from-primary to-indigo-600 rounded-2xl shadow-lg shadow-primary/25">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center py-3 font-bold text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-center py-3.5 font-bold text-white bg-gradient-to-r from-primary to-indigo-600 rounded-2xl shadow-lg shadow-primary/25">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden" />
      )}
    </nav>
  );
}
