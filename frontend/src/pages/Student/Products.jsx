import React, { useEffect, useState } from 'react';
import { ShoppingBag, ShieldCheck, CheckCircle2, ImagePlus, ExternalLink, Sparkles, Landmark, Tag, X } from 'lucide-react';
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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successId, setSuccessId] = useState(null);

  // Coupon state, keyed by product id
  const [couponInputs, setCouponInputs] = useState({});
  const [appliedCoupons, setAppliedCoupons] = useState({});
  const [couponErrors, setCouponErrors] = useState({});
  const [couponChecking, setCouponChecking] = useState({});
  const [pricing, setPricing] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await api.get('/student/products');
      setProducts(res.data.products || []);
      setPurchasedIds(res.data.purchased_product_ids || []);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const finalAmountFor = (product) => {
    const p = pricing[product.id];
    return p ? p.final_amount : product.price;
  };

  const handleApplyCoupon = async (product) => {
    const code = (couponInputs[product.id] || '').trim();
    if (!code) return;
    setCouponChecking((prev) => ({ ...prev, [product.id]: true }));
    setCouponErrors((prev) => ({ ...prev, [product.id]: '' }));
    try {
      const res = await api.post(`/student/products/${product.id}/checkout/pricing`, { coupon_code: code });
      if (res.data.coupon_valid) {
        setAppliedCoupons((prev) => ({ ...prev, [product.id]: code.toUpperCase() }));
        setPricing((prev) => ({ ...prev, [product.id]: res.data }));
      } else {
        setCouponErrors((prev) => ({ ...prev, [product.id]: res.data.message || 'Invalid coupon code.' }));
      }
    } catch (err) {
      setCouponErrors((prev) => ({ ...prev, [product.id]: err.response?.data?.message || 'Invalid coupon code.' }));
    } finally {
      setCouponChecking((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleRemoveCoupon = (product) => {
    setAppliedCoupons((prev) => ({ ...prev, [product.id]: null }));
    setCouponInputs((prev) => ({ ...prev, [product.id]: '' }));
    setCouponErrors((prev) => ({ ...prev, [product.id]: '' }));
    setPricing((prev) => ({ ...prev, [product.id]: null }));
  };

  const handleBuy = async (product) => {
    setErrorId(null);
    setErrorMsg('');
    setPayingId(product.id);

    const couponPayload = { coupon_code: appliedCoupons[product.id] || undefined };

    let orderResponse;
    try {
      orderResponse = await api.post(`/student/products/${product.id}/checkout/create-order`, couponPayload);
    } catch (err) {
      setErrorId(product.id);
      setErrorMsg(err.response?.data?.message || 'Payment could not be processed.');
      setPayingId(null);
      return;
    }

    if (!orderResponse.data.razorpay_enabled) {
      try {
        const freeResponse = await api.post(`/student/products/${product.id}/checkout/free`, couponPayload);
        if (freeResponse.data.success) {
          setSuccessId(product.id);
          setPurchasedIds((prev) => [...prev, product.id]);
        } else {
          setErrorId(product.id);
          setErrorMsg(freeResponse.data.message || 'Purchase failed.');
        }
      } catch (err) {
        setErrorId(product.id);
        setErrorMsg(err.response?.data?.message || 'Purchase failed.');
      } finally {
        setPayingId(null);
      }
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorId(product.id);
      setErrorMsg('Could not load the payment gateway. Please check your connection and try again.');
      setPayingId(null);
      return;
    }

    const { order_id, amount, currency, key_id, item_name, user_name, user_email } = orderResponse.data;

    const rzp = new window.Razorpay({
      key: key_id,
      amount,
      currency,
      name: 'Zarni Skills',
      description: item_name,
      order_id,
      prefill: { name: user_name, email: user_email },
      theme: { color: '#2b80f0' },
      handler: async (rzpResponse) => {
        try {
          const verifyResponse = await api.post(`/student/products/${product.id}/checkout/verify`, {
            ...couponPayload,
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature: rzpResponse.razorpay_signature,
          });
          if (verifyResponse.data.success) {
            setSuccessId(product.id);
            setPurchasedIds((prev) => [...prev, product.id]);
          } else {
            setErrorId(product.id);
            setErrorMsg(verifyResponse.data.message || 'Payment verification failed.');
          }
        } catch (err) {
          setErrorId(product.id);
          setErrorMsg(err.response?.data?.message || 'Payment verification failed.');
        } finally {
          setPayingId(null);
        }
      },
      modal: {
        ondismiss: () => setPayingId(null),
      },
    });
    rzp.on('payment.failed', (resp) => {
      setErrorId(product.id);
      setErrorMsg(resp.error?.description || 'Payment failed. Please try again.');
      setPayingId(null);
    });
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 text-slate-800 animate-fade-in-up">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white mb-8 sm:mb-10 animate-gradient-x"
        style={{ background: 'linear-gradient(115deg, #0f1f4d 0%, #1e3a8a 30%, #2563eb 55%, #1e3a8a 80%, #0f1f4d 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
        <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>
        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1.5 rounded-2xl bg-emerald-300/40 blur-md animate-pulse"></div>
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">
              <ShieldCheck className="w-3 h-3" /> Secure Checkout
            </div>
            <h2 className="text-xl sm:text-2xl font-black">Products</h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">Buy instantly with UPI or Cards, secured by Razorpay</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {products.map((p, idx) => {
          const isOwned = purchasedIds.includes(p.id);
          const isPaying = payingId === p.id;
          const applied = appliedCoupons[p.id];
          const hasDiscount = pricing[p.id]?.coupon_discount > 0;
          const displayAmount = finalAmountFor(p);
          return (
            <div key={p.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <ImagePlus className="w-9 h-9 text-slate-300" />
                )}
                {isOwned && (
                  <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Owned
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-black text-slate-900 leading-snug break-words">{p.title}</h3>
                {p.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{p.description}</p>}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                      {p.price != null ? `₹${displayAmount.toLocaleString('en-IN')}` : 'Contact for price'}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs font-bold text-slate-300 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {p.buy_url && (
                    <a href={p.buy_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center gap-1">
                      More Info <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Coupon */}
                {!isOwned && successId !== p.id && p.price != null && (
                  <div className="mt-3">
                    {applied ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                          <Tag className="w-3.5 h-3.5" /> {applied} applied
                        </span>
                        <button onClick={() => handleRemoveCoupon(p)} className="text-emerald-600 hover:text-emerald-800">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={couponInputs[p.id] || ''}
                          onChange={(e) => setCouponInputs((prev) => ({ ...prev, [p.id]: e.target.value.toUpperCase() }))}
                          placeholder="Coupon code"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                        />
                        <button
                          onClick={() => handleApplyCoupon(p)}
                          disabled={couponChecking[p.id] || !couponInputs[p.id]?.trim()}
                          className="shrink-0 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wide disabled:opacity-60"
                        >
                          {couponChecking[p.id] ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponErrors[p.id] && <p className="text-[10px] text-red-500 font-bold mt-1.5">{couponErrors[p.id]}</p>}
                  </div>
                )}

                {errorId === p.id && (
                  <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold">{errorMsg}</div>
                )}

                <div className="mt-4">
                  {isOwned || successId === p.id ? (
                    <div className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Purchased
                    </div>
                  ) : p.price != null ? (
                    <button
                      onClick={() => handleBuy(p)}
                      disabled={isPaying}
                      className="group/btn relative overflow-hidden w-full py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-60 active:scale-[0.98]"
                    >
                      {!isPaying && <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                      <Sparkles className="w-4 h-4 relative" /> <span className="relative">{isPaying ? 'Processing...' : displayAmount > 0 ? 'Buy Now' : 'Claim for Free'}</span>
                    </button>
                  ) : p.buy_url ? (
                    <a href={p.buy_url} target="_blank" rel="noopener noreferrer" className="w-full py-3 border border-slate-200 text-slate-700 hover:border-primary hover:text-primary rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                      <ExternalLink className="w-4 h-4" /> View Details
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No products available right now. Check back soon!</p>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-8 flex items-center justify-center gap-1.5">
        <Landmark className="w-3 h-3" /> Payments secured by Razorpay. Card and bank details are never stored on our servers.
      </p>
    </div>
  );
}
