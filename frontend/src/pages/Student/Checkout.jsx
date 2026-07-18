import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, Landmark, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const pkgId = searchParams.get('package_id');
        const courseId = searchParams.get('course_id');

        if (pkgId) {
          const response = await api.get('/global-data');
          const found = response.data.packages.find(p => String(p.id) === pkgId);
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
  }, [searchParams]);

  const handleSimulatedPurchase = async (payload) => {
    const response = await api.post('/student/purchase', payload);
    if (response.data.success) {
      setSuccess(true);
      setTimeout(() => navigate('/student/courses'), 2500);
    } else {
      setError(response.data.message || 'Purchase failed.');
    }
  };

  const handlePay = async () => {
    setError('');
    setPaying(true);

    const payload = item.type === 'package' ? { package_id: item.id } : { course_id: item.id };

    let orderResponse;
    try {
      orderResponse = await api.post('/student/checkout/create-order', payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment could not be processed.');
      setPaying(false);
      return;
    }

    if (!orderResponse.data.razorpay_enabled) {
      // Razorpay isn't configured — fall back to simulated instant purchase.
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
            setTimeout(() => navigate('/student/courses'), 2500);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Invalid checkout item</h3>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      
      {success ? (
        <div className="bg-white rounded-3xl border p-8 text-center shadow-lg">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
          <p className="text-slate-500 text-xs mt-2">Enrolling you into your purchased classes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border overflow-hidden shadow-md">
          
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">Secure Checkout</span>
            <h2 className="text-xl font-bold mt-3">{item.name || item.title}</h2>
            <p className="text-3xl font-black mt-2">₹{item.price}</p>
          </div>

          <div className="p-6 border-b">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Order Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-bold text-slate-700 capitalize">{item.type}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-slate-800">
                <span>Total Amount</span>
                <span>₹{item.price}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold text-center">
                {error}
              </div>
            )}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-transform hover:-translate-y-0.5 shadow-md shadow-primary/20 disabled:opacity-60"
            >
              {paying ? 'Processing...' : 'Pay via UPI / Cards'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4">Payments secured by Razorpay SDK integrations.</p>
          </div>

        </div>
      )}

    </div>
  );
}
