import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Check, UserCircle, ShieldCheck, Link2, FileText, Info, Copy, Sparkles, PenLine, Calendar, Crown, Award, Camera, Loader2, Cake, Users2, Briefcase, MapPin, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../../utils/api';
import Reveal from '../../components/Reveal';

const MAX_PHOTO_MB = 5;

const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  { value: 'housewife', label: 'Housewife' },
  { value: 'student', label: 'Student' },
  { value: 'job_person', label: 'Job Person' },
  { value: 'business_owner', label: 'Business Owner' },
];

function CompletionRing({ percent }) {
  const size = 76;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#completionGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black text-white leading-none">{percent}%</span>
        <span className="text-[7px] font-bold text-white/60 uppercase tracking-wider mt-0.5">Done</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, checkAuthStatus } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [about, setAbout] = useState(user?.about || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [category, setCategory] = useState(user?.category || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const isMentor = user?.role === 'manager';

  const isDirty = name !== (user?.name || '') || phone !== (user?.phone || '') ||
    bio !== (user?.bio || '') || about !== (user?.about || '') ||
    String(age) !== String(user?.age || '') || gender !== (user?.gender || '') ||
    category !== (user?.category || '') || address !== (user?.address || '');

  const completion = useMemo(() => {
    const fields = [user?.name, user?.phone, user?.bio, user?.about, user?.profile_image_url, user?.age, user?.gender, user?.category, user?.address];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setMsg({ type: 'error', text: `Image must be under ${MAX_PHOTO_MB}MB.` });
      return;
    }

    setMsg({ type: '', text: '' });
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.post('/student/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setMsg({ type: 'success', text: 'Profile photo updated!' });
        await checkAuthStatus();
      } else {
        setMsg({ type: 'error', text: response.data.message || 'Photo upload failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error uploading photo.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await api.put('/student/profile', { name, phone, bio, about, age: age || null, gender, category, address });
      if (response.data.success) {
        setMsg({ type: 'success', text: 'Profile details updated successfully!' });
        await checkAuthStatus();
      } else {
        setMsg({ type: 'error', text: response.data.message || 'Update failed.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error saving profile details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      const response = await api.put('/student/profile/password', { current_password: currentPassword, new_password: newPassword });
      if (response.data.success) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMsg({ type: 'error', text: response.data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Error changing password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCopyReferral = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="w-full space-y-4 sm:space-y-6 text-slate-800 animate-fade-in-up pb-10">
      {/* Ambient background blobs */}
      <div className="fixed top-24 right-[8%] w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-[6%] w-72 h-72 bg-indigo-300/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

        {/* LEFT: PREMIUM IDENTITY CARD */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <Reveal variant="scale-in">
            <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-[0_25px_60px_-20px_rgba(11,20,40,0.55)] hover:shadow-[0_30px_70px_-15px_rgba(37,99,235,0.4)] transition-shadow duration-500"
              style={{ background: 'linear-gradient(135deg, #0f1f4d 0%, #1e3a8a 45%, #2563eb 100%)' }}>
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
              <div className="absolute -top-16 -right-10 w-64 h-64 bg-blue-400/25 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
              <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-indigo-400/15 rounded-full blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2.5s' }}></div>
              <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative shrink-0 mb-5 group/avatar">
                  {/* Spinning premium aura ring */}
                  <div
                    className="absolute -inset-3 rounded-full opacity-90 blur-[3px] animate-[spin_6s_linear_infinite]"
                    style={{ background: 'conic-gradient(from 0deg, #fcd34d, #60a5fa, #a78bfa, #fcd34d)' }}
                  ></div>
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-300 via-blue-300 to-indigo-300 opacity-70 blur-[4px] animate-pulse"></div>
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[3px] border-white/60 overflow-hidden bg-white/10 flex items-center justify-center shadow-2xl">
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-black text-white">{initials || <UserCircle className="w-14 h-14" />}</span>
                    )}
                    {/* Hover-to-change overlay (desktop) */}
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute inset-0 rounded-full bg-black/0 group-hover/avatar:bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-200"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                      ) : (
                        <Camera className="w-7 h-7 text-white" />
                      )}
                    </button>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  {/* Always-visible change-photo button (works on touch too) */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    title="Change profile photo"
                    className="absolute bottom-1 -left-1 w-10 h-10 rounded-full bg-white text-blue-700 border-2 border-[#0f1f4d] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {isMentor && (
                    <span className="absolute bottom-1 -right-1 w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-[#0f1f4d] flex items-center justify-center shadow-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black truncate max-w-full">{user?.name}</h1>
                <p className="text-slate-300 text-xs truncate max-w-full mt-0.5">{user?.email}</p>

                <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" /> {user?.role}
                  </span>
                  {user?.created_at && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <Calendar className="w-3 h-3 text-amber-300" /> Since {user.created_at}
                    </span>
                  )}
                </div>

                {user?.referral_code && (
                  <button
                    onClick={handleCopyReferral}
                    className="group/ref relative overflow-hidden mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs font-black uppercase tracking-wider font-mono hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5 transition-all shadow-md active:scale-[0.98]"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover/ref:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300 relative" /> : <Link2 className="w-3.5 h-3.5 relative" />}
                    <span className="relative">{user.referral_code}</span>
                    {!copied && <Copy className="w-3 h-3 opacity-60 group-hover/ref:opacity-100 transition-opacity relative" />}
                  </button>
                )}

                <div className="w-full h-px bg-white/10 my-5"></div>

                <div className="w-full flex items-center gap-4">
                  <CompletionRing percent={completion} />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-300" /> Profile Strength
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {completion === 100 ? 'Your profile is fully complete!' : 'Fill in every field to reach 100%.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* RIGHT: EDIT FORM */}
        <div className="lg:col-span-2">
          <Reveal variant="fade-up" delay={100}>
            <div className="relative rounded-2xl sm:rounded-[2.5rem] p-[1.5px] bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-transparent shadow-[0_20px_50px_-20px_rgba(37,99,235,0.25)]">
              <div className="bg-white rounded-[calc(1rem-1.5px)] sm:rounded-[calc(2.5rem-1.5px)] p-5 sm:p-8">

                <div className="flex items-center gap-2.5 mb-6">
                  <div className="relative w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-xl bg-blue-400/30 blur-md animate-pulse"></span>
                    <PenLine className="relative w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black leading-tight">{isMentor ? 'Mentor Profile' : 'Profile Settings'}</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Keep your details fresh — this is what your network sees.</p>
                  </div>
                </div>

                {msg.text && (
                  <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 animate-scale-in ${
                    msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {msg.type === 'success' && <Check className="w-4 h-4 animate-pop-in" />}
                    {msg.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email (non-editable)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age</label>
                      <div className="relative">
                        <Cake className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                        <input
                          type="number"
                          min="10"
                          max="100"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 24"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gender</label>
                      <div className="relative">
                        <Users2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none z-10" />
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow appearance-none"
                        >
                          {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none z-10" />
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow appearance-none"
                        >
                          {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-350 pointer-events-none" />
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House no., street, city, state, PIN code"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Bio</label>
                      <span className="text-[10px] font-bold text-slate-300">{bio.length}/80</span>
                    </div>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-350 pointer-events-none" />
                      <input
                        type="text"
                        maxLength={80}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A short tagline about you"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">About</label>
                      <span className="text-[10px] font-bold text-slate-300">{about.length}/500</span>
                    </div>
                    <div className="relative">
                      <Info className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-350 pointer-events-none" />
                      <textarea
                        rows={4}
                        maxLength={500}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder="Tell others more about yourself and what you do."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !isDirty}
                      className="group relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md active:scale-[0.98]"
                    >
                      {!loading && isDirty && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                      <span className="relative flex items-center justify-center gap-2">
                        {loading && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? 'Saving Changes...' : isDirty ? 'Save Settings' : 'No Changes to Save'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Reveal>

          {/* CHANGE PASSWORD */}
          <Reveal variant="fade-up" delay={150}>
            <div className="relative rounded-2xl sm:rounded-[2.5rem] p-[1.5px] bg-gradient-to-br from-blue-400/40 via-indigo-300/20 to-transparent shadow-[0_20px_50px_-20px_rgba(37,99,235,0.25)] mt-4 sm:mt-6">
              <div className="bg-white rounded-[calc(1rem-1.5px)] sm:rounded-[calc(2.5rem-1.5px)] p-5 sm:p-8">

                <div className="flex items-center gap-2.5 mb-6">
                  <div className="relative w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="absolute inset-0 rounded-xl bg-blue-400/30 blur-md animate-pulse"></span>
                    <KeyRound className="relative w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black leading-tight">Change Password</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Update your login password.</p>
                  </div>
                </div>

                {pwMsg.text && (
                  <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 animate-scale-in ${
                    pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {pwMsg.type === 'success' && <Check className="w-4 h-4 animate-pop-in" />}
                    {pwMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-350 pointer-events-none" />
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPasswords ? 'Hide passwords' : 'Show passwords'}
                  </button>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                      className="group relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md active:scale-[0.98]"
                    >
                      {!pwLoading && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                      <span className="relative flex items-center justify-center gap-2">
                        {pwLoading && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
                        {pwLoading ? 'Updating...' : 'Update Password'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}
