import React, { useEffect, useState } from 'react';
import { Settings, Percent, Landmark, Mail, CheckCircle2, Save, Sparkles, Share2, UserPlus } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
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
  min_withdrawal_amount: '',
  global_level1_commission_percent: '', global_level2_commission_percent: '',
  global_manager_override_percent: '', global_manager_override_level2_percent: '',
  masterclass_referrer_percent: '',
  footer_facebook_url: '', footer_instagram_url: '', footer_whatsapp_url: '',
  support_email: '', support_phone: '', support_address: '',
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
      const response = await api.post('/admin/settings', settings);
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

        {/* Commission Settings */}
        <Section icon={Percent} title="Global Commission & Override Rates" desc="Default referral rates applied when individual courses do not set custom overrides">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Level 1 Direct Commission (%)" type="number" step="0.1" value={settings.global_level1_commission_percent || ''} onChange={set('global_level1_commission_percent')} placeholder="10" />
            <Field label="Level 2 Indirect Commission (%)" type="number" step="0.1" value={settings.global_level2_commission_percent || ''} onChange={set('global_level2_commission_percent')} placeholder="5" />
            <Field label="Manager Override Rate (Hop 1 %)" type="number" step="0.1" value={settings.global_manager_override_percent || ''} onChange={set('global_manager_override_percent')} placeholder="10" />
            <Field label="Manager Override Rate (Hop 2 %)" type="number" step="0.1" value={settings.global_manager_override_level2_percent || ''} onChange={set('global_manager_override_level2_percent')} placeholder="5" />
          </div>
        </Section>

        {/* Masterclass Registration Split */}
        <Section icon={UserPlus} title="Masterclass Registration Split" desc="How the ₹ fee a guest pays through someone's masterclass referral link is split between that referrer and the platform">
          <Field
            label="Referrer Share (%)"
            type="number" min="0" max="100" step="0.1"
            value={settings.masterclass_referrer_percent || ''}
            onChange={set('masterclass_referrer_percent')}
            placeholder="100"
          />
          {(() => {
            const pct = Math.min(100, Math.max(0, parseFloat(settings.masterclass_referrer_percent) || 0));
            const hasValue = settings.masterclass_referrer_percent !== '' && !isNaN(parseFloat(settings.masterclass_referrer_percent));
            const displayPct = hasValue ? pct : 100;
            return (
              <div className="pt-1">
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${displayPct}%` }} />
                  <div className="h-full bg-slate-400 transition-all duration-300" style={{ width: `${100 - displayPct}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-center">
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-wide">Referrer Gets</p>
                    <p className="text-lg font-black text-emerald-700">{displayPct}%</p>
                  </div>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wide">Platform Keeps</p>
                    <p className="text-lg font-black text-slate-600">{(100 - displayPct).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            );
          })()}
          <p className="text-[10px] text-slate-400 font-medium">Leave blank (or 100) to keep paying the referrer the whole fee — the platform's current default. Only applies to registrations made after this is saved; past payouts aren't recalculated.</p>
        </Section>

        {/* Withdrawal Settings */}
        <Section icon={Landmark} title="Payout & Withdrawal Rules" desc="Minimum threshold amount students must reach before requesting payouts">
          <Field label="Minimum Withdrawal Threshold (₹)" type="number" value={settings.min_withdrawal_amount || ''} onChange={set('min_withdrawal_amount')} placeholder="500" />
        </Section>

        {/* Footer Social Links */}
        <Section icon={Share2} title="Footer Social Links" desc="Facebook, Instagram & WhatsApp links shown as icons in the site footer (leave blank to hide that icon)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={<span className="inline-flex items-center gap-1.5"><FaFacebook className="w-3.5 h-3.5 text-blue-600" /> Facebook URL</span>} value={settings.footer_facebook_url || ''} onChange={set('footer_facebook_url')} placeholder="https://facebook.com/zarniskills" />
            <Field label={<span className="inline-flex items-center gap-1.5"><FaInstagram className="w-3.5 h-3.5 text-pink-600" /> Instagram URL</span>} value={settings.footer_instagram_url || ''} onChange={set('footer_instagram_url')} placeholder="https://instagram.com/zarniskills" />
            <Field label={<span className="inline-flex items-center gap-1.5"><FaWhatsapp className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp URL</span>} value={settings.footer_whatsapp_url || ''} onChange={set('footer_whatsapp_url')} placeholder="https://wa.me/91XXXXXXXXXX" />
          </div>
        </Section>

        {/* Support Contact Info */}
        <Section icon={Mail} title="Support Contact Info" desc="Shown on the Contact page, footer, and legal pages (Terms, Refund Policy) wherever a support email/phone/address appears">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Support Email" type="email" value={settings.support_email || ''} onChange={set('support_email')} placeholder="support@zarniskills.com" />
            <Field label="Support Phone" value={settings.support_phone || ''} onChange={set('support_phone')} placeholder="+91 98765 43210" />
          </div>
          <Field label="Office Address" value={settings.support_address || ''} onChange={set('support_address')} placeholder="123 Skills Tower, New Delhi, India - 110001" />
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
