import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, languages } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = languages.find(l => l.code === lang);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-sm text-zinc-200 hover:bg-white/10 transition-colors"
      >
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="font-medium tracking-wide">{current?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-40 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${lang === l.code ? 'text-cyan-400 bg-white/5' : 'text-zinc-300'}`}
            >
              <span>{l.name}</span>
              <span className="text-xs font-mono opacity-60">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}