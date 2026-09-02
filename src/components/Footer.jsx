import React from 'react';
import { useLang } from '@/lib/LanguageContext';
import { useSettings } from '@/lib/useSettings';
import { Instagram, Facebook, MapPin, MessageCircle, Send } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLang();
  const { settings } = useSettings();
  const siteName = settings ? (settings[`site_name_${lang}`] || settings.site_name_en) : 'KRD GROUP';

  const socials = [
    { url: settings?.instagram_url, Icon: Instagram },
    { url: settings?.facebook_url, Icon: Facebook },
    { url: settings?.telegram_url, Icon: Send }
  ].filter(s => s.url);

  return (
    <footer id="contact" className="relative border-t border-white/5 bg-zinc-950">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={siteName} className="h-9 w-auto object-contain" />
              ) : (
                <span className="font-heading font-extrabold text-2xl text-white">KRD<span className="text-cyan-400"> GROUP</span></span>
              )}
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">{settings ? (settings[`tagline_${lang}`] || settings.tagline_en) : t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-5">{t.contact.location}</h4>
            {settings?.location_url && (
              <a href={settings.location_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-zinc-300 hover:text-cyan-400 transition-colors group">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">{t.contact.location}</span>
              </a>
            )}
            <div className="mt-4 flex gap-3">
              {socials.map(({ url, Icon }, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-zinc-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-5">{t.contact.callUs}</h4>
            <a href={`https://wa.me/${settings?.whatsapp_number || '9647509180156'}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-zinc-300 hover:text-cyan-400 transition-colors">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-mono tracking-wide" dir="ltr">{settings?.display_phone || '07509180156'}</span>
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} {siteName}. {t.footer.rights}</p>
          <a href="https://krdgroup.dev/" target="_blank" rel="noreferrer" className="text-xs text-zinc-600 tracking-wider uppercase hover:text-cyan-400 transition-colors">build by KRD GROUP</a>
        </div>
      </div>
    </footer>
  );
}