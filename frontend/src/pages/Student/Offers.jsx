import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag, Copy, Check, Clock, Flame, Ticket, Sparkles, ShoppingBag, Infinity as InfinityIcon,
  Crown, Share2, ArrowRight, TrendingDown,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Each offer gets a hue so a wall of vouchers doesn't read as one block.
const HUES = [
  { from: '#7c3aed', to: '#4f46e5', soft: 'from-violet-50 to-indigo-50', ring: 'border-violet-200', text: 'text-violet-700', chip: 'bg-violet-100 text-violet-700' },
  { from: '#0891b2', to: '#0d9488', soft: 'from-cyan-50 to-teal-50', ring: 'border-cyan-200', text: 'text-cyan-700', chip: 'bg-cyan-100 text-cyan-700' },
  { from: '#e11d48', to: '#c026d3', soft: 'from-rose-50 to-fuchsia-50', ring: 'border-rose-200', text: 'text-rose-700', chip: 'bg-rose-100 text-rose-700' },
  { from: '#ea580c', to: '#d97706', soft: 'from-orange-50 to-amber-50', ring: 'border-orange-200', text: 'text-orange-700', chip: 'bg-orange-100 text-orange-700' },
];

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

const dateLabel = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

// A percent coupon is worth nothing on its own — it only means something
// against a real package price, so every figure on the card is computed
// against the package the student currently has selected.
function savingOn(offer, price) {
  const p = Number(price) || 0;
  if (!p) return 0;
  const raw = offer.discount_type === 'percent'
    ? p * Number(offer.discount_value) / 100
    : Number(offer.discount_value);
  return Math.min(raw, p);
}

function daysUntil(d) {
  if (!d) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${d}T00:00:00`).getTime() - today.getTime()) / 86400000);
}

function OfferCard({ offer, hue, packages, referralCode, best }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  // Default to the priciest package: it shows the coupon at its best, which is
  // the number a student actually wants to see first.
  const [pkgId, setPkgId] = useState(() => (packages[0] ? String(packages[0].id) : ''));
  const isPercent = offer.discount_type === 'percent';
  const left = offer.max_uses == null ? null : Math.max(0, offer.max_uses - offer.used_count);
  const usedPct = offer.max_uses ? Math.min(100, Math.round((offer.used_count / offer.max_uses) * 100)) : 0;
  const pkg = packages.find((x) => String(x.id) === pkgId) || null;
  const saving = pkg ? savingOn(offer, pkg.price) : 0;
  const payable = pkg ? Math.max(0, Number(pkg.price) - saving) : 0;
  const days = daysUntil(offer.expires_at);
  const endingSoon = days !== null && days <= 7;
  const almostGone = left !== null && left <= Math.max(3, Math.round((offer.max_uses || 0) * 0.15));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
    } catch {
      // Clipboard API needs a secure context; fall back to a temporary input
      // so copying still works when the dashboard is served over plain HTTP.
      const el = document.createElement('textarea');
      el.value = offer.code;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // The whole point of an *affiliate* offer: hand the student a message that
  // carries both their referral link and the discount, ready to forward.
  const shareText = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    const value = isPercent ? `${Math.round(offer.discount_value)}% off` : `${inr(offer.discount_value)} off`;
    return `Get ${value} on Zarni Skills! 🎉

Use coupon code: ${offer.code}
${offer.expires_at ? `Valid till ${dateLabel(offer.expires_at)}
` : ''}
Sign up here: ${link}`;
  };

  const share = async () => {
    const text = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${offer.code} — Zarni Skills`, text });
        return;
      } catch {
        // user dismissed the sheet, or the browser refused — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  };

  return (
    <div className={`group relative bg-white border ${hue.ring} rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      {/* Value band */}
      <div
        className="relative px-5 pt-5 pb-7 text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${hue.from} 0%, ${hue.to} 100%)` }}
      >
        <span className="absolute inset-x-0 top-0 h-px bg-white/40 pointer-events-none"></span>
        <span className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none"></span>
        <Ticket className="absolute -right-4 -bottom-6 w-28 h-28 text-white/10 rotate-12 pointer-events-none" strokeWidth={1} />

        <div className="relative flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> {isPercent ? 'Percent Off' : 'Flat Off'}
          </span>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {best && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-amber-700 text-[9px] font-black uppercase tracking-widest shadow-md">
                <Crown className="w-3 h-3" fill="currentColor" /> Best value
              </span>
            )}
            {(endingSoon || almostGone) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-300 text-amber-950 text-[9px] font-black uppercase tracking-widest shadow-sm">
                <Flame className="w-3 h-3" /> {almostGone ? 'Almost gone' : 'Ending soon'}
              </span>
            )}
          </div>
        </div>

        <p className="relative font-heading font-black leading-none mt-4 tabular-nums text-[44px] sm:text-[52px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
          {isPercent ? `${Math.round(offer.discount_value)}%` : inr(offer.discount_value)}
        </p>
        <p className="relative text-white/80 text-xs font-bold uppercase tracking-[0.18em] mt-1.5">
          {pkg ? `Saves ${inr(saving)} on ${pkg.name}` : 'Off your next purchase'}
        </p>
      </div>

      {/* Perforation — the notches make it read as a torn-off voucher */}
      <div className="relative h-0">
        <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200/70"></span>
        <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200/70"></span>
        <span className="absolute inset-x-4 -top-px border-t-2 border-dashed border-slate-200"></span>
      </div>

      {/* Code + meta */}
      <div className="p-5 pt-7">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Coupon Code</p>
        <div className={`flex items-stretch gap-2 rounded-2xl border-2 border-dashed ${hue.ring} bg-gradient-to-r ${hue.soft} p-1.5`}>
          <span className={`flex-1 min-w-0 flex items-center px-3 font-heading font-black text-lg sm:text-xl tracking-[0.12em] truncate ${hue.text}`}>
            {offer.code}
          </span>
          <button
            onClick={copy}
            aria-label={`Copy code ${offer.code}`}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95 ${
              copied ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'shadow-md'
            }`}
            style={copied ? undefined : { background: `linear-gradient(135deg, ${hue.from}, ${hue.to})` }}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>

        {/* Uses remaining */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wide mb-1.5">
            <span className="text-slate-400">Claimed</span>
            <span className={left !== null && almostGone ? 'text-amber-600' : 'text-slate-500'}>
              {left === null
                ? <span className="inline-flex items-center gap-1"><InfinityIcon className="w-3.5 h-3.5" /> Unlimited</span>
                : `${left} left`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200/70">
            <div
              className="h-full rounded-full transition-[width] duration-1000 ease-out"
              style={{
                width: left === null ? '18%' : `${usedPct}%`,
                background: `linear-gradient(90deg, ${hue.from}, ${hue.to})`,
                opacity: left === null ? 0.35 : 1,
              }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3.5 pt-3.5 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {offer.expires_at
            ? <>Valid till {dateLabel(offer.expires_at)}
                {days !== null && days >= 0 && (
                  <span className={`ml-auto font-black tabular-nums ${endingSoon ? 'text-amber-600' : 'text-slate-500'}`}>
                    {days === 0 ? 'Last day' : `${days} day${days === 1 ? '' : 's'}`}
                  </span>
                )}
              </>
            : <>No expiry<span className="ml-auto font-black text-slate-500">Always on</span></>}
        </div>

        {/* Pick a package and the numbers above/below recalculate, so the
            student sees what they'd actually pay before committing. */}
        {packages.length > 0 && (
          <div className="mt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Apply to</p>
            <select
              value={pkgId}
              onChange={(e) => setPkgId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {packages.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} — {inr(x.price)}
                </option>
              ))}
            </select>

            {pkg && (
              <div className={`flex items-center gap-2 mt-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r ${hue.soft} border ${hue.ring}`}>
                <TrendingDown className={`w-4 h-4 shrink-0 ${hue.text}`} strokeWidth={2.4} />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">You pay</p>
                  <p className="font-heading font-black text-base text-slate-900 tabular-nums leading-tight mt-0.5">
                    {inr(payable)}
                    <span className="ml-1.5 text-[11px] font-bold text-slate-400 line-through">{inr(pkg.price)}</span>
                  </p>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-black tabular-nums ${hue.chip}`}>
                  −{inr(saving)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mt-3">
          <button
            onClick={() => navigate(pkg
              ? `/student/checkout?package_id=${pkg.public_code}&coupon=${encodeURIComponent(offer.code)}`
              : '/student/packages')}
            className="group/btn relative overflow-hidden flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-inset ring-white/25 shadow-md transition-all hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${hue.from}, ${hue.to})` }}
          >
            <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></span>
            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent"></span>
            <ShoppingBag className="relative w-3.5 h-3.5" />
            <span className="relative">{pkg ? 'Apply & checkout' : 'Browse packages'}</span>
            <ArrowRight className="relative w-3.5 h-3.5" />
          </button>

          <button
            onClick={share}
            title="Share this offer with your referrals"
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
              shared
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {shared ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Offers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [offersRes, globalRes] = await Promise.all([
          api.get('/student/offers'),
          api.get('/global-data'),
        ]);
        setOffers(offersRes.data.offers || []);
        // Priciest first: it's both the default selection on a card and the
        // basis for ranking which coupon is worth the most.
        setPackages([...(globalRes.data.packages || [])].sort((a, b) => (b.price || 0) - (a.price || 0)));
      } catch (err) {
        console.error('Error fetching offers', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const topPrice = packages[0]?.price || 0;

  // Rank by what each coupon is actually worth against the top package, so the
  // biggest real saving leads — a flat ₹1000 can beat 15% and should show it.
  const ranked = [...offers].sort((a, b) => savingOn(b, topPrice) - savingOn(a, topPrice));
  const bestId = ranked.length && topPrice ? ranked[0].id : null;
  const bestSaving = bestId ? savingOn(ranked[0], topPrice) : 0;

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up pb-12">

      <div className="flex items-center gap-3">
        <Tag className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
        <h2 className="text-xl sm:text-2xl font-black">Affiliate Offers</h2>
      </div>

      {/* Hero */}
      <div className="relative">
        <div className="absolute -inset-3 sm:-inset-4 rounded-[3rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#0c0722]"></div>
          <div className="absolute -top-20 -left-12 w-80 h-80 rounded-full bg-violet-600/50 blur-[80px] animate-blob"></div>
          <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full bg-fuchsia-600/40 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(12,7,34,0.72) 0%, rgba(12,7,34,0.5) 45%, rgba(12,7,34,0.94) 100%)' }}></div>
        </div>

        <div className="relative rounded-[2.2rem] p-5 sm:p-8 text-white bg-white/[0.07] backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(12,7,34,0.5)] overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></span>
          <Ticket className="absolute right-5 top-5 w-28 h-28 sm:w-40 sm:h-40 text-amber-300/[0.06] rotate-6 pointer-events-none" strokeWidth={1} />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-violet-200 text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-3">
              <Tag className="w-3 h-3 text-amber-300" /> Live Offers
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl leading-tight bg-gradient-to-b from-white to-amber-100 bg-clip-text text-transparent">
              {offers.length === 0
                ? 'No offers right now'
                : `${offers.length} coupon${offers.length === 1 ? '' : 's'} you can use`}
            </h3>
            <p className="text-violet-100/80 text-xs sm:text-sm font-medium mt-2 max-w-md">
              {bestSaving > 0
                ? `Save up to ${inr(bestSaving)} on a package — pick one on any card and check out with the code already applied.`
                : 'Copy a code below and apply it at checkout on any package or course.'}
            </p>
          </div>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-400 mb-4">
            <Ticket className="w-7 h-7" />
          </div>
          <p className="text-slate-700 font-black">No active offers right now</p>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
            New promo codes show up here as soon as our team launches them. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {ranked.map((offer, i) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              hue={HUES[i % HUES.length]}
              packages={packages}
              referralCode={user?.referral_code || ''}
              best={offer.id === bestId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
