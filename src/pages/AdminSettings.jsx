import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2, Save, Image as ImageIcon, Link2, Phone, Globe } from 'lucide-react';

export default function AdminSettings() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // 'logo' | 'background' | null

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const list = await backend.entities.SiteSettings.list();
      if (list && list.length > 0) setSettings(list[0]);
      else setSettings({ whatsapp_number: '9647509180156', display_phone: '07509180156' });
    } catch { setSettings({}); }
    finally { setLoading(false); }
  }

  function set(key, val) { setSettings(s => ({ ...s, [key]: val })); }

  async function uploadFile(file, type) {
    setUploading(type);
    try {
      const { file_url } = await backend.integrations.Core.UploadFile({ file });
      set(type === 'logo' ? 'logo_url' : 'background_url', file_url);
    } catch { toast({ title: 'Upload failed', variant: 'destructive' }); }
    finally { setUploading(null); }
  }

  async function save() {
    setSaving(true);
    try {
      if (settings.id) await backend.entities.SiteSettings.update(settings.id, settings);
      else { const created = await backend.entities.SiteSettings.create(settings); setSettings(created); }
      toast({ title: t.admin.settingsSaved });
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>;

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors';
  const labelCls = 'block text-xs uppercase tracking-wider text-zinc-500 mb-1.5';

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight mb-8">{t.admin.settings}</h1>

      <div className="space-y-8">
        {/* Media */}
        <Section title="Media" icon={ImageIcon}>
          <div className="grid grid-cols-2 gap-4">
            <MediaUploader label={t.admin.logo} value={settings.logo_url} uploading={uploading === 'logo'} onUpload={f => uploadFile(f, 'logo')} />
            <MediaUploader label={t.admin.background} value={settings.background_url} uploading={uploading === 'background'} onUpload={f => uploadFile(f, 'background')} />
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact & Location" icon={Phone}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>{t.admin.whatsapp}</label><input className={inputCls} dir="ltr" value={settings.whatsapp_number || ''} onChange={e => set('whatsapp_number', e.target.value)} placeholder="9647509180156" /></div>
            <div><label className={labelCls}>{t.admin.displayPhone}</label><input className={inputCls} dir="ltr" value={settings.display_phone || ''} onChange={e => set('display_phone', e.target.value)} placeholder="07509180156" /></div>
          </div>
          <div><label className={labelCls}>{t.admin.locationUrl}</label><input className={inputCls} dir="ltr" value={settings.location_url || ''} onChange={e => set('location_url', e.target.value)} placeholder="https://maps.google.com/..." /></div>
        </Section>

        {/* Social */}
        <Section title={t.admin.social} icon={Link2}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>{t.admin.instagram}</label><input className={inputCls} dir="ltr" value={settings.instagram_url || ''} onChange={e => set('instagram_url', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.facebook}</label><input className={inputCls} dir="ltr" value={settings.facebook_url || ''} onChange={e => set('facebook_url', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.tiktok}</label><input className={inputCls} dir="ltr" value={settings.tiktok_url || ''} onChange={e => set('tiktok_url', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.snapchat}</label><input className={inputCls} dir="ltr" value={settings.snapchat_url || ''} onChange={e => set('snapchat_url', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.telegram}</label><input className={inputCls} dir="ltr" value={settings.telegram_url || ''} onChange={e => set('telegram_url', e.target.value)} /></div>
          </div>
        </Section>

        {/* Names & Taglines */}
        <Section title={t.admin.siteNames + ' & ' + t.admin.taglines} icon={Globe}>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelCls}>EN</label><input className={inputCls} value={settings.site_name_en || ''} onChange={e => set('site_name_en', e.target.value)} /></div>
            <div><label className={labelCls}>KU</label><input className={inputCls} dir="rtl" value={settings.site_name_ku || ''} onChange={e => set('site_name_ku', e.target.value)} /></div>
            <div><label className={labelCls}>AR</label><input className={inputCls} dir="rtl" value={settings.site_name_ar || ''} onChange={e => set('site_name_ar', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelCls}>EN</label><input className={inputCls} value={settings.tagline_en || ''} onChange={e => set('tagline_en', e.target.value)} /></div>
            <div><label className={labelCls}>KU</label><input className={inputCls} dir="rtl" value={settings.tagline_ku || ''} onChange={e => set('tagline_ku', e.target.value)} /></div>
            <div><label className={labelCls}>AR</label><input className={inputCls} dir="rtl" value={settings.tagline_ar || ''} onChange={e => set('tagline_ar', e.target.value)} /></div>
          </div>
        </Section>

        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t.admin.saveSettings}
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function MediaUploader({ label, value, uploading, onUpload }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5">{label}</label>
      <div className="aspect-video rounded-lg border border-white/10 bg-zinc-900 overflow-hidden relative">
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-8 h-8" /></div>
        )}
      </div>
      <label className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 cursor-pointer hover:border-cyan-400/50 text-zinc-300 text-xs transition-all">
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Upload className="w-3.5 h-3.5" /> Upload</>}
        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
      </label>
    </div>
  );
}