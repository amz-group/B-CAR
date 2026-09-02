import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';
import { useSettings } from '@/lib/useSettings';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { t } = useLang();
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const navLinks = [
    { label: t.nav.home, href: '/#fleet' },
    { label: t.nav.about, href: '/#about' },
    { label: t.nav.contact, href: '/#contact' }
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'}`}>
      <nav className="max-w-[1600px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="B Car For Rent" className="h-10 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-zinc-700 flex items-center justify-center font-bold text-zinc-950 text-lg tracking-tighter">B</div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">B Car<span className="text-cyan-400">.</span></span>
            </div>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 inset-x-0 h-px bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-start" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button className="md:hidden text-zinc-200 p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-2xl border-t border-white/5">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-base font-medium text-zinc-200 hover:text-cyan-400">{l.label}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}