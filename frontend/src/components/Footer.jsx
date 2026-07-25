import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowRight, Mail, MapPin, ChevronUp, Sparkles, Rocket } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [courses, setCourses] = useState([]);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    api.get('/global-data').then(r => {
      setCourses(r.data.courses || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0b1629] text-slate-400 pt-0 border-t border-white/5 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-light/60 to-transparent z-10"></div>

      {/* Decorative grid + blur */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }}>
      </div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="absolute -top-24 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none z-0"></div>

      {/* Super Sexy & Animated CTA strip */}
      <div className="relative z-10 border-b border-white/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="group relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-slate-900/90 border border-blue-500/30 p-8 sm:p-12 backdrop-blur-md shadow-[0_20px_60px_rgba(37,99,235,0.3)] hover:shadow-[0_30px_80px_rgba(37,99,235,0.4)] transition-all duration-500">
            
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"></div>

            {/* Top Shimmer Light Sweep */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-20"></span>

            {/* Dual Rotating Cyber Compass Rings */}
            <div className="absolute -top-24 -right-24 w-[450px] h-[450px] rounded-full border border-blue-500/20 border-dashed animate-[spin_50s_linear_infinite] pointer-events-none z-0"></div>
            <div className="absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full border border-cyan-400/25 border-dashed animate-[spin_35s_linear_infinite_reverse] pointer-events-none z-0"></div>

            {/* Ambient Background Flares */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-2xl">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm select-none mx-auto md:mx-0">
                  <Rocket className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  <span>START YOUR JOURNEY TODAY</span>
                </div>

                <h3 className="font-heading font-black text-2xl sm:text-4xl text-white leading-tight mb-3 tracking-wide uppercase">
                  Ready to build your <br className="hidden sm:block" />
                  <span className="text-cyan-300 sm:text-transparent sm:bg-clip-text sm:bg-gradient-to-r sm:from-cyan-400 sm:via-sky-300 sm:to-indigo-300 drop-shadow-[0_2px_15px_rgba(34,211,238,0.4)] inline-block">
                    high-income future?
                  </span>
                </h3>

                <p className="text-slate-100 text-sm sm:text-base font-semibold leading-relaxed">
                  Join 10,000+ students already learning and earning with Zarni Skills.
                </p>
              </div>

              <Link to="/register"
                className="group/btn relative shrink-0 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 hover:scale-108 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-95 overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="relative z-10 w-5 h-5 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
              </Link>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block group">
              <img src="/static/img/zarni-logo.png" alt="Zarni Skills" className="h-20 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 font-semibold">
              Empowering individuals with high-income skills designed for the modern digital economy. Join thousands of students scaling their careers today.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[
                { label: 'Facebook', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
                { label: 'Instagram', icon: <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16.4a4.238 4.238 0 110-8.476 4.238 4.238 0 010 8.476zm6.406-11.845a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z" /> },
                { label: 'Twitter / X', icon: <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /> },
                { label: 'YouTube', icon: <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> }
              ].map((s, idx) => (
                <a key={idx} href="#" aria-label={s.label} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:text-white hover:scale-115 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300">
                  <svg className="w-4 h-4 fill-current">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-heading font-black mb-7 uppercase tracking-wider text-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              Navigation
            </h4>
            <ul className="space-y-3.5">
              {[
                { name: 'Home', path: '/' },
                { name: 'All Packages', path: '/packages' },
                { name: 'Browse Courses', path: '/courses' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact Support', path: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" strokeWidth={2.5} />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="flex items-center gap-2 text-white font-heading font-black mb-7 uppercase tracking-wider text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
              Popular Courses
            </h4>
            {courses.length > 0 ? (
              <ul className="space-y-3.5">
                {courses.slice(0, 5).map(course => (
                  <li key={course.id}>
                    <Link to={`/courses/${course.slug || course.id}`} className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" strokeWidth={2.5} />
                      <span className="group-hover:translate-x-1 transition-transform duration-300 line-clamp-1">{course.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Link to="/courses" className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
                <span>Browse all courses</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h4 className="flex items-center gap-2 text-white font-heading font-black mb-7 uppercase tracking-wider text-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></span>
              Contact Us
            </h4>
            
            <a href="mailto:support@zarniskills.com" className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.06] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <Mail className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors truncate">support@zarniskills.com</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Available 24/7</span>
                </p>
              </div>
            </a>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300 leading-snug">123 Digital Heights, Skill Tower</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Delhi, India</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-6">
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
            &copy; {currentYear} Zarni Skills. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-cyan-300 transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <a href="#" className="hover:text-cyan-300 transition-colors">Terms of Service</a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <a href="#" className="hover:text-cyan-300 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>

      {/* Floating Super Sexy Back to top Button */}
      <button onClick={scrollToTop} aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_0_25px_rgba(37,99,235,0.6)] border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-95 ${showTop ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        <ChevronUp className="w-6 h-6 animate-bounce" strokeWidth={2.5} />
      </button>
    </footer>
  );
}
