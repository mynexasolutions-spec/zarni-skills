import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Landmark, CheckCircle2, Tag, X, ArrowLeft, ArrowRight, ArrowUpCircle, Package, BookOpen, Lock, Sparkles, PartyPopper, Play, Loader2 } from 'lucide-react';
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

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const packageId = searchParams.get('package_id');
  const courseId = searchParams.get('course_id');
  // Arriving from the offers page with ?coupon=CODE — prefill and validate it
  // so the student never has to retype a code they just tapped.
  const presetCoupon = (searchParams.get('coupon') || '').trim().toUpperCase();

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        if (packageId) {
          const response = await api.get('/global-data');
          const found = response.data.packages.find((p) => p.public_code === packageId);
          if (found) setItem({ ...found, type: 'package' });
        } else if (courseId) {
          const response = await api.get('/courses');
          const found = response.data.courses.find(c => String(c.id) === courseId);
          if (found) setItem({ ...found, type: 'course' });
        }
      } catch (err) {
        console.error('Error fetching checkout details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [packageId, courseId]);

  const fetchPricing = async (coupon_code) => {
    setPricingLoading(true);
    try {
      const payload = packageId ? { package_id: packageId, coupon_code } : { course_id: courseId, coupon_code };
      const response = await api.post('/student/checkout/pricing', payload);
      setPricing(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching pricing preview', err);
      return null;
    } finally {
      setPricingLoading(false);
    }
  };

  useEffect(() => {
    if (!item) return;
    if (presetCoupon) {
      setCouponInput(presetCoupon);
      fetchPricing(presetCoupon).then((result) => {
        if (result && result.coupon_valid) setAppliedCoupon(presetCoupon);
        else setCouponError('That coupon is no longer valid.');
      });
    } else {
      fetchPricing(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError('');
    const result = await fetchPricing(couponInput.trim());
    if (result && result.coupon_valid) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
    } else {
      setAppliedCoupon(null);
      setCouponError((result && result.message) || 'Invalid coupon code.');
    }
    setCouponChecking(false);
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    await fetchPricing(null);
  };

  const successRedirect = () => (item.type === 'package' ? '/student/packages' : `/student/watch/${item.id}`);

  const handleSimulatedPurchase = async (payload) => {
    const response = await api.post('/student/purchase', payload);
    if (response.data.success) {
      setSuccess(true);
      setTimeout(() => navigate(successRedirect()), 2500);
    } else {
      setError(response.data.message || 'Purchase failed.');
    }
  };

  const handlePay = async () => {
    setError('');
    setPaying(true);

    const basePayload = item.type === 'package' ? { package_id: item.id } : { course_id: item.id };
    const payload = { ...basePayload, coupon_code: appliedCoupon || undefined };

    let orderResponse;
    try {
      orderResponse = await api.post('/student/checkout/create-order', payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment could not be processed.');
      setPaying(false);
      return;
    }

    if (!orderResponse.data.razorpay_enabled) {
      // Razorpay isn't configured, or the price is fully covered by the coupon/upgrade
      // credit — fall back to the simulated instant purchase (still server-verified).
      try {
        await handleSimulatedPurchase(payload);
      } catch (err) {
        setError(err.response?.data?.message || 'Payment could not be processed.');
      } finally {
        setPaying(false);
      }
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Could not load the payment gateway. Please check your connection and try again.');
      setPaying(false);
      return;
    }

    // From here on, `paying` is owned by the Razorpay modal's own callbacks below —
    // it stays true while the modal is open and clears on success, failure, or dismiss.
    const { order_id, amount, currency, key_id, item_name, user_name, user_email } = orderResponse.data;

    const rzp = new window.Razorpay({
      key: key_id,
      amount,
      currency,
      name: 'Zarni Skills',
      description: item_name,
      image: `${window.location.origin}/static/img/zarni-logo.png`,
      order_id,
      prefill: { name: user_name, email: user_email },
      theme: { color: '#2b80f0' },
      handler: async (rzpResponse) => {
        try {
          const verifyResponse = await api.post('/student/payment/verify', {
            ...payload,
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature: rzpResponse.razorpay_signature,
          });
          if (verifyResponse.data.success) {
            setSuccess(true);
            setTimeout(() => navigate(successRedirect()), 2500);
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
    rzp.on('payment.failed', (resp) => {
      setError(resp.error?.description || 'Payment failed. Please try again.');
      setPaying(false);
    });
    rzp.open();
  };

  const ItemIcon = item?.type === 'course' ? BookOpen : Package;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Ambient background */}
      <div className="fixed top-[-10%] left-[8%] w-96 h-96 bg-blue-400/10 rounded-full blur-[130px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[8%] w-96 h-96 bg-indigo-400/10 rounded-full blur-[130px] pointer-events-none -z-10"></div>

      {/* Minimal top bar */}
      <header className="w-full px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/static/img/zarni-logo.png" alt="Zarni Skills" className="h-8 w-auto object-contain"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <span className="hidden items-center font-black text-lg text-primary">Zarni Skills</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-xs font-black uppercase tracking-widest">
          <Lock className="w-3 h-3" /> Secure Checkout
        </span>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 pb-16 flex flex-col justify-center">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : !item ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Invalid checkout item</h3>
            <p className="text-sm text-slate-400 mt-1">This link is missing a valid package or course.</p>
            <Link to="/packages" className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold text-primary hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Browse Packages
            </Link>
          </div>
        ) : success ? (
          <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200/90 p-8 sm:p-10 text-center shadow-[0_30px_70px_-20px_rgba(16,185,129,0.4)] animate-scale-in">
            {/* Confetti burst */}
            {[
              { top: '8%', left: '12%', size: 8, color: '#34d399', delay: '0ms', dur: '2.2s' },
              { top: '15%', left: '85%', size: 10, color: '#60a5fa', delay: '150ms', dur: '2.6s' },
              { top: '75%', left: '10%', size: 7, color: '#fbbf24', delay: '300ms', dur: '2.4s' },
              { top: '80%', left: '88%', size: 9, color: '#f472b6', delay: '450ms', dur: '2.8s' },
              { top: '5%', left: '50%', size: 6, color: '#a78bfa', delay: '600ms', dur: '2.3s' },
              { top: '90%', left: '48%', size: 8, color: '#34d399', delay: '250ms', dur: '2.5s' },
            ].map((c, i) => (
              <span key={i} className="absolute rounded-full pointer-events-none animate-float"
                style={{ top: c.top, left: c.left, width: c.size, height: c.size, backgroundColor: c.color, opacity: 0.7, animationDelay: c.delay, animationDuration: c.dur }}></span>
            ))}

            <div className="relative w-24 h-24 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-300/50 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                <PartyPopper className="w-4 h-4 text-amber-500" />
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" /> Payment Successful
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 leading-tight">You're All Set!</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              You now have full access to <span className="font-bold text-slate-800">{item.name || item.title}</span>.
              {item.type === 'course' ? ' Time to start learning.' : ' Your courses are ready to explore.'}
            </p>

            <button
              onClick={() => navigate(successRedirect())}
              className="group relative overflow-hidden w-full mt-7 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              {item.type === 'course' ? <Play className="w-4 h-4 relative fill-current" /> : null}
              <span className="relative">{item.type === 'course' ? 'Start Watching Now' : 'Go to My Packages'}</span>
              <ArrowRight className="w-4 h-4 relative transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </button>

            <p className="text-[10px] text-slate-400 font-semibold mt-4">Redirecting you automatically...</p>
          </div>
        ) : (
          <>
            {(() => {
              const finalAmount = pricing ? pricing.final_amount : item.price;
              const hasUpgradeCredit = pricing && pricing.upgrade_credit > 0;
              const hasCouponDiscount = pricing && pricing.coupon_discount > 0;

              return (
                <div className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-transparent shadow-[0_25px_60px_-20px_rgba(37,99,235,0.35)] hover:shadow-[0_30px_70px_-15px_rgba(37,99,235,0.45)] transition-shadow duration-500 animate-fade-in-up">
                  <div className="bg-white rounded-[calc(2rem-1.5px)] overflow-hidden">

                    {/* Header */}
                    <div className="relative overflow-hidden p-6 sm:p-7 text-white"
                      style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 45%, #2563eb 100%)' }}>
                      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
                      <div className="absolute -top-12 -right-8 w-48 h-48 bg-blue-400/25 rounded-full blur-[90px] pointer-events-none animate-blob"></div>
                      <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
                      <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

                      <div className="relative z-10 flex items-start gap-4">
                        {item.thumbnail_display_url ? (
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 animate-float">
                            <div className="absolute -inset-1.5 rounded-[1.5rem] bg-gradient-to-br from-amber-300 via-blue-300 to-indigo-300 opacity-80 blur-[6px] animate-pulse"></div>
                            <img
                              src={item.thumbnail_display_url}
                              alt={item.name || item.title}
                              className="relative w-full h-full rounded-2xl object-cover border-2 border-white/40 shadow-xl bg-white/10"
                            />
                            <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-[#0f1f4d] flex items-center justify-center shadow-lg">
                              <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                            </span>
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                            <ItemIcon className="w-9 h-9 text-white" strokeWidth={1.8} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/80">{item.type}</p>
                          <h2 className="text-lg sm:text-xl font-heading font-black leading-snug truncate">{item.name || item.title}</h2>

                          <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                            {pricingLoading ? (
                              <span className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-heading font-black">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-200" />
                              </span>
                            ) : (
                              <p className="text-3xl sm:text-4xl font-heading font-black transition-opacity duration-300">
                                ₹{finalAmount.toLocaleString('en-IN')}
                              </p>
                            )}
                            {item.market_price > item.price && (
                              <>
                                <span className="text-base sm:text-lg font-bold text-blue-200/60 line-through">₹{Number(item.market_price).toLocaleString('en-IN')}</span>
                                <span className="relative inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60"></span>
                                  <span className="relative">{Math.round(((item.market_price - item.price) / item.market_price) * 100)}% OFF 🥳</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b border-slate-100">
                      <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
                          <span className="absolute inset-0 rounded-full bg-blue-400/40 blur-[4px] animate-pulse"></span>
                          <Package className="relative w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
                        </span>
                        Order Summary
                      </p>

                      {hasUpgradeCredit && (
                        <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3 mb-4">
                          <ArrowUpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                          <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
                            You already own a package — its price (<span className="font-black">₹{pricing.upgrade_credit.toLocaleString('en-IN')}</span>) is credited toward this upgrade, so you only pay the difference.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2.5 text-sm">
                        {(() => {
                          const gstPct = item.gst_percent || 0;
                          const gstAmount = gstPct ? Number(item.price) - Number(item.price) / (1 + gstPct / 100) : 0;
                          const packageCost = Number(item.price) - gstAmount;
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Package Cost</span>
                                <span className="font-bold text-slate-700">₹{packageCost.toFixed(2)}</span>
                              </div>
                              {gstPct > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-medium">GST ({gstPct}%)</span>
                                  <span className="font-bold text-slate-700">₹{gstAmount.toFixed(2)}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5">
                          <span className="text-slate-400 font-medium">Base Price</span>
                          <span className="font-bold text-slate-700">₹{Number(item.price).toLocaleString('en-IN')}</span>
                        </div>
                        {hasUpgradeCredit && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Already-Owned Package Credit</span>
                            <span>−₹{pricing.upgrade_credit.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {hasCouponDiscount && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span>Coupon ({appliedCoupon})</span>
                            <span>−₹{pricing.coupon_discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5 mt-2.5 font-black text-slate-900">
                          <span>Total Amount</span>
                          {pricingLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          ) : (
                            <span className="text-blue-600">₹{finalAmount.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      {(hasUpgradeCredit || hasCouponDiscount) && (
                        <div className="relative overflow-hidden mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-emerald-500/25">
                          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></span>
                          <Sparkles className="w-3.5 h-3.5 relative" />
                          <span className="relative">You save ₹{((pricing.upgrade_credit || 0) + (pricing.coupon_discount || 0)).toLocaleString('en-IN')} on this order</span>
                        </div>
                      )}
                    </div>

                    {/* Coupon */}
                    <div className="p-6 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
                          <span className="absolute inset-0 rounded-full bg-indigo-400/40 blur-[4px] animate-pulse"></span>
                          <Tag className="relative w-3.5 h-3.5 text-indigo-500" strokeWidth={2.5} />
                        </span>
                        Coupon Code
                      </p>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                          <span className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                            <Tag className="w-4 h-4" /> {appliedCoupon} applied
                          </span>
                          <button onClick={handleRemoveCoupon} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-slate-300 transition-all"
                            />
                          </div>
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponChecking || !couponInput.trim()}
                            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-60 transition-all shrink-0 flex items-center justify-center min-w-[64px] active:scale-95"
                          >
                            {couponChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {couponError}
                        </p>
                      )}
                    </div>

                    {/* Pay */}
                    <div className="p-6">
                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold text-center animate-scale-in">
                          {error}
                        </div>
                      )}
                      <button
                        onClick={handlePay}
                        disabled={paying || pricingLoading}
                        className="group relative overflow-hidden w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-xl shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:hover:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {!paying && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                        {paying ? (
                          <span className="relative flex items-center gap-2">
                            <Sparkles className="w-4 h-4 animate-spin" /> Processing...
                          </span>
                        ) : (
                          <span className="relative flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                            {finalAmount > 0 ? 'Pay via UPI / Cards' : 'Claim for Free'}
                          </span>
                        )}
                      </button>
                      <div className="flex items-center justify-center gap-5 mt-5">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                            <Landmark className="w-3 h-3 text-slate-500" />
                          </span>
                          Razorpay Secured
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          </span>
                          256-bit SSL
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
