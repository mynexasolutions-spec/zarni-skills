import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import { Sparkles, FileText, Trophy, ArrowRight, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, Flame, Rocket } from 'lucide-react';

export default function TeamMemberDetail() {
  const { slug } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/team/${slug}`)
      .then(res => setMember(res.data.team_member))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unlocking Team Details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-24 pt-24">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <Star className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 mb-2">Team Profile Not Found</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">The requested team member profile is unavailable or relocated.</p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-500/25 transition-transform active:scale-95">
            Back To Home <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  const initials = member.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const achievementLines = (member.achievements || '').split('\n').map(l => l.trim()).filter(Boolean);
  const accent = member.color || '#2563eb';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 -mt-24 pt-24 pb-24 relative overflow-hidden">

      {/* Animated Floating Neon Spheres */}
      <div className="absolute top-[12%] left-[10%] w-[500px] h-[500px] bg-blue-400/10 blur-[140px] rounded-full pointer-events-none z-0 animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[8%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2.5s' }}></div>

      {/* Floating particles */}
      <span className="absolute top-28 left-[15%] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-float pointer-events-none z-0"></span>
      <span className="absolute top-1/3 right-[12%] w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-float-delayed pointer-events-none z-0"></span>
      <span className="absolute bottom-1/3 left-[8%] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-float pointer-events-none z-0"></span>

      {/* Tech Grid Mask Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '36px 36px' }}>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Breadcrumb Navigation */}
        <nav className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2 flex-wrap uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/#team" className="hover:text-blue-600 transition-colors">Team</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900">{member.name}</span>
        </nav>

        {/* HERO CARD */}
        <Reveal variant="scale-in" duration={800}>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-blue-50/50 to-slate-50 border border-slate-200/90 p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] mb-8">
            {/* Top Shimmer Sweep Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, #4f46e5, #0ea5e9)` }}></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">

              {/* Profile Photo Container */}
              <div className="relative shrink-0 group">
                <div className="absolute -inset-3 rounded-full opacity-70 blur-md animate-[spin_12s_linear_infinite] group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, ${accent}, #4f46e5, #0ea5e9)` }}></div>
                {member.image_display_url ? (
                  <img
                    src={member.image_display_url}
                    alt={member.name}
                    className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover object-top border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-white flex items-center justify-center text-white text-5xl font-black shadow-2xl" style={{ background: `linear-gradient(135deg, ${accent}, #4f46e5)` }}>
                    {initials}
                  </div>
                )}

                {/* Verified Shield Badge */}
                <div className="absolute bottom-2 right-2 w-11 h-11 rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-bounce" style={{ backgroundColor: accent }} title="Team Member">
                  <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Profile Meta Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black tracking-[0.25em] uppercase mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" strokeWidth={2.5} />
                  {member.badge || 'Team Member'}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-3 tracking-tight leading-tight">
                  {member.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-black shadow-sm flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" style={{ color: accent }} />
                    {member.designation}
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    Verified Team Member
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-sm">
                    <Rocket className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    Zarni Skills
                  </span>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

        {/* ABOUT SECTION */}
        {(member.about || member.bio) && (
          <Reveal variant="fade-up" className="mb-8">
            <section className="relative bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)] transition-all duration-300 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                    About <span className="text-blue-600">{member.name.split(' ')[0]}</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bio & Background</p>
                </div>
              </div>
              <p className="relative text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">
                {member.about || member.bio}
              </p>
            </section>
          </Reveal>
        )}

        {/* ACHIEVEMENTS & MILESTONES SECTION */}
        {achievementLines.length > 0 && (
          <Reveal variant="fade-up" className="mb-10">
            <section className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.08)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Trophy className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                    Track Record & Milestones
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Key Career Impact Highlights</p>
                </div>
              </div>

              {achievementLines.length > 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievementLines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 hover:border-amber-400 hover:shadow-md transition-all duration-300">
                      <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <p className="text-xs sm:text-sm text-slate-900 font-bold leading-snug">{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">{achievementLines[0]}</p>
              )}
            </section>
          </Reveal>
        )}

      </div>
    </div>
  );
}
