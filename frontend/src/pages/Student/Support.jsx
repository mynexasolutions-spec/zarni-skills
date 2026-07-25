import React, { useEffect, useState } from 'react';
import { UserCog, Mail, Phone, ArrowUpRight, Users, Crown, Clock, XCircle, Send, UserCheck, MessageSquare, Sparkles, ShieldCheck, Headphones } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function PersonAvatar({ person, size = 'w-16 h-16' }) {
  if (!person) return null;
  const initials = person.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return person.profile_image_url ? (
    <img src={person.profile_image_url} alt={person.name} className={`${size} rounded-2xl object-cover shrink-0 border-2 border-white/20 shadow-md`} />
  ) : (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-md`}>
      {initials}
    </div>
  );
}

export default function Support() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [managerRequest, setManagerRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  const fetchManagerRequest = async () => {
    try {
      const res = await api.get('/student/manager-request');
      setManagerRequest(res.data.request);
    } catch (err) {
      console.error('Error fetching manager request status', err);
    }
  };

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const response = await api.get('/student/manager');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching manager/sponsor profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchManager();
    if (user?.role !== 'manager') fetchManagerRequest();
  }, [user]);

  const handleManagerRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/student/manager-request', { message: requestMessage });
      if (res.data.success) {
        fetchManagerRequest();
        setRequestMessage('');
      } else {
        setSubmitError(res.data.message || 'Failed to submit request.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connecting Support & Mentorship...</p>
        </div>
      </div>
    );
  }

  const cleanPhone = (phone) => phone ? phone.replace(/\D/g, '') : '';

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Support & Mentorship
              </div>
              
              <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight flex items-center gap-3">
                Help & Support Line <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-blue-300" />
              </h1>
              <p className="text-blue-100/80 text-xs sm:text-sm font-medium leading-relaxed">
                Connect directly with your referrer, assigned team manager, or submit a request to upgrade to Manager status.
              </p>
            </div>

            <div className="shrink-0 sm:self-center flex items-center gap-2.5 bg-white/10 border border-white/20 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Official Support</p>
                <p className="text-base font-black text-white">Direct Assistance</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── GRID LAYOUT FOR SPONSOR & MANAGER ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* SECTION 1: Your Referrer / Sponsor */}
        <Reveal variant="fade-up" delay={150}>
          <div className="bg-white border border-slate-200/90 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
            <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <UserCheck className="w-5 h-5 text-emerald-300" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg text-white">Your Referrer (Sponsor)</h2>
                  <p className="text-xs text-emerald-200/80 font-medium">Person who invited you to Zarni Skills</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                Direct Upline
              </span>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              {data?.sponsor ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <PersonAvatar person={data.sponsor} size="w-20 h-20 text-2xl" />
                    <div className="text-center sm:text-left min-w-0 flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1.5">
                        <h3 className="text-xl font-heading font-black text-slate-900">{data.sponsor.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3" /> Sponsor
                        </span>
                        {data.sponsor.role === 'manager' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 uppercase tracking-wider bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Crown className="w-3 h-3" /> Manager
                          </span>
                        )}
                      </div>

                      {data.sponsor.referral_code && (
                        <p className="text-xs text-slate-500 font-bold mb-4">
                          Referral Code: <span className="font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-lg">{data.sponsor.referral_code}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Action Pills */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    {data.sponsor.phone && (
                      <a
                        href={`tel:${data.sponsor.phone}`}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition-all hover:-translate-y-0.5 shadow-sm"
                      >
                        <Phone className="w-4 h-4" /> Call: {data.sponsor.phone}
                      </a>
                    )}

                    {data.sponsor.phone && (
                      <a
                        href={`https://wa.me/91${cleanPhone(data.sponsor.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-500/20 hover:-translate-y-0.5"
                      >
                        <MessageSquare className="w-4 h-4" /> WhatsApp
                      </a>
                    )}

                    {data.sponsor.email && (
                      <a
                        href={`mailto:${data.sponsor.email}`}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-black transition-all hover:-translate-y-0.5"
                      >
                        <Mail className="w-4 h-4" /> Email
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 bg-slate-50/80 rounded-3xl border border-slate-200/60 my-auto">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-base font-black text-slate-800">No Direct Referrer</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">You registered directly without an affiliate referral code.</p>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* SECTION 2: Your Assigned Manager */}
        <Reveal variant="fade-up" delay={200}>
          <div className="bg-white border border-slate-200/90 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
            <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Crown className="w-5 h-5 text-amber-300" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg text-white">Your Assigned Manager</h2>
                  <p className="text-xs text-blue-200/80 font-medium">Designated team lead for official guidance</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                Team Support
              </span>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              {data?.has_manager ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <PersonAvatar person={data.manager} size="w-20 h-20 text-2xl" />
                    <div className="text-center sm:text-left min-w-0 flex-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-2">
                        <h3 className="text-xl font-heading font-black text-slate-900">{data.manager.name}</h3>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          Team Manager
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {data.manager.phone && (
                          <a href={`tel:${data.manager.phone}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black transition-all hover:scale-105">
                            <Phone className="w-3.5 h-3.5" /> {data.manager.phone}
                          </a>
                        )}
                        {data.manager.email && (
                          <a href={`mailto:${data.manager.email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-black transition-all hover:scale-105">
                            <Mail className="w-3.5 h-3.5" /> Email Manager
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Referred Manager (Upline Manager) */}
                  {data.referred_by && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" /> Senior Manager (Upline Lead)
                      </h4>
                      <div className="flex items-center gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                        <PersonAvatar person={data.referred_by} size="w-10 h-10 text-xs" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 truncate">{data.referred_by.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 truncate">{data.referred_by.email || data.referred_by.phone || 'Senior Support'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 bg-slate-50/80 rounded-3xl border border-slate-200/60 my-auto">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-base font-black text-slate-800">No Manager Assigned Yet</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">You aren't currently under an assigned manager's team. Feel free to contact your sponsor or submit a manager request below.</p>
                </div>
              )}
            </div>
          </div>
        </Reveal>

      </div>

      {/* SECTION 3: Become a Manager Request Form */}
      {user?.role !== 'manager' && (
        <Reveal variant="fade-up" delay={250}>
          <div className="bg-white border border-slate-200/90 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950 to-orange-950 text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Crown className="w-5 h-5 text-amber-300" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg text-white">Upgrade to Manager Status</h2>
                  <p className="text-xs text-amber-200/80 font-medium">Managers unlock custom commission rates & build direct downline teams</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                Growth Rank
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {managerRequest?.status === 'pending' ? (
                <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl p-4.5 text-xs sm:text-sm font-black">
                  <Clock className="w-5 h-5 shrink-0 text-amber-600 animate-pulse" /> Your request is currently under review by our admin team.
                </div>
              ) : managerRequest?.status === 'rejected' ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs sm:text-sm">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <p className="font-black">Your previous request was not approved.</p>
                      {managerRequest.admin_note && <p className="text-xs mt-1 font-bold text-red-600">Reason: {managerRequest.admin_note}</p>}
                    </div>
                  </div>
                  <form onSubmit={handleManagerRequestSubmit} className="space-y-4">
                    {submitError && <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">{submitError}</div>}
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={3}
                      placeholder="Tell us why you'd be a great manager..."
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none bg-slate-50/60"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> <span>{submitting ? 'Submitting...' : 'Re-Submit Manager Request'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleManagerRequestSubmit} className="space-y-4">
                  {submitError && <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">{submitError}</div>}
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={3}
                    placeholder="Tell us why you'd be a great manager and how many students you plan to mentor..."
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none bg-slate-50/60"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" /> <span>{submitting ? 'Submitting...' : 'Request to Become a Manager'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
