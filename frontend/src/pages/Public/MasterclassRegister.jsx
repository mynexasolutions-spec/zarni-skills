import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck, Video, Clock, Users, Calendar, Loader2, User, Phone, Mail, Cake,
  Briefcase, MapPin, BarChart3, Target, Wallet, Star, HelpCircle, CheckCircle2,
  Lock, ShieldAlert, MessageCircle, CalendarPlus, Trophy, Gift, Rocket, Headphones,
  CreditCard, Copy, Check, Play, Award, Mic, Bot, IndianRupee, Brain, Film,
  ArrowRight, FileText, Youtube, Instagram, Send, Facebook, Globe, Zap,
  GraduationCap, Landmark, QrCode, Smartphone
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

// WhatsApp gets its actual brand green (matches the community/support cards
// further down the page), the "watch video" step gets a filled play-button
// look instead of a bare outline icon, everything else stays on-brand blue —
// a uniform flat-blue icon per step read as one undifferentiated row.
function nextStepAccent(Icon) {
  if (Icon === MessageCircle) return { color: 'text-emerald-500', filled: false };
  if (Icon === Play || Icon === Video) return { color: 'text-white', filled: true };
  return { color: 'text-blue-600', filled: false };
}

// Renders text with {{...}} segments in blue — lets the admin highlight a
// word or phrase in the hero title (e.g. "How To Make {{Money Online}} Business")
// without needing separate title fields. A literal newline in the admin's
// text becomes a <br/>, so the heading can be forced onto exact lines
// (e.g. "How To Make\n{{Money Online}}\nBusiness") instead of relying on
// the browser to wrap it the same way at every screen width.
function renderHighlight(text) {
  if (!text) return null;
  return text.split('\n').map((line, lineIdx, lines) => (
    <React.Fragment key={lineIdx}>
      {line.split(/(\{\{.*?\}\})/g).map((part, i) => {
        const m = part.match(/^\{\{(.*)\}\}$/);
        return m ? <span key={i} className="text-blue-600">{m[1]}</span> : <React.Fragment key={i}>{part}</React.Fragment>;
      })}
      {lineIdx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

// Same {{...}} markup, but for spots that need a plain string (calendar links,
// white-on-dark card copies) — keeps the highlighted words, drops the braces.
function stripHighlight(text) {
  return (text || '').replace(/\{\{(.*?)\}\}/g, '$1');
}

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
            className="h-12 sm:h-14 w-auto object-contain"
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
    { key: 'youtube', Icon: Youtube, cls: 'bg-gradient-to-tr from-red-500 to-rose-600 hover:shadow-red-500/30' },
    { key: 'instagram', Icon: Instagram, cls: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 hover:shadow-pink-500/30' },
    { key: 'telegram', Icon: Send, cls: 'bg-gradient-to-tr from-sky-400 to-blue-500 hover:shadow-sky-500/30' },
    { key: 'facebook', Icon: Facebook, cls: 'bg-gradient-to-tr from-blue-600 to-indigo-700 hover:shadow-blue-600/30' },
  ].filter((s) => social[s.key]);

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400 border-t border-slate-800/80 mt-20 pt-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,74,173,0.1),transparent_50%)]"></div>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-6">
            {c?.logo_image ? (
              <img src={c.logo_image} alt={c?.brand_name || ''} className="h-14 sm:h-16 w-auto object-contain brightness-110" />
            ) : (
              <span className="font-black text-2xl uppercase tracking-wider bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">{c?.brand_name}</span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-bold mb-4">{c?.mission_text}</p>
        </div>
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-100 mb-6 pb-2 border-b border-slate-800">{c?.footer_links_heading || 'IMPORTANT LINKS'}</h4>
          <ul className="space-y-3.5 text-sm sm:text-base font-bold text-slate-400">
            {(c?.footer_links || []).map((l, i) => (
              <li key={i}>
                <a href={l.url} className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1">
                  <span>•</span> {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-100 mb-6 pb-2 border-b border-slate-800">{c?.footer_contact_heading || 'CONTACT US'}</h4>
          <ul className="space-y-4 text-sm sm:text-base font-bold text-slate-400">
            {c?.support_phone && <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-sky-400 shrink-0" /> {c.support_phone}</li>}
            {c?.support_email && <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-sky-400 shrink-0" /> {c.support_email}</li>}
            {c?.website_url && <li className="flex items-center gap-3"><Globe className="w-5 h-5 text-sky-400 shrink-0" /> {c.website_url}</li>}
            {c?.whatsapp_support_link && (
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4.5 h-4.5 text-emerald-400" />
                </span>
                <a href={c.whatsapp_support_link} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">{c?.whatsapp_support_label}</a>
              </li>
            )}
          </ul>
        </div>
        {socialIcons.length > 0 && (
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-100 mb-6 pb-2 border-b border-slate-800">{c?.footer_social_heading || 'FOLLOW US'}</h4>
            <div className="flex gap-4">
              {socialIcons.map(({ key, Icon, cls }) => (
                <a key={key} href={social[key]} target="_blank" rel="noreferrer"
                  className={`w-11 h-11 rounded-xl ${cls} flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl`}>
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#004aad] py-5 text-center text-xs sm:text-sm font-black text-white tracking-widest uppercase relative z-10 border-t border-white/10">
        {c?.copyright_text || `© ${new Date().getFullYear()} ${c?.brand_name || ''}. All Rights Reserved.`}
      </div>
    </footer>
  );
}

// Module-level so it isn't redefined (and remounted) on every parent render.
// Each tile cycles through its own accent color instead of one flat blue —
// reads as a proof-point "gallery" rather than a plain divided strip.
const STAT_ACCENTS = [
  { icon: 'text-blue-600', tile: 'from-blue-500/10 to-indigo-500/5', bar: 'from-blue-500 to-indigo-500' },
  { icon: 'text-amber-500', tile: 'from-amber-500/10 to-orange-500/5', bar: 'from-amber-400 to-orange-500' },
  { icon: 'text-emerald-600', tile: 'from-emerald-500/10 to-teal-500/5', bar: 'from-emerald-500 to-teal-500' },
  { icon: 'text-fuchsia-600', tile: 'from-fuchsia-500/10 to-purple-500/5', bar: 'from-fuchsia-500 to-purple-500' },
  { icon: 'text-sky-600', tile: 'from-sky-500/10 to-blue-500/5', bar: 'from-sky-500 to-blue-500' },
];

function StatTile({ s, i }) {
  const Icon = STAT_ICONS[i % STAT_ICONS.length];
  const a = STAT_ACCENTS[i % STAT_ACCENTS.length];
  return (
    <div
      className="group relative flex flex-col items-center text-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-default overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <span className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${a.bar} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}></span>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${a.tile} flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
        <Icon className={`w-5.5 h-5.5 ${a.icon}`} />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 to-[#004aad] bg-clip-text text-transparent leading-none mb-1.5">{s.value}</p>
        <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-tight">{s.label}</p>
      </div>
    </div>
  );
}

// Icon + accent color per payment method — a colored badge reads faster than
// the little styled-text wordmarks this used to render, and doesn't depend
// on approximating each brand's actual logo in CSS. Matched by keyword
// against the option's label/brand text (not a fixed `logoType` key) because
// the admin-managed Payment Options list (ObjectListEditor in the funnel
// editor) only ever saves label/desc/brand/logo_image — a `logoType` only
// ever existed on the hardcoded default array, so every admin-configured
// option was silently falling through to one generic icon before this.
const PAYMENT_ICON_RULES = [
  { test: /\bupi\b/i, Icon: QrCode, color: 'text-orange-600', bg: 'bg-orange-50' },
  { test: /phone\s*pe/i, Icon: Smartphone, color: 'text-[#5f259f]', bg: 'bg-purple-50' },
  { test: /google\s*pay|g\s*pay|gpay/i, Icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
  { test: /paytm/i, Icon: IndianRupee, color: 'text-[#00b9f5]', bg: 'bg-sky-50' },
  { test: /card|visa|master\s*card|rupay|debit|credit/i, Icon: CreditCard, color: 'text-indigo-700', bg: 'bg-indigo-50' },
  { test: /net\s*banking|\bbank/i, Icon: Landmark, color: 'text-blue-700', bg: 'bg-blue-50' },
];

function paymentIconFor(m) {
  const text = `${m.logoType || ''} ${m.label || ''} ${m.brand || ''}`;
  return PAYMENT_ICON_RULES.find((r) => r.test.test(text)) || { Icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' };
}

function PaymentLogo({ m }) {
  // A real uploaded logo always wins over the guessed icon.
  if (m.logo_image) {
    return (
      <span className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        <img src={m.logo_image} alt="" className="w-full h-full object-contain p-1.5" />
      </span>
    );
  }
  const { Icon, color, bg } = paymentIconFor(m);
  return (
    <span className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </span>
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
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [paying, setPaying] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (step === 'success') {
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      const shapes = ['circle', 'square', 'triangle'];
      const pieces = Array.from({ length: 120 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -30 - Math.random() * 50,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 2.5,
        tilt: Math.random() * 360,
      }));
      setConfetti(pieces);
      const timer = setTimeout(() => setConfetti([]), 9000);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim().replace(/\D/g, ''); // keep only numbers
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setPaying(true);

    const payload = {
      name: cleanName, phone: cleanPhone, email: cleanEmail,
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
    const title = encodeURIComponent(stripHighlight(c.hero_title) || 'Masterclass');
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

  // Short forms — the tiles these sit in are only ~50-70px wide on tighter
  // laptop widths, and "Minutes"/"Seconds" were the ones actually forcing
  // that row wider than its column and getting clipped or ellipsis-truncated.
  const countdownUnits = [
    [countdown.days, 'Days'], [countdown.hours, 'Hrs'],
    [countdown.minutes, 'Min'], [countdown.seconds, 'Sec'],
  ];

  // ══ SUCCESS STEP ══════════════════════════════════════════════════════
  if (step === 'success' && successData) {
    const nextSteps = (c.next_steps || []).map((s, i) => {
      const key = s.link_key;
      let href = null; let onClick = null;
      if (key === 'calendar') onClick = addToCalendar;
      else if (key === 'email') href = 'https://mail.google.com';
      // An uploaded Preparation Video file always wins over the plain-URL
      // fallback — same priority as the Hero video (video_filename before
      // video_url).
      else if (key === 'preparation_video_link') href = c.preparation_video_filename || c.preparation_video_link || null;
      else href = c[key] || null;
      return (href || onClick) ? { ...s, href, onClick, Icon: NEXT_STEP_ICONS[i % NEXT_STEP_ICONS.length], n: i + 1 } : null;
    }).filter(Boolean);

    // Fallback Next Steps if empty in backend
    const stepsList = nextSteps.length > 0 ? nextSteps : [
      { n: 1, Icon: MessageCircle, title: 'Join WhatsApp Community', desc: 'Join our official community to get updates, reminders & important announcements.', cta: 'JOIN COMMUNITY', href: c.whatsapp_group_link || '#' },
      { n: 2, Icon: Mail, title: 'Check Your Email', desc: 'Check your email for payment receipt and masterclass details.', cta: 'CHECK EMAIL', href: 'https://mail.google.com' },
      { n: 3, Icon: Calendar, title: 'Add to Calendar', desc: 'Add the masterclass to your calendar so you don\'t miss it.', cta: 'ADD TO CALENDAR', onClick: addToCalendar },
      { n: 4, Icon: Video, title: 'Watch Preparation Video', desc: 'Watch this short video to know how to get the best from this masterclass.', cta: 'WATCH NOW', href: c.preparation_video_filename || c.preparation_video_link || '#' },
      { n: 5, Icon: Award, title: 'Download Welcome PDF', desc: 'Download the welcome guide & preparation checklist for the session.', cta: 'DOWNLOAD PDF', href: c.welcome_pdf_link || '#' },
    ];

    const colClass = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[stepsList.length] || 'lg:grid-cols-5';

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden">
        <style>{`
          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(120vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>

        {/* Ambient background glow + dot grid, behind everything */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-blue-400/10 blur-[110px]" />
          <div className="absolute top-40 -right-24 w-[380px] h-[380px] rounded-full bg-emerald-400/10 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'linear-gradient(#0b1e57 1px, transparent 1px), linear-gradient(90deg, #0b1e57 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
        </div>

        {/* Confetti Particles */}
        {confetti.map((p) => (
          <div
            key={p.id}
            className="fixed pointer-events-none z-[100]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
              borderRadius: p.shape === 'circle' ? '50%' : '0px',
              borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : '',
              borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : '',
              borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : '',
              transform: `rotate(${p.tilt}deg)`,
              animation: `confettiFall ${p.duration}s linear ${p.delay}s forwards`,
            }}
          />
        ))}

        <SiteHeader c={c} />

        <main className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 py-8">

          {/* Top Confirmation Card */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] bg-white border border-slate-200/80 rounded-[2.5rem] overflow-hidden shadow-xl shadow-blue-900/5 mb-6">
            <span className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-[#004aad] z-10"></span>
            {/* Left Pane (Confirmation message) */}
            <div className="p-8 sm:p-12 text-center flex flex-col justify-center items-center bg-white border-r border-slate-100">
              <div className="relative w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 animate-pop-in">
                <span className="absolute -inset-3 rounded-full bg-emerald-400/20 animate-ping [animation-duration:2.2s]"></span>
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30"></span>
                <Check className="relative w-9 h-9 text-white" strokeWidth={3.5} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] via-blue-600 to-emerald-500">{c.success_title || 'Congratulations!'}</h1>
              <p className="text-xl font-black text-[#004aad] mb-3">{c.success_subtitle || 'Your Registration is Confirmed!'}</p>
              <p className="text-sm font-semibold text-slate-400 mb-6 max-w-sm leading-relaxed">
                {c.success_message || 'Welcome to Zarni Skills Family. Your seat has been successfully reserved.'}
              </p>
              <div className="relative inline-flex flex-col items-center gap-1.5 px-8 py-3 rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/60 to-slate-50/50 min-w-[240px] shadow-sm">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{c.registration_id_label || 'REGISTRATION ID'}</span>
                <span className="flex items-center gap-2 text-base sm:text-lg font-black text-slate-800 tracking-wider tabular-nums">
                  {successData.registration_id}
                  <button onClick={copyRegId} className="text-slate-400 hover:text-blue-700 hover:scale-110 active:scale-95 transition-all" aria-label="Copy registration ID">
                    {copied ? <Check className="w-4.5 h-4.5 text-emerald-600" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </span>
                {copied && (
                  <span className="absolute -bottom-6 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-fade-in-up">Copied!</span>
                )}
              </div>
            </div>

            {/* Right Pane (Class timings & Info) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1e57] via-[#0e2568] to-[#12308a] text-white p-8 sm:p-12 flex items-center">
              <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-blue-400/15 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none"></div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center w-full z-10 relative">
                <div className="space-y-5">
                  <h3 className="font-black text-lg sm:text-xl uppercase tracking-wider text-blue-300 leading-tight">
                    {c.success_panel_heading || "You're All Set For The Live Masterclass!"}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { Icon: Calendar, label: c.label_masterclass_date || 'Masterclass Date', value: successData.date || c.date || '17 August 2026, Sunday' },
                      { Icon: Clock, label: c.label_time || 'Time', value: successData.time || c.time || '07:00 PM – 09:00 PM (IST)' },
                      { Icon: Video, label: c.label_mode || 'Mode', value: successData.mode || c.mode || 'Online (Zoom Meeting)' },
                      { Icon: Globe, label: c.label_language || 'Language', value: successData.language || c.language || 'Hindi' },
                    ].filter((r) => r.value).map(({ Icon, label, value }, i) => (
                      <div key={label} className="group flex items-start gap-3.5 animate-fade-in-up" style={{ animationDelay: `${i * 90}ms` }}>
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                          <Icon className="w-5 h-5 text-blue-300 shrink-0" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider leading-none mb-1">{label}</p>
                          <p className="text-sm sm:text-base font-black text-white">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2.5 bg-amber-400/10 border border-amber-300/25 rounded-xl px-3.5 py-3">
                    <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <p className="text-[11px] sm:text-xs font-semibold text-amber-100 leading-relaxed">
                      {c.schedule_disclaimer_text || 'This schedule isn\'t final yet — join our WhatsApp Community below and we\'ll confirm the exact date & time there.'}
                    </p>
                  </div>
                </div>

                {c.summary_image && (
                  <div className="relative w-44 h-32 rounded-2xl overflow-hidden border border-white/15 shadow-xl shrink-0 hidden sm:block">
                    <img src={c.summary_image} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-blue-600 text-[8px] font-black uppercase tracking-widest text-white">
                      {c.badge_text || 'LIVE MASTERCLASS'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email / WhatsApp Confirmation Note Row */}
          <div className="bg-[#f4f8ff] border border-blue-100/50 rounded-3xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:divide-x md:divide-blue-100 mb-8">
            <div className="flex items-center gap-3.5 text-slate-700 flex-1 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm font-bold">A confirmation email has been sent to <strong className="text-blue-900 font-extrabold">{successData.email}</strong></span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-700 flex-1 justify-center md:justify-start md:pl-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs sm:text-sm font-bold">Event updates and reminders will be sent to <strong className="text-emerald-950 font-extrabold">{successData.phone} (WhatsApp)</strong></span>
            </div>
          </div>

          {/* Next Steps Header */}
          <div className="flex items-center gap-4 my-8">
            <span className="h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-slate-200 flex-1"></span>
            <h3 className="font-black text-blue-800 uppercase tracking-widest text-sm bg-slate-50 px-4">{c.next_steps_heading || 'NEXT STEPS'}</h3>
            <span className="h-[2px] bg-gradient-to-l from-transparent via-slate-200 to-slate-200 flex-1"></span>
          </div>

          {/* Next Steps Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-6 mb-8`}>
            {stepsList.map(({ n, Icon, title, desc, cta, href, onClick }, i) => {
              const accent = nextStepAccent(Icon);
              return (
              <div key={n} className="group bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">{n}</span>
                    {accent.filled ? (
                      // Always a play triangle here, even if the underlying
                      // icon is Video (the fallback "Watch Preparation Video"
                      // step) — the point is a recognizable play-button, not
                      // whatever the semantic icon for this step happens to be.
                      <span className="w-8 h-8 rounded-full bg-[#004aad] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                      </span>
                    ) : (
                      <Icon className={`w-8 h-8 ${accent.color} shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`} />
                    )}
                  </div>
                  <p className="font-black text-sm text-slate-800 mb-2 leading-tight">{title}</p>
                  <p className="text-[11px] text-slate-400 font-bold leading-normal mb-4">{desc}</p>
                </div>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#004aad] hover:bg-[#003d94] text-white text-xs font-black uppercase tracking-wider text-center transition-colors">
                    {cta}
                  </a>
                ) : (
                  <button onClick={onClick}
                    className="w-full py-2.5 rounded-xl bg-[#004aad] hover:bg-[#003d94] text-white text-xs font-black uppercase tracking-wider transition-colors">
                    {cta}
                  </button>
                )}
              </div>
              );
            })}
          </div>

          {/* Community & Support Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:border-emerald-200/70 transition-colors duration-300">
              <div className="mb-4">
                <h4 className="font-black text-sm text-blue-800 uppercase tracking-wider mb-1">{c.community_panel_heading || 'JOIN OUR COMMUNITY'}</h4>
                <p className="text-xs font-bold text-slate-400">{c.community_panel_text || 'Get instant access to our WhatsApp community and connect with other learners.'}</p>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 text-left">
                  <span className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                    <MessageCircle className="w-5.5 h-5.5 text-white" />
                  </span>
                  <div>
                    <p className="font-black text-sm text-slate-800">{c.community_card_title || 'WhatsApp Community'}</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{c.community_card_subtitle || 'Learn, Network & Grow Together'}</p>
                  </div>
                </div>
                <a href={c.whatsapp_group_link || '#'} target="_blank" rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors shrink-0">
                  {c.community_card_cta || 'JOIN COMMUNITY'}
                </a>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:border-emerald-200/70 transition-colors duration-300">
              <div className="mb-4">
                <h4 className="font-black text-sm text-blue-800 uppercase tracking-wider mb-1">{c.support_panel_heading || 'YOUR WHATSAPP SUPPORT'}</h4>
                <p className="text-xs font-bold text-slate-400">{c.support_panel_text || 'Need help? Chat directly with our support team on WhatsApp.'}</p>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 text-left">
                  <img 
                    src={c.support_avatar_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                    alt="Support" 
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm" 
                  />
                  <div>
                    <p className="font-black text-sm text-slate-800">{c.support_card_title || 'Chat on WhatsApp'}</p>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{c.support_card_subtitle || "We're here to help you!"}</p>
                  </div>
                </div>
                <a href={c.whatsapp_support_link || '#'} target="_blank" rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors shrink-0">
                  {c.support_card_cta || 'CHAT NOW'}
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Success Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1e57] via-[#0e2568] to-[#12308a] text-white rounded-[2.5rem] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1.1fr] gap-8 items-center mb-8 shadow-2xl shadow-blue-900/30">
            <div className="absolute -top-14 -right-14 w-64 h-64 rounded-full bg-amber-300/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-blue-400/15 blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-5 z-10 relative">
              <span className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 bg-white/10 shadow-lg shadow-black/20 animate-float">
                <Trophy className="w-8 h-8 text-amber-300" />
              </span>
              <div>
                <h4 className="text-lg sm:text-xl font-black mb-1.5">{c.success_banner_title || 'You\'ve Taken The First Step Towards Your Success!'}</h4>
                <p className="text-xs sm:text-sm font-semibold text-blue-200/90">{c.success_banner_subtitle || 'We\'re excited to help you achieve your goals.'}</p>
              </div>
            </div>
            {/* Testimonial / Founder card */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 z-10 relative backdrop-blur-sm hover:bg-white/[0.14] transition-colors duration-300">
              <p className="text-xs sm:text-sm italic text-blue-100 mb-4">
                "{c.founder_quote || 'The best investment you can make is in yourself. See you in the masterclass!'}"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" 
                  alt="Founder" 
                  className="w-9 h-9 rounded-full object-cover border border-white/15 shadow-sm" 
                />
                <div>
                  <p className="text-xs sm:text-sm font-black">– {c.founder_name || 'Suriya Yadav'}</p>
                  <p className="text-[10px] text-blue-300 font-bold">{c.founder_title || 'Founder, Zarni Skills'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Trust Badges */}
          <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:divide-x divide-slate-100 shadow-sm">
            {(c.success_trust_items && c.success_trust_items.length > 0 ? c.success_trust_items : [
              '100% Secure Payment', 'Instant Access', 'Expert Guidance', 'Practical Learning', 'Live Q&A Session', 'Certificate Included'
            ]).map((label, i) => {
              const Icon = SUCCESS_TRUST_ICONS[i % SUCCESS_TRUST_ICONS.length];
              return (
                <div key={i} className="group flex flex-col lg:flex-row items-center justify-center gap-2 px-2 text-center lg:text-left py-2 lg:py-0 animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                  <Icon className="w-5.5 h-5.5 text-blue-600 shrink-0 transition-transform duration-300 group-hover:scale-125" />
                  <span className="text-[11px] font-black text-slate-700 tracking-wide uppercase leading-tight">{label}</span>
                </div>
              );
            })}
          </div>
        </main>

        <SiteFooter c={c} />
      </div>
    );
  }

  // ══ FORM STEP ═════════════════════════════════════════════════════════
  if (step === 'form') {
    const paymentOptions = c.payment_options && c.payment_options.length > 0 ? c.payment_options : [
      { label: 'UPI', desc: 'Pay using any UPI app', logoType: 'upi' },
      { label: 'PhonePe', desc: 'Pay using PhonePe', logoType: 'phonepe' },
      { label: 'Google Pay', desc: 'Pay using Google Pay', logoType: 'gpay' },
      { label: 'Paytm', desc: 'Pay using Paytm', logoType: 'paytm' },
      { label: 'Debit / Credit Card', desc: 'Visa, Mastercard, Rupay', logoType: 'cards' },
      { label: 'Net Banking', desc: 'All major banks supported', logoType: 'netbanking' },
    ];
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <SiteHeader c={c} />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-7">
          {/* Same hero_image banner treatment as the landing page, so the
              registration step feels like one continuous design. */}
          <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-10 mb-6 bg-gradient-to-r from-[#eef4ff] to-[#f4f8ff] border border-blue-50">
            {/* Both tracks are fr-based (not fr + auto) so the right card can
                never force the row wider than the container — it gets a
                fixed proportional share and its own content shrinks to fit
                that share (flex-1/min-w-0 below) instead of pushing past it
                and getting clipped by the outer overflow-hidden. */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-center">
              <div className="space-y-4 min-w-0">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-slate-900 via-[#0b1e57] to-[#004aad] bg-clip-text text-transparent mb-2 leading-tight tracking-tight">{c.form_title}</h1>
                  <p className="text-base sm:text-lg text-slate-500 font-semibold">{c.form_subtitle}</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
                  {(c.feature_chips || []).map((chip, i) => {
                    const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
                    return (
                      <div key={i} className="group flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/60 transition-colors duration-300">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-100">
                          <Icon className="w-4.5 h-4.5 text-blue-600" />
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-700 leading-tight">{chip}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1e57] via-[#0e2568] to-[#12308a] text-white rounded-3xl shadow-2xl shadow-blue-900/30 flex flex-col sm:flex-row items-stretch w-full min-w-0">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-14 -left-10 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none"></div>
                <div className="relative flex-1 flex flex-col justify-center gap-3 px-3 sm:px-6 py-4 sm:py-5 sm:border-r border-white/10 min-w-0">
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">{c.countdown_label || 'OFFER ENDS IN'}</p>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                    {/* Re-keying the number on its own value is what makes it
                        flip every second — a plain re-render leaves an
                        already-finished CSS animation finished, it doesn't
                        replay it. flex-1/min-w-0 (not a fixed min-width) lets
                        these four tiles shrink together to whatever the
                        column actually has, instead of forcing the row wider
                        than its container and getting clipped. */}
                    {countdownUnits.map(([v, l]) => (
                      <div key={l} className="flex-1 min-w-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-1 sm:px-2.5 py-1.5 sm:py-2 text-center shadow-inner overflow-hidden">
                        <div key={v} className="animate-flip-in text-lg sm:text-2xl font-black text-white tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
                        <div className="text-[7px] sm:text-[9px] font-bold text-blue-200/80 uppercase tracking-widest mt-1 truncate">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {totalSeats > 0 && (
                  <div className="relative px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-center min-w-0 sm:min-w-[220px] border-t sm:border-t-0 border-white/10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-300 whitespace-nowrap">{c.limited_seats_label || 'LIMITED SEATS'}</span>
                    </div>
                    <p className="text-center text-sm sm:text-lg font-black text-white mb-2.5 whitespace-nowrap" style={{ textShadow: '0 2px 10px rgba(37,99,235,0.5)' }}>{fillSeats(c.seats_left_text)}</p>
                    <div className="h-2.5 rounded-full bg-white/15 overflow-hidden w-full max-w-[190px] mx-auto shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(96,165,250,0.7)]" style={{ width: `${seatsPct}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] sm:w-auto animate-slideDown">
              <div className="bg-white border-2 border-rose-100 text-rose-700 px-5 py-4 rounded-2xl shadow-[0_15px_40px_rgba(244,63,94,0.12)] flex items-start gap-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                <ShieldAlert className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800 leading-tight">Error</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">{error}</p>
                </div>
                <button onClick={() => setError('')} className="text-slate-400 hover:text-slate-600 font-black text-xs shrink-0 pl-2">✕</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 items-start">

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-col mb-4">
                <div className="flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#004aad] to-blue-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
                    1
                  </span>
                  <div>
                    <h2 className="font-black text-base tracking-wider bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent uppercase">
                      {c.step1_heading || 'YOUR DETAILS'}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      {c.step1_subheading || 'Fill in your information to get started'}
                    </p>
                  </div>
                </div>
                <div className="h-[2px] bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent w-full mt-3"></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_full_name} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-blue-600" />
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={c.placeholder_full_name}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_phone || 'Mobile Number (WhatsApp)'} <span className="text-rose-500">*</span></label>
                <div className="relative flex items-center rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 overflow-hidden bg-white">
                  <div className="flex items-center gap-1.5 px-3.5 py-3 text-base font-bold text-slate-700 bg-slate-50 border-r border-slate-200 h-full shrink-0">
                    <Phone className="w-4.5 h-4.5 text-blue-600" />
                    <span>{c.country_code || '+91'}</span>
                    <span className="text-[9px] text-slate-400">▼</span>
                  </div>
                  <input required type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder={c.placeholder_phone || 'Enter your WhatsApp number'}
                    className="w-full px-4 py-3 text-base focus:outline-none bg-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_email || 'Email Address'} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-blue-600" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.placeholder_email || 'Enter your email address'}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(c.age_options || []).length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_age || 'Age'} <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Cake className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-blue-600 pointer-events-none" />
                      <select required value={age} onChange={(e) => setAge(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none">
                        <option value="">{c.placeholder_age || 'Select your age'}</option>
                        {c.age_options.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <span className="absolute right-3.5 top-4 text-[10px] text-slate-400 pointer-events-none">▼</span>
                    </div>
                  </div>
                )}
                {(c.occupation_options || []).length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_occupation || 'Occupation'} <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-blue-600 pointer-events-none" />
                      <select required value={occupation} onChange={(e) => setOccupation(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none">
                        <option value="">{c.placeholder_occupation || 'Select occupation'}</option>
                        {c.occupation_options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <span className="absolute right-3.5 top-4 text-[10px] text-slate-400 pointer-events-none">▼</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_city || 'City & State (Optional)'}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-blue-600 pointer-events-none" />
                    <input value={cityState} onChange={(e) => setCityState(e.target.value)} placeholder={c.placeholder_city || 'Enter your city & state'}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                  </div>
                </div>
                {(c.experience_options || []).length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{c.label_experience || 'Experience Level'} <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <BarChart3 className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-blue-600 pointer-events-none" />
                      <select required value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none">
                        <option value="">{c.placeholder_experience || 'Select your level'}</option>
                        {c.experience_options.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <span className="absolute right-3.5 top-4 text-[10px] text-slate-400 pointer-events-none">▼</span>
                    </div>
                  </div>
                )}
              </div>

              {(c.goal_options || []).length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">{c.label_goal || 'What is your biggest goal? (Choose one)'} <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {c.goal_options.map((label, i) => {
                      const Icon = GOAL_ICONS[i % GOAL_ICONS.length];
                      return (
                        <button key={label} type="button" onClick={() => setGoal(label)}
                          className={`flex items-center gap-2.5 px-3.5 py-3.5 rounded-xl border text-sm font-bold text-left transition-all ${
                            goal === label ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}>
                          <Icon className={`w-4 h-4 shrink-0 ${goal === label ? 'text-blue-600' : 'text-slate-500'}`} /> {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" disabled={paying}
                className="w-full py-4 bg-[#004aad] hover:bg-[#003d94] text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-4">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> {c.processing_text || 'Processing...'}</> : <>PROCEED TO PAYMENT <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5 mt-4">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" /> Your information is 100% secure and safe.
              </p>
            </form>

            <div className="space-y-5">
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="p-4 sm:p-6 pb-4">
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#004aad] to-blue-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
                        2
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent uppercase truncate">
                          {c.step2_heading || 'ORDER SUMMARY'}
                        </h2>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-0.5 truncate">
                          {c.step2_subheading || 'Review your order details'}
                        </p>
                      </div>
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent w-full mt-3"></div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[#0b1e57] via-[#0e2568] to-[#12308a] text-white p-4 sm:p-5 relative overflow-hidden min-h-[130px] sm:min-h-[150px] flex flex-col justify-center shadow-lg shadow-blue-900/20">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b1e57]/95 via-[#0b1e57]/50 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 max-w-[62%] sm:max-w-[60%]">
                      <span className="inline-block w-fit px-2.5 py-0.5 rounded bg-blue-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-2 shadow-sm shadow-blue-500/30">
                        {c.badge_text}
                      </span>
                      <h3 className="font-black text-base sm:text-xl leading-tight">{stripHighlight(c.hero_title)}</h3>
                    </div>
                    {c.summary_image && (
                      <img src={c.summary_image} alt="" className="absolute right-0 bottom-0 h-full max-w-[40%] sm:max-w-[42%] w-auto object-contain object-bottom opacity-95" />
                    )}
                  </div>
                </div>
                <div className="px-4 sm:px-6 pb-3">
                  <p className="font-bold text-sm text-slate-800 truncate">{c.order_item_title}</p>
                  <p className="text-xs text-slate-500 truncate">{stripHighlight(c.hero_title)}</p>
                </div>
                <div className="px-4 sm:px-6 pb-6 space-y-3.5 text-sm border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>{c.fee_label || 'Registration Fee'}</span>
                    <span className="text-slate-900 font-bold">₹{price}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>{c.gst_label || 'GST (18%)'}</span>
                    <span className="text-slate-900 font-bold">₹{c.gst_amount ?? 0}</span>
                  </div>
                  <div className="flex items-start justify-between rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-4 py-3.5 mt-1">
                    <div className="min-w-0">
                      <span className="font-black text-slate-900 text-sm sm:text-base">{c.total_label || 'Total Amount'}</span>
                      <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">{c.tax_note || '(All taxes included)'}</p>
                    </div>
                    <span className="font-black text-blue-700 text-xl sm:text-2xl shrink-0 pl-2">₹{Number(price) + Number(c.gst_amount ?? 0)}</span>
                  </div>
                </div>
              </div>

              {paymentOptions.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#004aad] to-blue-500 text-white flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
                        3
                      </span>
                      <div className="min-w-0">
                        <h2 className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent uppercase truncate">
                          {c.step3_heading || 'CHOOSE PAYMENT OPTION'}
                        </h2>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-0.5 truncate">
                          {c.step3_subheading || 'Select your preferred payment method'}
                        </p>
                      </div>
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent w-full mt-3"></div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-sm">
                    {paymentOptions.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3 sm:py-3.5 bg-white hover:bg-blue-50/40 transition-colors">
                        <PaymentLogo m={m} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 leading-tight truncate">{m.label}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1 truncate">{m.desc}</p>
                        </div>
                        {!m.logo_image && m.brand && (
                          <span className={`text-xs font-black italic shrink-0 ${BRAND_COLORS[i % BRAND_COLORS.length]}`}>{m.brand}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/70 rounded-xl text-center">
                    <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                      💡 All these payment options will be available on the Razorpay payment gateway after clicking "Proceed to Payment".
                    </p>
                  </div>
                  <p className="text-center text-xs font-bold text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-blue-600 shrink-0" /> {c.payment_secure_note || 'Secure payment powered by Razorpay'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {(() => {
            const trustItems = c.form_trust_items && c.form_trust_items.length > 0 ? c.form_trust_items : [
              { title: '100% Secure', desc: 'Your data is protected', Icon: ShieldCheck },
              { title: 'Easy Payment', desc: 'Multiple payment options', Icon: CreditCard },
              { title: 'Instant Access', desc: 'Get immediate confirmation', Icon: Zap },
              { title: '24/7 Support', desc: "We're here to help", Icon: Headphones },
            ];
            return (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x divide-slate-100 mt-6 shadow-sm">
                {trustItems.map((t, i) => {
                  const Icon = t.Icon || FORM_TRUST_ICONS[i % FORM_TRUST_ICONS.length];
                  return (
                    <div key={i} className="group flex items-center gap-4 px-4 py-2 lg:py-0 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <Icon className="w-8 h-8 text-blue-600 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">{t.title}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1">{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {(() => {
            const stats = c.stats && c.stats.length > 0 ? c.stats : [
              { value: '5000+', label: 'Happy Learners', Icon: Users },
              { value: '4.8/5', label: 'Average Rating', Icon: Star },
              { value: '100+', label: 'Success Stories', Icon: Trophy },
              { value: '100%', label: 'Live Interactive', Icon: Clock },
            ];
            const quote = c.why_join_quote && c.why_join_quote.text ? c.why_join_quote : {
              text: "This masterclass changed the way I think about online income. Highly recommended!",
              name: "Rohit Sharma",
              role: "Freelancer"
            };
            return (
              <div className="bg-[#0b1e57] text-white rounded-[2rem] p-6 lg:p-8 mt-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1.1fr] gap-6 lg:gap-8 items-center shadow-lg">
                <div>
                  <h4 className="font-black text-xl mb-6 tracking-wide">
                    {c.why_join_heading || 'Why Thousands Are Joining'}{' '}
                    <span className="text-blue-400">{c.brand_name || 'Zarni Skills'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                    {stats.map((s, i) => {
                      const Icon = s.Icon || STAT_ICONS[i % STAT_ICONS.length];
                      return (
                        <div key={i} className="group flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 90}ms` }}>
                          <Icon className="w-8 h-8 text-white/95 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          <div>
                            <p className="text-base sm:text-lg font-black leading-none">{s.value}</p>
                            <p className="text-[10px] sm:text-[11px] text-blue-200/90 font-bold mt-1 leading-tight">{s.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* White Testimonial Card */}
                <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px] border border-slate-100">
                  <p className="text-xs sm:text-[13px] font-bold text-slate-700 leading-relaxed mb-4">
                    "{quote.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
                        alt={quote.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                      />
                      <div>
                        <p className="text-xs font-black text-slate-800">- {quote.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{quote.role || 'Freelancer'}</p>
                      </div>
                    </div>
                    {/* Slider Dots */}
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-[#f4f8ff] border border-blue-100 rounded-[2rem] p-6 lg:p-7 mt-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4 flex-1">
              <ShieldCheck className="w-12 h-12 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-black text-base text-blue-900 mb-1">{c.privacy_heading || 'Your Information is Safe With Us'}</h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-bold">{c.privacy_text || 'We respect your privacy and never share your information with anyone. Your registration is safe, secure and confidential.'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3.5 shrink-0 justify-center lg:justify-end">
              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-w-[125px]">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <div className="text-[10px] font-black text-slate-700 leading-tight uppercase">
                  <div>SSL</div>
                  <div className="text-slate-400 font-bold">Secure</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-w-[145px]">
                <Lock className="w-6 h-6 text-blue-600 shrink-0" />
                <div className="text-[10px] font-black text-slate-700 leading-tight uppercase">
                  <div>Privacy</div>
                  <div className="text-slate-400 font-bold">Protected</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-w-[155px]">
                <Users className="w-6 h-6 text-blue-800 shrink-0" />
                <div className="text-[10px] font-black text-slate-700 leading-tight uppercase">
                  <div>Trusted By</div>
                  <div className="text-slate-400 font-bold">Thousands</div>
                </div>
              </div>
            </div>
          </div>
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
  // Legacy entries were plain "Name from City" strings; newer ones carry an
  // optional avatar photo alongside the name — normalize both shapes here.
  const liveRegs = (c.live_registrations || []).map((r) => (typeof r === 'string' ? { name: r, avatar: '' } : r));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SiteHeader c={c} />

      {/* On mobile/tablet the full-bleed background-image hero below sits
          almost entirely behind a white overlay (it's built for the desktop
          2-column layout, where the presenter needs to show through), so the
          uploaded Hero Image was effectively invisible under ~1024px. This
          shows a dedicated portrait crop instead — hero_image_mobile if the
          admin uploaded one, otherwise hero_image itself — with the FULL
          hero text block (badge/title/subtitle/checks/description/CTA)
          overlaid on a dark scrim on top of it, restacked for a narrow
          screen instead of split image-then-text. The equivalent block in
          the shared Column 1 below is hidden on these screens so nothing
          shows twice. */}
      <div className="lg:hidden relative w-full min-h-[560px] sm:min-h-[600px] flex flex-col overflow-hidden"
        style={{
          backgroundImage: `url(${c.hero_image_mobile || c.hero_image || '/static/img/manwithlaptop.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/10"></div>
        <div className="relative z-10 flex flex-col flex-1 p-5 sm:p-6 pt-8 pb-7">
          {c.badge_text && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest mb-3 w-fit shadow-sm shadow-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> {c.badge_text}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-[1.15] tracking-tight mb-3" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            {renderHighlight(c.hero_title)}
          </h1>
          <p className="text-sm font-bold text-blue-50/90 mb-4 leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            {c.hero_subtitle}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-2 mb-4">
            {(c.hero_checks || []).map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> {t}
              </span>
            ))}
          </div>

          <p className="text-xs font-bold text-white/85 mb-5 leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            {c.hero_description}
          </p>

          <div className="mt-auto flex flex-col gap-2">
            <button onClick={() => setStep('form')}
              className="w-full px-8 py-4 bg-[#004aad] hover:bg-[#003d94] text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-950/40 hover:shadow-xl active:scale-[0.98] transition-all text-center">
              {ctaLabel}
            </button>
            <p className="text-[10px] font-bold text-white/70 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> {c.secure_note_hero}
            </p>
          </div>
        </div>
      </div>

      {/* HERO — Redesigned with c.hero_image in the background and a 2-column overlay layout */}
      <div className="relative overflow-hidden w-full py-12 sm:py-16 lg:py-20 mb-10 flex items-center min-h-0 sm:min-h-0 lg:min-h-[640px]"
        style={{
          backgroundImage: `url(${c.hero_image || '/static/img/manwithlaptop.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-white lg:bg-transparent pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.15] bg-gradient-to-r from-blue-900/10 via-transparent to-blue-900/10 pointer-events-none"></div>

        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Column 1: Left Text content (Only occupies 5/12 columns so it doesn't overlap the presenter).
              The entire block is desktop-only — below lg, this same content
              (badge/title/subtitle/checks/description/CTA) is shown overlaid
              on the mobile hero image above instead, so it isn't duplicated. */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center text-left">
            {c.badge_text && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest mb-4 w-fit shadow-sm shadow-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> {c.badge_text}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.12] mb-4 tracking-tight">
                {renderHighlight(c.hero_title)}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-600 mb-5 leading-relaxed">
                {c.hero_subtitle}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
                {(c.hero_checks || []).map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs lg:text-sm font-extrabold text-slate-700 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-blue-50/50 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> {t}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-900 mb-6 leading-relaxed">
                {c.hero_description}
              </p>

              <div className="flex flex-col gap-2">
                <button onClick={() => setStep('form')}
                  className="w-fit px-8 py-4 bg-[#004aad] hover:bg-[#003d94] text-white rounded-xl font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-blue-800/20 hover:shadow-xl hover:shadow-blue-800/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] text-center">
                  {ctaLabel}
                </button>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center justify-start gap-1.5 mt-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> {c.secure_note_hero}
                </p>
              </div>
            </div>

            {/* Column 2: Center Empty Space (3/12 columns reserved to show the presenter in the background image clearly) */}
            <div className="hidden lg:block lg:col-span-3 min-h-[300px]"></div>

            {/* Column 3: Right Offer Card (Occupies 4/12 columns to make it wider) */}
            <div className="lg:col-span-4 flex justify-center w-full mt-6 lg:mt-0">
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-blue-950/5 w-full max-w-[380px]">
                {c.offer_header_text && (
                  <div className="bg-[#004aad] text-white text-center py-3 text-xs font-black uppercase tracking-widest">
                    {c.offer_header_text}
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-2.5">{c.countdown_label}</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {countdownUnits.map(([v, l]) => (
                      <div key={l} className="bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center min-w-[50px] overflow-hidden">
                        <div key={v} className="animate-flip-in text-base sm:text-lg font-black text-slate-900 tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{l}</div>
                      </div>
                    ))}
                  </div>

                  {c.seats_cta_text && (
                    <div className="bg-blue-50 border border-blue-100/50 rounded-xl py-2 px-3 text-center text-[10px] font-black text-blue-700 uppercase tracking-wide mb-4 flex items-center justify-center gap-1.5 shadow-sm">
                      <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {c.seats_cta_text}
                    </div>
                  )}

                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{c.fee_label}</p>
                  {originalPrice && (
                    <p className="text-center text-sm font-black text-slate-400 line-through leading-none">₹{originalPrice}</p>
                  )}
                  <p className="text-center mb-4">
                    <span className="text-3xl font-black text-[#004aad]">₹{price}/-</span>
                    <span className="block text-[10px] font-black text-slate-500 uppercase mt-0.5">{c.price_only_suffix}</span>
                  </p>

                  <div className="space-y-2.5 mb-5 border-t border-slate-100 pt-4">
                    {includeItems.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> {inc}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setStep('form')}
                    className="w-full py-3.5 bg-[#004aad] hover:bg-[#003d94] text-white rounded-xl font-black text-sm lg:text-base uppercase tracking-wider shadow-md hover:shadow-lg transition-all mb-2 active:scale-[0.98]">
                    {ctaLabel}
                  </button>
                  <p className="text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> {c.secure_note_offer}
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-8">
        {statItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-10">
            {statItems.map((s, i) => <StatTile key={i} s={s} i={i} />)}
          </div>
        )}

        {/* VIDEO + DETAILS + SEATS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-6 mb-10">
          {showVideo && (
            <div className="bg-gradient-to-br from-[#0b1e57] to-[#040e2b] rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-950/10 min-h-[350px]">
              <div className="text-center mb-5">
                <h4 className="text-sm sm:text-base lg:text-lg font-black text-white uppercase tracking-wider">{c.video_heading || 'WATCH THIS 60-SECOND INTRO'}</h4>
                <p className="text-[11px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">{c.video_subheading || '— BEFORE YOU REGISTER —'}</p>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 flex-1">
                {c.video_filename ? (
                  <video src={c.video_filename} controls className="w-full h-full object-cover" />
                ) : (
                  <iframe src={toEmbedUrl(c.video_url)} title="Masterclass intro" className="w-full h-full" allowFullScreen />
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[350px]">
            <h4 className="text-sm sm:text-base font-black text-[#004aad] uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 text-center lg:text-left">
              {c.details_heading || 'MASTERCLASS DETAILS'}
            </h4>
            <div className="space-y-5 flex-1 flex flex-col justify-around">
              {[
                { Icon: Calendar, label: c.label_masterclass_date || 'Masterclass Date', value: c.date },
                { Icon: Clock, label: c.label_time || 'Time', value: c.time },
                { Icon: Video, label: c.label_mode || 'Mode', value: c.mode },
                { Icon: Globe, label: c.label_language || 'Language', value: c.language },
              ].filter((r) => r.value).map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <Icon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1.5">{label}</p>
                    <p className="text-xs sm:text-sm lg:text-base font-black text-slate-800 leading-tight">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[350px]">
            <h4 className="flex items-center gap-2 justify-center lg:justify-start text-sm sm:text-base font-black text-blue-700 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-blue-600" /> {c.seats_heading || 'SEATS AVAILABILITY'}
            </h4>
            {totalSeats > 0 && (
              <div className="mb-5">
                <p className="text-center text-sm sm:text-base font-black text-slate-800 mb-1">{fillSeats(c.seats_filled_text || '{filled} / {total} SEATS FILLED')}</p>
                <p className="text-center text-xs sm:text-sm font-black text-rose-600 mb-3 uppercase tracking-wide leading-none">{fillSeats(c.seats_left_text || 'ONLY {left} SEATS LEFT')}</p>
                <div className="h-4 rounded-full bg-blue-50 overflow-hidden shadow-inner border border-blue-100/30">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(37,99,235,0.25)]" style={{ width: `${seatsPct}%` }}></div>
                </div>
              </div>
            )}
            {liveRegs.length > 0 && (
              <div className="flex-1 flex flex-col justify-end">
                <p className="flex items-center gap-1.5 text-[11px] font-black text-blue-700 uppercase tracking-wider mb-3.5 justify-center lg:justify-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {c.live_registrations_label || 'LIVE REGISTRATIONS'}
                </p>
                <div className="space-y-3.5">
                  {liveRegs.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {r.avatar ? (
                          <img src={r.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0 uppercase">
                            {r.name?.[0]}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{r.name}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-blue-500 shrink-0 tracking-wide uppercase">{c.live_registrations_badge || 'Just Registered'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SKILLS */}
        {learnItems.length > 0 && (
          <section className="relative mt-14 mb-10 pt-4">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-6 z-10">
              <h2 className="text-center text-xs sm:text-sm font-black text-[#004aad] uppercase tracking-widest whitespace-nowrap">
                {c.skills_heading || 'SKILLS YOU WILL MASTER'}
              </h2>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-3xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 shadow-sm divide-y lg:divide-y-0 lg:divide-x divide-slate-100 overflow-hidden">
              {learnItems.map((item, idx) => {
                const Icon = SKILL_ICONS[idx % SKILL_ICONS.length];
                return (
                  <div key={idx} className="group p-6 text-center hover:bg-slate-50/50 transition-all duration-300 flex flex-col items-center justify-start min-h-[180px] animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 9) * 60}ms` }}>
                    <div className="mb-4">
                      <Icon className="w-10 h-10 text-blue-700 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={2} />
                    </div>
                    <h3 className="font-black text-xs sm:text-sm lg:text-base text-slate-800 uppercase tracking-wide mb-2.5 leading-tight px-1">{item.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-normal">{item.desc}</p>
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
              <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">
                    {c.achieve_heading || 'WHAT YOU WILL ACHIEVE'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-6 items-center">
                      <ul className="space-y-4">
                        {achieveItems.map((item, i) => (
                          <li key={i} className="group flex items-start gap-2.5 text-sm sm:text-base md:text-lg font-bold text-slate-700 leading-normal animate-fade-in-up" style={{ animationDelay: `${i * 90}ms` }}>
                            <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-125" /> {item}
                          </li>
                        ))}
                      </ul>
                    <div className="flex justify-center">
                      <img 
                        src={c.achievement_image || '/static/img/achievement-man.png'} 
                        alt="Achievement goal" 
                        className="w-full max-w-[150px] sm:max-w-none h-auto rounded-2xl object-cover shadow-sm border border-slate-200" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bonusItems.length > 0 && (
              <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-slate-200/60 rounded-[2rem] p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 uppercase tracking-wider mb-1">
                    {c.bonuses_heading || 'EXCLUSIVE BONUSES'}
                  </h3>
                  {c.bonuses_subheading && <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">{c.bonuses_subheading}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-6 items-center">
                    <ul className="space-y-4">
                        {bonusItems.map((item, i) => (
                          <li key={i} className="group flex items-start gap-2.5 text-sm sm:text-base md:text-lg font-bold text-slate-700 leading-normal animate-fade-in-up" style={{ animationDelay: `${i * 90}ms` }}>
                            <Gift className="w-6 h-6 text-orange-500 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" /> {item}
                          </li>
                        ))}
                      </ul>
                    <div className="flex justify-center">
                      <img
                        src={c.bonuses_image || '/static/img/reward-laptop.png'}
                        alt="Premium rewards"
                        className="w-full max-w-[150px] sm:max-w-none h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TESTIMONIALS */}
        {testimonialItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px bg-slate-200 flex-1 max-w-[120px] hidden sm:block"></div>
              <h2 className="text-center text-base md:text-lg font-black text-[#004aad] uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {c.testimonials_heading || 'SUCCESS STORIES'}
              </h2>
              <div className="h-px bg-slate-200 flex-1 max-w-[120px] hidden sm:block"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {testimonialItems.map((t, idx) => (
                <div key={idx} className="bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    {t.image ? (
                      <img src={t.image} alt="" className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100" />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center shrink-0 border border-blue-100">
                        {t.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-black text-base md:text-lg text-slate-800">{t.name}</p>
                      <div className="flex gap-0.5 text-amber-400 mt-1">
                        {Array.from({ length: t.rating || 5 }).map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed whitespace-pre-line italic">"{t.text}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px bg-slate-200 flex-1 max-w-[120px] hidden sm:block"></div>
              <h2 className="text-center text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 uppercase tracking-wider">
                {c.faq_heading || 'FREQUENTLY ASKED QUESTIONS'}
              </h2>
              <div className="h-px bg-slate-200 flex-1 max-w-[120px] hidden sm:block"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {faqItems.map((f, idx) => (
                <div key={idx} className="bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-fit animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-black text-base md:text-lg text-slate-800 bg-gradient-to-r from-white via-gray-50 to-gray-100">
                    <span>Q. {f.q}</span>
                    <span className="text-blue-600 font-black text-2xl shrink-0 transition-transform duration-200" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && <div className="px-5 pb-4 text-base md:text-lg text-slate-600 font-medium leading-relaxed border-t border-slate-200 pt-3 whitespace-pre-line transition-opacity duration-300" style={{ opacity: openFaq === idx ? 1 : 0 }}>{f.a}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BOTTOM CTA CONTAINER (SUPER SEXY) */}
        <div className="bg-gradient-to-r from-blue-700 via-[#004aad] to-indigo-900 rounded-t-[2rem] p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-white shadow-2xl border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)]"></div>
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center shrink-0 bg-white/10 shadow-lg shadow-black/20 animate-float">
              <Rocket className="w-10 h-10 text-sky-300" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-2 tracking-wide bg-gradient-to-r from-white via-slate-100 to-sky-100 bg-clip-text text-transparent">
                {c.final_cta_title || "Don't Miss This Opportunity!"}
              </h4>
              <p className="text-lg sm:text-xl font-medium text-slate-200">
                Start Your Online <span className="text-sky-300 font-extrabold underline decoration-wavy underline-offset-4">Income Journey</span> Today.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8 w-full lg:w-auto shrink-0 justify-end relative z-10">
            <div className="text-center sm:text-right border-y border-white/10 py-3 sm:py-0 sm:border-y-0 sm:border-r sm:border-white/20 sm:pr-8">
              <p className="text-xs sm:text-sm font-extrabold text-sky-200 uppercase tracking-widest mb-1.5">{c.fee_label || 'Registration Fee'}</p>
              <p className="text-3xl sm:text-4xl font-black text-sky-300 tracking-tight">
                ₹{price}/- <span className="text-base font-bold text-white/90">{c.price_only_suffix || 'Only'}</span>
              </p>
            </div>
            <div className="text-center w-full sm:w-auto">
              <button onClick={() => setStep('form')}
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 text-white rounded-2xl font-black text-lg uppercase tracking-wider shadow-[0_10px_25px_rgba(56,189,248,0.3)] hover:shadow-[0_15px_35px_rgba(56,189,248,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shrink-0 border border-white/20">
                {c.cta_button_text || 'REGISTER NOW'}
              </button>
              <p className="text-xs text-sky-200/80 font-bold mt-3 uppercase tracking-widest animate-pulse">{c.final_cta_note || 'Limited Seats - Register Now!'}</p>
            </div>
          </div>
        </div>

        {/* TRUST + PAYMENT BAR (SUPER SEXY) */}
        {((c.landing_trust_items || []).length > 0 || (c.payment_brands || []).length > 0) && (
          <div className="bg-gradient-to-b from-white to-slate-50/80 border-x border-b border-slate-200/80 rounded-b-[2rem] px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl mb-12">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4">
              {(c.landing_trust_items || []).map((l, i) => {
                const Icon = LANDING_TRUST_ICONS[i % LANDING_TRUST_ICONS.length];
                return (
                  <span key={i} className="flex items-center gap-3 text-sm sm:text-base font-black text-slate-700 hover:text-[#004aad] transition-colors duration-200">
                    <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                      <Icon className="w-4.5 h-4.5 text-[#004aad]" />
                    </span>
                    {l}
                  </span>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 border-t lg:border-t-0 pt-5 lg:pt-0 border-slate-200/60 w-full lg:w-auto lg:justify-end">
              {(c.payment_brands || []).map((b, i) => (
                <span key={i} className={`px-4 py-2 rounded-xl bg-slate-100/80 border border-slate-200/60 text-sm font-black italic tracking-wide ${BRAND_COLORS[i % BRAND_COLORS.length]} shadow-sm hover:bg-white hover:shadow transition-all duration-200`}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter c={c} />
    </div>
  );
}
