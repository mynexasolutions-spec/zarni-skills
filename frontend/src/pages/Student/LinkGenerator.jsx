import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link2, Share2, Copy, Check, Lightbulb, Loader2, Rocket, Sparkles, QrCode, Target, Instagram, Zap, Forward, Package, ChevronDown, Terminal, ShieldCheck, Flame, ExternalLink } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from 'react-icons/fa';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

const SHARE_APPS = [
  { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp, grad: 'from-emerald-400 to-green-600', glow: 'rgba(16,185,129,0.45)', tint: 'bg-emerald-50/80 border-emerald-200/80', text: 'text-emerald-800' },
  { key: 'telegram', label: 'Telegram', Icon: FaTelegramPlane, grad: 'from-sky-400 to-blue-600', glow: 'rgba(14,165,233,0.45)', tint: 'bg-sky-50/80 border-sky-200/80', text: 'text-sky-800' },
  { key: 'facebook', label: 'Facebook', Icon: FaFacebookF, grad: 'from-indigo-400 to-indigo-600', glow: 'rgba(99,102,241,0.45)', tint: 'bg-indigo-50/80 border-indigo-200/80', text: 'text-indigo-800' },
];

export default function LinkGenerator() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [loading, setLoading] = useState(true);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);
  const { ref: tiltCodeRef, onMouseMove: onCodeMove, onMouseLeave: onCodeLeave } = useTilt(4);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const globalRes = await api.get('/global-data');
        setPackages(globalRes.data.packages || []);
      } catch (err) {
        console.error('Error fetching link generator data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const origin = window.location.origin;
  const referralCode = user?.referral_code || '';
  const primaryLink = `${origin}/register?ref=${referralCode}`;
  const deepLink = selectedPkg ? `${primaryLink}&package_id=${selectedPkg}` : primaryLink;
  const masterclassLink = `${origin}/masterclass/${referralCode}`;

  const shareMessage = `Hey! I've been learning high-income skills on Zarni Skills. You can also learn and start earning commissions!\n\nCheck it out here: `;
  const shareText = encodeURIComponent(shareMessage);
  const shareUrl = encodeURIComponent(primaryLink);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${shareText}${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Zarni Skills', text: shareMessage, url: primaryLink }).catch(() => { });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">

      {/* ── 3D TILT HERO HERO BANNER ───────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-950/20 hover:shadow-[0_30px_70px_-15px_rgba(37,99,235,0.45)] overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Lighting & Pattern Sweep */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Custom Link Generator
            </div>
            
            <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
              Grow Your Affiliate Earnings
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm mb-7 max-w-xl font-medium leading-relaxed">
              Share your custom referral link across WhatsApp, Telegram, or social media. When new students enroll using your link, instant commissions land in your wallet.
            </p>

            {/* Primary Link Bar */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/12 border border-white/20 rounded-2xl p-2 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-3 flex-1 min-w-0 px-3.5 py-2">
                <Link2 className="w-5 h-5 text-blue-300 shrink-0" strokeWidth={2.2} />
                <input
                  type="text"
                  readOnly
                  value={primaryLink}
                  className="flex-1 min-w-0 bg-transparent border-0 text-white text-xs sm:text-sm font-extrabold focus:outline-none tracking-wide"
                />
              </div>
              <button
                onClick={() => handleCopy(primaryLink, 'primary')}
                className={`group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-lg active:scale-95 shrink-0 ${
                  copiedField === 'primary' 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                    : 'bg-white text-blue-900 hover:bg-blue-50 hover:shadow-xl'
                }`}
              >
                {copiedField !== 'primary' && (
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent"></span>
                )}
                <span className="relative flex items-center gap-2">
                  {copiedField === 'primary' ? <Check className="w-4 h-4 animate-bounce" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                  {copiedField === 'primary' ? 'Copied!' : 'Copy Referral Link'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* Left Col (2 Cols Wide) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* Quick Share Box */}
          <Reveal variant="fade-up" delay={150}>
            <div className="bg-white border border-slate-200/90 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                    <span className="absolute inset-0 rounded-2xl bg-blue-400/30 blur-md animate-pulse"></span>
                    <Share2 className="relative w-5 h-5 text-blue-300" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-lg text-white">Instant Social Sharing</h2>
                    <p className="text-xs text-blue-200/80 font-medium">Broadcast your referral link directly to prospective students</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                  <Flame className="w-3.5 h-3.5 text-amber-300" /> Instant Share
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <div className={`grid ${canNativeShare ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-3 sm:gap-4`}>
                  {SHARE_APPS.map((app) => (
                    <a
                      key={app.key}
                      href={shareLinks[app.key]}
                      target="_blank"
                      rel="noreferrer"
                      className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border ${app.tint} hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300`}
                    >
                      <div
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${app.grad} text-white flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                        style={{ boxShadow: `0 10px 25px -5px ${app.glow}` }}
                      >
                        <app.Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className={`text-xs font-black tracking-tight ${app.text}`}>{app.label}</span>
                    </a>
                  ))}

                  {canNativeShare && (
                    <button
                      onClick={handleNativeShare}
                      className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border bg-slate-50 border-slate-200 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <Forward className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-xs font-black tracking-tight text-slate-700">More Apps</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Deep Link Generator Box */}
          <Reveal variant="fade-up" delay={200}>
            <div className="bg-white border border-slate-200/90 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                    <span className="absolute inset-0 rounded-2xl bg-indigo-400/30 blur-md animate-pulse"></span>
                    <QrCode className="relative w-5 h-5 text-indigo-300" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-lg text-white">Package Deep Link Generator</h2>
                    <p className="text-xs text-slate-300 font-medium">Direct students directly to a specific course checkout page</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" /> High Converting
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Target Course Package</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={selectedPkg}
                      onChange={(e) => setSelectedPkg(e.target.value)}
                      className="w-full appearance-none pl-11 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">Full Registration Page (Default)</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.public_code}>{pkg.name} — ₹{pkg.price}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Generated Deep Link
                  </label>
                  
                  <div className="relative flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 pl-4 rounded-2xl shadow-inner overflow-hidden">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                    <input
                      type="text"
                      readOnly
                      value={deepLink}
                      className="flex-1 min-w-0 bg-transparent border-0 text-xs sm:text-sm text-emerald-400 font-mono font-bold focus:outline-none tracking-wide py-2"
                    />
                    <button
                      onClick={() => handleCopy(deepLink, 'deep')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shrink-0 ${
                        copiedField === 'deep'
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20'
                      }`}
                    >
                      {copiedField === 'deep' ? <Check className="w-4 h-4 animate-bounce" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                      {copiedField === 'deep' ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {selectedPkg && (
                    <p className="text-xs text-indigo-600 font-bold mt-2.5 flex items-center gap-1.5 animate-fade-in-up">
                      <ExternalLink className="w-3.5 h-3.5" /> Direct checkout pre-selected for: <span className="underline">{packages.find(p => p.public_code === selectedPkg)?.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

        </div>

        {/* Right Col */}
        <div className="space-y-6 sm:space-y-8">

          {/* 3D Referral Code Card */}
          <Reveal variant="fade-up" delay={250}>
            <div
              ref={tiltCodeRef}
              onMouseMove={onCodeMove}
              onMouseLeave={onCodeLeave}
              className="bg-white border border-slate-200/90 rounded-[2rem] p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group [transform:perspective(800px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-500/5 blur-2xl pointer-events-none animate-blob"></div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-black uppercase tracking-widest mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Your Code
              </div>

              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Personal Referral Code</h3>
              
              <div className="relative font-mono text-2xl sm:text-3xl font-black text-blue-600 tracking-[0.2em] py-4 px-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 mb-4 shadow-inner">
                {referralCode}
              </div>

              <button
                onClick={() => handleCopy(referralCode, 'code')}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  copiedField === 'code'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-900 hover:bg-black text-white shadow-md shadow-slate-900/20 hover:-translate-y-0.5'
                }`}
              >
                {copiedField === 'code' ? <Check className="w-4 h-4 animate-bounce" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                {copiedField === 'code' ? 'Copied Code!' : 'Copy Code Only'}
              </button>
            </div>
          </Reveal>

          {/* Pro Tips Box */}
          <Reveal variant="fade-up" delay={300}>
            <div
              className="rounded-[2rem] p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 60%, #2563eb 100%)' }}
            >
              <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-amber-400/10 blur-2xl pointer-events-none animate-blob"></div>

              <h3 className="flex items-center gap-2 font-heading font-black text-base text-white mb-4">
                <span className="relative w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-lg bg-amber-400/30 blur-md animate-pulse"></span>
                  <Lightbulb className="relative w-4 h-4 text-amber-300" strokeWidth={2.2} />
                </span>
                Pro Growth Tips
              </h3>

              <ul className="space-y-3.5 text-xs text-blue-100/90 font-medium">
                {[
                  { Icon: Target, text: 'Share your genuine learning experience with Zarni Skills courses.' },
                  { Icon: Instagram, text: 'Add your referral link directly in your Instagram & WhatsApp bio.' },
                  { Icon: Zap, text: 'Highlight how new members start earning income while acquiring skills.' },
                ].map(({ Icon, text }, idx) => (
                  <li key={idx} className="flex items-start gap-3 leading-relaxed">
                    <span className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Icon className="w-3.5 h-3.5 text-amber-300" strokeWidth={2.2} />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

        </div>

      </div>

      {/* ── MASTERCLASS REGISTRATION LINK ──────────────────────────────────── */}
      <Reveal variant="fade-up" delay={350}>
        <div className="relative rounded-[2rem] p-6 sm:p-8 border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-white shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none animate-blob"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest mb-3">
              <Rocket className="w-3.5 h-3.5" /> ₹99 Masterclass Registration Link
            </div>
            <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900 mb-1.5">Send this link — earn when they register</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-2xl">
              Anyone who opens this link sees a standalone ₹99 masterclass registration page — no other part of the site is visible to them. The moment they pay, that ₹99 is credited straight to your wallet as commission.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white border border-emerald-200 rounded-2xl p-2 shadow-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0 px-3.5 py-2">
                <Link2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={2.2} />
                <input
                  type="text"
                  readOnly
                  value={masterclassLink}
                  className="flex-1 min-w-0 bg-transparent border-0 text-slate-800 text-xs sm:text-sm font-extrabold focus:outline-none tracking-wide"
                />
              </div>
              <button
                onClick={() => handleCopy(masterclassLink, 'masterclass')}
                className={`group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-md active:scale-95 shrink-0 ${
                  copiedField === 'masterclass'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                {copiedField === 'masterclass' ? <Check className="w-4 h-4 animate-bounce" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                {copiedField === 'masterclass' ? 'Copied!' : 'Copy Masterclass Link'}
              </button>
            </div>
          </div>
        </div>
      </Reveal>

    </div>
  );
}
