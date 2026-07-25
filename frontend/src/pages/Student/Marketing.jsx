import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import {
  Rocket, CheckCircle2, Link2, ArrowRight, Loader2, ShieldAlert, ShieldCheck, Calendar, Clock, Monitor,
  Star, ChevronDown, User, Mail, Phone, MapPin, ArrowLeft, Download, MessageCircle, Lock,
  Gift, Home, Users, Package, Share2, IndianRupee, Sparkles, Zap, Target, Wifi, Video as VideoIcon, Play,
  Volume2, Settings, Maximize, Laptop, ShoppingCart, ShoppingBag, Award, HelpCircle, FileText, Check,
  CreditCard, Smartphone, Shield
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
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

const PROFESSIONS = ['Student', 'Job Holder', 'Business Owner', 'Freelancer', 'Other'];

// Native player for an admin-uploaded video
function MasterclassVideo({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlayClick = () => {
    videoRef.current?.play();
  };

  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden bg-black mb-6 border-2 border-blue-500/40 shadow-[0_0_50px_rgba(37,99,235,0.2)] group">
      <video
        ref={videoRef}
        src={src}
        controls={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="w-full h-full object-cover"
        playsInline
      />
      {!playing && (
        <button
          onClick={handlePlayClick}
          aria-label="Play masterclass video"
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors"
        >
          <span className="relative flex items-center justify-center">
            <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/30 animate-ping"></span>
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 transition-transform duration-300 group-hover:scale-110">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white translate-x-0.5 fill-current" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export default function Marketing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('landing'); // 'landing' | 'form' | 'checkout' | 'success'
  const [openFaq, setOpenFaq] = useState(null);

  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNum, setPhoneNum] = useState(user?.phone || '');
  const [emailAddr, setEmailAddr] = useState(user?.email || '');
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState(PROFESSIONS[0]);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');

  const [orderId, setOrderId] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhoneNum(user.phone || '');
      setEmailAddr(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchMasterclass = async () => {
      try {
        const response = await api.get('/student/masterclass-funnel');
        setActivated(response.data.activated || false);
        setContent(response.data.content || {});
      } catch (err) {
        console.error('Error fetching masterclass funnel', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterclass();
  }, []);

  // Form Submit (Step 2) -> Validate and go to Step 3 Checkout
  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Please enter your City / State.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to Terms & Conditions.');
      return;
    }
    setError('');
    setStep('checkout');
  };

  // Launch Razorpay Payment Modal from Step 3
  const handleStartPayment = async () => {
    setPaying(true);
    setError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load payment gateway. Please check your connection.');
        setPaying(false);
        return;
      }

      const response = await api.post('/student/affiliate-activation/activate', {
        city: city.trim(),
        profession,
        full_name: fullName.trim(),
        phone: phoneNum.trim(),
        email: emailAddr.trim(),
      });

      if (!response.data.success && response.data.simulated) {
        setActivated(true);
        setStep('success');
        setPaying(false);
        return;
      }

      const { order_id, key_id, amount, currency, simulated } = response.data;
      setOrderId(order_id);

      if (simulated || amount === 0 || !key_id) {
        setActivated(true);
        setStep('success');
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: key_id,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'Zarni Skills',
        description: 'Affiliate Masterclass Registration',
        order_id,
        prefill: {
          name: fullName || user?.name || '',
          email: emailAddr || user?.email || '',
          contact: phoneNum || user?.phone || '',
        },
        theme: { color: '#2563eb' },
        handler: async (paymentResp) => {
          try {
            const verifyResponse = await api.post('/student/purchase/verify', {
              razorpay_order_id: paymentResp.razorpay_order_id,
              razorpay_payment_id: paymentResp.razorpay_payment_id,
              razorpay_signature: paymentResp.razorpay_signature,
              order_db_id: order_id,
            });

            if (verifyResponse.data.success) {
              setActivated(true);
              setStep('success');
            } else {
              setError(verifyResponse.data.message || 'Payment verification failed.');
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start activation. Please try again.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activated && step !== 'success') {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={1.8} />
        </div>
        <h2 className="text-2xl font-black mb-3">You're an Activated Affiliate</h2>
        <p className="text-slate-300 text-sm mb-8 max-w-md mx-auto">Your referral link is live. Head over to the link generator to start sharing and earning commissions.</p>
        <button
          onClick={() => navigate('/student/link-generator')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
        >
          <Link2 className="w-4 h-4" /> Go to My Referral Link <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const price = content?.price || 99;
  const videoUrl = toEmbedUrl(content?.video_url);

  // ── Step 1: Landing Page ─────────────────────────────────────────
  if (step === 'landing') {
    const learnItems = content?.learn_items?.length > 0 ? content.learn_items : [
      { title: 'घर बैठे Online Paise Kaise Kamaye', desc: 'Zero Investment से Income के तरीके सीखें', icon: 'home' },
      { title: 'Freelancing Kaise Karte Hain', desc: 'Skills की मदद से Global Clients से कमाई करें', icon: 'laptop' },
      { title: 'Drop Shipping Kaise Kare', desc: 'Product बिना खरीदे अपना Online Store चलाएं', icon: 'shopping-cart' },
      { title: 'Social Media Se Business Kaise Banaye', desc: 'Instagram, YouTube, Facebook से हजारों की कमाई', icon: 'share-2' },
      { title: 'Monthly ₹1,00,000+ Kaise Kamaye', desc: 'Proven Strategies & Real Examples के साथ', icon: 'indian-rupee' }
    ];

    const whyItems = content?.why_register?.length > 0 ? content.why_register : [
      'सीट Limited हैं - पहले आओ, पहले पाओ',
      'Serious Learners के लिए Only',
      'Live Interaction और Q&A',
      'आपकी Seat Confirm होगी',
      'Masterclass का Access मिलेगा',
      'Special Bonuses सिर्फ Registrants के लिए'
    ];

    const bonusItems = content?.bonuses?.length > 0 ? content.bonuses : [
      'Free PDF Guide',
      'Top 50 Business Ideas List',
      'Freelancing Secret Resources',
      'Drop Shipping Full Guide',
      'AI Tools List (Value ₹999)',
      'Masterclass Recording (If Available)'
    ];

    const statsItems = content?.stats?.length > 0 ? content.stats : [
      { value: '5000+', label: 'Happy Learners' },
      { value: '100+', label: 'Success Stories' },
      { value: '4.8/5', label: 'Average Rating' }
    ];

    const testimonialItems = content?.testimonials?.length > 0 ? content.testimonials : [
      { name: 'Rohit Sharma', text: 'Zarni Skills की Masterclass ने मेरी सोच बदल दी। अब मैं Freelancing से हर महीने ₹70,000+ कमा रहा हूं।', rating: 5 },
      { name: 'Anjali Verma', text: 'Drop Shipping के बारे में इतनी आसान भाषा में पहले कभी नहीं समझा। अब अपनी Online Store से अच्छी कमाई हो रही है।', rating: 5 },
      { name: 'Vikash Kumar', text: 'Social Media और Online Business के सही तरीके सीखे और अब ₹1,00,000+ Monthly Income कर रहा हूं।', rating: 5 }
    ];

    const faqItems = content?.faq?.length > 0 ? content.faq : [
      { q: 'Masterclass कब होगी?', a: 'Masterclass Zoom Live पर ऊपर दिए गए Date और Time पर लाइव होगी। Registrants को WhatsApp और Email पर लिंक मिलेगा।' },
      { q: 'Link कहां मिलेगा?', a: 'Register करने के तुरंत बाद आपको Dashboard में WhatsApp Link और Zoom Joining Details मिल जाएंगी।' },
      { q: 'Recording मिलेगी?', a: 'जी हां, Live Session खत्म होने के बाद Dashboard में Masterclass का Access available कर दिया जाएगा।' },
      { q: 'Refund होगा?', a: 'यह ₹99 फीस सीट रिजर्वेशन और सर्वर कॉस्ट कवर करने के लिए है, जो कि non-refundable है।' }
    ];

    const learnIcons = [Home, Laptop, ShoppingBag, Share2, IndianRupee];

    return (
      <div className="w-full bg-[#050a18] text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-fade-in-up">

        {/* TOP BAR / LOGO & STATUS BADGES */}
        <header className="bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Link to="/" className="flex items-center gap-2.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm transition-transform hover:scale-105">
              <img
                src="/static/img/zarni-logo.png"
                alt="Zarni Skills"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <span className="hidden items-center font-black text-primary text-sm">ZS</span>
            </Link>
            <div className="block sm:hidden border-l border-slate-800 pl-3">
              <span className="block text-xs font-black text-white tracking-wide">ZARNI SKILLS</span>
              <span className="block text-[8px] font-bold text-blue-400 uppercase tracking-widest">LEARN | EARN | GROW</span>
            </div>
            <div className="hidden sm:block border-l border-slate-800 pl-3">
              <span className="block text-xs font-black text-white tracking-wide">ZARNI SKILLS</span>
              <span className="block text-[9px] font-bold text-blue-400 uppercase tracking-widest">LEARN | EARN | GROW</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[10px] font-extrabold uppercase tracking-wider shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 shadow-sm shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {content?.badge_text || 'LIVE MASTERCLASS'}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 shadow-sm shrink-0 whitespace-nowrap">
              <Clock className="w-3 h-3 text-blue-400" /> LIMITED SEATS
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shrink-0 whitespace-nowrap">
              <Wifi className="w-3 h-3 text-emerald-400" /> 100% ONLINE
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 shadow-sm shrink-0 whitespace-nowrap">
              <Lock className="w-3 h-3 text-slate-400" /> SECURE REGISTRATION
            </span>
          </div>
        </header>

        {/* HERO SECTION */}
        <section
          className="relative px-4 sm:px-8 py-14 sm:py-20 lg:py-24 min-h-[750px] flex items-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #091330 0%, #0f1f4d 40%, #1e3a8a 85%, #172554 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 sm:gap-12 items-start max-w-7xl mx-auto relative z-10">

            {/* Left Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                {content?.badge_text || 'LIVE MASTERCLASS'}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-3">
                {content?.hero_title ? (
                  content.hero_title
                ) : (
                  <>
                    ONLINE EARNING & <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">ONLINE BUSINESS</span>
                  </>
                )}
              </h1>

              <h2 className="text-lg sm:text-2xl font-extrabold text-blue-300 mb-4 leading-snug flex items-center gap-2">
                <span>{content?.hero_subtitle || 'सीखें घर बैठे Online Income बनाने के 5 Powerful तरीके'}</span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl font-medium bg-slate-900/40 p-3.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                {content?.hero_description || 'इस Live Masterclass में हम आपको बताएंगे कि कैसे आप Social Media, Digital Skills और Online Business की मदद से हर महीने ₹1,00,000 या उससे ज्यादा कमा सकते हैं।'}
              </p>

              {/* Date / Time / Mode / Fee Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
                <div className="bg-[#0b1638]/90 border border-slate-700/70 rounded-2xl p-3.5 text-center shadow-lg hover:border-blue-400/50 hover:bg-[#0e1d49] transition-all group">
                  <Calendar className="w-4 h-4 mx-auto mb-1.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">DATE</p>
                  <p className="text-xs font-black text-white truncate">{content?.date || '26 May 2024 (Sunday)'}</p>
                </div>
                <div className="bg-[#0b1638]/90 border border-slate-700/70 rounded-2xl p-3.5 text-center shadow-lg hover:border-blue-400/50 hover:bg-[#0e1d49] transition-all group">
                  <Clock className="w-4 h-4 mx-auto mb-1.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">TIME</p>
                  <p className="text-xs font-black text-white truncate">{content?.time || '6:00 PM (Evening)'}</p>
                </div>
                <div className="bg-[#0b1638]/90 border border-slate-700/70 rounded-2xl p-3.5 text-center shadow-lg hover:border-blue-400/50 hover:bg-[#0e1d49] transition-all group">
                  <Monitor className="w-4 h-4 mx-auto mb-1.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">MODE</p>
                  <p className="text-xs font-black text-white truncate">{content?.mode || 'Online (Zoom Live)'}</p>
                </div>
                <div className="bg-[#0b1638]/90 border border-slate-700/70 rounded-2xl p-3.5 text-center shadow-lg hover:border-blue-400/50 hover:bg-[#0e1d49] transition-all group">
                  <IndianRupee className="w-4 h-4 mx-auto mb-1.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">FEE</p>
                  <p className="text-xs font-black text-white truncate">₹{price} Only (Fee)</p>
                </div>
              </div>

              {/* Video Player */}
              {content?.video_filename ? (
                <MasterclassVideo src={content.video_filename} />
              ) : videoUrl ? (
                <div className="aspect-video rounded-3xl overflow-hidden bg-black mb-6 border-2 border-blue-500/40 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                  <iframe
                    src={videoUrl}
                    title="Masterclass introduction"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 mb-6 border-2 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] group cursor-pointer" onClick={() => setStep('form')}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20"></div>
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                    alt="Live Masterclass Presenter"
                    className="w-full h-full object-cover object-top opacity-70 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="relative flex items-center justify-center">
                      <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/30 animate-ping"></span>
                      <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white translate-x-0.5 fill-current" />
                      </span>
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-slate-950/85 backdrop-blur-md flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 fill-current text-blue-400" />
                      <span className="font-mono text-[11px] font-bold">01:25 / 02:45</span>
                    </div>
                    <div className="flex-1 mx-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="w-1/2 h-full bg-blue-500"></div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Volume2 className="w-4 h-4" />
                      <Settings className="w-4 h-4" />
                      <Maximize className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Checkout / Form Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100 sticky top-20">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-slate-900 via-[#0f1f4d] to-blue-950 text-white rounded-2xl p-3.5 shadow-md mb-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest mb-1">
                    {content?.badge_text || 'LIVE MASTERCLASS'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    अपनी सीट अभी REGISTER करें
                  </h3>
                </div>

                <div className="flex items-baseline justify-center gap-1.5 my-2">
                  <span className="text-4xl sm:text-5xl font-black text-blue-600 tracking-tight">₹{price}</span>
                  <span className="text-sm font-black text-slate-800 uppercase">ONLY</span>
                </div>
                <span className="text-xs font-semibold text-slate-400 block">(Registration Fee)</span>
              </div>

              {/* Includes Checkmark List */}
              <div className="space-y-3 mb-6 border-y border-slate-100 py-5">
                {(content?.includes?.length > 0 ? content.includes : [
                  'Live Masterclass Access',
                  'Live Q&A Session',
                  'Bonus PDF & Resources',
                  'Limited Seats Available',
                  'Recording (If Available)'
                ]).map((inc, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                    <span>{inc}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setStep('form')}
                className="group relative overflow-hidden w-full py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all mb-3 text-center block"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                <span className="relative">REGISTER NOW — ₹{price} ONLY</span>
              </button>

              <p className="text-center text-[10px] font-extrabold text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> 100% Secure Payment | Your Data is Safe
              </p>
            </div>

          </div>
        </section>

        {/* SECTION 2: WHAT YOU WILL LEARN */}
        <section className="px-4 sm:px-8 py-12 sm:py-16 bg-[#070e24] border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-10 text-center">
              <span className="hidden sm:block h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-xs"></span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                इस MASTERCLASS में आप क्या सीखेंगे?
              </h2>
              <span className="hidden sm:block h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-xs"></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
              {learnItems.map((item, idx) => {
                const IconComponent = learnIcons[idx % learnIcons.length];
                return (
                  <div
                    key={idx}
                    className="bg-[#0b1638]/90 border border-slate-700/80 rounded-2xl p-5 text-center flex flex-col items-center justify-between hover:-translate-y-2 hover:border-blue-400/60 transition-all duration-300 shadow-xl group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-7 h-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white mb-2 leading-snug">{item.title}</h3>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{item.desc || item.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: 3-COLUMN INFO BLOCK */}
        <section className="px-4 sm:px-8 py-12 sm:py-16 bg-[#050a18] border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Why ₹99 Registration */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">₹</span>
                ₹{price} REGISTRATION क्यों?
              </h3>
              <ul className="space-y-3">
                {whyItems.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Exclusive Bonuses */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-blue-500/80 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-blue-500 opacity-15 pointer-events-none">
                <Gift className="w-16 h-16" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-blue-700 mb-5 border-b border-blue-100 pb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                EXCLUSIVE BONUSES 🎁
              </h3>
              <ul className="space-y-3">
                {bonusItems.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
                    <span className="text-blue-600 shrink-0">🎁</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Proof / Stats */}
            <div className="space-y-4 flex flex-col justify-between">
              {statsItems.map((s, idx) => (
                <div key={idx} className="bg-[#0b1638] border border-slate-700/80 rounded-2xl p-5 flex items-center gap-4 shadow-xl hover:border-blue-400/40 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    {idx === 0 ? <Users className="w-6 h-6" /> : idx === 1 ? <Award className="w-6 h-6" /> : <Star className="w-6 h-6 fill-current text-amber-300" />}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-300 leading-tight">{s.value}</p>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SECTION 4: TESTIMONIALS */}
        <section className="px-4 sm:px-8 py-12 sm:py-16 bg-[#070e24] border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-10 text-center">
              <span className="hidden sm:block h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-xs"></span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                हमारे STUDENTS की SUCCESS STORIES
              </h2>
              <span className="hidden sm:block h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-xs"></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {testimonialItems.map((t, idx) => (
                <div key={idx} className="bg-white text-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-between hover:-translate-y-1 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0">
                        {t.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{t.name}</h4>
                        <div className="flex gap-0.5 text-amber-400 mt-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">"{t.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ ACCORDION */}
        <section className="px-4 sm:px-8 py-12 sm:py-16 bg-[#050a18] border-t border-slate-800/60">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-10 text-center">
              <span className="hidden sm:block h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-xs"></span>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <HelpCircle className="w-7 h-7 text-blue-400" /> FAQ
              </h2>
              <span className="hidden sm:block h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1 max-w-xs"></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {faqItems.map((f, idx) => (
                <div key={idx} className="bg-[#0b1638] border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-extrabold text-sm text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{f.q}</span>
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0 ml-2">
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: BOTTOM CTA BANNER */}
        <section className="px-4 sm:px-8 py-10 bg-[#070e24] border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#0b1638] via-[#102359] to-[#0b1638] border border-slate-700 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0 hidden sm:flex">
                <Rocket className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-white mb-1">
                  आज ही <span className="text-blue-300 uppercase">REGISTER</span> करें और अपना FUTURE बदलें!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  सिर्फ ₹{price} देकर Live Masterclass में शामिल हों और सीखें Online Earning & Online Business के सीक्रेट्स।
                </p>
              </div>
            </div>

            <div className="shrink-0 text-center w-full sm:w-auto">
              <button
                onClick={() => setStep('form')}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto block"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                <span className="relative">REGISTER NOW — ₹{price} ONLY</span>
              </button>
              <p className="text-[10px] font-extrabold text-slate-400 mt-2 uppercase tracking-wider">Limited Seats – Register Now!</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#030712] border-t border-slate-800 px-4 sm:px-8 py-10 text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/static/img/zarni-logo.png" alt="Zarni Logo" className="h-7 w-auto object-contain" />
                <span className="font-black text-sm text-white">ZARNI SKILLS</span>
              </div>
              <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-3">Learn | Earn | Grow</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                हमारा Mission आपको Digital Skills और Online Business सिखाकर आपकी Financial Freedom में मदद करना है।
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">IMPORTANT LINKS</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="/about" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-blue-400 transition-colors">Terms & Conditions</a></li>
                <li><a href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">CONTACT US</h4>
              <ul className="space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" /> WhatsApp Support
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" /> support@zarniskills.com
                </li>
                <li className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-400 shrink-0" /> www.zarniskills.com
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-white uppercase tracking-wider mb-3">FOLLOW US</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-red-500 hover:bg-slate-800 transition-colors">
                  <VideoIcon className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-500 hover:bg-slate-800 transition-colors">
                  <Share2 className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 hover:bg-slate-800 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 text-center text-slate-500 text-[11px]">
            © {new Date().getFullYear()} Zarni Skills. All Rights Reserved.
          </div>
        </footer>

      </div>
    );
  }

  // ── Step 2: Live Registration Form ─────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="w-full bg-[#050a18] text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-fade-in-up">

        {/* TOP BAR */}
        <header className="bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-30">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <button onClick={() => setStep('landing')} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm transition-transform hover:scale-105">
              <img
                src="/static/img/zarni-logo.png"
                alt="Zarni Skills"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <span className="font-black text-white text-sm">Zarni Skills</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[10px] font-extrabold uppercase tracking-wider shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 shadow-sm shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Masterclass
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 shadow-sm shrink-0 whitespace-nowrap">
              <Clock className="w-3 h-3 text-blue-400" /> Limited Seats
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shrink-0 whitespace-nowrap">
              <Wifi className="w-3 h-3 text-emerald-400" /> 100% Online
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 shadow-sm shrink-0 whitespace-nowrap">
              <Lock className="w-3 h-3 text-slate-400" /> Secure Registration
            </span>
          </div>
        </header>

        {/* HERO + GLASSMORPHISM REGISTRATION FORM */}
        <section
          className="relative px-4 sm:px-8 py-10 sm:py-16 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #070e24 0%, #0d1a45 40%, #162c6b 85%, #0a1230 100%)' }}
        >
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 sm:gap-12 items-center max-w-7xl mx-auto relative z-10">

            {/* Left Text */}
            <div>
              <button
                onClick={() => setStep('landing')}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 hover:text-white uppercase tracking-wider mb-6 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Masterclass Info
              </button>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                Reserve Your Seat for <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">Our Live Online Earning & Online Business Masterclass</span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed mb-6 font-medium max-w-xl bg-black/25 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                Register today for only <strong className="text-blue-300 font-extrabold">₹{price}</strong> and secure your seat for an exclusive live masterclass where you'll learn practical digital skills and online business strategies.
              </p>
            </div>

            {/* Right Side ULTRA-GLASSMORPHIC Form Card */}
            <div className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-white/[0.08] border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.7),0_0_40px_rgba(255,255,255,0.05)] text-white overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="text-xl sm:text-2xl font-black text-center mb-6 text-white border-b border-white/15 pb-4 tracking-tight drop-shadow-md">
                Live Registration Form
              </h2>

              {error && (
                <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-2xl text-xs font-bold mb-5 flex items-center gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" /> {error}
                </div>
              )}

              <form onSubmit={handleProceedToCheckout} className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-slate-950/60 text-white font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="tel"
                    required
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="WhatsApp Number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-slate-950/60 text-white font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="email"
                    required
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-slate-950/60 text-white font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all shadow-inner"
                  />
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-300 transition-colors" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City / State"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-slate-950/60 text-white font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Profession</label>
                  <div className="flex flex-wrap gap-2">
                    {PROFESSIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProfession(p)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                          profession === p
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400 shadow-md shadow-blue-500/30 scale-105'
                            : 'bg-slate-950/50 text-slate-300 border border-white/15 hover:bg-slate-900 hover:border-white/30'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-blue-500 focus:ring-blue-400 cursor-pointer bg-slate-950"
                  />
                  <label htmlFor="terms" className="text-xs font-medium text-slate-300 cursor-pointer">
                    I agree to <span className="text-blue-300 underline font-bold">Terms & Conditions</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="group relative overflow-hidden w-full py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full font-black text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_45px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95 transition-all text-center block mt-5"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                  <span className="relative">
                    Proceed to Confirm — ₹{price}
                  </span>
                </button>

                <p className="text-center text-[10px] font-extrabold text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> 100% Secure Registration
                </p>
              </form>
            </div>

          </div>
        </section>
      </div>
    );
  }

  // ── Step 3: Checkout & Confirmation Page (CONFIRM REGISTRATION LAYOUT) ─────────────────────────────────────────
  if (step === 'checkout') {
    const includeItems = content?.includes?.length > 0 ? content.includes : [
      'Live Masterclass Access',
      'Live Q&A Session',
      'Bonus PDF & Resources',
      'Limited Seats Available',
      'Recording (If Available)'
    ];

    return (
      <div className="w-full bg-[#050a18] text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-fade-in-up">

        {/* TOP BAR / LOGO & SECURE PAYMENT BADGE */}
        <header className="bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
          <button onClick={() => setStep('form')} className="flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm transition-transform hover:scale-105">
            <img
              src="/static/img/zarni-logo.png"
              alt="Zarni Skills"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <span className="font-black text-white text-sm">Zarni Skills</span>
          </button>

          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/20 border border-blue-400/40 px-3.5 py-1.5 rounded-full text-[10px] font-black text-blue-300 uppercase tracking-widest shadow-md">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>SECURE PAYMENT BADGE</span>
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[8px]">SSL</span>
          </div>
        </header>

        {/* MAIN GLASSMORPHIC CONFIRMATION & CHECKOUT SECTION */}
        <section
          className="relative px-4 sm:px-8 py-10 sm:py-16 overflow-hidden min-h-[80vh] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #070e24 0%, #0d1a45 40%, #162c6b 85%, #0a1230 100%)' }}
        >
          {/* Ambient Glowing Background */}
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>

          <div className="w-full max-w-3xl mx-auto relative z-10">

            <button
              onClick={() => setStep('form')}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 hover:text-white uppercase tracking-wider mb-6 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Registration Form
            </button>

            {/* Ultra Glassmorphic Card Container */}
            <div className="relative rounded-3xl p-6 sm:p-10 backdrop-blur-2xl bg-white/[0.08] border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(255,255,255,0.05)] text-white overflow-hidden">

              <h2 className="text-xl sm:text-2xl font-black text-blue-300 mb-1 tracking-tight">Confirm Your Registration</h2>

              <h1 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {content?.hero_title || 'ONLINE EARNING & ONLINE BUSINESS'}
              </h1>

              <div className="mb-6 bg-black/25 p-4 rounded-2xl border border-white/10 backdrop-blur-md inline-block pr-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Registration Fee</p>
                <p className="text-4xl sm:text-5xl font-black text-blue-400 tracking-tight">₹{price} <span className="text-base font-extrabold text-slate-300">Only</span></p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" /> {error}
                </div>
              )}

              {/* Include Features Box */}
              <div className="bg-slate-950/60 border border-white/15 rounded-2xl p-5 sm:p-6 mb-6 backdrop-blur-md">
                <h3 className="text-base font-black text-blue-300 mb-4 border-b border-white/10 pb-2">Include</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-slate-200">
                  {includeItems.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" strokeWidth={3} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Details & Payment Methods 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

                {/* Left Box: Meeting Details */}
                <div className="bg-slate-950/60 border border-white/15 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                  <h4 className="text-sm font-black text-blue-300 mb-4 border-b border-white/10 pb-2">Meeting Details</h4>

                  <div className="space-y-3.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</span>
                        <span className="font-extrabold text-white text-xs">{content?.date || '26 May 2024 (Sunday)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</span>
                        <span className="font-extrabold text-white text-xs">{content?.time || '6:00 PM (Evening)'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mode</span>
                        <span className="font-extrabold text-white text-xs">{content?.mode || 'Online (Zoom Live)'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Box: Payment Methods & CTA */}
                <div className="bg-slate-950/60 border border-white/15 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-blue-300 mb-3 border-b border-white/10 pb-2">Payment Methods</h4>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] font-extrabold">
                      <div className="bg-white/10 border border-white/15 rounded-lg p-2 text-center flex items-center justify-center gap-1.5 text-slate-200">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> UPI (GPay/PhonePe)
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-lg p-2 text-center flex items-center justify-center gap-1.5 text-slate-200">
                        <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Credit Card
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-lg p-2 text-center flex items-center justify-center gap-1.5 text-slate-200">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Debit Card
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-lg p-2 text-center flex items-center justify-center gap-1.5 text-slate-200">
                        <Monitor className="w-3.5 h-3.5 text-blue-400" /> Net Banking
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Pay Securely Blue CTA Button */}
                    <button
                      onClick={handleStartPayment}
                      disabled={paying}
                      className="group relative overflow-hidden w-full py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full font-black text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_45px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-60 transition-all text-center block"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {paying ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Launching Razorpay...
                          </>
                        ) : (
                          <>
                            Pay Securely ₹{price}
                          </>
                        )}
                      </span>
                    </button>

                    <p className="text-center text-[10px] font-extrabold text-slate-400 flex items-center justify-center gap-1.5 mt-2">
                      <Lock className="w-3.5 h-3.5 text-blue-400" /> 100% Secure Payment
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>
      </div>
    );
  }

  // ── Step 4: Success Screen (REGISTRATION SUCCESSFUL MATCHING REFERENCE LAYOUT) ─────────────────────────────────────────
  const regId = 'ZS' + (orderId ? String(orderId).replace(/[^A-Za-z0-9]/g, '').slice(-8).toUpperCase() : '20268892');

  const handleDownloadPDF = async () => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '700px';
    element.style.padding = '40px';
    element.style.background = '#ffffff';
    element.style.fontFamily = "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
    element.style.color = '#0f172a';
    element.style.borderRadius = '24px';
    element.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.25)';

    const logoUrl = window.location.origin + '/static/img/zarni-logo.png';

    element.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #e2e8f0; padding-bottom:20px; margin-bottom:24px;">
        <img src="${logoUrl}" style="height:48px; width:auto; object-fit:contain;" alt="Zarni Skills Logo" />
        <div style="display:table; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; border-radius:9999px; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
          <div style="display:table-cell; vertical-align:middle; text-align:center; padding:8px 18px 7px 18px; font-size:11px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; line-height:1;">✓ REGISTRATION CONFIRMED</div>
        </div>
      </div>

      <div style="font-size:22px; font-weight:800; color:#0f172a; margin-bottom:4px; line-height:1.2;">Live Online Business & Online Earning Masterclass</div>
      <div style="font-size:13px; color:#64748b; margin-bottom:24px; font-weight:600;">Official Admission Pass & Payment Receipt</div>
      
      <div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border:1.5px solid #bfdbfe; border-radius:16px; padding:20px; text-align:center; margin-bottom:24px; box-shadow:0 4px 6px -1px rgba(37,99,235,0.05);">
        <div style="font-size:11px; font-weight:800; color:#1e40af; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px;">Registration ID</div>
        <div style="font-size:30px; font-weight:900; color:#1d4ed8; font-family:monospace; letter-spacing:2.5px;">${regId}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:24px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px;">
          <div style="font-size:12px; font-weight:800; color:#1e3a8a; text-transform:uppercase; margin-bottom:12px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px; letter-spacing:0.5px;">Student Details</div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">Name:</span> <strong style="color:#0f172a;">${fullName || 'Student'}</strong></div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">Phone:</span> <strong style="color:#0f172a;">${phoneNum || 'N/A'}</strong></div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">Email:</span> <strong style="color:#0f172a;">${emailAddr || 'N/A'}</strong></div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">City/State:</span> <strong style="color:#0f172a;">${city || 'N/A'}</strong></div>
          <div style="font-size:12px; color:#334155;"><span style="color:#64748b; font-weight:600;">Profession:</span> <strong style="color:#0f172a;">${profession || 'Student'}</strong></div>
        </div>
        
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px;">
          <div style="font-size:12px; font-weight:800; color:#1e3a8a; text-transform:uppercase; margin-bottom:12px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px; letter-spacing:0.5px;">Session Details</div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">Date:</span> <strong style="color:#0f172a;">${content?.date || '26 May 2024 (Sunday)'}</strong></div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">Time:</span> <strong style="color:#0f172a;">${content?.time || '6:00 PM (Evening)'}</strong></div>
          <div style="font-size:12px; margin-bottom:7px; color:#334155;"><span style="color:#64748b; font-weight:600;">Mode:</span> <strong style="color:#0f172a;">${content?.mode || 'Online (Zoom Live)'}</strong></div>
          <div style="font-size:12px; color:#334155;"><span style="color:#64748b; font-weight:600;">Fee Paid:</span> <strong style="color:#16a34a;">₹${price} (VERIFIED)</strong></div>
        </div>
      </div>

      <div style="text-align:center; border-top:1px solid #e2e8f0; padding-top:18px; font-size:11px; color:#94a3b8; font-weight:600;">
        © ${new Date().getFullYear()} Zarni Skills. All Rights Reserved. | support@zarniskills.com
      </div>
    `;

    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true });
      
      // Convert canvas to valid PDF 1.4 binary file
      const imgWidth = 595.28; // A4 pt width
      const imgHeight = Math.round((canvas.height * 595.28) / canvas.width);
      const pageHeight = Math.max(841.89, imgHeight + 40);

      const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const base64 = imgDataUrl.split(',')[1];
      const imgBytes = atob(base64);

      const contentStream = `q ${imgWidth} 0 0 ${imgHeight} 0 ${pageHeight - imgHeight - 20} cm /Img1 Do Q`;

      let pdf = `%PDF-1.4\n`;
      const offsets = [];

      offsets.push(pdf.length);
      pdf += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

      offsets.push(pdf.length);
      pdf += `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;

      offsets.push(pdf.length);
      pdf += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${imgWidth} ${pageHeight}] /Resources << /XObject << /Img1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;

      offsets.push(pdf.length);
      pdf += `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`;

      const headerBytes = new TextEncoder().encode(pdf);
      const imgUint8 = new Uint8Array(imgBytes.length);
      for (let i = 0; i < imgBytes.length; i++) {
        imgUint8[i] = imgBytes.charCodeAt(i);
      }

      let footer = `\nendstream\nendobj\n`;
      const footerOffset5 = pdf.length + imgBytes.length + footer.length;
      footer += `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

      const xrefOffset = footerOffset5 + `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`.length;

      footer += `xref\n0 6\n0000000000 65535 f \n`;
      offsets.forEach(off => {
        footer += (off.toString().padStart(10, '0') + ` 00000 n \n`);
      });
      footer += (footerOffset5.toString().padStart(10, '0') + ` 00000 n \n`);
      footer += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

      const footerBytes = new TextEncoder().encode(footer);

      const blobBytes = new Uint8Array(headerBytes.length + imgUint8.length + footerBytes.length);
      blobBytes.set(headerBytes, 0);
      blobBytes.set(imgUint8, headerBytes.length);
      blobBytes.set(footerBytes, headerBytes.length + imgUint8.length);

      const blob = new Blob([blobBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ZarniSkills_Pass_${regId}.pdf`;
      link.click();
    } catch (err) {
      console.error('Error generating PDF download', err);
    } finally {
      document.body.removeChild(element);
    }
  };

  return (
    <div className="w-full bg-[#050a18] text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-fade-in-up">

      {/* TOP BAR / LOGO & SECURE PAYMENT BADGE */}
      <header className="bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm transition-transform hover:scale-105">
          <img
            src="/static/img/zarni-logo.png"
            alt="Zarni Skills"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            className="h-7 sm:h-8 w-auto object-contain"
          />
          <span className="font-black text-white text-sm">Zarni Skills</span>
        </Link>

        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-[10px] font-black text-emerald-300 uppercase tracking-widest shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SECURE PAYMENT BADGE</span>
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[8px]">SSL</span>
        </div>
      </header>

      {/* MAIN SUCCESS CONTAINER */}
      <section
        className="relative px-4 sm:px-8 py-10 sm:py-16 overflow-hidden min-h-[85vh] flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #070e24 0%, #0d1a45 40%, #162c6b 85%, #0a1230 100%)' }}
      >
        {/* Ambient Glowing Effect */}
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[140px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-3xl mx-auto relative z-10">

          {/* Ultra Glassmorphic Confirmation Card */}
          <div className="relative rounded-3xl p-6 sm:p-10 backdrop-blur-2xl bg-white/[0.08] border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(255,255,255,0.05)] text-white overflow-hidden">

            {/* Glowing Big Green Check Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-bounce">
              <Check className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={3.5} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent text-center leading-tight mb-2 tracking-tight">
              Registration Successful
            </h1>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white text-center mb-1">
              Congratulations!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 text-center font-medium mb-7">
              Your seat has been successfully reserved.
            </p>

            {/* Registration ID Container */}
            <div className="bg-slate-950/70 border border-blue-500/30 rounded-2xl p-4 sm:p-5 mb-8 text-center backdrop-blur-md shadow-inner">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Registration ID</p>
              <p className="text-2xl sm:text-4xl font-black text-blue-400 font-mono tracking-widest">{regId}</p>
            </div>

            {/* 2-Column Grid: Meeting Details & What Happens Next */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

              {/* Left Box: Meeting Details */}
              <div className="bg-slate-950/60 border border-white/15 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                <h4 className="text-sm font-black text-blue-300 mb-4 border-b border-white/10 pb-2">Meeting Details</h4>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</span>
                      <span className="font-extrabold text-white text-xs">{content?.date || 'OCT 12, 2026'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</span>
                      <span className="font-extrabold text-white text-xs">{content?.time || '6:00 PM'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mode</span>
                      <span className="font-extrabold text-white text-xs">{content?.mode || 'Live Online Masterclass'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Box: What Happens Next? */}
              <div className="bg-slate-950/60 border border-white/15 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-blue-300 mb-3 border-b border-white/10 pb-2">What happens next?</h4>

                  <div className="space-y-2 text-xs font-bold text-slate-200 mb-5">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />
                      <span>WhatsApp Group Link</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />
                      <span>Meeting Link</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />
                      <span>Reminder</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />
                      <span>Bonus PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={3} />
                      <span>Resources</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Join WhatsApp Button */}
                  <a
                    href={content?.whatsapp_group_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95 transition-all text-center block"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Join WhatsApp link
                    </span>
                  </a>

                  {/* Download Confirmation Button */}
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-black text-xs uppercase tracking-wider transition-all text-center block flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Confirmation
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
