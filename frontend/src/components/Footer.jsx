import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowRight, Mail, MapPin, ChevronUp } from 'lucide-react';

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

      {/* CTA strip */}
      <div className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 sm:px-10 sm:py-10 backdrop-blur-sm">
            <div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white leading-tight">
                Ready to build your <span className="text-primary-light">high-income</span> future?
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-2">Join 10,000+ students already learning and earning with Zarni Skills.</p>
            </div>
            <Link to="/register"
              className="group shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40">
              Get Started Free
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-14">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img src="/static/img/zarni-logo.png" alt="Zarni Skills" className="h-20 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 font-medium">
              Empowering individuals with high-income skills designed for the modern digital economy. Join thousands of students scaling their careers today.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16.4a4.238 4.238 0 110-8.476 4.238 4.238 0 010 8.476zm6.406-11.845a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z" /></svg>
              </a>
              <a href="#" aria-label="Twitter / X" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="relative inline-block text-white font-heading font-bold mb-8 uppercase tracking-widest text-sm after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-8 after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-primary after:to-indigo-500">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="group inline-flex items-center gap-2.5 text-sm hover:text-primary-light transition-all font-medium"><span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-light group-hover:scale-125 transition-all"></span><span className="group-hover:translate-x-0.5 transition-transform">Home</span></Link></li>
              <li><Link to="/packages" className="group inline-flex items-center gap-2.5 text-sm hover:text-primary-light transition-all font-medium"><span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-light group-hover:scale-125 transition-all"></span><span className="group-hover:translate-x-0.5 transition-transform">All Packages</span></Link></li>
              <li><Link to="/courses" className="group inline-flex items-center gap-2.5 text-sm hover:text-primary-light transition-all font-medium"><span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-light group-hover:scale-125 transition-all"></span><span className="group-hover:translate-x-0.5 transition-transform">Browse Courses</span></Link></li>
              <li><Link to="/about" className="group inline-flex items-center gap-2.5 text-sm hover:text-primary-light transition-all font-medium"><span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-light group-hover:scale-125 transition-all"></span><span className="group-hover:translate-x-0.5 transition-transform">About Us</span></Link></li>
              <li><Link to="/contact" className="group inline-flex items-center gap-2.5 text-sm hover:text-primary-light transition-all font-medium"><span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-light group-hover:scale-125 transition-all"></span><span className="group-hover:translate-x-0.5 transition-transform">Contact Support</span></Link></li>
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="relative inline-block text-white font-heading font-bold mb-8 uppercase tracking-widest text-sm after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-8 after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-primary after:to-indigo-500">Popular Courses</h4>
            {courses.length > 0 ? (
              <ul className="space-y-4">
                {courses.slice(0, 5).map(course => (
                  <li key={course.id}>
                    <Link to={`/courses/${course.id}`} className="group inline-flex items-center gap-2.5 text-sm hover:text-primary-light transition-all font-medium">
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-primary-light group-hover:scale-125 transition-all shrink-0"></span>
                      <span className="group-hover:translate-x-0.5 transition-transform">{course.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Link to="/courses" className="group inline-flex items-center gap-1.5 text-sm hover:text-primary-light transition-all font-medium">
                Browse all courses
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
              </Link>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="relative inline-block text-white font-heading font-bold mb-8 uppercase tracking-widest text-sm after:content-[''] after:absolute after:-bottom-3 after:left-0 after:w-8 after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-primary after:to-indigo-500">Contact Us</h4>
            <a href="mailto:support@zarniskills.com" className="flex items-start gap-4 group -mx-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Mail className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-sm leading-relaxed group-hover:text-primary-light transition-colors pt-2">
                support@zarniskills.com<br />
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Available 24/7</span>
              </p>
            </a>
            <div className="flex items-start gap-4 -mx-2 px-2 py-1.5 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-sm leading-relaxed pt-2">123 Digital Heights, Skill Tower,<br />New Delhi, India</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-6">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest text-center md:text-left">
            &copy; {currentYear} Zarni Skills. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
            <a href="#" className="hover:text-primary-light transition-colors">Privacy Policy</a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <a href="#" className="hover:text-primary-light transition-colors">Terms of Service</a>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <a href="#" className="hover:text-primary-light transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button onClick={scrollToTop} aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 ring-1 ring-white/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 ${showTop ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-2'}`}>
        <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </footer>
  );
}
