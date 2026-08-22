import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Link as LinkIcon, Check, Copy, MessageCircle, Send, Mail, Sparkles, Zap, Award, ArrowRight, ShieldCheck, Share2, X, Phone, MapPin, Calendar, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function ReferralProfileModal({ member, loading, onClose }) {
  if (member === null) return null;
  const initials = member.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'ST';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="p-8 pb-16 text-white relative"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {loading || !member.id ? (
          <div className="p-12 -mt-14 relative flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</p>
          </div>
        ) : (
          <div className="px-6 pb-6 -mt-14 relative">
            {member.profile_image_url ? (
              <img
                src={member.profile_image_url}
                alt={member.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg bg-slate-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-2xl font-black flex items-center justify-center border-4 border-white shadow-lg">
                {initials}
              </div>
            )}
            <h3 className="mt-4 text-xl font-heading font-black text-slate-900">{member.name}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {member.created_at}
            </p>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 truncate">{member.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700">{member.phone || 'N/A'}</span>
              </div>
              {member.address && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{member.address}</span>
                </div>
              )}
              {(member.age || member.gender) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <UserIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">
                    {[member.age ? `${member.age} yrs` : null, member.gender].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
              {(member.bio || member.about) && (
                <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">About</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{member.bio || member.about}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Referrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(4);

  const openMemberProfile = async (memberId) => {
    setProfileLoading(true);
    setProfileModal({});
    try {
      const response = await api.get(`/student/my-team/profile/${memberId}`);
      setProfileModal(response.data.user);
    } catch (err) {
      console.error('Error fetching member profile', err);
      setProfileModal(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await api.get('/student/referrals');
        setReferrals(response.data.referrals || []);
      } catch (err) {
        console.error('Error fetching referrals list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const refUrl = `${window.location.origin}/register?ref=${user?.referral_code || ''}`;
  const shareText = `Join Zarni Skills and start learning + earning with me! ${refUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareLinks = [
    { label: 'WhatsApp', Icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(shareText)}`, color: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
    { label: 'Telegram', Icon: Send, href: `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent('Join Zarni Skills and start learning + earning with me!')}`, color: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-400/30' },
    { label: 'Email', Icon: Mail, href: `mailto:?subject=${encodeURIComponent('Join me on Zarni Skills')}&body=${encodeURIComponent(shareText)}`, color: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-400/30' },
  ];

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Referral Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* REFERRAL HERO CARD WITH TILT & GLASSMORPHISM */}
      <Reveal variant="scale-in">
        <div
          ref={tiltRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-12 text-white shadow-2xl shadow-blue-950/20 hover:shadow-[0_30px_70px_-15px_rgba(37,99,235,0.45)] group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient texture, glowing halos & shimmer */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-blue-200 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              Referral Growth Engine
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black tracking-tight mb-3">
                Share Your Link & Earn
              </h1>
              <p className="text-slate-200 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Earn lucrative direct & passive affiliate payouts every time a new student registers using your personal referral link.
              </p>
            </div>

            {/* Link Copy Box */}
            <div className="bg-white/10 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-white/20 backdrop-blur-md flex flex-col sm:flex-row items-stretch gap-3 shadow-inner">
              <div className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2 sm:py-0">
                <LinkIcon className="w-5 h-5 text-blue-300 shrink-0 hidden sm:block" strokeWidth={2.5} />
                <input
                  type="text"
                  readOnly
                  value={refUrl}
                  className="w-full bg-transparent border-0 text-white text-xs sm:text-sm font-black focus:outline-none tracking-wide"
                />
              </div>
              <button
                onClick={handleCopy}
                className={`group/btn relative overflow-hidden px-8 py-3.5 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95 shadow-lg ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-white hover:bg-slate-100 text-slate-900 shadow-white/20'
                }`}
              >
                {!copied && (
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"></span>
                )}
                <span className="relative flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 animate-bounce" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>

            {/* Quick Share Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-blue-300" strokeWidth={2.5} /> Quick Share:
              </span>
              {shareLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black transition-all hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 shadow-sm backdrop-blur-md ${s.color}`}
                >
                  <s.Icon className="w-4 h-4" strokeWidth={2.2} />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>

          </div>
        </div>
      </Reveal>

      {/* REFERRED STUDENTS NETWORK TABLE / GRID */}
      <Reveal variant="fade-up" delay={150}>
        <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.08)] transition-shadow duration-500 space-y-8 relative overflow-hidden">
          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none animate-blob"></div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
                <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-full bg-blue-400/40 blur-[4px] animate-pulse"></span>
                  <Users className="relative w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                </span>
                Network Connections
              </div>
              <h2 className="font-heading font-black text-slate-900 text-2xl sm:text-3xl tracking-tight">
                People You Referred
              </h2>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-2xl px-5 py-3 shrink-0 self-start sm:self-auto shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active Team:</span>
              <AnimatedNumber value={referrals.length} duration={1000} className="text-2xl font-heading font-black text-blue-600" />
            </div>
          </div>

          {referrals.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto relative z-10">
                <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400 text-xs font-black uppercase tracking-widest">
                      <th className="py-3 px-4 font-black">Student Name</th>
                      <th className="py-3 px-4 font-black">Email Address</th>
                      <th className="py-3 px-4 font-black">Joined Date</th>
                      <th className="py-3 px-4 font-black text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r, idx) => {
                      const initials = r.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'ST';
                      const palette = [
                        'from-blue-600 to-indigo-600',
                        'from-emerald-500 to-teal-600',
                        'from-purple-600 to-fuchsia-600',
                        'from-amber-500 to-orange-600'
                      ];
                      return (
                        <tr key={r.id ?? idx} className="group bg-slate-50/60 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/40 border border-slate-200/80 hover:border-blue-300 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
                          <td className="py-4 px-4 font-black text-slate-900 rounded-l-2xl">
                            <button type="button" onClick={() => openMemberProfile(r.id)} className="flex items-center gap-3 text-left">
                              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${palette[idx % palette.length]} text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                {initials}
                              </div>
                              <span className="group-hover:text-blue-600 transition-colors font-black text-sm">{r.name}</span>
                            </button>
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium">{r.email || 'N/A'}</td>
                          <td className="py-4 px-4 text-slate-400 font-medium text-xs">{r.created_at}</td>
                          <td className="py-4 px-4 text-right rounded-r-2xl">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Active Referral
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="sm:hidden space-y-3 relative z-10">
                {referrals.map((r, idx) => {
                  const initials = r.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'ST';
                  const palette = [
                    'from-blue-600 to-indigo-600',
                    'from-emerald-500 to-teal-600',
                    'from-purple-600 to-fuchsia-600',
                    'from-amber-500 to-orange-600'
                  ];
                  return (
                    <div key={r.id ?? idx} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <button type="button" onClick={() => openMemberProfile(r.id)} className="flex items-center gap-3 min-w-0 text-left">
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${palette[idx % palette.length]} text-white text-xs font-black flex items-center justify-center shrink-0 shadow-md`}>
                            {initials}
                          </div>
                          <p className="font-black text-slate-900 text-sm leading-snug break-words">{r.name}</p>
                        </button>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Active Referral
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Email:</span>
                          <span className="text-slate-700 font-medium break-all">{r.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">Joined Date:</span>
                          <span className="text-slate-600 font-bold">{r.created_at}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-6 relative z-10">
              <div className="relative w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm animate-float">
                <span className="absolute inset-0 rounded-2xl bg-blue-400/20 blur-lg animate-pulse"></span>
                <Users className="relative w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900 mb-2">No Referrals Recorded Yet</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mb-6 leading-relaxed">
                Copy your referral link above and share it on WhatsApp, Telegram, or social media to start building your team.
              </p>
              <button
                onClick={handleCopy}
                className="group relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:-translate-y-0.5 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                <span className="relative">Copy My Referral Link</span>
              </button>
            </div>
          )}

        </div>
      </Reveal>

      <ReferralProfileModal
        member={profileModal}
        loading={profileLoading}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}
