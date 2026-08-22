import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';
import { Mail, User, FileText, Send, MapPin, Clock, MessageCircle, ArrowUpRight, Sparkles, Navigation, Phone } from 'lucide-react';

const SOCIALS = [
  { label: 'Facebook', href: '#', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { label: 'Instagram', href: '#', path: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16.4a4.238 4.238 0 110-8.476 4.238 4.238 0 010 8.476zm6.406-11.845a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z' },
  { label: 'Twitter / X', href: '#', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
  { label: 'YouTube', href: '#', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
];

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [supportEmail, setSupportEmail] = useState('support@zarniskills.com');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportAddress, setSupportAddress] = useState('123 Skills Tower, New Delhi, India - 110001');

  useEffect(() => {
    api.get('/global-data')
      .then(res => {
        if (res.data.support_email) setSupportEmail(res.data.support_email);
        if (res.data.support_phone) setSupportPhone(res.data.support_phone);
        if (res.data.support_address) setSupportAddress(res.data.support_address);
      })
      .catch(() => {});
  }, []);

  const mapsQuery = encodeURIComponent(supportAddress);

  const panelRef = useRef(null);
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(2.5);

  // Merge the panel's own ref (for the cursor spotlight) with the tilt hook's ref.
  const setPanelRefs = (node) => {
    panelRef.current = node;
    tiltRef.current = node;
  };

  const onPanelMouseMove = (e) => {
    onMouseMove(e);
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await api.post('/contact', { name, email, subject, message });
      if (response.data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen text-slate-800 -mt-24 pt-24 overflow-hidden relative">

      {/* 1. HERO HEADER */}
      <section className="relative py-16 md:py-20 flex items-center justify-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 0%, #eef6ff 0%, #f8faff 60%, #f8faff 100%)'
        }}>
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(43,128,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43,128,240,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px'
          }}>
        </div>
        <div className="absolute -top-16 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0 animate-blob"></div>
        <div className="absolute -top-16 right-1/4 w-72 h-72 bg-indigo-300/20 rounded-full blur-[100px] pointer-events-none z-0 animate-blob" style={{ animationDirection: 'reverse' }}></div>

        {/* Floating ambient sparkles */}
        {[
          { top: '20%', left: '12%', size: 4, delay: '0s', dur: '5s' },
          { top: '65%', left: '10%', size: 3, delay: '1.2s', dur: '6s' },
          { top: '22%', left: '88%', size: 3, delay: '0.6s', dur: '5.5s' },
          { top: '70%', left: '90%', size: 5, delay: '2s', dur: '4.8s' },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-primary/50 pointer-events-none z-0"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              boxShadow: '0 0 10px 3px rgba(43,128,240,0.4)',
              animation: `float ${s.dur} ease-in-out infinite`,
              animationDelay: s.delay,
            }}
          ></span>
        ))}

        <Reveal variant="fade-up" className="relative z-10 text-center px-6">
          <div className="relative overflow-hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"></span>
            <Sparkles className="relative w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            <span className="relative">We're here to help you scale your future</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Get In <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">Touch</span> With Us
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto mt-4">
            Whether you have a question about our packages, specific courses, or just want to say hello, our team is ready to assist you.
          </p>
        </Reveal>
      </section>

      {/* 2. MAIN CONTENT AREA — split panel */}
      <section className="py-8 z-10 relative">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal variant="scale-in" duration={800}>
          <div
            ref={setPanelRefs}
            onMouseMove={onPanelMouseMove}
            onMouseLeave={onMouseLeave}
            className="group/panel relative bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-300/40 overflow-hidden grid grid-cols-1 lg:grid-cols-2 lg:auto-rows-fr [transform:perspective(1400px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
          >
            {/* Cursor-follow spotlight across the whole card */}
            <div
              className="hidden lg:block absolute inset-0 opacity-0 group-hover/panel:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
              style={{ background: 'radial-gradient(500px circle at var(--spot-x,50%) var(--spot-y,50%), rgba(43,128,240,0.06), transparent 70%)' }}
            ></div>

            {/* LEFT: Brand / info panel */}
            <div className="relative flex flex-col justify-between p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-primary via-primary to-indigo-700 animate-gradient-x overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-[80px] pointer-events-none animate-blob"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-[90px] pointer-events-none animate-blob" style={{ animationDirection: 'reverse' }}></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white leading-tight mb-2">
                  Let's Start a Conversation
                </h3>
                <p className="text-white/80 text-sm leading-relaxed max-w-xs mb-4">
                  Questions about packages, courses, or partnerships — drop us a line and our team will get back to you fast.
                </p>

                <div className="space-y-3">
                  <a href={`mailto:${supportEmail}`} className="group flex items-start gap-4 p-2.5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Mail className="w-5 h-5 text-white group-hover:text-primary transition-colors duration-300 animate-bounce" strokeWidth={2} style={{ animationDelay: '0s' }} />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-white font-bold text-sm group-hover:underline">{supportEmail}</p>
                      <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mt-0.5">Email Us</p>
                    </div>
                  </a>
                  {supportPhone && (
                    <a href={`tel:${supportPhone}`} className="group flex items-start gap-4 p-2.5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-primary group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                        <Phone className="w-5 h-5 text-white group-hover:text-primary transition-colors duration-300" strokeWidth={2} />
                      </div>
                      <div className="pt-1.5">
                        <p className="text-white font-bold text-sm group-hover:underline">{supportPhone}</p>
                        <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mt-0.5">Call Us</p>
                      </div>
                    </a>
                  )}
                  <div className="group flex items-start gap-4 p-2.5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                      <MapPin className="w-5 h-5 text-white group-hover:animate-bounce" strokeWidth={2} style={{ animationDelay: '0.1s' }} />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-white font-bold text-sm">{supportAddress}</p>
                      <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mt-0.5">Visit Office</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 p-2.5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Clock className="w-5 h-5 text-white group-hover:animate-spin" strokeWidth={2} style={{ animationDelay: '0.2s' }} />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-white font-bold text-sm">We reply within 24 hours</p>
                      <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mt-0.5">Response Time</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3 pt-4 mt-4 border-t border-white/15">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white hover:text-primary hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className="p-10 sm:p-12 lg:p-14 relative flex flex-col justify-center">
              {/* Animated background shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover/panel:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-blob"></div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3 relative z-10 flex flex-col gap-3">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Reveal variant="fade-up" delay={0}>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-primary group-focus-within:scale-110 transition-all" strokeWidth={2} />
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition relative"
                      />
                      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full group-focus-within:w-full transition-all duration-500"></div>
                    </div>
                  </Reveal>
                  <Reveal variant="fade-up" delay={100}>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-primary group-focus-within:scale-110 transition-all" strokeWidth={2} />
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition relative"
                      />
                      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full group-focus-within:w-full transition-all duration-500"></div>
                    </div>
                  </Reveal>
                </div>

                <Reveal variant="fade-up" delay={200}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="subject">Subject</label>
                  <div className="relative group">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-primary group-focus-within:scale-110 transition-all" strokeWidth={2} />
                    <input
                      id="subject"
                      type="text"
                      required
                      placeholder="Inquiry about Pro Package"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition relative"
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full group-focus-within:w-full transition-all duration-500"></div>
                  </div>
                </Reveal>

                <Reveal variant="fade-up" delay={300}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="message">Message</label>
                  <div className="relative group">
                    <textarea
                      id="message"
                      rows={5}
                      required
                      placeholder="How can we help you?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition resize-none relative"
                    ></textarea>
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-indigo-600 rounded-full group-focus-within:w-full transition-all duration-500"></div>
                  </div>
                </Reveal>

                <Reveal variant="fade-up" delay={400}>
                  {status === 'success' && (
                    <div className="relative p-4 rounded-xl bg-emerald-50 border border-emerald-200 animate-pulse">
                      <p className="text-center text-sm font-bold text-emerald-700">✓ Message sent! We'll get back to you soon.</p>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="relative p-4 rounded-xl bg-red-50 border border-red-200 animate-pulse">
                      <p className="text-center text-sm font-bold text-red-700">Could not send your message right now. Please email us directly at {supportEmail}.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group relative w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-1 active:scale-[0.98] overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0 animate-float"
                  >
                    {status !== 'sending' && (
                      <span className="absolute inset-0 rounded-xl bg-primary/50 animate-pulse-ring pointer-events-none"></span>
                    )}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    {status === 'sending' && (
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer-sweep"></span>
                    )}
                    <span className="relative">{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                    <Send className="relative w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </Reveal>
              </form>
            </div>

          </div>
          </Reveal>
        </div>
      </section>

      {/* 3. LOCATION STRIP */}
      <section className="mt-14 py-14 relative overflow-hidden border-t border-slate-200"
        style={{
          background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(43,128,240,0.06) 0%, transparent 60%), #f1f5f9'
        }}>
        <div className="absolute inset-0 pointer-events-none z-0 opacity-60"
          style={{
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 60% 100% at 50% 50%, #000 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 100% at 50% 50%, #000 40%, transparent 90%)'
          }}>
        </div>
        <Reveal variant="scale-in" className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-primary/30">
              <MapPin className="w-7 h-7 text-white" fill="currentColor" />
            </div>
          </div>
          <p className="font-heading font-black text-slate-900 text-lg">Zarni Skills HQ</p>
          <p className="text-slate-500 text-sm font-medium mt-1">{supportAddress}</p>
          <a
            href={`https://maps.google.com/?q=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 mt-4 text-primary font-bold text-sm hover:underline active:scale-95 transition-transform"
          >
            Get Directions
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
          </a>
        </Reveal>

        <Reveal variant="fade-up" delay={150} className="relative z-10 max-w-4xl mx-auto mt-10 px-6">
          <div className="group relative">
            {/* Floating ambient blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[70px] pointer-events-none animate-blob opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none animate-blob opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ animationDirection: 'reverse' }}></div>

            {/* Corner brackets — scanner accent */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-[3px] border-l-[3px] border-primary rounded-tl-xl opacity-0 group-hover:opacity-100 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-20 pointer-events-none"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-[3px] border-r-[3px] border-primary rounded-tr-xl opacity-0 group-hover:opacity-100 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-20 pointer-events-none"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-[3px] border-l-[3px] border-primary rounded-bl-xl opacity-0 group-hover:opacity-100 -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-20 pointer-events-none"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-[3px] border-r-[3px] border-primary rounded-br-xl opacity-0 group-hover:opacity-100 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 z-20 pointer-events-none"></div>

            <div className="relative rounded-[1.75rem] p-[2px] bg-gradient-to-r from-primary via-indigo-500 to-primary bg-[length:200%_100%] animate-gradient-x shadow-2xl shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-500">
              <div className="relative rounded-[1.7rem] overflow-hidden">
                <iframe
                  title="Zarni Skills HQ Location"
                  src={`https://maps.google.com/maps?q=${mapsQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="340"
                  style={{ border: 0, filter: 'saturate(1.1) contrast(1.02)' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[25%] group-hover:grayscale-0 transition-all duration-500 scale-[1.04] group-hover:scale-100"
                ></iframe>

                {/* Scanning sweep line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-[400%] transition-transform duration-[1400ms] ease-in-out skew-x-[-20deg]"></div>
                </div>

                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[1.7rem]"></div>

                {/* Bouncing pin marker overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                  <MapPin className="w-8 h-8 text-primary drop-shadow-lg animate-bounce" fill="white" strokeWidth={2} />
                  <div className="w-3 h-1.5 mx-auto bg-slate-900/20 rounded-full blur-[2px] animate-pulse"></div>
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">We're Here</span>
                </div>

                {/* Hover overlay CTA */}
                <a
                  href={`https://maps.google.com/?q=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-end justify-center pb-6 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                >
                  <span className="inline-flex items-center gap-2 bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-full shadow-xl translate-y-3 group-hover:translate-y-0 transition-transform duration-500 hover:bg-primary hover:text-white active:scale-95">
                    <Navigation className="w-4 h-4" strokeWidth={2.5} />
                    Open in Google Maps
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
