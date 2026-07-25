import React, { useEffect, useState } from 'react';
import { Settings, CreditCard, Percent, Landmark, Mail, CheckCircle2, Plane, ClipboardList, Shield, Save, Sparkles, Lock } from 'lucide-react';
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

const DEFAULT_SETTINGS = {
  mail_server: '', mail_port: '', mail_use_tls: '', mail_username: '',
  mail_password: '', mail_from: '', min_withdrawal_amount: '',
  global_level1_commission_percent: '', global_level2_commission_percent: '',
  global_manager_override_percent: '', global_manager_override_level2_percent: '',
  trip_goal_title: '', trip_goal_amount: '', trip_goal_date: '',
  registration_field_config: {},
};

const REGISTRATION_FIELDS = [
  { key: 'phone', label: 'Phone Number' },
  { key: 'state', label: 'State Location' },
  { key: 'dob', label: 'Date of Birth' },
];
const FIELD_MODES = ['required', 'optional', 'hidden'];

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [razorpayStatus, setRazorpayStatus] = useState({ enabled: false, key_id: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings({ ...DEFAULT_SETTINGS, ...response.data.settings });
        setRazorpayStatus(response.data.razorpay_status || { enabled: false, key_id: null });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const setFieldMode = (fieldKey, mode) => {
    setSettings(prev => ({
      ...prev,
      registration_field_config: { ...prev.registration_field_config, [fieldKey]: mode },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const response = await api.post('/admin/settings', {
        ...settings,
        mail_use_tls: settings.mail_use_tls === true || settings.mail_use_tls === 'true',
      });
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          <div className="absolute animate-ping rounded-full h-10 w-10 border border-red-400 opacity-75"></div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading Platform Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-slate-800 space-y-6 pb-10 animate-fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
            <Settings className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Platform Configurations</h2>
            <p className="text-xs text-slate-400 font-semibold">Manage live payment gateways, commission percentages, payouts, and mail servers</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm animate-scale-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Platform settings updated and saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Razorpay Gateway — read-only, keys live in .env */}
        <Section icon={CreditCard} title="Razorpay Payment Gateway" desc="Configured directly via the server's .env file — not editable here">
          <div className={`flex items-center justify-between gap-3 rounded-2xl p-4 border ${
            razorpayStatus.enabled ? 'bg-emerald-50/80 border-emerald-200/60' : 'bg-amber-50/80 border-amber-200/60'
          }`}>
            <div>
              <span className={`text-xs font-black uppercase flex items-center gap-1.5 ${razorpayStatus.enabled ? 'text-emerald-700' : 'text-amber-700'}`}>
                {razorpayStatus.enabled ? <><CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Enabled</> : <><Lock className="w-3.5 h-3.5" /> Razorpay Not Configured</>}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                {razorpayStatus.enabled
                  ? `Key ID: ${razorpayStatus.key_id}`
                  : 'Add razorpay_key and razorpay_secret to the server .env file, then restart.'}
              </span>
            </div>
          </div>
        </Section>

        {/* Commission Settings */}
        <Section icon={Percent} title="Global Commission & Override Rates" desc="Default referral rates applied when individual courses do not set custom overrides">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Level 1 Direct Commission (%)" type="number" step="0.1" value={settings.global_level1_commission_percent || ''} onChange={set('global_level1_commission_percent')} placeholder="10" />
            <Field label="Level 2 Indirect Commission (%)" type="number" step="0.1" value={settings.global_level2_commission_percent || ''} onChange={set('global_level2_commission_percent')} placeholder="5" />
            <Field label="Manager Override Rate (Hop 1 %)" type="number" step="0.1" value={settings.global_manager_override_percent || ''} onChange={set('global_manager_override_percent')} placeholder="10" />
            <Field label="Manager Override Rate (Hop 2 %)" type="number" step="0.1" value={settings.global_manager_override_level2_percent || ''} onChange={set('global_manager_override_level2_percent')} placeholder="5" />
          </div>
        </Section>

        {/* Withdrawal Settings */}
        <Section icon={Landmark} title="Payout & Withdrawal Rules" desc="Minimum threshold amount students must reach before requesting payouts">
          <Field label="Minimum Withdrawal Threshold (₹)" type="number" value={settings.min_withdrawal_amount || ''} onChange={set('min_withdrawal_amount')} placeholder="500" />
        </Section>

        {/* Trip Goal Settings */}
        <Section icon={Plane} title="Trip Achievement Goal" desc="Powers the Trip Goal progress bar on student dashboards (leave title blank to disable)">
          <Field label="Trip Title" value={settings.trip_goal_title || ''} onChange={set('trip_goal_title')} placeholder="Bali International Trip 2026" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Target Income Goal (₹)" type="number" value={settings.trip_goal_amount || ''} onChange={set('trip_goal_amount')} placeholder="50000" />
            <Field label="Target Deadline Date" type="date" value={settings.trip_goal_date || ''} onChange={set('trip_goal_date')} />
          </div>
        </Section>

        {/* Registration Form Config */}
        <Section icon={ClipboardList} title="Registration Form Fields" desc="Control visibility and requirement rules for optional registration fields">
          <div className="space-y-3">
            {REGISTRATION_FIELDS.map(f => {
              const mode = settings.registration_field_config?.[f.key] || 'required';
              return (
                <div key={f.key} className="flex items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex-wrap">
                  <span className="text-sm font-extrabold text-slate-800">{f.label}</span>
                  <div className="flex gap-1.5">
                    {FIELD_MODES.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFieldMode(f.key, m)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                          mode === m 
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-600/20' 
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-red-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* SMTP Mail Settings */}
        <Section icon={Mail} title="Email Server (SMTP Credentials)" desc="Outbound email configurations for automated system notifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SMTP Host / Server" value={settings.mail_server || ''} onChange={set('mail_server')} placeholder="smtp.gmail.com" />
            <Field label="SMTP Port" value={settings.mail_port || ''} onChange={set('mail_port')} placeholder="587" />
            <Field label="Mail Username" value={settings.mail_username || ''} onChange={set('mail_username')} placeholder="you@zarniskills.com" />
            <Field label="Mail Password" type="password" value={settings.mail_password || ''} onChange={set('mail_password')} placeholder="••••••••" />
            <Field label="From Address Email" value={settings.mail_from || ''} onChange={set('mail_from')} placeholder="no-reply@zarniskills.com" />
          </div>

          <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 mt-3">
            <div>
              <span className="text-xs font-black uppercase text-slate-800 block">Use TLS Security Encryption</span>
              <span className="text-[10px] text-slate-400 font-semibold">Encrypt outbound emails with TLS protocol</span>
            </div>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={settings.mail_use_tls === true || settings.mail_use_tls === 'true'}
                onChange={set('mail_use_tls')}
                className="sr-only peer"
              />
              <span className="w-10 h-6 bg-slate-300 peer-checked:bg-emerald-500 rounded-full transition-colors"></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
            </span>
          </label>
        </Section>

        {/* Save Settings Submit Button */}
        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="group relative inline-flex overflow-hidden px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest items-center justify-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {!saving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>}
            <span className="relative flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving Configurations...' : 'Save All Settings'}
            </span>
          </button>
        </div>

      </form>
    </div>
  );
}
