import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Rocket, Link2, Users, Check, Copy, Phone, Mail, Zap, IndianRupee, UserPlus, Flame, X, Cake, Briefcase, MapPin, BarChart3, Target } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';

const FORM_FIELD_META = [
  { key: 'age', label: 'Age', Icon: Cake },
  { key: 'occupation', label: 'Occupation', Icon: Briefcase },
  { key: 'city_state', label: 'City / State', Icon: MapPin },
  { key: 'experience_level', label: 'Experience Level', Icon: BarChart3 },
  { key: 'goal', label: 'Goal', Icon: Target },
];

export default function Marketing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralStats, setReferralStats] = useState({ total_count: 0, purchased_count: 0, not_purchased_count: 0, total_registration_income: 0 });
  const [price, setPrice] = useState(99);

  const masterclassLink = `${window.location.origin}/masterclass/${user?.referral_code || ''}`;
  const handleCopyMasterclassLink = () => {
    navigator.clipboard.writeText(masterclassLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [referralsRes, funnelRes] = await Promise.all([
          api.get('/student/masterclass-referrals'),
          api.get('/student/masterclass-funnel'),
        ]);
        setReferrals(referralsRes.data.referrals || []);
        setReferralStats({
          total_count: referralsRes.data.total_count || 0,
          purchased_count: referralsRes.data.purchased_count || 0,
          not_purchased_count: referralsRes.data.not_purchased_count || 0,
          total_registration_income: referralsRes.data.total_registration_income || 0,
        });
        if (funnelRes.data?.content?.price != null) {
          setPrice(Number(funnelRes.data.content.price));
        }
      } catch (err) {
        console.error('Error fetching marketing data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statTiles = [
    { label: 'Total Registered', value: referralStats.total_count, sub: 'People who filled the form', Icon: UserPlus, from: '#60a5fa', to: '#2563eb', shadow: 'rgba(37,99,235,0.35)' },
    { label: 'Registration Income', value: referralStats.total_registration_income, sub: '100% of every registration', Icon: IndianRupee, from: '#a78bfa', to: '#7c3aed', shadow: 'rgba(124,58,237,0.35)', prefix: '₹' },
  ];

  return (
    <>
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in-up">

      {/* ══════════════════════════════════════════════
           HERO — INVITE TO REGISTRATION FORM
         ══════════════════════════════════════════════ */}
      <section
        className="relative rounded-[2rem] sm:rounded-[2.5rem] px-6 sm:px-10 py-8 sm:py-11 overflow-hidden animate-gradient-x"
        style={{
          background: 'linear-gradient(115deg, #052e2b 0%, #065f46 25%, #10b981 50%, #065f46 75%, #052e2b 100%)',
          boxShadow: '0 25px 60px -20px rgba(5,150,105,0.45)'
        }}
      >
        {/* Ambient texture & glow */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/10 blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-amber-300/10 blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-200 mb-4">
            <Flame className="w-3.5 h-3.5" /> 100% Instant Payout — No Splitting, No Waiting
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Send This Form.<br className="hidden sm:block" /> Keep The Full <span className="text-amber-300">₹{price}</span>.
          </h2>
          <p className="text-emerald-50/85 text-sm sm:text-base max-w-2xl mb-7 leading-relaxed">
            This is different from your regular package/course referral link. Anyone who opens it lands on a standalone ₹{price} masterclass registration form — nothing else on the site is visible to them. The moment they pay, <span className="font-bold text-white">the entire ₹{price} lands in your wallet as commission</span> — not a split percentage, the full amount, credited instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-2 shadow-xl">
            <div className="flex items-center gap-3 flex-1 min-w-0 px-3.5 py-2.5">
              <Link2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={2.2} />
              <input
                type="text"
                readOnly
                value={masterclassLink}
                className="flex-1 min-w-0 bg-transparent border-0 text-slate-800 text-xs sm:text-sm font-extrabold focus:outline-none tracking-wide"
              />
            </div>
            <button
              onClick={handleCopyMasterclassLink}
              className={`group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all shadow-md active:scale-95 shrink-0 ${
                linkCopied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              {!linkCopied && (
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
              )}
              <span className="relative flex items-center gap-2">
                {linkCopied ? <Check className="w-4 h-4 animate-bounce" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
                {linkCopied ? 'Copied!' : 'Copy Registration Link'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           STATS
         ══════════════════════════════════════════════ */}
      <section>
        <h2 className="flex items-center gap-2 sm:gap-3 text-[1rem] sm:text-[1.125rem] font-extrabold text-slate-900 mb-3 sm:mb-4 flex-wrap">
          <span className="relative w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-md bg-emerald-400/30 blur-md animate-pulse"></span>
            <Rocket className="relative w-3.5 h-3.5 text-emerald-500" />
          </span>
          Your Masterclass Referrals
          <span className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent min-w-[20px]"></span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
          {statTiles.map((kpi, i) => (
            <div
              key={i}
              className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 group cursor-default animate-fade-in-up"
              style={{
                background: `linear-gradient(135deg, ${kpi.from} 0%, ${kpi.to} 100%)`,
                boxShadow: `0 10px 28px ${kpi.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                animationDelay: `${i * 80}ms`
              }}
            >
              <kpi.Icon
                className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-24 sm:h-24 text-white/10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                strokeWidth={1.5}
              />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              <div className="relative z-10">
                <p className="flex items-center gap-1.5 sm:gap-2 text-[0.62rem] sm:text-[0.7rem] font-bold text-white/85 uppercase tracking-wide sm:tracking-widest mb-2 sm:mb-3.5">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <kpi.Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
                  </span>
                  <span className="truncate">{kpi.label}</span>
                </p>
                <AnimatedNumber
                  value={kpi.value}
                  prefix={kpi.prefix || ''}
                  className="block text-[1.35rem] sm:text-[2.15rem] font-black text-white leading-none mb-1.5 sm:mb-2.5 tabular-nums"
                  style={{ textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                  duration={1200}
                />
                <p className="text-[0.62rem] sm:text-[0.7rem] text-white/75 font-medium truncate">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
           REFERRAL LIST
         ══════════════════════════════════════════════ */}
      <section className="relative rounded-[2rem] p-6 sm:p-8 border border-slate-200/90 bg-gradient-to-br from-blue-50/60 via-white to-white shadow-sm overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-400/10 blur-2xl pointer-events-none animate-blob"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-widest w-fit mb-6">
            <Users className="w-3.5 h-3.5" /> Registrations Via Your Link
          </div>

          {referrals.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No one has registered through your masterclass link yet — share it to start building your network.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {referrals.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReferral(r)}
                  className="px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-bold text-slate-900 truncate">{r.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 min-w-0 max-w-full"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{r.email}</span></span>
                    {r.phone && <span className="inline-flex items-center gap-1 shrink-0"><Phone className="w-3 h-3 shrink-0" />{r.phone}</span>}
                    <span className="shrink-0">Joined {r.created_at}</span>
                  </div>
                  {r.masterclass_amount != null && (
                    <div className="mt-1 text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 shrink-0" /> ₹{r.masterclass_amount} paid{r.masterclass_paid_at ? ` on ${r.masterclass_paid_at}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>

    {/* ══════════════════════════════════════════════
         REGISTRATION FORM DETAILS MODAL
       ══════════════════════════════════════════════ */}
    {selectedReferral && createPortal(
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
        onClick={() => setSelectedReferral(null)}
      >
        <div
          className="bg-white rounded-[2rem] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-5 text-white"
            style={{ background: 'linear-gradient(135deg, #052e2b 0%, #065f46 60%, #10b981 100%)' }}>
            <div className="min-w-0">
              <h3 className="text-lg font-black tracking-tight truncate">{selectedReferral.name}</h3>
              <p className="text-xs text-emerald-50/70 font-medium truncate">Masterclass registration details</p>
            </div>
            <button onClick={() => setSelectedReferral(null)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{selectedReferral.email}</span></div>
              {selectedReferral.phone && (
                <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5 shrink-0" />{selectedReferral.phone}</div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-400 font-semibold">Joined {selectedReferral.created_at}</span>
                {selectedReferral.masterclass_amount != null && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> ₹{selectedReferral.masterclass_amount} paid
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Form Answers</p>
              {selectedReferral.form_details ? (
                <div className="space-y-2">
                  {FORM_FIELD_META.map(({ key, label, Icon }) => (
                    <div key={key} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0"><Icon className="w-3.5 h-3.5 text-emerald-500" />{label}</span>
                      <span className="text-sm font-bold text-slate-900 text-right truncate">{selectedReferral.form_details[key] || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No form answers were recorded for this registration.</p>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
