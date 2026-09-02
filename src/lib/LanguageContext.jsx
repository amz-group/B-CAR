import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from './i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('bcar_lang') || 'en');
  const t = translations[lang] || translations.en;
  const dir = t.dir;

  useEffect(() => {
    localStorage.setItem('bcar_lang', lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}