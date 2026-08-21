import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowRight, Mail, MapPin, ChevronUp, Sparkles, Rocket } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [courses, setCourses] = useState([]);
  const [showTop, setShowTop] = useState(false);
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', whatsapp: '' });
  const [supportEmail, setSupportEmail] = useState('support@zarniskills.com');

  useEffect(() => {
    api.get('/global-data').then(r => {
      setCourses(r.data.courses || []);
      setSocialLinks(r.data.social_links || { facebook: '', instagram: '', whatsapp: '' });
      if (r.data.support_email) setSupportEmail(r.data.support_email);
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
                { label: 'Facebook', Icon: FaFacebook, url: socialLinks.facebook },
                { label: 'Instagram', Icon: FaInstagram, url: socialLinks.instagram },
                { label: 'WhatsApp', Icon: FaWhatsapp, url: socialLinks.whatsapp },
              ].map((s, idx) => (
                <a key={idx} href={s.url || '#'} target={s.url ? '_blank' : undefined} rel="noopener noreferrer" aria-label={s.label} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:text-white hover:scale-115 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300">
                  <s.Icon className="w-4 h-4" />
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
            
            <a href={`mailto:${supportEmail}`} className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.06] transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                <Mail className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors truncate">{supportEmail}</p>
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
            <Link to="/terms-and-conditions" className="hover:text-cyan-300 transition-colors">Terms of Service</Link>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <Link to="/refund-policy" className="hover:text-cyan-300 transition-colors">Refund Policy</Link>
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
