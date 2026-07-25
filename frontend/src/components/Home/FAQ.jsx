import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageSquare, ArrowRight, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const DEFAULT_FAQS = [
  { q: "Can I contact support if I have questions or issues?", a: "Absolutely! Our support team is available 24/7 through your dashboard, live chat, or email at support@zarniskills.com, and we typically respond within a few hours." },
  { q: "Can I access the course materials after I complete the course?", a: "Yes, you have lifetime access to all course materials including videos, PDFs, and bonuses even after completion." },
  { q: "Do You Offer Any Certifications?", a: "Yes, upon successfully completing a course and passing the final assessment, you will receive a verified certificate of completion." },
  { q: "How can I join?", a: "Simply choose a package from the pricing section above, click 'Enroll Now', and complete the secure payment process to get instant access." },
  { q: "How does the affiliate commission payout work?", a: "Affiliate earnings are tracked in real-time from your dashboard. Once you hit the minimum payout threshold, you can request a withdrawal and receive your commission securely within a few business days." },
  { q: "What payment methods do you accept?", a: "We accept all major debit/credit cards, UPI, and net banking through our secure payment gateway, so you can enroll safely in just a few clicks." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const [FAQS, setFaqs] = useState(DEFAULT_FAQS);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs');
        const items = response.data.faqs || [];
        if (items.length > 0) {
          setFaqs(items.map((f) => ({ q: f.question, a: f.answer })));
        }
      } catch (err) {
        console.error('Error fetching FAQs', err);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 text-slate-900 relative overflow-hidden" id="faq">

      {/* Top light shimmer sweep bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer-sweep pointer-events-none"></div>

      {/* Dual Rotating Cyber Compass Rings behind header */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full border border-blue-500/20 border-dashed animate-[spin_50s_linear_infinite] pointer-events-none z-0"></div>
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-cyan-400/25 border-dashed animate-[spin_35s_linear_infinite_reverse] pointer-events-none z-0"></div>

      {/* Floating Neon Particles */}
      <span className="absolute top-20 left-[10%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-32 left-[5%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[6%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-float pointer-events-none z-0"></span>

      {/* Diagonal Laser Stream comets */}
      <div className="absolute top-20 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent rotate-6 animate-shimmer-sweep pointer-events-none z-0"></div>
      <div className="absolute bottom-28 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -rotate-6 animate-shimmer-sweep pointer-events-none z-0" style={{ animationDelay: '3.5s' }}></div>

      {/* Ambient Blue Background Flares */}
      <div className="absolute -top-10 -left-16 w-[450px] h-[450px] bg-blue-300/20 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-0 -right-16 w-[450px] h-[450px] bg-indigo-300/20 blur-[130px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_4px_20px_rgba(37,99,235,0.15)] select-none mx-auto hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
            <span>FAQ HELP DESK</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-4 uppercase drop-shadow-sm">
            Frequently Asked <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 animate-gradient-x drop-shadow-[0_2px_15px_rgba(37,99,235,0.25)]">
              Questions
            </span>
          </h2>

          {/* Glowing Underline Bar */}
          <div className="relative w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full shadow-[0_0_14px_rgba(37,99,235,0.6)] overflow-hidden mx-auto mb-5">
            <span className="absolute inset-0 w-full h-full bg-white/40 -translate-x-full animate-shimmer-sweep"></span>
          </div>

          <p className="text-slate-500 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
            Got questions? Find clear, direct answers about Zarni Skills below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT: Support / Contact Card (Order 2 on Mobile, Order 1 on Desktop) */}
          <div className="lg:col-span-4 order-2 lg:order-1 lg:sticky lg:top-28">
            <div className="group relative rounded-3xl p-[1.5px] bg-gradient-to-br from-blue-500/50 via-indigo-500/30 to-blue-600/20 shadow-[0_15px_40px_rgba(37,99,235,0.15)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.25)] transition-all duration-500">
              <div className="bg-gradient-to-br from-white via-white to-blue-50/40 backdrop-blur-md rounded-[calc(1.5rem-1.5px)] p-7 sm:p-8 relative overflow-hidden h-full">
                
                {/* Top Shimmer Light Sweep */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-20"></span>

                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 text-white">
                  <MessageSquare className="w-7 h-7" strokeWidth={2} />
                </div>

                <h3 className="font-heading font-black text-xl text-slate-900 mb-2 relative">Still have questions?</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed mb-6 relative">
                  Can't find the answer you're looking for? Our support team is available 24/7 to help you out.
                </p>

                {/* Mini trust stats */}
                <div className="grid grid-cols-3 gap-2 mb-7 relative z-10">
                  {[['24/7', 'Support'], ['<2hr', 'Response'], ['98%', 'Resolved']].map(([value, label]) => (
                    <div key={label} className="text-center bg-blue-50/60 border border-blue-100/80 rounded-xl py-2.5 backdrop-blur-sm">
                      <p className="text-sm font-black text-blue-600 leading-none">{value}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 relative z-10">
                  <Link to="/contact"
                    className="group/btn relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 overflow-hidden">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                    Contact Support
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-1" strokeWidth={2.5} />
                  </Link>
                  <a href="mailto:support@zarniskills.com"
                    className="flex items-center justify-center gap-2 w-full bg-white border-2 border-slate-200/90 hover:border-blue-500 hover:text-blue-600 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-xs">
                    support@zarniskills.com
                  </a>
                </div>

                <div className="flex items-center gap-2.5 mt-7 pt-6 border-t border-slate-100 relative z-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-500">Support team online now</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: FAQ Accordion (Order 1 on Mobile, Order 2 on Desktop) */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="space-y-4">
              {FAQS.map((f, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx}
                    className={`group relative bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-md border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 ${
                      isOpen
                        ? 'border-blue-400 shadow-[0_16px_40px_rgba(37,99,235,0.18)] -translate-y-1'
                        : 'border-slate-200/80 shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.1)] hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Top Shimmer Sweep */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-20"></span>

                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className={`w-full text-left px-5 sm:px-7 py-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-500 ${
                        isOpen ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md' : 'bg-transparent text-slate-800'
                      }`}
                    >
                      <span className={`flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-all duration-300 ${
                        isOpen ? 'bg-white/20 text-white shadow-inner' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      
                      <span className="flex-1 font-heading font-black text-sm sm:text-base leading-snug tracking-wide uppercase transition-colors duration-300">
                        {f.q}
                      </span>
                      
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-all duration-500 ${
                        isOpen ? 'bg-white/20 text-white border border-white/30 rotate-180' : 'bg-slate-100 border border-slate-200 text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'
                      }`}>
                        <ChevronDown className="w-4 h-4 transition-transform duration-300" strokeWidth={2.5} />
                      </div>
                    </button>

                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: isOpen ? '400px' : '0px' }}>
                      <p className="px-5 sm:px-7 pl-[3.75rem] sm:pl-[4.75rem] py-5 text-slate-600 font-semibold text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-white/80 backdrop-blur-sm">
                        {f.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
