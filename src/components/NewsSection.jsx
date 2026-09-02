import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { Image } from '@/components/ui/image';
import { Newspaper, Tag, TrendingUp, ArrowRight, ArrowLeft, Pin } from 'lucide-react';

const typeStyles = {
  news: { Icon: Newspaper, ring: 'text-cyan-300', chip: 'bg-cyan-400/10 border-cyan-400/25 text-cyan-200', blob: 'bg-cyan-500/10' },
  offer: { Icon: Tag, ring: 'text-amber-300', chip: 'bg-amber-400/10 border-amber-400/25 text-amber-200', blob: 'bg-amber-500/10' },
  price_change: { Icon: TrendingUp, ring: 'text-violet-300', chip: 'bg-violet-400/10 border-violet-400/25 text-violet-200', blob: 'bg-violet-500/10' }
};

export default function NewsSection() {
  const { t, lang, dir } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await backend.entities.News.filter({ active: true }, '-created_date', 12);
        const sorted = (list || []).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setItems(sorted);
      } catch { setItems([]); }
      finally { setLoading(false); }
    })();
  }, []);

  if (!loading && items.length === 0) return null;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section id="news" className="py-16 lg:py-20 border-t border-white/[0.06]">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 mb-3">{t.news.eyebrow}</p>
            <h2 className="font-heading font-extrabold text-white tracking-tight" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}>
              {t.news.title}
            </h2>
            <p className="mt-3 text-zinc-400 text-base max-w-xl">{t.news.subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => <NewsCard key={item.id} item={item} lang={lang} t={t} Arrow={Arrow} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function NewsCard({ item, lang, t, Arrow }) {
  const title = item[`title_${lang}`] || item.title_en || '';
  const content = item[`content_${lang}`] || item.content_en || '';
  const style = typeStyles[item.type] || typeStyles.news;
  const { Icon } = style;

  return (
    <article className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40 hover:border-cyan-400/20 transition-all duration-500">
      <div className={`absolute -top-20 -end-20 w-48 h-48 rounded-full ${style.blob} blur-[80px] opacity-60`} />
      {item.image_url ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src={item.image_url} alt={title} className="w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>
      ) : (
        <div className="relative aspect-[16/9] bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center overflow-hidden">
          <Icon className="w-16 h-16 text-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
      )}

      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.chip}`}>
            <Icon className="w-3 h-3" />
            {t.news[item.type]}
          </span>
          {item.pinned && <Pin className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40" />}
        </div>
        <h3 className="font-heading font-bold text-white text-lg tracking-tight mb-2 leading-snug">{title}</h3>
        {content && <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{content}</p>}
      </div>
    </article>
  );
}