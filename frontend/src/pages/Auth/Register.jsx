import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Key, Layers, 
  CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle, XCircle, 
  Loader2, Sparkles, ShieldCheck, Contact, Check, BadgeCheck, 
  Zap, ChevronRight, RefreshCw, Award
} from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman & Nicobar Islands", 
  "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", 
  "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [planTab, setPlanTab] = useState('package');
  const [step, setStep] = useState(1);
  const [fieldConfig, setFieldConfig] = useState({});

  const fieldMode = (key) => fieldConfig[key] || 'required';
  const isFieldHidden = (key) => fieldMode(key) === 'hidden';
  const isFieldRequired = (key) => fieldMode(key) === 'required';

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Email OTP: the address must be proven before the account is created.
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMsg, setOtpMsg] = useState({ type: '', text: '' });
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [dob, setDob] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [referrerName, setReferrerName] = useState(null);
  const [referralChecking, setReferralChecking] = useState(false);
  const [referralInvalid, setReferralInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  // Field Touched state for live feedback
  const [touched, setTouched] = useState({});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const markTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setPackagesLoading(true);
        const [globalRes, coursesRes] = await Promise.all([
          api.get('/global-data'),
          api.get('/courses'),
        ]);
        const fetchedPackages = globalRes.data.packages || [];
        // Only courses the admin has priced for standalone purchase show up here —
        // the rest are package-only and have no individual checkout path.
        const fetchedCourses = (coursesRes.data.courses || []).filter((c) => c.price);
        setPackages(fetchedPackages);
        setCourses(fetchedCourses);
        setFieldConfig(globalRes.data.registration_field_config || {});

        // Affiliate deep links carry ?package_id=X or ?course_id=X so the referred
        // student lands straight on that plan, pre-selected, instead of picking again.
        const packageIdFromUrl = searchParams.get('package_id');
        const courseIdFromUrl = searchParams.get('course_id');
        if (courseIdFromUrl) {
          const matchedCourse = fetchedCourses.find((c) => String(c.id) === courseIdFromUrl);
          if (matchedCourse) {
            setSelectedCourseId(matchedCourse.id);
            setPlanTab('course');
            setStep(2);
          }
        } else if (packageIdFromUrl) {
          const matchedPkg = fetchedPackages.find((p) => p.public_code === packageIdFromUrl);
          if (matchedPkg) {
            setSelectedPkgId(matchedPkg.id);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Error fetching packages', err);
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const code = referralCode.trim();
    if (!code) {
      setReferrerName(null);
      setReferralInvalid(false);
      setReferralChecking(false);
      return;
    }

    setReferralChecking(true);
    setReferrerName(null);
    setReferralInvalid(false);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get('/auth/verify-referral', { params: { code } });
        if (response.data.valid) {
          setReferrerName(response.data.name);
          setReferralInvalid(false);
        } else {
          setReferrerName(null);
          setReferralInvalid(true);
        }
      } catch (err) {
        console.error('Error verifying referral code', err);
        setReferrerName(null);
        setReferralInvalid(true);
      } finally {
        setReferralChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [referralCode]);

  // Phone Input Handler - Restrict to digits only & max 10 chars
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(raw);
    markTouched('phone');
  };

  // Validation Rules
  const isNameValid = name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isEmailMatching = email.trim() !== '' && email.trim() === confirmEmail.trim();
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  // Password Strength Checklist
  const pwdCriteria = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const pwdScore = Object.values(pwdCriteria).filter(Boolean).length;
  const isPasswordValid = pwdScore >= 4;
  const isPasswordMatching = password !== '' && password === confirmPassword;

  const selectedPackage = packages.find(p => p.id === selectedPkgId);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleSelectPackage = (pkgId) => {
    setSelectedPkgId(pkgId);
    setSelectedCourseId('');
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedPkgId('');
  };

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  // Editing the address after verifying has to invalidate it, otherwise a
  // verified code for one email would wave through a different one.
  const onEmailChange = (value) => {
    setEmail(value);
    if (otpVerified || otpSent) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtpCode('');
      setOtpMsg({ type: '', text: '' });
    }
  };

  const sendOtp = async () => {
    if (!isEmailValid) {
      setOtpMsg({ type: 'error', text: 'Enter a valid email address first.' });
      return;
    }
    setOtpBusy(true);
    setOtpMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/send-otp', { email: email.trim(), name: name.trim() });
      if (res.data?.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        setOtpMsg({ type: 'success', text: `Code sent to ${email.trim()}. Check your inbox.` });
      } else {
        setOtpMsg({ type: 'error', text: res.data?.message || 'Could not send the code.' });
      }
    } catch (err) {
      if (err.response?.data?.retry_after) setOtpCooldown(err.response.data.retry_after);
      setOtpMsg({ type: 'error', text: err.response?.data?.message || 'Could not send the code. Try again.' });
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      setOtpMsg({ type: 'error', text: 'Enter the 6-digit code.' });
      return;
    }
    setOtpBusy(true);
    setOtpMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/verify-otp', { email: email.trim(), code: otpCode.trim() });
      if (res.data?.success) {
        setOtpVerified(true);
        setOtpMsg({ type: 'success', text: 'Email verified.' });
      } else {
        setOtpMsg({ type: 'error', text: res.data?.message || 'Incorrect code.' });
      }
    } catch (err) {
      setOtpMsg({ type: 'error', text: err.response?.data?.message || 'Incorrect code.' });
    } finally {
      setOtpBusy(false);
    }
  };

  const handleNextStep = () => {
    if (!selectedPkgId && !selectedCourseId) {
      setError(planTab === 'course' ? 'Please select a course to continue' : 'Please select a package to continue');
      return;
    }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all inputs touched to display validation indicators
    setTouched({
      name: true,
      email: true,
      confirmEmail: true,
      phone: true,
      state: true,
      dob: true,
      password: true,
      confirmPassword: true
    });

    if (!isNameValid) {
      setError('Please enter a valid full name (at least 2 characters)');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }
    if (!isEmailMatching) {
      setError('Email addresses do not match');
      return;
    }
    if (!otpVerified) {
      setError('Please verify your email address with the code we sent.');
      return;
    }
    if (!isFieldHidden('phone') && isFieldRequired('phone') && !isPhoneValid) {
      if (phone.length < 10) {
        setError('Mobile number must be exactly 10 digits');
      } else {
        setError('Mobile number must start with 6, 7, 8, or 9');
      }
      return;
    }
    if (!isFieldHidden('state') && isFieldRequired('state') && !state) {
      setError('Please select your state');
      return;
    }
    if (!isFieldHidden('dob') && isFieldRequired('dob') && !dob) {
      setError('Please select your date of birth');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters with uppercase, lowercase, numbers & symbols');
      return;
    }
    if (!isPasswordMatching) {
      setError('Passwords do not match');
      return;
    }
    if (!selectedPkgId && !selectedCourseId) {
      setError('Please select a package or a course to continue');
      setStep(1);
      return;
    }
    if (!terms) {
      setError('Please accept the Terms & Conditions to complete registration');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('state', state.trim());
      formData.append('dob', dob);
      formData.append('password', password);
      if (selectedPkgId) formData.append('package_id', selectedPkgId);
      if (selectedCourseId) formData.append('course_id', selectedCourseId);
      if (referralCode) {
        formData.append('referral_code', referralCode.trim());
      }

      const result = await register(formData);
      if (result.success) {
        const role = result.user?.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (selectedCourseId) {
          // No referral code on this account means buyer.referrer is null, so
          // process_commissions() pays out nothing — the full amount stays
          // with the company, exactly like a direct package purchase.
          navigate(`/student/checkout?course_id=${selectedCourseId}`);
        } else if (selectedPkgId) {
          navigate(`/student/checkout?package_id=${selectedPackage?.public_code}`);
        } else {
          navigate('/student');
        }
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-6 pt-20 sm:pt-28 lg:pt-32 pb-12 relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 text-slate-800">
        
        {/* Isolated Background Glows Container (Prevents Duplicate Scrollbar) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 rounded-full blur-[100px] sm:blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-400/10 rounded-full blur-[100px] sm:blur-[120px] animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-blue-400/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Header Section */}
        <div className="w-full max-w-4xl text-center mb-5 sm:mb-8 relative z-10 px-1 sm:px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider sm:tracking-widest mb-3 sm:mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            Start Your Learning Journey
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-1.5 sm:mb-2 leading-tight">
            Unlock Your <span className="bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 bg-clip-text text-transparent">Full Potential</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Join thousands of ambitious learners mastering high-income digital skills
          </p>
        </div>

        {/* Stepper Navigation Card */}
        <div className="w-full max-w-xl mx-auto mb-6 sm:mb-10 relative z-10 px-0 sm:px-2">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-slate-200/50 p-2.5 sm:p-5">
            <div className="flex items-center justify-between gap-1.5 sm:gap-3">
              
              {/* Step 1 Tab */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all duration-300 text-left ${
                  step === 1 
                    ? 'bg-primary/10 border border-primary/30 text-primary shadow-sm font-bold'
                    : 'hover:bg-slate-100/80 text-slate-500'
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-all ${
                  step >= 1 
                    ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md shadow-primary/30' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > 1 ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : '1'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-bold truncate ${step === 1 ? 'text-primary' : 'text-slate-700'}`}>
                    1. Choose Plan
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden md:block">Select package</p>
                </div>
              </button>

              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 shrink-0" />

              {/* Step 2 Tab */}
              <button
                type="button"
                onClick={() => (selectedPkgId || selectedCourseId) && setStep(2)}
                disabled={!selectedPkgId && !selectedCourseId}
                className={`flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all duration-300 text-left ${
                  step === 2 
                    ? 'bg-primary/10 border border-primary/30 text-primary shadow-sm font-bold'
                    : (selectedPkgId || selectedCourseId)
                    ? 'hover:bg-slate-100/80 text-slate-600 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-all ${
                  step === 2
                    ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md shadow-primary/30'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  2
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-bold truncate ${step === 2 ? 'text-primary' : 'text-slate-700'}`}>
                    2. Your Details
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden md:block">Complete registration</p>
                </div>
              </button>

            </div>

            {/* Stepper Progress Bar */}
            <div className="mt-2.5 sm:mt-3 w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 transition-all duration-500 ease-out" 
                style={{ width: step === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step 1: Package Selection */}
        {step === 1 ? (
          <div className="w-full max-w-5xl relative z-10 px-0 sm:px-0">
            {/* Plan Type Tabs */}
            <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
              <div className="inline-flex p-1 rounded-full bg-white border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPlanTab('package')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    planTab === 'package' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Packages
                </button>
                <button
                  type="button"
                  onClick={() => setPlanTab('course')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    planTab === 'course' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Individual Courses
                </button>
              </div>
            </div>

            {packagesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-700 text-sm sm:text-base font-bold">Loading available plans...</p>
                <p className="text-xs text-slate-500 mt-1">Please wait a moment</p>
              </div>
            ) : planTab === 'course' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {courses.length > 0 ? courses.map((course) => {
                  const isSelected = selectedCourseId === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course.id)}
                      className={`group relative rounded-2xl sm:rounded-3xl p-[2px] transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-primary via-indigo-600 to-indigo-700 shadow-xl shadow-primary/20 -translate-y-1 sm:-translate-y-2'
                          : 'bg-gradient-to-b from-slate-200/80 to-slate-200/40 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg'
                      }`}
                    >
                      <div className={`h-full rounded-[calc(1rem-2px)] sm:rounded-[calc(1.5rem-2px)] p-5 sm:p-7 flex flex-col justify-between transition-colors ${
                        isSelected ? 'bg-white' : 'bg-white/90 group-hover:bg-white'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4">
                            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-slate-200">
                              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> Single Course
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold animate-pulse">
                                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /> Selected
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>

                          <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-100">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{course.price}</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">One-time payment • Lifetime access to this course only</p>
                          </div>

                          {course.lesson_count > 0 && (
                            <p className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mb-5 sm:mb-6">
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                              </div>
                              {course.lesson_count} lesson{course.lesson_count === 1 ? '' : 's'}{course.level ? ` • ${course.level}` : ''}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 ring-2 ring-primary/40'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <BadgeCheck className="w-4 h-4" /> Selected Course
                            </>
                          ) : (
                            'Select Course'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full text-center py-12 bg-white/80 rounded-3xl border border-slate-200">
                    <p className="text-slate-600 font-semibold">No courses are available for individual purchase right now</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {packages.length > 0 ? packages.map((pkg, idx) => {
                  const isPopular = idx === 1;
                  const isSelected = selectedPkgId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`group relative rounded-2xl sm:rounded-3xl p-[2px] transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-b from-primary via-indigo-600 to-indigo-700 shadow-xl shadow-primary/20 -translate-y-1 sm:-translate-y-2' 
                          : 'bg-gradient-to-b from-slate-200/80 to-slate-200/40 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg'
                      }`}
                    >
                      <div className={`h-full rounded-[calc(1rem-2px)] sm:rounded-[calc(1.5rem-2px)] p-5 sm:p-7 flex flex-col justify-between transition-colors ${
                        isSelected ? 'bg-white' : 'bg-white/90 group-hover:bg-white'
                      }`}>
                        
                        {/* Card Badges */}
                        <div>
                          <div className="flex items-center justify-between flex-wrap gap-2 mb-3 sm:mb-4">
                            {isPopular ? (
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
                                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> Most Popular
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-slate-200">
                                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> Package
                              </span>
                            )}

                            {isSelected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold animate-pulse">
                                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" /> Selected
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">
                            {pkg.name}
                          </h3>

                          {/* Price Tag */}
                          <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-100">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{pkg.price}</span>
                              <span className="text-xs sm:text-sm text-slate-400 line-through">₹{pkg.price * 2}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                50% OFF
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">One-time payment • Lifetime access</p>
                          </div>

                          {/* Features list */}
                          {pkg.what_you_get && (
                            <ul className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
                              {pkg.what_you_get.split('\n').slice(0, 5).map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                                  </div>
                                  <span className="leading-snug">{item.replace('✓', '').trim()}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Select Button */}
                        <button
                          type="button"
                          className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 ring-2 ring-primary/40'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <BadgeCheck className="w-4 h-4" /> Selected Plan
                            </>
                          ) : (
                            'Select Plan'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full text-center py-12 bg-white/80 rounded-3xl border border-slate-200">
                    <p className="text-slate-600 font-semibold">No packages available at the moment</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action Button for Step 1 */}
            {(selectedPkgId || selectedCourseId) && (
              <div className="flex flex-col items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 hover:from-primary-dark hover:to-indigo-800 text-white font-black text-sm sm:text-base rounded-xl sm:rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105"
                >
                  <span className="relative z-10">Proceed to Step 2: Fill Details</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                </button>
                {selectedCourseId ? (
                  <p className="text-xs text-slate-500 font-medium text-center">Selected course: <strong className="text-primary font-bold">{selectedCourse?.title}</strong> (₹{selectedCourse?.price})</p>
                ) : (
                  <p className="text-xs text-slate-500 font-medium text-center">Selected plan: <strong className="text-primary font-bold">{selectedPackage?.name}</strong> (₹{selectedPackage?.price})</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Registration Form */
          <div className="w-full max-w-2xl relative z-10 px-0 sm:px-0">
            
            {/* Selected Plan Banner Summary */}
            {(selectedPackage || selectedCourse) && (
              <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/90 border border-blue-200 backdrop-blur-xl shadow-sm sm:shadow-md flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{selectedCourse ? 'Selected Course' : 'Selected Plan'}</p>
                    <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {selectedCourse ? selectedCourse.title : selectedPackage.name} — <span className="text-primary">₹{selectedCourse ? selectedCourse.price : selectedPackage.price}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition shrink-0 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Change</span>
                </button>
              </div>
            )}

            {/* Main Light Form Container */}
            <div className="relative rounded-2xl sm:rounded-[2rem] p-[1px] bg-gradient-to-b from-primary/30 via-slate-200 to-indigo-300/40 shadow-[0_15px_45px_-10px_rgba(43,128,240,0.15)]">
              <div className="rounded-[calc(1rem-1px)] sm:rounded-[calc(2rem-1px)] bg-white p-4 sm:p-8 md:p-10">
                
                <div className="mb-6 sm:mb-8 border-b border-slate-100 pb-4 sm:pb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2 sm:mb-3">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Step 2 of 2
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 mb-1">Create Your Account</h2>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">Please fill in your details to finalize registration</p>
                </div>

                {error && (
                  <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl flex items-start gap-2.5 text-red-700">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-bold leading-snug">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">

                  {/* Personal Information Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-primary font-black text-xs uppercase tracking-wider">
                      <Contact className="w-4 h-4" /> Personal Information
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                          Full Name *
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => markTouched('name')}
                            className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                              touched.name && isNameValid
                                ? 'border-emerald-300 focus:ring-emerald-400/20'
                                : touched.name && !isNameValid
                                ? 'border-red-300 focus:ring-red-400/20'
                                : 'border-slate-200 focus:border-primary focus:ring-primary/15'
                            }`}
                          />
                          {touched.name && isNameValid && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          )}
                          {touched.name && !isNameValid && (
                            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {touched.name && !isNameValid && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">Name must be at least 2 characters</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                          Email Address *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            onBlur={() => markTouched('email')}
                            className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                              touched.email && isEmailValid
                                ? 'border-emerald-300 focus:ring-emerald-400/20'
                                : touched.email && !isEmailValid
                                ? 'border-red-300 focus:ring-red-400/20'
                                : 'border-slate-200 focus:border-primary focus:ring-primary/15'
                            }`}
                          />
                          {touched.email && isEmailValid && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          )}
                          {touched.email && !isEmailValid && (
                            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {touched.email && !isEmailValid && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">Enter a valid email address</p>
                        )}
                      </div>

                      {/* Confirm Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                          Confirm Email *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            onBlur={() => markTouched('confirmEmail')}
                            className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                              confirmEmail && isEmailMatching
                                ? 'border-emerald-300 bg-emerald-50/50 focus:ring-emerald-400/20'
                                : confirmEmail && !isEmailMatching
                                ? 'border-red-300 bg-red-50/50 focus:ring-red-400/20'
                                : 'border-slate-200 bg-slate-50/70 text-slate-900 focus:border-primary focus:ring-primary/15'
                            }`}
                          />
                          {confirmEmail && isEmailMatching && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          )}
                          {confirmEmail && !isEmailMatching && (
                            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {confirmEmail && !isEmailMatching && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">Emails do not match</p>
                        )}
                      </div>

                      {/* Email verification — the account can't be created until the
                          address is proven, and the server re-checks this on register. */}
                      <div className={`rounded-2xl border p-3.5 sm:p-4 transition-colors ${
                        otpVerified ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/70'
                      }`}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            otpVerified ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}>
                            {otpVerified
                              ? <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.6} />
                              : <Mail className="w-3.5 h-3.5 text-slate-500" />}
                          </span>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                            {otpVerified ? 'Email Verified' : 'Verify Your Email *'}
                          </p>
                        </div>

                        {otpVerified ? (
                          <p className="text-[11px] font-semibold text-emerald-700 leading-relaxed">
                            {email.trim()} is confirmed. You can finish creating your account.
                          </p>
                        ) : (
                          <>
                            {!otpSent ? (
                              <>
                                <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                                  We'll email a 6-digit code to confirm this address is yours.
                                </p>
                                <button
                                  type="button"
                                  onClick={sendOtp}
                                  disabled={otpBusy || !isEmailValid || otpCooldown > 0}
                                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                  {otpBusy ? 'Sending…' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send Verification Code'}
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="6-digit code"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-black tracking-[0.3em] text-center text-slate-900 placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={verifyOtp}
                                    disabled={otpBusy || otpCode.length !== 6}
                                    className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-primary/20 disabled:opacity-50 transition-all"
                                  >
                                    {otpBusy ? '…' : 'Verify'}
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={sendOtp}
                                  disabled={otpBusy || otpCooldown > 0}
                                  className="text-[11px] font-bold text-primary hover:underline mt-2 disabled:text-slate-400 disabled:no-underline"
                                >
                                  {otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : 'Resend code'}
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {otpMsg.text && (
                          <p className={`text-[11px] font-semibold mt-2 leading-relaxed ${
                            otpMsg.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                          }`}>
                            {otpMsg.text}
                          </p>
                        )}
                      </div>

                      {/* Phone Number - STRICT 10 DIGIT LIMIT & MOBILE RESPONSIVE */}
                      {!isFieldHidden('phone') && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Phone Number{isFieldRequired('phone') ? ' *' : ''}
                            </label>
                            <span className={`text-[11px] font-bold ${
                              phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {phone.length}/10 digits
                            </span>
                          </div>
                          <div className="relative group">
                            {/* Prefix Tag */}
                            <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 border-r border-slate-200 pr-1.5 sm:pr-2 pointer-events-none">
                              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <span className="text-xs font-bold text-slate-700">+91</span>
                            </div>
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              required={isFieldRequired('phone')}
                              placeholder="9876543210"
                              value={phone}
                              onChange={handlePhoneChange}
                              onBlur={() => markTouched('phone')}
                              className={`w-full pl-16 sm:pl-20 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-medium tracking-wide bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                                phone.length === 10 && isPhoneValid
                                  ? 'border-emerald-300 focus:ring-emerald-400/20'
                                  : touched.phone && (!isPhoneValid || phone.length < 10)
                                  ? 'border-red-300 focus:ring-red-400/20'
                                  : 'border-slate-200 focus:border-primary focus:ring-primary/15'
                              }`}
                            />
                            {phone.length === 10 && isPhoneValid && (
                              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                            )}
                            {touched.phone && (!isPhoneValid || phone.length < 10) && (
                              <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                            )}
                          </div>
                          {/* Live Phone Helper */}
                          {phone.length > 0 && phone.length < 10 && (
                            <p className="text-[11px] text-amber-600 font-semibold mt-1">
                              Enter remaining {10 - phone.length} digits
                            </p>
                          )}
                          {phone.length === 10 && !isPhoneValid && (
                            <p className="text-[11px] text-red-600 font-semibold mt-1">
                              Must start with 6, 7, 8, or 9
                            </p>
                          )}
                          {phone.length === 10 && isPhoneValid && (
                            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Valid 10-digit number
                            </p>
                          )}
                        </div>
                      )}

                      {/* State Selection Dropdown */}
                      {!isFieldHidden('state') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                            State{isFieldRequired('state') ? ' *' : ''}
                          </label>
                          <div className="relative group">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                            <select
                              required={isFieldRequired('state')}
                              value={state}
                              onChange={(e) => { setState(e.target.value); markTouched('state'); }}
                              className={`w-full pl-10 pr-8 py-2.5 sm:py-3 rounded-xl border text-sm font-medium bg-slate-50/70 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 transition-all appearance-none ${
                                state
                                  ? 'border-emerald-300 text-slate-900'
                                  : 'border-slate-200 text-slate-500 focus:border-primary focus:ring-primary/15'
                              }`}
                            >
                              <option value="" disabled className="text-slate-400">Select your state</option>
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st} className="text-slate-800">
                                  {st}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                              ▼
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Date of Birth */}
                      {!isFieldHidden('dob') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                            Date of Birth{isFieldRequired('dob') ? ' *' : ''}
                          </label>
                          <div className="relative group">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                              type="date"
                              required={isFieldRequired('dob')}
                              max={new Date().toISOString().split('T')[0]}
                              value={dob}
                              onChange={(e) => { setDob(e.target.value); markTouched('dob'); }}
                              className={`w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl border text-sm font-medium bg-slate-50/70 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                                dob ? 'border-emerald-300' : 'border-slate-200 focus:border-primary focus:ring-primary/15'
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Referral Code */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                          Referral Code (Optional)
                        </label>
                        <div className="relative group">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold text-sm group-focus-within:text-primary transition-colors">%</span>
                          <input
                            type="text"
                            placeholder="PROMO2026"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                            className={`w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border text-sm font-bold uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                              referrerName
                                ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800 focus:ring-emerald-400/20'
                                : referralInvalid
                                ? 'border-red-300 bg-red-50/60 text-red-800 focus:ring-red-400/20'
                                : 'border-slate-200 bg-slate-50/70 text-slate-900 focus:border-primary focus:ring-primary/15'
                            }`}
                          />
                          {referralChecking && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex">
                              <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            </span>
                          )}
                          {!referralChecking && referrerName && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          )}
                          {!referralChecking && referralInvalid && (
                            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {!referralChecking && referrerName && (
                          <p className="mt-1.5 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5 shrink-0" /> Referred by <strong>{referrerName}</strong>
                          </p>
                        )}
                        {!referralChecking && referralInvalid && (
                          <p className="mt-1.5 text-xs font-semibold text-red-500">
                            No account found with this referral code
                          </p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-primary font-black text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" /> Password Security
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      
                      {/* Password Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                          Password *
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => markTouched('password')}
                            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative group">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => markTouched('confirmPassword')}
                            className={`w-full pl-10 pr-14 py-2.5 sm:py-3 rounded-xl border text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                              confirmPassword && isPasswordMatching
                                ? 'border-emerald-300 bg-emerald-50/50 focus:ring-emerald-400/20'
                                : confirmPassword && !isPasswordMatching
                                ? 'border-red-300 bg-red-50/50 focus:ring-red-400/20'
                                : 'border-slate-200 bg-slate-50/70 text-slate-900 focus:border-primary focus:ring-primary/15'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {confirmPassword && isPasswordMatching && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          )}
                          {confirmPassword && !isPasswordMatching && (
                            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {confirmPassword && !isPasswordMatching && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">Passwords do not match</p>
                        )}
                      </div>

                    </div>

                    {/* Password Strength Checklist */}
                    {password && (
                      <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-slate-700">Password Strength:</span>
                          <span className={
                            pwdScore <= 2 ? 'text-red-500' : pwdScore <= 4 ? 'text-orange-500' : 'text-emerald-600'
                          }>
                            {pwdScore <= 2 ? 'Weak' : pwdScore <= 4 ? 'Medium' : 'Strong'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              pwdScore <= 2 ? 'bg-red-500' : pwdScore <= 4 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(pwdScore / 5) * 100}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-1 sm:gap-1.5 pt-1">
                          <div className={`text-[11px] flex items-center gap-1 font-medium ${pwdCriteria.length ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {pwdCriteria.length ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : '•'} Min 8 characters
                          </div>
                          <div className={`text-[11px] flex items-center gap-1 font-medium ${pwdCriteria.hasUpper && pwdCriteria.hasLower ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {pwdCriteria.hasUpper && pwdCriteria.hasLower ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : '•'} Upper & Lowercase
                          </div>
                          <div className={`text-[11px] flex items-center gap-1 font-medium ${pwdCriteria.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {pwdCriteria.hasNumber ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : '•'} At least 1 number
                          </div>
                          <div className={`text-[11px] flex items-center gap-1 font-medium ${pwdCriteria.hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {pwdCriteria.hasSpecial ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : '•'} Special symbol (!@#$)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <label className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none hover:bg-slate-100/70 transition">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/40 accent-primary cursor-pointer shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-bold">Terms &amp; Conditions</a> and understand the privacy policy.
                    </span>
                  </label>

                  {/* Form Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="order-2 sm:order-1 flex-1 py-3 sm:py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-xs sm:text-sm"
                    >
                      Back to Step 1
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !terms}
                      className="order-1 sm:order-2 group relative flex-1 py-3 sm:py-3.5 bg-gradient-to-r from-primary via-primary to-indigo-700 hover:from-primary-dark hover:to-indigo-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 overflow-hidden text-xs sm:text-sm uppercase tracking-wider"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-500 font-medium pt-1">
                    Already registered? <Link to="/login" className="text-primary font-bold hover:underline">Sign in to your account</Link>
                  </p>

                </form>

              </div>
            </div>

          </div>
        )}

      </div>
    </>
  );
}
