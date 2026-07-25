import React, { useEffect, useState } from 'react';
import { Rocket, CheckCircle2, Plus, Trash2, Video, ListChecks, Gift, BarChart3, MessageSquareQuote, HelpCircle, Link2, Upload } from 'lucide-react';
import api from '../../utils/api';

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm transition-shadow hover:shadow-md animate-fade-in-up">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/25">
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {desc && <p className="text-xs text-slate-400 mb-5 ml-12">{desc}</p>}
      <div className="space-y-4 mt-5">{children}</div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow"
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
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
        <AddButton onClick={add} />
      </div>
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            />
            <RemoveButton onClick={() => remove(i)} />
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-slate-400">No items yet.</p>}
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
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
        <AddButton onClick={add} />
      </div>
      <div className="space-y-3">
        {list.map((item, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex justify-end -mt-1 -mr-1">
              <RemoveButton onClick={() => remove(i)} />
            </div>
            {fields.map((f) =>
              f.type === 'textarea' ? (
                <textarea
                  key={f.key}
                  rows={2}
                  value={item[f.key] || ''}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                />
              ) : (
                <input
                  key={f.key}
                  type={f.type || 'text'}
                  value={item[f.key] || ''}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                />
              )
            )}
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-slate-400">No items yet.</p>}
      </div>
    </div>
  );
}

const DEFAULT_CONTENT = {
  badge_text: '', hero_title: '', hero_subtitle: '',
  date: '', time: '', mode: '', price: '',
  video_url: '', video_filename: '',
  includes: [], learn_items: [], why_register: [], bonuses: [], stats: [], testimonials: [], faq: [],
  whatsapp_group_link: '', meeting_link: '',
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
  const setList = (key) => (val) => setContent(prev => ({ ...prev, [key]: val }));

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-slate-800 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
          <Rocket className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Masterclass Funnel</h2>
          <p className="text-xs text-slate-400">Every block on the student's ₹99 affiliate-activation funnel — landing page, form, payment, and success screen.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 animate-pop-in" /> Funnel content saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        <Section icon={Video} title="Hero & Video" desc="The top of the landing page — badge, headline, video, and session details.">
          <Field label="Badge Text" value={content.badge_text} onChange={set('badge_text')} placeholder="LIVE MASTERCLASS" />
          <Field label="Hero Title" value={content.hero_title} onChange={set('hero_title')} placeholder="ONLINE EARNING & ONLINE BUSINESS" />
          <Field label="Hero Subtitle" value={content.hero_subtitle} onChange={set('hero_subtitle')} placeholder="सीखें घर बैठे Online Income बनाने के 5 Powerful तरीके" />
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Hero Description</label>
            <textarea
              rows={3}
              value={content.hero_description || ''}
              onChange={set('hero_description')}
              placeholder="इस Live Masterclass में हम आपको बताएंगे कि कैसे..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow"
            />
          </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date" type="date" value={content.date} onChange={set('date')} />
            <Field label="Time" value={content.time} onChange={set('time')} placeholder="6:00 PM" />
            <Field label="Mode" value={content.mode} onChange={set('mode')} placeholder="Online (Zoom Live)" />
          </div>
          <Field label="Activation Price (₹)" type="number" value={content.price} onChange={set('price')} placeholder="99" />
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

        <Section icon={Link2} title="Post-Registration Links" desc="Shown on the success screen after payment.">
          <Field label="WhatsApp Group Link" value={content.whatsapp_group_link} onChange={set('whatsapp_group_link')} placeholder="https://chat.whatsapp.com/..." />
          <Field label="Meeting Link" value={content.meeting_link} onChange={set('meeting_link')} placeholder="https://zoom.us/..." />
        </Section>

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
