import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Key, Upload, Layers, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [dob, setDob] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setPackagesLoading(true);
        const response = await api.get('/global-data');
        setPackages(response.data.packages || []);
      } catch (err) {
        console.error('Error fetching packages', err);
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;

    const strengths = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
    return { score, text: strengths[score], color: colors[score] };
  };

  const passwordStrength = getPasswordStrength(password);
  const emailMatch = email && confirmEmail && email === confirmEmail;
  const passwordMatch = password && confirmPassword && password === confirmPassword;

  const handleSelectPackage = (pkgId) => {
    setSelectedPkgId(pkgId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!selectedPkgId) {
      setError('Please select a package to continue');
      return;
    }
    if (!terms) {
      setError('Please accept the terms & conditions');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('state', state);
      formData.append('dob', dob);
      formData.append('password', password);
      formData.append('package_id', selectedPkgId);
      if (referralCode) {
        formData.append('referral_code', referralCode);
      }

      const result = await register(formData);
      if (result.success) {
        const role = result.user?.role;
        navigate(role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/student');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-32 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/5 rounded-full blur-[150px] pointer-events-none"></div>

        {/* Progress Stepper */}
        <div className="w-full max-w-2xl mx-auto mb-16 relative z-10 px-4">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-lg p-8">
            <div className="flex items-center justify-between gap-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => step > 1 && setStep(1)}
                  className={`relative mb-4 transition-all duration-300 ${step === 1 ? 'scale-110' : step > 1 ? 'cursor-pointer hover:scale-105' : ''}`}
                  disabled={step === 1}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 shadow-lg ${
                    step >= 1
                      ? 'bg-gradient-to-br from-primary via-primary to-indigo-600 text-white shadow-primary/40'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > 1 ? <CheckCircle2 className="w-8 h-8" /> : '1'}
                  </div>
                  {step >= 1 && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-primary/30 animate-pulse"></div>
                  )}
                </button>
                <div className="text-center">
                  <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${
                    step >= 1 ? 'text-primary' : 'text-slate-400'
                  }`}>
                    Choose Plan
                  </p>
                  <p className={`text-xs transition-colors duration-300 ${
                    step >= 1 ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Select your package
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex-1 flex items-center gap-0 -mx-2 mb-6">
                <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  step >= 2
                    ? 'bg-gradient-to-r from-primary via-indigo-600 to-primary'
                    : 'bg-slate-200'
                }`}></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => step > 2 && setStep(2)}
                  className={`relative mb-4 transition-all duration-300 ${step === 2 ? 'scale-110' : ''}`}
                  disabled={step !== 2 && step < 2}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg transition-all duration-300 shadow-lg ${
                    step >= 2
                      ? 'bg-gradient-to-br from-primary via-primary to-indigo-600 text-white shadow-primary/40'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    2
                  </div>
                  {step >= 2 && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-primary/30 animate-pulse"></div>
                  )}
                </button>
                <div className="text-center">
                  <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${
                    step >= 2 ? 'text-primary' : 'text-slate-400'
                  }`}>
                    Your Details
                  </p>
                  <p className={`text-xs transition-colors duration-300 ${
                    step >= 2 ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Complete registration
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 flex gap-2">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              step >= 1 ? 'bg-primary' : 'bg-slate-200'
            }`}></div>
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
              step >= 2 ? 'bg-primary' : 'bg-slate-200'
            }`}></div>
          </div>
        </div>

        {/* Step 1: Package Selection */}
        {step === 1 ? (
          <div className="w-full max-w-5xl relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider mb-6">
                <Layers className="w-4 h-4" />
                Choose Your Plan
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">Select Your <span className="bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 bg-clip-text text-transparent">Growth Plan</span></h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Pick the perfect package to start your learning journey</p>
            </div>

            {packagesLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent border-r-transparent animate-spin"></div>
                  </div>
                </div>
                <p className="text-slate-600 font-semibold">Loading available packages...</p>
                <p className="text-sm text-slate-500 mt-2">This should only take a moment</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {packages.length > 0 ? packages.map((pkg, idx) => {
                const isPopular = idx === 1;
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg.id)}
                    className="group cursor-pointer relative transition-all duration-300"
                  >
                    {/* Glow effect */}
                    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 blur-lg transition-all duration-500 pointer-events-none ${
                      isSelected ? 'opacity-75' : 'opacity-0 group-hover:opacity-40'
                    }`}></div>

                    <div className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 flex flex-col h-full ${
                      isSelected
                        ? 'border-primary shadow-xl -translate-y-1'
                        : 'border-slate-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1'
                    }`}>

                      {/* Top bar */}
                      <div className={`h-2 w-full ${isPopular ? 'bg-gradient-to-r from-primary to-indigo-700' : 'bg-slate-100'}`}></div>

                      {/* Badge */}
                      {isPopular && (
                        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                          ⭐ Most Popular
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-6">
                        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">{pkg.name}</h3>

                        <div className="mb-6 pb-6 border-b border-slate-200">
                          <div className="flex items-end gap-1">
                            <span className="text-3xl font-black text-slate-900">₹{pkg.price}</span>
                            <span className="text-sm text-slate-400 line-through mb-1">₹{pkg.price * 2}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Limited time offer</p>
                        </div>

                        {pkg.what_you_get && (
                          <ul className="space-y-2 flex-1">
                            {pkg.what_you_get.split('\n').slice(0, 4).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{item.replace('✓', '').trim()}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <button className={`w-full mt-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}>
                          {isSelected ? '✓ Selected' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-600 font-semibold">No packages available at the moment</p>
                  <p className="text-sm text-slate-500 mt-1">Please try again later</p>
                </div>
              )}
            </div>
            )}

            {selectedPkgId && (
              <div className="flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-indigo-700 hover:from-primary-dark hover:to-indigo-800 text-white font-black rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Continue to Details
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Registration Form */
          <div className="w-full max-w-2xl relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 md:p-14">
              <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Create Your Account</h1>
                <p className="text-slate-600 text-sm">Join our community and start learning today</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Personal Information */}
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition ${
                          confirmEmail && emailMatch
                            ? 'border-emerald-200 bg-emerald-50 focus:ring-emerald-400'
                            : confirmEmail
                            ? 'border-red-200 bg-red-50 focus:ring-red-400'
                            : 'border-slate-200 focus:ring-primary/40 focus:border-primary'
                        }`}
                      />
                      {emailMatch && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">State *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Maharashtra"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth *</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Referral Code (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 text-xl font-bold">%</span>
                        <input
                          type="text"
                          placeholder="PROMO2026"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Security</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <div className={`flex-1 h-1.5 rounded-full ${passwordStrength.color}`}></div>
                          <span className="text-slate-600 font-bold">{passwordStrength.text}</span>
                        </div>
                        <p className="text-xs text-slate-500">At least 8 characters with uppercase, lowercase, numbers & symbols</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition ${
                          confirmPassword && passwordMatch
                            ? 'border-emerald-200 bg-emerald-50 focus:ring-emerald-400'
                            : confirmPassword
                            ? 'border-red-200 bg-red-50 focus:ring-red-400'
                            : 'border-slate-200 focus:ring-primary/40 focus:border-primary'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {passwordMatch && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/40 accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-slate-700"><strong>I agree to the Terms & Conditions</strong> and understand the privacy policy</span>
                </label>

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !terms}
                    className="flex-1 py-3.5 bg-gradient-to-r from-primary to-indigo-700 hover:from-primary-dark hover:to-indigo-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-center text-sm text-slate-600">
                  Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
