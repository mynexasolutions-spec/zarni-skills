import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link2, Share2, Copy, Check, Lightbulb, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function LinkGenerator() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get('/global-data');
        setPackages(response.data.packages || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const origin = window.location.origin;
  const referralCode = user?.referral_code || '';
  const primaryLink = `${origin}/register?ref=${referralCode}`;
  const deepLink = selectedPkg ? `${primaryLink}&package_id=${selectedPkg}` : primaryLink;

  const shareText = encodeURIComponent(`Hey! I've been learning high-income skills on Zarni Skills. You can also learn and start earning commissions!\n\nCheck it out here: `);
  const shareUrl = encodeURIComponent(primaryLink);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* Hero */}
      <section
        className="relative rounded-[22px] px-6 sm:px-8 py-8 mb-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #2563eb 100%)', boxShadow: '0 12px 32px rgba(30,64,175,0.28)' }}
      >
        <div className="absolute pointer-events-none rounded-full" style={{ top: '-60%', right: '-8%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)' }}></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl font-extrabold text-white mb-2">Grow Your Network</h1>
          <p className="text-white/75 text-sm mb-6">Share your unique referral link with friends and followers. When they join and purchase a package, you earn instant commissions.</p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/12 border border-white/25 rounded-2xl p-1.5">
            <input type="text" readOnly value={primaryLink} className="flex-1 bg-transparent border-0 text-white text-sm font-medium focus:outline-none px-3.5" />
            <button
              onClick={() => handleCopy(primaryLink, 'primary')}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-blue-800 rounded-xl font-bold text-[0.8rem] whitespace-nowrap hover:-translate-y-0.5 transition-all shadow-lg"
            >
              {copiedField === 'primary' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedField === 'primary' ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* Left: 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-7">

          {/* Quick Share */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
              <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
                <Share2 className="w-5 h-5 text-blue-600" /> Quick Share
              </h2>
            </div>
            <div className="p-6 grid grid-cols-3 gap-3">
              <a
                href={`https://wa.me/?text=${shareText}${shareUrl}`}
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:-translate-y-1 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30 font-bold text-sm">W</div>
                <span className="text-[0.75rem] font-bold text-emerald-700">WhatsApp</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`}
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-sky-50 border border-sky-100 hover:-translate-y-1 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-sky-500/30 font-bold text-sm">T</div>
                <span className="text-[0.75rem] font-bold text-sky-700">Telegram</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:-translate-y-1 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-indigo-500/30 font-bold text-sm">F</div>
                <span className="text-[0.75rem] font-bold text-indigo-700">Facebook</span>
              </a>
            </div>
          </div>

          {/* Deep Link Generator */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(180deg, #fafbff 0%, #fff 100%)' }}>
              <h2 className="flex items-center gap-2.5 font-bold text-[1.05rem] text-slate-900 m-0">
                <Link2 className="w-5 h-5 text-blue-600" /> Deep Link Generator
              </h2>
            </div>
            <div className="p-6">
              <p className="text-[0.8rem] text-slate-400 mb-4">Promoting a specific package? Generate a direct link below.</p>

              <label className="block text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Target Package</label>
              <select
                value={selectedPkg}
                onChange={(e) => setSelectedPkg(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white"
              >
                <option value="">Full Registration Page (Default)</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} — ₹{pkg.price}</option>
                ))}
              </select>

              <label className="block text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Generated Deep Link</label>
              <div className="flex items-stretch gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                <input type="text" readOnly value={deepLink} className="flex-1 bg-transparent border-0 text-sm text-slate-700 font-medium focus:outline-none px-3" />
                <button
                  onClick={() => handleCopy(deepLink, 'deep')}
                  className="flex items-center justify-center px-4 rounded-lg text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                >
                  {copiedField === 'deep' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="flex flex-col gap-7">

          {/* Referral code */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-3">Your Referral Code</p>
            <div
              className="font-mono text-[1.75rem] font-extrabold text-blue-600 tracking-[0.15em] py-4 rounded-xl mb-4"
              style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', border: '1px solid #dbeafe' }}
            >
              {referralCode}
            </div>
            <button
              onClick={() => handleCopy(referralCode, 'code')}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            >
              {copiedField === 'code' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Tips */}
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
            <h3 className="flex items-center gap-2 font-extrabold text-sm mb-4">
              <Lightbulb className="w-[18px] h-[18px] text-amber-300" /> Pro Sharing Tips
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-2.5 text-[0.8rem] text-white/85 leading-relaxed">
                <strong className="text-amber-300 font-extrabold flex-shrink-0">01.</strong>
                Share your personal success story with the courses.
              </li>
              <li className="flex gap-2.5 text-[0.8rem] text-white/85 leading-relaxed">
                <strong className="text-amber-300 font-extrabold flex-shrink-0">02.</strong>
                Post your referral link in your Instagram &amp; WhatsApp bio.
              </li>
              <li className="flex gap-2.5 text-[0.8rem] text-white/85 leading-relaxed">
                <strong className="text-amber-300 font-extrabold flex-shrink-0">03.</strong>
                Tell people they can earn while they learn.
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
