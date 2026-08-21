import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck, Video, Clock, Users, Calendar, Loader2, User, Phone, Mail, Cake,
  Briefcase, MapPin, BarChart3, Target, Wallet, Star, HelpCircle, CheckCircle2,
  Lock, ShieldAlert, MessageCircle, CalendarPlus, Trophy, Gift, Rocket, Headphones,
  CreditCard, Copy, Check, Play, Award, Mic, Bot, IndianRupee, Brain, Film,
  ArrowRight, FileText, Youtube, Instagram, Send, Facebook, Globe, Zap,
  GraduationCap
} from 'lucide-react';
import api from '../../utils/api';

let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

function toEmbedUrl(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}

function useCountdown(targetIso) {
  const target = useMemo(() => {
    if (targetIso) {
      const d = new Date(targetIso);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(Date.now() + 8 * 3600e3 + 24 * 60e3 + 15e3);
  }, [targetIso]);

  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  return {
    days: Math.floor(remaining / 86400e3),
    hours: Math.floor((remaining % 86400e3) / 3600e3),
    minutes: Math.floor((remaining % 3600e3) / 60e3),
    seconds: Math.floor((remaining % 60e3) / 1000),
  };
}

// Icon rotations — the admin controls the text of every list below; these
// just cycle decorative icons so a list of any length still renders.
const HEADER_BADGE_ICONS = [null, Users, GraduationCap, ShieldCheck];
const CHIP_ICONS = [Video, GraduationCap, Gift, Award];
const SKILL_ICONS = [Film, Facebook, Mic, Bot, Briefcase, BarChart3, User, IndianRupee, Brain];
const GOAL_ICONS = [Target, Wallet, BarChart3, User, Star, HelpCircle];
const STAT_ICONS = [Users, Star, Trophy, Award, Clock];
const FORM_TRUST_ICONS = [ShieldCheck, CreditCard, Zap, Headphones];
const LANDING_TRUST_ICONS = [ShieldCheck, IndianRupee, Headphones, Users];
const SUCCESS_TRUST_ICONS = [ShieldCheck, Zap, Award, GraduationCap, MessageCircle, FileText];
const PRIVACY_ICONS = [ShieldCheck, Lock, Users];
const NEXT_STEP_ICONS = [MessageCircle, Mail, CalendarPlus, Play, FileText];
const BRAND_COLORS = ['text-orange-600', 'text-purple-700', 'text-slate-700', 'text-sky-600', 'text-blue-800', 'text-slate-600'];

function CountdownBox({ value, label }) {
  return (
    <div className="bg-white rounded-xl px-3 py-2 text-center min-w-[56px] shadow-sm">
      <div className="text-lg sm:text-xl font-black text-slate-900 tabular-nums leading-none">{String(value).padStart(2, '0')}</div>
      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function SiteHeader({ c }) {
  const badges = c?.header_badges || [];
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2.5 shrink-0">
        {c?.logo_image && (
          <img
            src={c.logo_image}
            alt={c?.brand_name || ''}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="h-9 w-auto object-contain"
          />
        )}
        <span className={`${c?.logo_image ? 'hidden' : 'flex'} items-center font-black text-blue-700 text-base`}>{c?.brand_name}</span>
      </div>
      <div className="hidden md:flex flex-wrap items-center gap-2.5 text-[10px] font-extrabold uppercase tracking-wider">
        {badges.map((label, i) => {
          const Icon = HEADER_BADGE_ICONS[i % HEADER_BADGE_ICONS.length];
          return (
            <span key={i} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${i === 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {i === 0 ? <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> : Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </span>
          );
        })}
      </div>
    </header>
  );
}

function SiteFooter({ c }) {
  const social = c?.social_links || {};
  const socialIcons = [
    { key: 'youtube', Icon: Youtube, cls: 'bg-red-600' },
    { key: 'instagram', Icon: Instagram, cls: 'bg-pink-600' },
    { key: 'telegram', Icon: Send, cls: 'bg-sky-500' },
    { key: 'facebook', Icon: Facebook, cls: 'bg-blue-600' },
  ].filter((s) => social[s.key]);

  return (
    <footer className="bg-[#0b1e57] text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {c?.logo_image && <img src={c.logo_image} alt="" className="h-8 w-auto object-contain" />}
            <span className="font-black text-sm uppercase">{c?.brand_name}</span>
          </div>
          <p className="text-xs text-blue-200/80 leading-relaxed">{c?.mission_text}</p>
        </div>
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider mb-3">{c?.footer_links_heading}</h4>
          <ul className="space-y-2 text-xs text-blue-200/80">
            {(c?.footer_links || []).map((l, i) => (
              <li key={i}><a href={l.url} className="hover:text-white transition-colors">{l.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-extrabold text-xs uppercase tracking-wider mb-3">{c?.footer_contact_heading}</h4>
          <ul className="space-y-2.5 text-xs text-blue-200/80">
            {c?.support_phone && <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {c.support_phone}</li>}
            {c?.support_email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" /> {c.support_email}</li>}
            {c?.website_url && <li className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 shrink-0" /> {c.website_url}</li>}
            {c?.whatsapp_support_link && (
              <li className="flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <a href={c.whatsapp_support_link} target="_blank" rel="noreferrer" className="hover:text-white">{c?.whatsapp_support_label}</a>
              </li>
            )}
          </ul>
        </div>
        {socialIcons.length > 0 && (
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-3">{c?.footer_social_heading}</h4>
            <div className="flex gap-2.5">
              {socialIcons.map(({ key, Icon, cls }) => (
                <a key={key} href={social[key]} target="_blank" rel="noreferrer"
                  className={`w-9 h-9 rounded-full ${cls} flex items-center justify-center hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[11px] text-blue-200/70">
        {c?.copyright_text || `© ${new Date().getFullYear()} ${c?.brand_name || ''}. All Rights Reserved.`}
      </div>
    </footer>
  );
}

export default function MasterclassRegister() {
  const { code } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [content, setContent] = useState(null);
  const [step, setStep] = useState('landing');
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [cityState, setCityState] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(0);

  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const countdown = useCountdown(content?.offer_ends_at);

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        const res = await api.get(`/public/masterclass/${code}`);
        setContent(res.data.content || {});
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFunnel();
  }, [code]);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const c = content || {};
  const price = c.price ?? 99;
  const originalPrice = c.original_price;
  const totalSeats = Number(c.total_seats) || 0;
  const seatsFilled = Number(c.seats_filled) || 0;
  const seatsLeft = Math.max(0, totalSeats - seatsFilled);
  const seatsPct = totalSeats > 0 ? Math.min(100, Math.round((seatsFilled / totalSeats) * 100)) : 0;
  const showVideo = c.show_video !== false && (c.video_filename || c.video_url);
  const ctaLabel = `${c.cta_button_text || 'Register Now'} – ₹${price} ${c.price_only_suffix || ''}`.trim();
  // Admin-authored templates carry {left}/{filled}/{total} placeholders.
  const fillSeats = (tpl) => (tpl || '')
    .replace('{left}', seatsLeft).replace('{filled}', seatsFilled).replace('{total}', totalSeats);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setError('Please fill in your name, mobile number, and email.');
      return;
    }
    setError('');
    setPaying(true);

    const payload = {
      name: fullName.trim(), phone: phone.trim(), email: email.trim(),
      age, occupation, city_state: cityState.trim(),
      experience_level: experienceLevel, goal,
    };

    try {
      const res = await api.post(`/public/masterclass/${code}/create-order`, payload);

      if (res.data.razorpay_enabled === false) {
        const activateRes = await api.post(`/public/masterclass/${code}/activate`, payload);
        if (activateRes.data.success) {
          setSuccessData(activateRes.data);
          setStep('success');
        } else {
          setError(activateRes.data.message || 'Could not complete registration.');
        }
        setPaying(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load payment gateway. Please check your connection.');
        setPaying(false);
        return;
      }

      const { order_id, key_id, amount, currency } = res.data;
      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency: currency || 'INR',
        name: c.brand_name || 'Registration',
        description: c.order_item_title || 'Masterclass Registration',
        order_id,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: '#1e3a8a' },
        handler: async (paymentResp) => {
          try {
            const verifyRes = await api.post(`/public/masterclass/${code}/verify`, {
              razorpay_order_id: paymentResp.razorpay_order_id,
              razorpay_payment_id: paymentResp.razorpay_payment_id,
              razorpay_signature: paymentResp.razorpay_signature,
              ...payload,
            });
            if (verifyRes.data.success) {
              setSuccessData(verifyRes.data);
              setStep('success');
            } else {
              setError(verifyRes.data.message || 'Payment verification failed.');
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start registration. Please try again.');
      setPaying(false);
    }
  };

  const addToCalendar = () => {
    const title = encodeURIComponent(c.hero_title || 'Masterclass');
    const details = encodeURIComponent(c.order_item_title || '');
    const start = new Date(Date.now() + 3600e3);
    const end = new Date(start.getTime() + 2 * 3600e3);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${fmt(start)}/${fmt(end)}`, '_blank');
  };

  const copyRegId = () => {
    navigator.clipboard.writeText(successData?.registration_id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-black text-slate-900 mb-2">{c.invalid_link_title || "This link isn't valid"}</h1>
          <p className="text-sm text-slate-500">{c.invalid_link_text || 'The registration link you followed is invalid or has expired.'}</p>
        </div>
      </div>
    );
  }

  const countdownUnits = [
    [countdown.days, 'Days'], [countdown.hours, 'Hours'],
    [countdown.minutes, 'Minutes'], [countdown.seconds, 'Seconds'],
  ];

  // ══ SUCCESS STEP ══════════════════════════════════════════════════════
  if (step === 'success' && successData) {
    const nextSteps = (c.next_steps || []).map((s, i) => {
      const key = s.link_key;
      let href = null; let onClick = null;
      if (key === 'calendar') onClick = addToCalendar;
      else if (key === 'email') href = 'https://mail.google.com';
      else href = c[key] || null;
      return (href || onClick) ? { ...s, href, onClick, Icon: NEXT_STEP_ICONS[i % NEXT_STEP_ICONS.length], n: i + 1 } : null;
    }).filter(Boolean);

    const colClass = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[nextSteps.length] || 'lg:grid-cols-5';
    const bothPanels = c.whatsapp_group_link && c.whatsapp_support_link;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <SiteHeader c={c} />

        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="relative bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 text-center shadow-sm overflow-hidden">
              <span className="absolute left-10 top-10 w-2 h-2 rounded-full bg-rose-300"></span>
              <span className="absolute right-14 top-16 w-2 h-2 rounded-full bg-blue-300"></span>
              <span className="absolute left-16 top-24 w-1.5 h-1.5 rounded-full bg-rose-300"></span>
              <span className="absolute right-24 top-28 w-1.5 h-1.5 rounded-full bg-blue-300"></span>
              <div className="relative w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <Check className="w-9 h-9 text-white" strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-1">{c.success_title}</h1>
              <p className="text-lg font-black text-blue-700 mb-3">{c.success_subtitle}</p>
              <p className="text-sm text-slate-500 mb-6 whitespace-pre-line">{c.success_message}</p>
              <div className="inline-flex flex-col items-center gap-1 px-8 py-3.5 rounded-2xl border border-blue-100 bg-white">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{c.registration_id_label}</span>
                <span className="flex items-center gap-2 text-lg font-black text-slate-900 tracking-wide">
                  {successData.registration_id}
                  <button onClick={copyRegId} className="text-slate-400 hover:text-blue-600 transition-colors" aria-label="Copy registration ID">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </span>
              </div>
            </div>

            <div className="bg-[#0b1e57] text-white rounded-3xl p-7 shadow-sm">
              <h2 className="font-black text-base mb-5">{c.success_panel_heading}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-center">
                <div className="space-y-4">
                  {[
                    { Icon: Calendar, label: c.label_masterclass_date, value: successData.date || c.date },
                    { Icon: Clock, label: c.label_time, value: successData.time || c.time },
                    { Icon: Video, label: c.label_mode, value: successData.mode || c.mode },
                    { Icon: Globe, label: c.label_language, value: successData.language || c.language },
                  ].filter((r) => r.value).map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-black">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {c.summary_image && (
                  <img src={c.summary_image} alt="" className="w-40 h-auto rounded-xl object-cover hidden sm:block" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 text-sm">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{c.email_sent_text} <strong className="text-blue-800">{successData.email}</strong></span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-blue-200"></div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{c.whatsapp_sent_text} <strong className="text-emerald-800">{successData.phone}</strong></span>
            </div>
          </div>

          {nextSteps.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px bg-slate-200 flex-1"></span>
                <h3 className="font-black text-blue-800 uppercase tracking-widest text-sm">{c.next_steps_heading}</h3>
                <span className="h-px bg-slate-200 flex-1"></span>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-5 divide-y sm:divide-y-0 lg:divide-x divide-slate-100`}>
                  {nextSteps.map(({ n, Icon, title, desc, cta, href, onClick }) => (
                    <div key={n} className="px-3 pt-5 sm:pt-0 text-center flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">{n}</span>
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-bold text-sm text-slate-800 mb-1.5">{title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4 flex-1">{desc}</p>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer"
                          className="w-full py-2.5 rounded-lg bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-800 transition-colors">
                          {cta}
                        </a>
                      ) : (
                        <button onClick={onClick}
                          className="w-full py-2.5 rounded-lg bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-800 transition-colors">
                          {cta}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {(c.whatsapp_group_link || c.whatsapp_support_link) && (
            <div className={`grid grid-cols-1 gap-6 mb-8 ${bothPanels ? 'lg:grid-cols-2' : ''}`}>
              {c.whatsapp_group_link && (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center">
                  <h4 className="font-black text-sm text-blue-800 uppercase tracking-wider mb-2">{c.community_panel_heading}</h4>
                  <p className="text-xs text-slate-500 mb-5">{c.community_panel_text}</p>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </span>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{c.community_card_title}</p>
                        <p className="text-[11px] text-slate-500">{c.community_card_subtitle}</p>
                      </div>
                    </div>
                    <a href={c.whatsapp_group_link} target="_blank" rel="noreferrer"
                      className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors shrink-0">
                      {c.community_card_cta}
                    </a>
                  </div>
                </div>
              )}
              {c.whatsapp_support_link && (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center">
                  <h4 className="font-black text-sm text-blue-800 uppercase tracking-wider mb-2">{c.support_panel_heading}</h4>
                  <p className="text-xs text-slate-500 mb-5">{c.support_panel_text}</p>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                        <Headphones className="w-5 h-5 text-white" />
                      </span>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{c.support_card_title}</p>
                        <p className="text-[11px] text-slate-500">{c.support_card_subtitle}</p>
                      </div>
                    </div>
                    <a href={c.whatsapp_support_link} target="_blank" rel="noreferrer"
                      className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors shrink-0">
                      {c.support_card_cta}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {(c.success_banner_title || c.founder_quote) && (
            <div className="bg-[#0b1e57] text-white rounded-3xl p-7 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-center mb-8">
              <div className="flex items-center gap-5">
                <span className="w-16 h-16 rounded-full border-2 border-blue-400/40 flex items-center justify-center shrink-0">
                  <Trophy className="w-8 h-8 text-amber-300" />
                </span>
                <div>
                  <h4 className="text-lg font-black mb-1">{c.success_banner_title}</h4>
                  <p className="text-xs text-blue-200">{c.success_banner_subtitle}</p>
                </div>
              </div>
              {c.founder_quote && (
                <div className="lg:border-l lg:border-white/15 lg:pl-6">
                  <p className="text-sm italic text-blue-100 mb-3">"{c.founder_quote}"</p>
                  <p className="text-xs font-black">– {c.founder_name}</p>
                  <p className="text-[11px] text-blue-300">{c.founder_title}</p>
                </div>
              )}
            </div>
          )}

          {(c.success_trust_items || []).length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 divide-x divide-slate-100">
              {c.success_trust_items.map((label, i) => {
                const Icon = SUCCESS_TRUST_ICONS[i % SUCCESS_TRUST_ICONS.length];
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-1.5 px-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <SiteFooter c={c} />
      </div>
    );
  }

  // ══ FORM STEP ═════════════════════════════════════════════════════════
  if (step === 'form') {
    const paymentOptions = c.payment_options || [];
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <SiteHeader c={c} />

        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-7">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">{c.form_title}</h1>
              <p className="text-sm text-slate-500 mb-4">{c.form_subtitle}</p>
              <div className="flex flex-wrap gap-2.5">
                {(c.feature_chips || []).map((chip, i) => {
                  const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
                  return (
                    <span key={i} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-[11px] font-bold text-slate-700">
                      <Icon className="w-4 h-4 text-blue-600 shrink-0" /> {chip}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#0b1e57] text-white px-6 py-4 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 text-center mb-2.5">{c.countdown_label}</p>
                <div className="flex items-center justify-center gap-2">
                  {countdownUnits.map(([v, l]) => <CountdownBox key={l} value={v} label={l} />)}
                </div>
              </div>
              {totalSeats > 0 && (
                <div className="bg-[#123a8a] text-white px-6 py-4 flex flex-col justify-center min-w-[210px]">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <Users className="w-4 h-4 text-blue-200" />
                    <span className="text-xs font-black uppercase tracking-wider">{c.limited_seats_label}</span>
                  </div>
                  <p className="text-center text-xs font-bold text-blue-100 mb-2">{fillSeats(c.seats_left_text)}</p>
                  <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${seatsPct}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold mb-5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 items-start">

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <span className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0">1</span>
                <div>
                  <h2 className="font-black text-sm text-blue-800 uppercase tracking-wide">{c.step1_heading}</h2>
                  <p className="text-xs text-slate-400">{c.step1_subheading}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{c.label_full_name} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-600" />
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={c.placeholder_full_name}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{c.label_phone} <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  {c.country_code && (
                    <span className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 shrink-0">
                      <Phone className="w-4 h-4 text-blue-600" /> {c.country_code}
                    </span>
                  )}
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={c.placeholder_phone}
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">{c.label_email} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-600" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.placeholder_email}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(c.age_options || []).length > 0 && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><Cake className="w-3.5 h-3.5 text-blue-600" /> {c.label_age}</label>
                    <select value={age} onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                      <option value="">{c.placeholder_age}</option>
                      {c.age_options.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                )}
                {(c.occupation_options || []).length > 0 && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><Briefcase className="w-3.5 h-3.5 text-blue-600" /> {c.label_occupation}</label>
                    <select value={occupation} onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                      <option value="">{c.placeholder_occupation}</option>
                      {c.occupation_options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {c.label_city}</label>
                  <input value={cityState} onChange={(e) => setCityState(e.target.value)} placeholder={c.placeholder_city}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
                {(c.experience_options || []).length > 0 && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5"><BarChart3 className="w-3.5 h-3.5 text-blue-600" /> {c.label_experience}</label>
                    <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                      <option value="">{c.placeholder_experience}</option>
                      {c.experience_options.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {(c.goal_options || []).length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">{c.label_goal} <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {c.goal_options.map((label, i) => {
                      const Icon = GOAL_ICONS[i % GOAL_ICONS.length];
                      return (
                        <button key={label} type="button" onClick={() => setGoal(label)}
                          className={`flex items-center gap-2.5 px-3.5 py-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                            goal === label ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}>
                          <Icon className="w-4 h-4 shrink-0 text-blue-600" /> {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" disabled={paying}
                className="w-full py-4 bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-wide shadow-md hover:bg-blue-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> {c.processing_text}</> : <>{c.submit_button_text} <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-center text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> {c.form_secure_note}
              </p>
            </form>

            <div className="space-y-5">
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0">2</span>
                    <div>
                      <h2 className="font-black text-sm text-blue-800 uppercase tracking-wide">{c.step2_heading}</h2>
                      <p className="text-xs text-slate-400">{c.step2_subheading}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#0b1e57] text-white p-5 relative overflow-hidden min-h-[150px] flex flex-col justify-center">
                    <span className="inline-block w-fit px-2.5 py-0.5 rounded bg-blue-500 text-[9px] font-black uppercase tracking-widest mb-2">
                      {c.badge_text}
                    </span>
                    <h3 className="font-black text-xl leading-tight max-w-[60%]">{c.hero_title}</h3>
                    {c.summary_image && (
                      <img src={c.summary_image} alt="" className="absolute right-0 bottom-0 h-full w-auto object-cover object-left opacity-90" />
                    )}
                  </div>
                </div>
                <div className="px-6 pb-3">
                  <p className="font-bold text-sm text-slate-800">{c.order_item_title}</p>
                  <p className="text-xs text-slate-500">{c.hero_title}</p>
                </div>
                <div className="px-6 pb-6 space-y-2.5 text-sm border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{c.fee_label}</span><span className="text-slate-900 font-black">₹{price}</span>
                  </div>
                  {c.gst_label && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{c.gst_label}</span><span className="text-slate-900 font-black">₹{c.gst_amount ?? 0}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="font-black text-slate-900">{c.total_label}</span>
                    <span className="font-black text-blue-700 text-xl">₹{Number(price) + Number(c.gst_amount ?? 0)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{c.tax_note}</p>
                </div>
              </div>

              {paymentOptions.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0">3</span>
                    <div>
                      <h2 className="font-black text-sm text-blue-800 uppercase tracking-wide">{c.step3_heading}</h2>
                      <p className="text-xs text-slate-400">{c.step3_subheading}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {paymentOptions.map((m, i) => (
                      <label key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === i ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="pm" checked={paymentMethod === i} onChange={() => setPaymentMethod(i)} className="accent-blue-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800">{m.label}</p>
                          <p className="text-[11px] text-slate-400">{m.desc}</p>
                        </div>
                        {m.brand && <span className={`text-xs font-black italic shrink-0 ${BRAND_COLORS[i % BRAND_COLORS.length]}`}>{m.brand}</span>}
                      </label>
                    ))}
                  </div>
                  <p className="text-center text-[11px] font-bold text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> {c.payment_secure_note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {(c.form_trust_items || []).length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-x divide-slate-100 mt-6">
              {c.form_trust_items.map((t, i) => {
                const Icon = FORM_TRUST_ICONS[i % FORM_TRUST_ICONS.length];
                return (
                  <div key={i} className="flex items-center gap-3 px-3">
                    <Icon className="w-6 h-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-800">{t.title}</p>
                      <p className="text-[11px] text-slate-500">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {((c.stats || []).length > 0 || (c.testimonials || []).length > 0) && (
            <div className="bg-[#0b1e57] text-white rounded-3xl p-7 mt-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-center">
              <div>
                <h4 className="font-black text-lg mb-5">{c.why_join_heading} <span className="text-blue-300">{c.brand_name}</span></h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(c.stats || []).map((s, i) => {
                    const Icon = STAT_ICONS[i % STAT_ICONS.length];
                    return (
                      <div key={i} className="flex items-center gap-2.5">
                        <Icon className="w-6 h-6 text-blue-300 shrink-0" />
                        <div>
                          <p className="text-lg font-black leading-none">{s.value}</p>
                          <p className="text-[10px] text-blue-200">{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {c.testimonials?.[0] && (
                <div className="bg-white/10 border border-white/15 rounded-2xl p-5">
                  <p className="text-xs italic text-blue-100 mb-3">"{c.testimonials[0].text}"</p>
                  <p className="text-xs font-black">– {c.testimonials[0].name}</p>
                </div>
              )}
            </div>
          )}

          {c.privacy_heading && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mt-6 flex flex-col lg:flex-row items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <ShieldCheck className="w-12 h-12 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-black text-base text-blue-800 mb-1">{c.privacy_heading}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.privacy_text}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0">
                {(c.privacy_badges || []).map((l, i) => {
                  const Icon = PRIVACY_ICONS[i % PRIVACY_ICONS.length];
                  return (
                    <span key={i} className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white border border-slate-100 text-[10px] font-black text-slate-700 uppercase tracking-wide">
                      <Icon className="w-5 h-5 text-blue-600" /> {l}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        <SiteFooter c={c} />
      </div>
    );
  }

  // ══ LANDING STEP ══════════════════════════════════════════════════════
  const learnItems = c.learn_items || [];
  const bonusItems = c.bonuses || [];
  const faqItems = c.faq || [];
  const testimonialItems = c.testimonials || [];
  const statItems = c.stats || [];
  const achieveItems = c.achieve_items || [];
  const includeItems = c.includes || [];
  const liveRegs = c.live_registrations || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SiteHeader c={c} />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10 mb-7 border border-blue-100"
          style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #f4f8ff 50%, #ffffff 100%)' }}>
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(37,99,235,0.08), transparent 55%)' }}></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-7 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_auto] gap-5 items-center">
            <div>
              {c.badge_text && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> {c.badge_text}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.12] mb-3">{c.hero_title}</h1>
              <p className="text-sm sm:text-base font-bold text-slate-700 mb-4">{c.hero_subtitle}</p>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                {(c.hero_checks || []).map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> {t}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-500 mb-6">{c.hero_description}</p>

              <button onClick={() => setStep('form')}
                className="px-7 py-4 bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-wide shadow-lg shadow-blue-700/25 hover:bg-blue-800 hover:-translate-y-0.5 transition-all active:scale-95">
                {ctaLabel}
              </button>
              <p className="text-[11px] font-bold text-slate-400 mt-2.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> {c.secure_note_hero}
              </p>
            </div>

            {c.hero_image && (
              <img src={c.hero_image} alt="" className="hidden sm:block w-52 lg:w-60 rounded-2xl object-cover self-end shadow-lg" />
            )}
          </div>

          {/* OFFER CARD */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-lg shadow-blue-950/5">
            {c.offer_header_text && (
              <div className="bg-blue-700 text-white text-center py-2.5 text-[11px] font-black uppercase tracking-widest">
                {c.offer_header_text}
              </div>
            )}
            <div className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-2.5">{c.countdown_label}</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                {countdownUnits.map(([v, l]) => (
                  <div key={l} className="bg-slate-100 rounded-lg px-2.5 py-2 text-center min-w-[52px]">
                    <div className="text-lg font-black text-slate-900 tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{l}</div>
                  </div>
                ))}
              </div>

              {c.seats_cta_text && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg py-2 text-center text-[11px] font-black text-blue-700 uppercase tracking-wide mb-4">
                  <Users className="w-3.5 h-3.5 inline mr-1.5" /> {c.seats_cta_text}
                </div>
              )}

              <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{c.fee_label}</p>
              {originalPrice && (
                <p className="text-center text-lg font-black text-slate-400 line-through leading-none">₹{originalPrice}</p>
              )}
              <p className="text-center mb-4">
                <span className="text-4xl font-black text-blue-700">₹{price}/-</span>
                <span className="block text-xs font-black text-slate-500 uppercase mt-0.5">{c.price_only_suffix}</span>
              </p>

              <div className="space-y-2.5 mb-5">
                {includeItems.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> {inc}
                  </div>
                ))}
              </div>

              <button onClick={() => setStep('form')}
                className="w-full py-3.5 bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-md hover:bg-blue-800 transition-all mb-2 active:scale-95">
                {ctaLabel}
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> {c.secure_note_offer}
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* STATS BAR */}
        {statItems.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-7 shadow-sm">
            {statItems.map((s, i) => {
              const Icon = STAT_ICONS[i % STAT_ICONS.length];
              return (
                <div key={i} className="flex items-center justify-center gap-2.5">
                  <Icon className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIDEO + DETAILS + SEATS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-5 mb-10">
          {showVideo && (
            <div className="bg-[#0b1e57] rounded-2xl p-4 text-white">
              {c.video_heading && <p className="text-center text-xs font-black uppercase tracking-wider mb-1">{c.video_heading}</p>}
              {c.video_subheading && <p className="text-center text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-3">{c.video_subheading}</p>}
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                {c.video_filename ? (
                  <video src={c.video_filename} controls className="w-full h-full object-cover" />
                ) : (
                  <iframe src={toEmbedUrl(c.video_url)} title="Masterclass intro" className="w-full h-full" allowFullScreen />
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">{c.details_heading}</h4>
            <div className="space-y-4">
              {[
                { Icon: Calendar, label: c.label_masterclass_date, value: c.date },
                { Icon: Clock, label: c.label_time, value: c.time },
                { Icon: Video, label: c.label_mode, value: c.mode },
                { Icon: Globe, label: c.label_language, value: c.language },
              ].filter((r) => r.value).map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-black text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wider mb-4">
              <Users className="w-4 h-4" /> {c.seats_heading}
            </h4>
            {totalSeats > 0 && (
              <>
                <p className="text-center text-sm font-black text-slate-800 mb-1">{fillSeats(c.seats_filled_text)}</p>
                <p className="text-center text-xs font-bold text-rose-600 mb-3">{fillSeats(c.seats_left_text)}</p>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mb-5">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${seatsPct}%` }}></div>
                </div>
              </>
            )}
            {liveRegs.length > 0 && (
              <>
                <p className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase tracking-wider mb-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> {c.live_registrations_label}
                </p>
                <div className="space-y-2.5">
                  {liveRegs.map((n) => (
                    <div key={n} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black flex items-center justify-center shrink-0">
                          {n[0]}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 truncate">{n}</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 shrink-0">{c.live_registrations_badge}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* SKILLS */}
        {learnItems.length > 0 && (
          <section className="bg-white border border-slate-100 rounded-3xl p-7 mb-10 shadow-sm">
            <h2 className="text-center text-sm font-black text-slate-800 uppercase tracking-widest mb-7">{c.skills_heading}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {learnItems.map((item, idx) => {
                const Icon = SKILL_ICONS[idx % SKILL_ICONS.length];
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2.5" strokeWidth={1.8} />
                    <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1">{item.title}</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ACHIEVE + BONUSES */}
        {(achieveItems.length > 0 || bonusItems.length > 0) && (
          <div className={`grid grid-cols-1 gap-6 mb-10 ${achieveItems.length > 0 && bonusItems.length > 0 ? 'lg:grid-cols-2' : ''}`}>
            {achieveItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-7">
                <h3 className="font-black text-sm text-blue-800 uppercase tracking-wider mb-5">{c.achieve_heading}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
                  <ul className="space-y-3">
                    {achieveItems.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-bold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {a}
                      </li>
                    ))}
                  </ul>
                  {c.achievement_image && (
                    <img src={c.achievement_image} alt="" className="w-32 h-auto rounded-xl object-cover hidden sm:block" />
                  )}
                </div>
              </div>
            )}

            {bonusItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-7">
                <h3 className="font-black text-sm text-blue-800 uppercase tracking-wider mb-1">{c.bonuses_heading}</h3>
                {c.bonuses_subheading && <p className="text-[11px] text-slate-500 mb-5">{c.bonuses_subheading}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
                  <ul className="space-y-3">
                    {bonusItems.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-bold text-slate-700">
                        <Gift className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {b}
                      </li>
                    ))}
                  </ul>
                  <Gift className="w-24 h-24 text-blue-600/30 hidden sm:block shrink-0" strokeWidth={1.2} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TESTIMONIALS */}
        {testimonialItems.length > 0 && (
          <section className="mb-10">
            <h2 className="text-center text-sm font-black text-slate-800 uppercase tracking-widest mb-7">{c.testimonials_heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {testimonialItems.map((t, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                      {t.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </span>
                    <div>
                      <p className="font-black text-sm text-slate-800">{t.name}</p>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: t.rating || 5 }).map((_, s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="mb-10">
            <h2 className="text-center text-sm font-black text-slate-800 uppercase tracking-widest mb-7">{c.faq_heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {faqItems.map((f, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm h-fit">
                  <button type="button" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left font-bold text-xs text-slate-800">
                    <span>Q. {f.q}</span>
                    <span className="text-slate-400 font-black text-base shrink-0">{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && <div className="px-4 pb-3.5 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BOTTOM CTA */}
        <div className="bg-[#0b1e57] rounded-3xl p-7 grid grid-cols-1 lg:grid-cols-[1.5fr_auto_auto] gap-6 items-center text-white mb-6">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-full border-2 border-blue-400/40 flex items-center justify-center shrink-0">
              <Rocket className="w-7 h-7 text-blue-300" />
            </span>
            <div>
              <h4 className="text-lg font-black leading-tight">{c.final_cta_title}</h4>
              <p className="text-sm text-blue-200">{c.final_cta_subtitle}</p>
            </div>
          </div>
          <div className="text-center lg:border-l lg:border-white/15 lg:pl-6">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">{c.fee_label}</p>
            <p className="text-2xl font-black">₹{price}/- <span className="text-xs font-bold text-blue-200">{c.price_only_suffix}</span></p>
          </div>
          <div className="text-center">
            <button onClick={() => setStep('form')}
              className="w-full lg:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-wide shadow-lg hover:bg-blue-500 transition-all active:scale-95">
              {c.cta_button_text}
            </button>
            <p className="text-[10px] text-blue-300 mt-1.5">{c.final_cta_note}</p>
          </div>
        </div>

        {/* TRUST + PAYMENT LOGOS */}
        {((c.landing_trust_items || []).length > 0 || (c.payment_brands || []).length > 0) && (
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-5 flex flex-wrap items-center justify-between gap-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              {(c.landing_trust_items || []).map((l, i) => {
                const Icon = LANDING_TRUST_ICONS[i % LANDING_TRUST_ICONS.length];
                return (
                  <span key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <Icon className="w-5 h-5 text-blue-600" /> {l}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs font-black italic">
              {(c.payment_brands || []).map((b, i) => (
                <span key={i} className={BRAND_COLORS[i % BRAND_COLORS.length]}>{b}</span>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter c={c} />
    </div>
  );
}
