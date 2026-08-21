import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import { ChevronRight, FileText, Mail, Phone, Clock as ClockIcon, ShieldCheck, Sparkles } from 'lucide-react';

function Blank({ label }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-dashed border-amber-300 text-amber-600 text-[11px] font-bold italic align-middle">
      {label} — to be added
    </span>
  );
}

export { Blank };

export default function LegalPageLayout({ icon: Icon = FileText, title, subtitle, lastUpdated, sections, contact }) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="min-h-screen text-slate-800 -mt-24 pt-24 pb-20 relative overflow-hidden">

      {/* Background ambience matching site theme */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[130px] pointer-events-none z-0 animate-blob"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-indigo-300/15 rounded-full blur-[130px] pointer-events-none z-0 animate-blob" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.35]"
        style={{
          backgroundImage: 'linear-gradient(rgba(43,128,240,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43,128,240,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Breadcrumb */}
        <Reveal variant="fade-up">
          <nav className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 flex-wrap uppercase tracking-wider">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-900">{title}</span>
          </nav>
        </Reveal>

        {/* Hero header */}
        <Reveal variant="scale-in" duration={600}>
          <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 mb-10 shadow-[0_20px_55px_rgba(37,99,235,0.18)]"
            style={{ background: 'linear-gradient(135deg, #0b1428 0%, #16244d 45%, #1e3a8a 100%)' }}>
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-black uppercase tracking-widest mb-5">
                <Icon className="w-3.5 h-3.5 text-amber-300" />
                Legal &amp; Policy
              </div>
              <h1 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight max-w-2xl">
                {title}
              </h1>
              {subtitle && <p className="text-blue-100/70 text-sm sm:text-base font-medium mt-3 max-w-xl">{subtitle}</p>}
              <p className="text-[11px] font-black uppercase tracking-widest text-blue-300 mt-5">
                Antim Update (Last Updated): {lastUpdated || <Blank label="Date" />}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Sticky Table of Contents */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-500" /> On This Page
              </p>
              <ul className="space-y-1">
                {sections.map((s, idx) => (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      onClick={() => setActiveIdx(idx)}
                      className={`block px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 leading-snug ${
                        activeIdx === idx ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      {s.number}. {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sections */}
          <div className="lg:col-span-3 space-y-5">
            {sections.map((s, idx) => (
              <Reveal key={idx} variant="fade-up" delay={Math.min(idx * 40, 300)}>
                <div id={`section-${idx}`} className="scroll-mt-28 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25">
                      {s.number}
                    </span>
                    <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 leading-snug pt-1">{s.title}</h2>
                  </div>
                  <div className="pl-0 sm:pl-[52px] space-y-3">
                    {s.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm text-slate-600 leading-relaxed font-medium">{p}</p>
                    ))}
                    {s.fields && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {s.fields.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/60 rounded-xl px-4 py-3">
                            <span className="text-xs font-bold text-slate-500">{f}</span>
                            <span className="w-24 border-b-2 border-dashed border-slate-300"></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}

            {/* Contact card */}
            {contact && (
              <Reveal variant="fade-up" delay={340}>
                <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-[0_20px_55px_rgba(37,99,235,0.18)]"
                  style={{ background: 'linear-gradient(135deg, #0b1428 0%, #16244d 45%, #1e3a8a 100%)' }}>
                  <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-[90px] pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-amber-300" />
                      </span>
                      <h2 className="text-lg sm:text-xl font-heading font-black text-white">{contact.title}</h2>
                    </div>
                    {contact.paragraphs?.map((p, i) => (
                      <p key={i} className="text-blue-100/80 text-sm font-medium leading-relaxed mb-4">{p}</p>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                        <span className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Company Name</p>
                          <p className="text-sm font-black text-white truncate">Zarni Skills Private Limited</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                        <span className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0"><Mail className="w-4 h-4" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Support Email</p>
                          <p className="text-sm font-black text-white truncate">{contact.email || <Blank label="Email" />}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                        <span className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0"><Phone className="w-4 h-4" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Support Mobile</p>
                          <p className="text-sm font-black text-white truncate">{contact.phone || <Blank label="Phone" />}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
                        <span className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0"><ClockIcon className="w-4 h-4" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Working Time</p>
                          <p className="text-sm font-black text-white truncate">{contact.workingTime || <Blank label="Hours" />}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
