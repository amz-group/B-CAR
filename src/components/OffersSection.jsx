import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useSettings } from '@/lib/useSettings';
import { Image } from '@/components/ui/image';
import { ArrowRight, ArrowLeft, BadgePercent } from 'lucide-react';

export default function OffersSection() {
  const { t, lang, dir } = useLang();
  const { settings } = useSettings();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await backend.entities.Car.list('order', 200);
        setCars((list || []).filter(c => (c.discount_percentage || 0) > 0));
      } catch { setCars([]); }
      finally { setLoading(false); }
    })();
  }, []);

  if (!loading && cars.length === 0) return null;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section id="offers" className="py-16 lg:py-20 border-t border-white/[0.06] relative overflow-hidden">
      <div className="absolute top-0 start-1/4 w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[140px]" />
      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 backdrop-blur-xl mb-4">
              <BadgePercent className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-amber-200">{t.offers.eyebrow}</span>
            </div>
            <h2 className="font-heading font-extrabold text-white tracking-tight" style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)' }}>
              {t.offers.title}
            </h2>
            <p className="mt-3 text-zinc-400 text-base max-w-xl">{t.offers.subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[3/2] rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map(car => <OfferCard key={car.id} car={car} t={t} lang={lang} Arrow={Arrow} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function OfferCard({ car, t, lang, Arrow }) {
  const img = car.images?.[0];
  const disc = car.discount_percentage || 0;
  const finalPrice = (car.price_per_day * (1 - disc / 100)).toFixed(0);

  return (
    <Link to={`/car/${car.id}`} className="group block">
      <div className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900 shadow-2xl shadow-black/40">
        {img ? (
          <Image src={img} alt={car.name} className="w-full h-full" fittingType="fill" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🚗</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/20 to-transparent" />

        {/* Discount ribbon */}
        <div className="absolute top-4 start-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/30">
            <BadgePercent className="w-3.5 h-3.5" />
            -{disc}%
          </span>
        </div>

        <div className="absolute bottom-4 inset-x-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-white text-lg tracking-tight truncate">{car.name}</h3>
            <p className="text-xs text-zinc-400">{car.brand} {car.model}</p>
          </div>
          <div className="text-end shrink-0">
            <div className="text-xs text-zinc-500 line-through">${car.price_per_day}</div>
            <div className="text-2xl font-heading font-extrabold text-amber-300">${finalPrice}<span className="text-xs font-normal text-zinc-400">/{t.fleet.perDay}</span></div>
          </div>
        </div>
      </div>
    </Link>
  );
}