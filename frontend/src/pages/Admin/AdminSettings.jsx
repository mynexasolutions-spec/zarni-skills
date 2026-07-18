import React, { useEffect, useState } from 'react';
import { Settings, CreditCard, Percent, Landmark, Mail, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
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
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
      />
    </div>
  );
}

const DEFAULT_SETTINGS = {
  razorpay_enabled: '', razorpay_key_id: '', razorpay_key_secret: '',
  mail_server: '', mail_port: '', mail_use_tls: '', mail_username: '',
  mail_password: '', mail_from: '', min_withdrawal_amount: '',
  global_level1_commission_percent: '', global_level2_commission_percent: '',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings({ ...DEFAULT_SETTINGS, ...response.data.settings });
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const response = await api.post('/admin/settings', {
        ...settings,
        razorpay_enabled: settings.razorpay_enabled === true || settings.razorpay_enabled === 'true',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-red-600" />
        <div>
          <h2 className="text-2xl font-black">Platform Settings</h2>
          <p className="text-xs text-slate-400">Configure payments, commissions, payouts, and email delivery.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        <Section icon={CreditCard} title="Razorpay Payment Gateway" desc="Enable live payments and configure API credentials.">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={settings.razorpay_enabled === true || settings.razorpay_enabled === 'true'} onChange={set('razorpay_enabled')} className="w-4 h-4 rounded accent-red-600" />
            <span className="text-sm font-bold text-slate-700">Enable Razorpay live payments</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Key ID" value={settings.razorpay_key_id || ''} onChange={set('razorpay_key_id')} placeholder="rzp_live_xxxxxx" />
            <Field label="Key Secret" type="password" value={settings.razorpay_key_secret || ''} onChange={set('razorpay_key_secret')} placeholder="••••••••" />
          </div>
        </Section>

        <Section icon={Percent} title="Referral & Commission" desc="Default commission rates applied when a package/course doesn't override them.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Level 1 Commission %" type="number" step="0.1" value={settings.global_level1_commission_percent || ''} onChange={set('global_level1_commission_percent')} placeholder="10" />
            <Field label="Level 2 Commission %" type="number" step="0.1" value={settings.global_level2_commission_percent || ''} onChange={set('global_level2_commission_percent')} placeholder="5" />
          </div>
        </Section>

        <Section icon={Landmark} title="Withdrawals" desc="Minimum amount a student must reach before requesting a payout.">
          <Field label="Minimum Withdrawal Amount (₹)" type="number" value={settings.min_withdrawal_amount || ''} onChange={set('min_withdrawal_amount')} placeholder="500" />
        </Section>

        <Section icon={Mail} title="Email / SMTP" desc="Outbound mail server used for notifications and confirmations.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Mail Server" value={settings.mail_server || ''} onChange={set('mail_server')} placeholder="smtp.gmail.com" />
            <Field label="Mail Port" value={settings.mail_port || ''} onChange={set('mail_port')} placeholder="587" />
            <Field label="Mail Username" value={settings.mail_username || ''} onChange={set('mail_username')} placeholder="you@zarniskills.com" />
            <Field label="Mail Password" type="password" value={settings.mail_password || ''} onChange={set('mail_password')} placeholder="••••••••" />
            <Field label="From Address" value={settings.mail_from || ''} onChange={set('mail_from')} placeholder="no-reply@zarniskills.com" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={settings.mail_use_tls === true || settings.mail_use_tls === 'true'} onChange={set('mail_use_tls')} className="w-4 h-4 rounded accent-red-600" />
            <span className="text-sm font-bold text-slate-700">Use TLS encryption</span>
          </label>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-red-600/25 hover:shadow-lg transition-all disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
