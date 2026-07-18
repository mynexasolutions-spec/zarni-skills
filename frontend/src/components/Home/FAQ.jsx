import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageSquare, ArrowRight, ChevronDown } from 'lucide-react';

const FAQS = [
  { q: "Can I contact support if I have questions or issues?", a: "Absolutely! Our support team is available 24/7 through your dashboard, live chat, or email at support@zarniskills.com, and we typically respond within a few hours." },
  { q: "Can I access the course materials after I complete the course?", a: "Yes, you have lifetime access to all course materials including videos, PDFs, and bonuses even after completion." },
  { q: "Do You Offer Any Certifications?", a: "Yes, upon successfully completing a course and passing the final assessment, you will receive a verified certificate of completion." },
  { q: "How can I join?", a: "Simply choose a package from the pricing section above, click 'Enroll Now', and complete the secure payment process to get instant access." },
  { q: "How does the affiliate commission payout work?", a: "Affiliate earnings are tracked in real-time from your dashboard. Once you hit the minimum payout threshold, you can request a withdrawal and receive your commission securely within a few business days." },
  { q: "What payment methods do you accept?", a: "We accept all major debit/credit cards, UPI, and net banking through our secure payment gateway, so you can enroll safely in just a few clicks." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 bg-slate-50 text-slate-900 relative overflow-hidden" id="faq">

      {/* Abstract tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -left-32 top-32 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute right-0 bottom-0 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-primary-light/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Floating accent particles */}
      <span className="absolute top-20 left-[12%] w-2 h-2 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(43,128,240,0.6)] animate-float pointer-events-none z-0"></span>
      <span className="absolute bottom-24 right-[10%] w-2.5 h-2.5 rounded-full bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.6)] animate-float-delayed pointer-events-none z-0"></span>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">

        {/* Header */}
        <div className="relative text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <HelpCircle className="hidden sm:block absolute -top-8 left-1/2 -translate-x-1/2 w-36 h-36 text-primary/[0.05] pointer-events-none" strokeWidth={1.5} />

          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-5 shadow-sm shadow-primary/10">
            <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={2.5} />
            FAQ Help Desk
          </div>
          <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Frequently Asked <span className="relative inline-block bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent">Questions<span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-primary via-indigo-600 to-primary opacity-30"></span></span>
          </h2>
          <p className="relative text-slate-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Got questions? Find clear, direct answers about Zarni Skills below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT: Support / Contact Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="group relative rounded-[2rem] p-[1.5px] bg-gradient-to-br from-primary/40 via-indigo-400/30 to-primary/10 shadow-[0_20px_50px_-20px_rgba(43,128,240,0.25)] hover:shadow-[0_28px_60px_-20px_rgba(43,128,240,0.35)] transition-shadow duration-500">
              <div className="glass-card rounded-[calc(2rem-1.5px)] p-8 relative overflow-hidden h-full">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
                <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30 mb-6 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                  <MessageSquare className="w-7 h-7 text-white" strokeWidth={2} />
                </div>

                <h3 className="font-heading font-black text-xl text-slate-900 mb-2 relative">Still have questions?</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 relative">
                  Can't find the answer you're looking for? Our support team is available 24/7 to help you out.
                </p>

                {/* Mini trust stats */}
                <div className="grid grid-cols-3 gap-2 mb-7 relative">
                  {[['24/7', 'Support'], ['<2hr', 'Response'], ['98%', 'Resolved']].map(([value, label]) => (
                    <div key={label} className="text-center bg-primary/5 border border-primary/10 rounded-xl py-2.5">
                      <p className="text-sm font-black text-primary leading-none">{value}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 relative">
                  <Link to="/contact"
                    className="group/btn relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 overflow-hidden">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                    Contact Support
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
                  </Link>
                  <a href="mailto:support@zarniskills.com"
                    className="flex items-center justify-center gap-2 w-full bg-white border-2 border-slate-200 hover:border-primary hover:text-primary text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5">
                    support@zarniskills.com
                  </a>
                </div>

                <div className="flex items-center gap-2.5 mt-7 pt-6 border-t border-slate-100 relative">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-500">Support team online now</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: FAQ Accordion */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {FAQS.map((f, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx}
                    className={`border shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(43,128,240,0.08)] rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary/25 shadow-[0_12px_35px_-8px_rgba(43,128,240,0.3)]' : 'border-slate-100 hover:border-primary/25 hover:-translate-y-0.5'}`}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className={`w-full text-left px-5 sm:px-7 py-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-300 group ${isOpen ? 'bg-gradient-to-r from-primary to-indigo-600 text-white' : 'bg-white text-slate-800'}`}
                    >
                      <span className={`flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl items-center justify-center text-[11px] sm:text-xs font-black shrink-0 transition-all duration-300 ${isOpen ? 'bg-white/15 text-white' : 'bg-primary/5 text-primary/70 group-hover:bg-primary/10'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-heading font-black text-[14px] sm:text-[15px] leading-snug transition-colors duration-300">{f.q}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${isOpen ? 'bg-white/15 border border-white/20' : 'bg-slate-50 border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20'}`}>
                        <ChevronDown className={`transition-transform duration-500 w-4 h-4 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400 group-hover:text-primary'}`} strokeWidth={2.5} />
                      </div>
                    </button>
                    <div className="bg-transparent overflow-hidden transition-all duration-500" style={{ maxHeight: isOpen ? '400px' : '0px' }}>
                      <p className="px-5 sm:px-7 pl-[3.75rem] sm:pl-[4.75rem] pb-6 text-slate-500 font-medium text-xs sm:text-sm leading-relaxed border-t border-slate-50 pt-4">
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
