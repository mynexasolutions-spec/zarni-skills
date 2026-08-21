import React, { useEffect, useState } from 'react';
import { Rocket, CheckCircle2, Plus, Trash2, Video, ListChecks, Gift, BarChart3, MessageSquareQuote, HelpCircle, Link2, Upload, Image, Type, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[2.2rem] p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up space-y-5">
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
          {desc && <p className="text-xs text-slate-400 font-semibold mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
      />
    </div>
  );
}

function AddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wide hover:bg-red-100 transition-colors"
    >
      <Plus className="w-3.5 h-3.5" /> Add
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

function StringListEditor({ label, items, onChange, placeholder }) {
  const list = items || [];
  const update = (i, val) => { const next = [...list]; next[i] = val; onChange(next); };
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const add = () => onChange([...list, '']);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{label}</label>
        <AddButton onClick={add} />
      </div>
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
            <RemoveButton onClick={() => remove(i)} />
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-slate-400 font-semibold pl-1">No items yet.</p>}
      </div>
    </div>
  );
}

function ObjectListEditor({ label, items, onChange, fields, emptyItem }) {
  const list = items || [];
  const update = (i, key, val) => onChange(list.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const add = () => onChange([...list, { ...emptyItem }]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{label}</label>
        <AddButton onClick={add} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((item, i) => (
          <div key={i} className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3 relative group">
            <div className="absolute top-3 right-3 z-10">
              <RemoveButton onClick={() => remove(i)} />
            </div>
            <div className="space-y-2.5 pt-4">
              {fields.map((f) =>
                f.type === 'textarea' ? (
                  <div key={f.key} className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.placeholder || f.key}</span>
                    <textarea
                      rows={2}
                      value={item[f.key] || ''}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow placeholder:text-slate-400"
                    />
                  </div>
                ) : (
                  <div key={f.key} className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.placeholder || f.key}</span>
                    <input
                      type={f.type || 'text'}
                      value={item[f.key] || ''}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow placeholder:text-slate-400"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="text-xs text-slate-400 font-semibold pl-1">No items yet.</p>}
    </div>
  );
}

const DEFAULT_CONTENT = {
  badge_text: '', hero_title: '', hero_subtitle: '',
  date: '', time: '', mode: '', price: '', original_price: '', language: '',
  video_url: '', video_filename: '', show_video: true,
  offer_ends_at: '', total_seats: '', seats_filled: '',
  hero_image: '', summary_image: '', achievement_image: '',
  includes: [], learn_items: [], why_register: [], bonuses: [], stats: [], testimonials: [], faq: [],
  feature_chips: [], achieve_items: [],
  founder_name: '', founder_title: '', founder_quote: '',
  support_phone: '', support_email: '', website_url: '', mission_text: '',
  whatsapp_group_link: '', whatsapp_support_link: '', meeting_link: '',
  preparation_video_link: '', welcome_pdf_link: '',
  social_links: { youtube: '', instagram: '', telegram: '', facebook: '' },

  brand_name: '', logo_image: '', header_badges: [], hero_checks: [],
  cta_button_text: '', secure_note_hero: '', secure_note_offer: '',
  offer_header_text: '', countdown_label: '', seats_cta_text: '', fee_label: '',
  limited_seats_label: '', seats_left_text: '', seats_filled_text: '', price_only_suffix: '',
  placeholder_full_name: '', placeholder_phone: '', placeholder_email: '', placeholder_city: '',
  placeholder_age: '', placeholder_occupation: '', placeholder_experience: '',
  processing_text: '', invalid_link_title: '', invalid_link_text: '',
  video_heading: '', video_subheading: '', details_heading: '', seats_heading: '',
  live_registrations_label: '', live_registrations: [], live_registrations_badge: '',
  skills_heading: '', achieve_heading: '', bonuses_heading: '', bonuses_subheading: '',
  testimonials_heading: '', faq_heading: '',
  final_cta_title: '', final_cta_subtitle: '', final_cta_note: '',
  landing_trust_items: [], payment_brands: [],

  form_title: '', form_subtitle: '',
  step1_heading: '', step1_subheading: '', step2_heading: '', step2_subheading: '',
  step3_heading: '', step3_subheading: '',
  order_item_title: '', gst_label: '', gst_amount: '', total_label: '', tax_note: '',
  submit_button_text: '', form_secure_note: '', payment_secure_note: '',
  label_full_name: '', label_phone: '', label_email: '', label_age: '',
  label_occupation: '', label_city: '', label_experience: '', label_goal: '',
  country_code: '',
  age_options: [], occupation_options: [], experience_options: [], goal_options: [],
  payment_options: [], form_trust_items: [],
  why_join_heading: '', privacy_heading: '', privacy_text: '', privacy_badges: [],

  success_title: '', success_subtitle: '', success_message: '',
  registration_id_label: '', success_panel_heading: '',
  label_masterclass_date: '', label_time: '', label_mode: '', label_language: '',
  email_sent_text: '', whatsapp_sent_text: '', next_steps_heading: '', next_steps: [],
  community_panel_heading: '', community_panel_text: '', community_card_title: '',
  community_card_subtitle: '', community_card_cta: '',
  support_panel_heading: '', support_panel_text: '', support_card_title: '',
  support_card_subtitle: '', support_card_cta: '',
  success_banner_title: '', success_banner_subtitle: '', success_trust_items: [],

  footer_links_heading: '', footer_contact_heading: '', footer_social_heading: '',
  footer_links: [], whatsapp_support_label: '', copyright_text: '',
};

export default function AdminMasterclassFunnel() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [imageUploading, setImageUploading] = useState('');
  const [imageError, setImageError] = useState('');
  const [activeTab, setActiveTab] = useState('hero');

  const TABS = [
    { key: 'hero', label: 'Hero & Branding', Icon: Video },
    { key: 'landing', label: 'Landing Content', Icon: ListChecks },
    { key: 'form', label: 'Registration Form', Icon: Type },
    { key: 'success', label: 'Success Page', Icon: CheckCircle2 },
    { key: 'footer', label: 'Footer & Contact', Icon: Link2 },
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/admin/masterclass-funnel');
        setContent({ ...DEFAULT_CONTENT, ...response.data.content });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const set = (key) => (e) => setContent(prev => ({ ...prev, [key]: e.target.value }));
  const setChecked = (key) => (e) => setContent(prev => ({ ...prev, [key]: e.target.checked }));
  const setList = (key) => (val) => setContent(prev => ({ ...prev, [key]: val }));
  const setSocial = (key) => (e) => setContent(prev => ({
    ...prev, social_links: { ...(prev.social_links || {}), [key]: e.target.value },
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const response = await api.post('/admin/masterclass-funnel', content);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoError('');
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setVideoUploading(true);
    setVideoError('');
    try {
      const fd = new FormData();
      fd.append('video_file', videoFile);
      const response = await api.post('/admin/masterclass-funnel/video', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setContent(prev => ({ ...prev, video_filename: response.data.video_filename }));
        setVideoFile(null);
        setVideoPreview(null);
      } else {
        setVideoError(response.data.message || 'Failed to upload video.');
      }
    } catch (err) {
      setVideoError(err.response?.data?.message || 'Failed to upload video.');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    setImageUploading(field);
    setImageError('');
    try {
      const fd = new FormData();
      fd.append('image_file', file);
      fd.append('field', field);
      const response = await api.post('/admin/masterclass-funnel/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setContent(prev => ({ ...prev, [field]: response.data.url }));
      } else {
        setImageError(response.data.message || 'Failed to upload image.');
      }
    } catch (err) {
      setImageError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setImageUploading('');
    }
  };

  const ImageField = ({ label, field, hint }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">{label}</label>
      {content[field] && (
        <img src={content[field]} alt="" className="h-24 w-auto rounded-xl border border-slate-200 object-contain bg-slate-50 mb-2" />
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
          <Upload className="w-4 h-4 shrink-0" />
          {imageUploading === field ? 'Uploading...' : content[field] ? 'Replace Image' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleImageUpload(field, e.target.files?.[0])} />
        </label>
        {content[field] && (
          <button type="button" onClick={() => setContent(prev => ({ ...prev, [field]: '' }))}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            Remove
          </button>
        )}
      </div>
      <input
        value={content[field] || ''}
        onChange={set(field)}
        placeholder="…or paste an image URL / path"
        className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
      />
      {hint && <p className="text-[11px] text-slate-400 font-semibold mt-1">{hint}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-red-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Funnel Configurations...</p>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-800 space-y-6 pb-12 animate-fade-in-up">
      <div className="relative rounded-[1.75rem] overflow-hidden mb-6 px-6 py-6 sm:px-8 sm:py-7"
        style={{ background: 'linear-gradient(115deg, #1c0b14 0%, #7f1d1d 35%, #dc2626 65%, #7f1d1d 100%)', boxShadow: '0 20px 45px -18px rgba(190,18,60,0.45)' }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="relative flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm text-white flex items-center justify-center shadow-inner shrink-0">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Masterclass Funnel</h2>
            <p className="text-xs text-white/70 mt-0.5">Every block on the student's affiliate-activation funnel — landing page, form, payment, and success screen.</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 animate-pop-in" /> Funnel content saved successfully.
        </div>
      )}

      {/* Tab navigation — keeps only one group of sections on screen at a time */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-2 mb-6 bg-slate-50/90 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-red-200 hover:text-red-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {activeTab === 'hero' && (<>
        <Section icon={Video} title="Hero & Video" desc="The top of the landing page — badge, headline, video, and session details.">
          <Field label="Badge Text" value={content.badge_text} onChange={set('badge_text')} placeholder="LIVE MASTERCLASS" />
          <Field label="Hero Title" value={content.hero_title} onChange={set('hero_title')} placeholder="ONLINE EARNING & ONLINE BUSINESS" />
          <Field label="Hero Subtitle" value={content.hero_subtitle} onChange={set('hero_subtitle')} placeholder="सीखें घर बैठे Online Income बनाने के 5 Powerful तरीके" />
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Hero Description</label>
            <textarea
              rows={3}
              value={content.hero_description || ''}
              onChange={set('hero_description')}
              placeholder="इस Live Masterclass में हम आपको बताएंगे कि कैसे..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>

          <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={content.show_video !== false}
              onChange={setChecked('show_video')}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-400"
            />
            <span className="text-sm font-bold text-slate-700">Show video on the registration page</span>
            <span className="text-[11px] text-slate-400 ml-auto">Turn off to hide the video block without deleting the upload</span>
          </label>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Hero Video (uploaded file)</label>
            {videoError && <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-bold mb-2">{videoError}</div>}
            {(videoPreview || content.video_filename) && (
              <video src={videoPreview || content.video_filename} controls className="w-full max-h-56 rounded-xl bg-black mb-3" />
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                <Upload className="w-4 h-4 shrink-0" />
                {content.video_filename ? 'Replace Video' : 'Choose Video'}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              </label>
              {videoFile && (
                <button
                  type="button"
                  onClick={handleVideoUpload}
                  disabled={videoUploading}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide disabled:opacity-60 shadow-sm hover:shadow-md transition-all"
                >
                  {videoUploading ? 'Uploading...' : `Upload "${videoFile.name}"`}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Uploads immediately and takes priority over the Video URL below on the landing page. MP4 works best.</p>
          </div>

          <Field label="Video URL (fallback if no file uploaded)" value={content.video_url} onChange={set('video_url')} placeholder="https://youtube.com/watch?v=..." />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field label="Date" type="date" value={content.date} onChange={set('date')} />
            <Field label="Time" value={content.time} onChange={set('time')} placeholder="6:00 PM" />
            <Field label="Mode" value={content.mode} onChange={set('mode')} placeholder="Online (Zoom Live)" />
            <Field label="Language" value={content.language} onChange={set('language')} placeholder="Hindi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Registration Price (₹)" type="number" value={content.price} onChange={set('price')} placeholder="99" />
            <Field label="Original Price (strikethrough)" type="number" value={content.original_price} onChange={set('original_price')} placeholder="499" />
          </div>
        </Section>

        <Section icon={Image} title="Page Images" desc="Upload the images shown across the registration pages. Leave one empty to hide it.">
          {imageError && <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-bold">{imageError}</div>}
          <ImageField label="Logo" field="logo_image" hint="Shown in the page header and footer." />
          <ImageField label="Hero Image" field="hero_image" hint="Beside the headline on the landing page." />
          <ImageField label="Order Summary / Success Image" field="summary_image" hint="Inside the dark order-summary card and the success panel." />
          <ImageField label="Achievement Image" field="achievement_image" hint="Beside the 'What You Will Achieve' list." />
        </Section>

        <Section icon={Type} title="Branding & Header" desc="Brand name, the header badge chips, and the hero checkmarks.">
          <Field label="Brand Name" value={content.brand_name} onChange={set('brand_name')} placeholder="Zarni Skills" />
          <StringListEditor label="Header Badges" items={content.header_badges} onChange={setList('header_badges')} placeholder="LIVE MASTERCLASS" />
          <StringListEditor label="Hero Checkmarks" items={content.hero_checks} onChange={setList('hero_checks')} placeholder="Practical Training" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CTA Button Text" value={content.cta_button_text} onChange={set('cta_button_text')} placeholder="Register Now" />
            <Field label="Hero Secure Note" value={content.secure_note_hero} onChange={set('secure_note_hero')} placeholder="Secure Payment | Instant Access" />
            <Field label="Offer Card Secure Note" value={content.secure_note_offer} onChange={set('secure_note_offer')} placeholder="Secure Payment | Your Data is Safe" />
          </div>
        </Section>

        <Section icon={BarChart3} title="Urgency & Seats" desc="Powers the countdown timer, offer card, and seats-remaining bar.">
          <Field label="Offer Ends At" type="datetime-local" value={content.offer_ends_at} onChange={set('offer_ends_at')} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Seats" type="number" value={content.total_seats} onChange={set('total_seats')} placeholder="100" />
            <Field label="Seats Filled" type="number" value={content.seats_filled} onChange={set('seats_filled')} placeholder="87" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Offer Card Header" value={content.offer_header_text} onChange={set('offer_header_text')} placeholder="Limited Time Offer" />
            <Field label="Countdown Label" value={content.countdown_label} onChange={set('countdown_label')} placeholder="Offer Ends In" />
            <Field label="Seats CTA Text" value={content.seats_cta_text} onChange={set('seats_cta_text')} placeholder="Limited Seats – Act Now!" />
            <Field label="Fee Label" value={content.fee_label} onChange={set('fee_label')} placeholder="Registration Fee" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Limited Seats Label" value={content.limited_seats_label} onChange={set('limited_seats_label')} placeholder="Limited Seats" />
            <Field label="Price 'Only' Suffix" value={content.price_only_suffix} onChange={set('price_only_suffix')} placeholder="Only" />
            <Field label="Seats Left Text — use {left}" value={content.seats_left_text} onChange={set('seats_left_text')} placeholder="Only {left} Seats Left!" />
            <Field label="Seats Filled Text — use {filled} / {total}" value={content.seats_filled_text} onChange={set('seats_filled_text')} placeholder="{filled} / {total} Seats Filled" />
          </div>
          <StringListEditor label="Live Registrations Ticker" items={content.live_registrations} onChange={setList('live_registrations')} placeholder="Rahul from Jaipur" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ticker Heading" value={content.live_registrations_label} onChange={set('live_registrations_label')} placeholder="Live Registrations" />
            <Field label="Ticker Badge" value={content.live_registrations_badge} onChange={set('live_registrations_badge')} placeholder="Just Registered" />
          </div>
        </Section>
        </>)}

        {activeTab === 'landing' && (<>
        <Section icon={Type} title="Landing Section Headings" desc="Every heading on the landing page. Clear one to hide that heading.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Video Heading" value={content.video_heading} onChange={set('video_heading')} placeholder="Watch This 60-Second Intro" />
            <Field label="Video Subheading" value={content.video_subheading} onChange={set('video_subheading')} placeholder="– Before You Register –" />
            <Field label="Details Heading" value={content.details_heading} onChange={set('details_heading')} placeholder="Masterclass Details" />
            <Field label="Seats Heading" value={content.seats_heading} onChange={set('seats_heading')} placeholder="Seats Availability" />
            <Field label="Skills Heading" value={content.skills_heading} onChange={set('skills_heading')} placeholder="Skills You Will Master" />
            <Field label="Achieve Heading" value={content.achieve_heading} onChange={set('achieve_heading')} placeholder="What You Will Achieve" />
            <Field label="Bonuses Heading" value={content.bonuses_heading} onChange={set('bonuses_heading')} placeholder="Exclusive Bonuses" />
            <Field label="Bonuses Subheading" value={content.bonuses_subheading} onChange={set('bonuses_subheading')} placeholder="(For Registered Students)" />
            <Field label="Testimonials Heading" value={content.testimonials_heading} onChange={set('testimonials_heading')} placeholder="Success Stories" />
            <Field label="FAQ Heading" value={content.faq_heading} onChange={set('faq_heading')} placeholder="Frequently Asked Questions" />
          </div>
        </Section>

        <Section icon={Rocket} title="Bottom CTA & Trust Bar" desc="The final call-to-action band and the trust/payment strip below it.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CTA Title" value={content.final_cta_title} onChange={set('final_cta_title')} placeholder="Don't Miss This Opportunity!" />
            <Field label="CTA Subtitle" value={content.final_cta_subtitle} onChange={set('final_cta_subtitle')} placeholder="Start Your Online Income Journey Today." />
            <Field label="CTA Note" value={content.final_cta_note} onChange={set('final_cta_note')} placeholder="Limited Seats – Register Now!" />
          </div>
          <StringListEditor label="Trust Items" items={content.landing_trust_items} onChange={setList('landing_trust_items')} placeholder="100% Secure Payment" />
          <StringListEditor label="Payment Brands" items={content.payment_brands} onChange={setList('payment_brands')} placeholder="Razorpay" />
        </Section>

        <Section icon={ListChecks} title="Feature Chips & Achievements" desc="The 4 chips on the form page, and the 'What You Will Achieve' checklist.">
          <StringListEditor label="Feature Chips" items={content.feature_chips} onChange={setList('feature_chips')} placeholder="Live Interactive Session" />
          <StringListEditor label="What You Will Achieve" items={content.achieve_items} onChange={setList('achieve_items')} placeholder="Achieve financial freedom" />
        </Section>

        <Section icon={ListChecks} title="What's Included" desc="Shown on the landing page and the payment summary.">
          <StringListEditor label="Includes" items={content.includes} onChange={setList('includes')} placeholder="Live Q&A Session" />
        </Section>

        <Section icon={ListChecks} title="What You'll Learn" desc="Grid of learning outcomes on the landing page.">
          <ObjectListEditor
            label="Learning Items"
            items={content.learn_items}
            onChange={setList('learn_items')}
            fields={[{ key: 'title', placeholder: 'Title' }, { key: 'desc', placeholder: 'Description', type: 'textarea' }]}
            emptyItem={{ title: '', desc: '' }}
          />
        </Section>

        <Section icon={Gift} title="Why Register & Bonuses" desc="Two supporting lists on the landing page.">
          <StringListEditor label="Why Register" items={content.why_register} onChange={setList('why_register')} placeholder="Limited Seats — First Come First Serve" />
          <StringListEditor label="Bonuses" items={content.bonuses} onChange={setList('bonuses')} placeholder="Free PDF Guide" />
        </Section>

        <Section icon={BarChart3} title="Stats" desc="Small proof-point tiles (e.g. Happy Learners, Success Stories).">
          <ObjectListEditor
            label="Stats"
            items={content.stats}
            onChange={setList('stats')}
            fields={[{ key: 'value', placeholder: '5000+' }, { key: 'label', placeholder: 'Happy Learners' }]}
            emptyItem={{ value: '', label: '' }}
          />
        </Section>

        <Section icon={MessageSquareQuote} title="Testimonials">
          <ObjectListEditor
            label="Testimonials"
            items={content.testimonials}
            onChange={setList('testimonials')}
            fields={[
              { key: 'name', placeholder: 'Student name' },
              { key: 'text', placeholder: 'Testimonial text', type: 'textarea' },
              { key: 'rating', placeholder: 'Rating (1-5)', type: 'number' },
            ]}
            emptyItem={{ name: '', text: '', rating: 5 }}
          />
        </Section>

        <Section icon={HelpCircle} title="FAQ">
          <ObjectListEditor
            label="FAQ"
            items={content.faq}
            onChange={setList('faq')}
            fields={[{ key: 'q', placeholder: 'Question' }, { key: 'a', placeholder: 'Answer', type: 'textarea' }]}
            emptyItem={{ q: '', a: '' }}
          />
        </Section>
        </>)}

        {activeTab === 'form' && (<>
        <Section icon={Type} title="Form Page — Headings & Labels" desc="Every heading, field label, and note on the registration form page.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Page Title" value={content.form_title} onChange={set('form_title')} placeholder="You're Just One Step Away!" />
            <Field label="Page Subtitle" value={content.form_subtitle} onChange={set('form_subtitle')} placeholder="Reserve Your Seat in the Live Masterclass" />
            <Field label="Step 1 Heading" value={content.step1_heading} onChange={set('step1_heading')} placeholder="Your Details" />
            <Field label="Step 1 Subheading" value={content.step1_subheading} onChange={set('step1_subheading')} placeholder="Fill in your information to get started" />
            <Field label="Step 2 Heading" value={content.step2_heading} onChange={set('step2_heading')} placeholder="Order Summary" />
            <Field label="Step 2 Subheading" value={content.step2_subheading} onChange={set('step2_subheading')} placeholder="Review your order details" />
            <Field label="Step 3 Heading" value={content.step3_heading} onChange={set('step3_heading')} placeholder="Choose Payment Option" />
            <Field label="Step 3 Subheading" value={content.step3_subheading} onChange={set('step3_subheading')} placeholder="Select your preferred payment method" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name Label" value={content.label_full_name} onChange={set('label_full_name')} placeholder="Full Name" />
            <Field label="Phone Label" value={content.label_phone} onChange={set('label_phone')} placeholder="Mobile Number (WhatsApp)" />
            <Field label="Email Label" value={content.label_email} onChange={set('label_email')} placeholder="Email Address" />
            <Field label="Age Label" value={content.label_age} onChange={set('label_age')} placeholder="Age" />
            <Field label="Occupation Label" value={content.label_occupation} onChange={set('label_occupation')} placeholder="Occupation" />
            <Field label="City Label" value={content.label_city} onChange={set('label_city')} placeholder="City & State (Optional)" />
            <Field label="Experience Label" value={content.label_experience} onChange={set('label_experience')} placeholder="Experience Level" />
            <Field label="Goal Label" value={content.label_goal} onChange={set('label_goal')} placeholder="What is your biggest goal?" />
            <Field label="Country Code" value={content.country_code} onChange={set('country_code')} placeholder="+91" />
            <Field label="Submit Button Text" value={content.submit_button_text} onChange={set('submit_button_text')} placeholder="Proceed to Payment" />
          </div>
          <Field label="Form Secure Note" value={content.form_secure_note} onChange={set('form_secure_note')} placeholder="Your information is 100% secure and safe." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name Placeholder" value={content.placeholder_full_name} onChange={set('placeholder_full_name')} placeholder="Enter your full name" />
            <Field label="Phone Placeholder" value={content.placeholder_phone} onChange={set('placeholder_phone')} placeholder="Enter your WhatsApp number" />
            <Field label="Email Placeholder" value={content.placeholder_email} onChange={set('placeholder_email')} placeholder="Enter your email address" />
            <Field label="City Placeholder" value={content.placeholder_city} onChange={set('placeholder_city')} placeholder="Enter your city & state" />
            <Field label="Age Dropdown Placeholder" value={content.placeholder_age} onChange={set('placeholder_age')} placeholder="Select your age" />
            <Field label="Occupation Dropdown Placeholder" value={content.placeholder_occupation} onChange={set('placeholder_occupation')} placeholder="Select occupation" />
            <Field label="Experience Dropdown Placeholder" value={content.placeholder_experience} onChange={set('placeholder_experience')} placeholder="Select your level" />
            <Field label="Processing Text" value={content.processing_text} onChange={set('processing_text')} placeholder="Processing..." />
          </div>
        </Section>

        <Section icon={HelpCircle} title="Invalid Link Message" desc="Shown when someone opens a referral link that doesn't exist.">
          <Field label="Title" value={content.invalid_link_title} onChange={set('invalid_link_title')} placeholder="This link isn't valid" />
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
            <textarea
              rows={2}
              value={content.invalid_link_text || ''}
              onChange={set('invalid_link_text')}
              placeholder="The registration link you followed is invalid or has expired."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>
        </Section>

        <Section icon={ListChecks} title="Form Dropdown Options" desc="The choices a visitor can pick from. Empty a list to hide that field.">
          <StringListEditor label="Age Options" items={content.age_options} onChange={setList('age_options')} placeholder="25 - 34" />
          <StringListEditor label="Occupation Options" items={content.occupation_options} onChange={setList('occupation_options')} placeholder="Student" />
          <StringListEditor label="Experience Options" items={content.experience_options} onChange={setList('experience_options')} placeholder="Complete Beginner" />
          <StringListEditor label="Goal Options" items={content.goal_options} onChange={setList('goal_options')} placeholder="Earn Extra Income" />
        </Section>

        <Section icon={BarChart3} title="Order Summary & Payment Options" desc="The pricing rows and the payment method list on the form page.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Order Item Title" value={content.order_item_title} onChange={set('order_item_title')} placeholder="Live Masterclass Registration" />
            <Field label="Total Label" value={content.total_label} onChange={set('total_label')} placeholder="Total Amount" />
            <Field label="GST Label (clear to hide row)" value={content.gst_label} onChange={set('gst_label')} placeholder="GST (18%)" />
            <Field label="GST Amount (₹)" type="number" value={content.gst_amount} onChange={set('gst_amount')} placeholder="0" />
            <Field label="Tax Note" value={content.tax_note} onChange={set('tax_note')} placeholder="(All taxes included)" />
            <Field label="Payment Secure Note" value={content.payment_secure_note} onChange={set('payment_secure_note')} placeholder="Secure payment powered by Razorpay" />
          </div>
          <ObjectListEditor
            label="Payment Options"
            items={content.payment_options}
            onChange={setList('payment_options')}
            fields={[
              { key: 'label', placeholder: 'UPI' },
              { key: 'desc', placeholder: 'Pay using any UPI app' },
              { key: 'brand', placeholder: 'Brand label shown on the right (e.g. UPI)' },
            ]}
            emptyItem={{ label: '', desc: '', brand: '' }}
          />
        </Section>

        <Section icon={ShieldCheck} title="Form Page — Trust & Privacy Bands" desc="The trust strip, 'Why Thousands Are Joining' band, and privacy band.">
          <ObjectListEditor
            label="Trust Items"
            items={content.form_trust_items}
            onChange={setList('form_trust_items')}
            fields={[{ key: 'title', placeholder: '100% Secure' }, { key: 'desc', placeholder: 'Your data is protected' }]}
            emptyItem={{ title: '', desc: '' }}
          />
          <Field label="Why Join Heading" value={content.why_join_heading} onChange={set('why_join_heading')} placeholder="Why Thousands Are Joining" />
          <Field label="Privacy Heading (clear to hide band)" value={content.privacy_heading} onChange={set('privacy_heading')} placeholder="Your Information is Safe With Us" />
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Privacy Text</label>
            <textarea
              rows={2}
              value={content.privacy_text || ''}
              onChange={set('privacy_text')}
              placeholder="We respect your privacy..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>
          <StringListEditor label="Privacy Badges" items={content.privacy_badges} onChange={setList('privacy_badges')} placeholder="SSL Secure" />
        </Section>
        </>)}

        {activeTab === 'success' && (<>
        <Section icon={CheckCircle2} title="Success Page — Copy" desc="Everything shown after a successful payment.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Success Title" value={content.success_title} onChange={set('success_title')} placeholder="Congratulations!" />
            <Field label="Success Subtitle" value={content.success_subtitle} onChange={set('success_subtitle')} placeholder="Your Registration is Confirmed!" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Success Message</label>
            <textarea
              rows={2}
              value={content.success_message || ''}
              onChange={set('success_message')}
              placeholder="Welcome to the family. Your seat has been reserved."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Registration ID Label" value={content.registration_id_label} onChange={set('registration_id_label')} placeholder="Registration ID" />
            <Field label="Details Panel Heading" value={content.success_panel_heading} onChange={set('success_panel_heading')} placeholder="You're All Set For The Live Masterclass!" />
            <Field label="Email Sent Text" value={content.email_sent_text} onChange={set('email_sent_text')} placeholder="A confirmation email has been sent to" />
            <Field label="WhatsApp Sent Text" value={content.whatsapp_sent_text} onChange={set('whatsapp_sent_text')} placeholder="Event updates will be sent to" />
            <Field label="Next Steps Heading" value={content.next_steps_heading} onChange={set('next_steps_heading')} placeholder="Next Steps" />
            <Field label="Banner Title" value={content.success_banner_title} onChange={set('success_banner_title')} placeholder="You've Taken The First Step..." />
            <Field label="Banner Subtitle" value={content.success_banner_subtitle} onChange={set('success_banner_subtitle')} placeholder="We're excited to help you achieve your goals." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field label="Date Label" value={content.label_masterclass_date} onChange={set('label_masterclass_date')} placeholder="Masterclass Date" />
            <Field label="Time Label" value={content.label_time} onChange={set('label_time')} placeholder="Time" />
            <Field label="Mode Label" value={content.label_mode} onChange={set('label_mode')} placeholder="Mode" />
            <Field label="Language Label" value={content.label_language} onChange={set('label_language')} placeholder="Language" />
          </div>
          <StringListEditor label="Success Trust Items" items={content.success_trust_items} onChange={setList('success_trust_items')} placeholder="100% Secure Payment" />
        </Section>

        <Section icon={ListChecks} title="Next Steps Cards" desc="The numbered cards on the success page. 'Link Key' picks which link the button uses — whatsapp_group_link, preparation_video_link, welcome_pdf_link, email, or calendar. A card is hidden if its link is empty.">
          <ObjectListEditor
            label="Next Steps"
            items={content.next_steps}
            onChange={setList('next_steps')}
            fields={[
              { key: 'title', placeholder: 'Join WhatsApp Community' },
              { key: 'desc', placeholder: 'Description', type: 'textarea' },
              { key: 'cta', placeholder: 'Button text (e.g. Join Community)' },
              { key: 'link_key', placeholder: 'link key (e.g. whatsapp_group_link)' },
            ]}
            emptyItem={{ title: '', desc: '', cta: '', link_key: '' }}
          />
        </Section>

        <Section icon={MessageSquareQuote} title="Community & Support Panels" desc="The two WhatsApp panels on the success page. Each is hidden unless its link is set below.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Community Heading" value={content.community_panel_heading} onChange={set('community_panel_heading')} placeholder="Join Our Community" />
            <Field label="Community Text" value={content.community_panel_text} onChange={set('community_panel_text')} placeholder="Get instant access..." />
            <Field label="Community Card Title" value={content.community_card_title} onChange={set('community_card_title')} placeholder="WhatsApp Community" />
            <Field label="Community Card Subtitle" value={content.community_card_subtitle} onChange={set('community_card_subtitle')} placeholder="Learn, Network & Grow Together" />
            <Field label="Community Button" value={content.community_card_cta} onChange={set('community_card_cta')} placeholder="Join" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Support Heading" value={content.support_panel_heading} onChange={set('support_panel_heading')} placeholder="Your WhatsApp Support" />
            <Field label="Support Text" value={content.support_panel_text} onChange={set('support_panel_text')} placeholder="Need help? Chat directly..." />
            <Field label="Support Card Title" value={content.support_card_title} onChange={set('support_card_title')} placeholder="Chat on WhatsApp" />
            <Field label="Support Card Subtitle" value={content.support_card_subtitle} onChange={set('support_card_subtitle')} placeholder="We're here to help you!" />
            <Field label="Support Button" value={content.support_card_cta} onChange={set('support_card_cta')} placeholder="Chat Now" />
          </div>
        </Section>

        <Section icon={Link2} title="Post-Registration Links" desc="Shown as the 'Next Steps' cards on the success screen. Leave a link blank to hide its card.">
          <Field label="WhatsApp Group Link" value={content.whatsapp_group_link} onChange={set('whatsapp_group_link')} placeholder="https://chat.whatsapp.com/..." />
          <Field label="WhatsApp Support Link" value={content.whatsapp_support_link} onChange={set('whatsapp_support_link')} placeholder="https://wa.me/91..." />
          <Field label="Preparation Video Link" value={content.preparation_video_link} onChange={set('preparation_video_link')} placeholder="https://youtube.com/..." />
          <Field label="Welcome PDF Link" value={content.welcome_pdf_link} onChange={set('welcome_pdf_link')} placeholder="https://.../welcome.pdf" />
          <Field label="Meeting Link" value={content.meeting_link} onChange={set('meeting_link')} placeholder="https://zoom.us/..." />
        </Section>

        <Section icon={MessageSquareQuote} title="Founder Quote" desc="The quote band on the success screen.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Founder Name" value={content.founder_name} onChange={set('founder_name')} placeholder="Suriya Yadav" />
            <Field label="Founder Title" value={content.founder_title} onChange={set('founder_title')} placeholder="Founder, Zarni Skills" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Founder Quote</label>
            <textarea
              rows={2}
              value={content.founder_quote || ''}
              onChange={set('founder_quote')}
              placeholder="The best investment you can make is in yourself."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>
        </Section>
        </>)}

        {activeTab === 'footer' && (<>
        <Section icon={Link2} title="Footer & Contact" desc="Contact details, mission text, and social links in the page footer.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Support Phone" value={content.support_phone} onChange={set('support_phone')} placeholder="+91 12345 67890" />
            <Field label="Support Email" value={content.support_email} onChange={set('support_email')} placeholder="support@zarniskills.com" />
            <Field label="Website" value={content.website_url} onChange={set('website_url')} placeholder="www.zarniskills.com" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Mission Text</label>
            <textarea
              rows={2}
              value={content.mission_text || ''}
              onChange={set('mission_text')}
              placeholder="हमारा Mission है..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="YouTube" value={content.social_links?.youtube} onChange={setSocial('youtube')} placeholder="https://youtube.com/@..." />
            <Field label="Instagram" value={content.social_links?.instagram} onChange={setSocial('instagram')} placeholder="https://instagram.com/..." />
            <Field label="Telegram" value={content.social_links?.telegram} onChange={setSocial('telegram')} placeholder="https://t.me/..." />
            <Field label="Facebook" value={content.social_links?.facebook} onChange={setSocial('facebook')} placeholder="https://facebook.com/..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Links Column Heading" value={content.footer_links_heading} onChange={set('footer_links_heading')} placeholder="Important Links" />
            <Field label="Contact Column Heading" value={content.footer_contact_heading} onChange={set('footer_contact_heading')} placeholder="Contact Us" />
            <Field label="Social Column Heading" value={content.footer_social_heading} onChange={set('footer_social_heading')} placeholder="Follow Us" />
          </div>
          <ObjectListEditor
            label="Footer Links"
            items={content.footer_links}
            onChange={setList('footer_links')}
            fields={[{ key: 'label', placeholder: 'About Us' }, { key: 'url', placeholder: '/about' }]}
            emptyItem={{ label: '', url: '' }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="WhatsApp Support Label" value={content.whatsapp_support_label} onChange={set('whatsapp_support_label')} placeholder="WhatsApp Support" />
            <Field label="Copyright Text (blank = auto)" value={content.copyright_text} onChange={set('copyright_text')} placeholder="© 2026 Zarni Skills. All Rights Reserved." />
          </div>
        </Section>
        </>)}

        <button
          type="submit"
          disabled={saving}
          className="group relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-red-600/25 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 active:scale-[0.98]"
        >
          {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
          <span className="relative">{saving ? 'Saving...' : 'Save Funnel Content'}</span>
        </button>
      </form>
    </div>
  );
}
