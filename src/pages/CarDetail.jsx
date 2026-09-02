import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useSettings } from '@/lib/useSettings';
import { Image } from '@/components/ui/image';
import ReviewsSection from '@/components/ReviewsSection';
import { ArrowLeft, ArrowRight, Gauge, Settings2, Users, Calendar, Tag, Play, MessageCircle, Bell, BadgePercent } from 'lucide-react';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, dir } = useLang();
  const { settings } = useSettings();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ name: '', phone: '', date: '' });
  const [booking, setBooking] = useState({ pickup: '', return: '' });
  const [rentals, setRentals] = useState([]);
  const [notifyDone, setNotifyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await backend.entities.Car.get(id);
        setCar(c);
        const rlist = await backend.entities.Rental.filter({ car_id: id, status: 'active' }, 'start_date', 50);
        setRentals(rlist || []);
      } catch (e) { setCar(null); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="w-8 h-8 border-4 border-zinc-800 border-t-cyan-400 rounded-full animate-spin" /></div>;
  }
  if (!car) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-center px-6">
      <p className="text-zinc-400 mb-4">404</p>
      <button onClick={() => navigate('/')} className="text-cyan-400 hover:underline">{t.detail.back}</button>
    </div>;
  }

  const available = car.status === 'available';
  const isRented = car.status === 'rented';
  const isUnavailable = car.status === 'unavailable';
  const waNumber = settings?.whatsapp_number || '9647509180156';
  const images = car.images || [];
  const desc = car[`description_${lang}`] || car.description_en || '';
  const Arrow = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const finalPrice = (car.discount_percentage || 0) > 0 ? car.price_per_day * (1 - car.discount_percentage / 100) : car.price_per_day;
  const days = booking.pickup && booking.return ? Math.max(1, Math.ceil((new Date(booking.return) - new Date(booking.pickup)) / 86400000)) : 0;
  const dateConflict = booking.pickup && booking.return && rentals.some(r => booking.pickup <= r.end_date && booking.return >= r.start_date);

  const waMessage = `Hello B Car For Rent, I would like to rent the ${car.name} (${car.brand} ${car.model}, ${car.year}).${booking.pickup ? ` Pickup: ${booking.pickup}` : ''}${booking.return ? ` Return: ${booking.return}` : ''}${days > 0 ? ` (${days} days)` : ''} Please confirm availability and total price.`;

  const specs = [
    { Icon: Gauge, label: t.detail.engine, value: car.engine || '—' },
    { Icon: Settings2, label: t.detail.transmission, value: car.transmission || '—' },
    { Icon: Users, label: t.detail.seats, value: car.seats || '—' },
    { Icon: Calendar, label: t.detail.year, value: car.year || '—' },
    { Icon: Tag, label: t.detail.category, value: car.category || '—' }
  ];

  async function handleNotify(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await backend.entities.NotifyRequest.create({
        car_id: car.id, car_name: car.name,
        customer_name: notifyForm.name, customer_phone: notifyForm.phone,
        notify_date: notifyForm.date || car.rented_until || '', status: 'pending'
      });
      setNotifyDone(true);
    } catch (err) { /* ignore */ }
    finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition-colors mb-10">
          <Arrow className="w-4 h-4" />
          {t.detail.back}
        </button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* GALLERY */}
          <div>
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none z-10" />
              {images.length > 0 ? (
                <Image src={images[activeImg]} alt={car.name} className="w-full h-full" fittingType="fill" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">🚗</div>
              )}
              {car.video_url && (
                <a href={car.video_url} target="_blank" rel="noreferrer" className="absolute bottom-4 end-4 z-20 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950/60 backdrop-blur-2xl border border-white/15 text-white text-sm shadow-lg shadow-black/30 hover:bg-cyan-400/20 hover:border-cyan-400/40 hover:text-cyan-300 transition-all duration-300">
                  <Play className="w-4 h-4" />
                  {t.detail.video}
                </a>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-6 gap-2">
                {images.slice(0, 7).map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-300 backdrop-blur-sm ${activeImg === i ? 'border-cyan-400/70 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-400/20' : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:border-white/25'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {activeImg === i && <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent" />}
                  </button>
                ))}
              </div>
            )}
            {car.video_url && (
              <div className="mt-6">
                <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">{t.detail.video}</h3>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none z-10" />
                  <video src={car.video_url} controls className="w-full h-full object-contain relative z-0" />
                </div>
              </div>
            )}
          </div>

          {/* COMMAND CENTER */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${available ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : isRented ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-400 animate-pulse' : isRented ? 'bg-sky-400' : 'bg-rose-400'}`} />
                {available ? t.detail.available : isRented ? t.detail.rented : t.detail.unavailable}
              </span>
              <span className="text-xs uppercase tracking-wider text-zinc-500">{car.category}</span>
            </div>
            {isRented && (car.rented_from || car.rented_until) && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-sm">
                <Calendar className="w-4 h-4" />
                {car.rented_from && car.rented_until
                  ? `${t.detail.rentedUntil} ${car.rented_from} → ${car.rented_until}`
                  : car.rented_until ? `${t.detail.availableAgain} ${car.rented_until}` : ''}
              </div>
            )}

            <h1 className="font-heading font-extrabold text-white tracking-tight text-4xl lg:text-5xl leading-tight">{car.name}</h1>
            <p className="mt-2 text-zinc-400 text-lg">{car.brand} {car.model} · {car.year}</p>

            <div className="mt-6 flex items-baseline gap-3 flex-wrap">
              {(car.discount_percentage || 0) > 0 ? (
                <>
                  <span className="font-heading font-extrabold text-amber-300 text-5xl">${(car.price_per_day * (1 - car.discount_percentage / 100)).toFixed(0)}</span>
                  <span className="text-zinc-600 line-through text-2xl font-heading">${car.price_per_day}</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold border border-amber-400/30">
                    <BadgePercent className="w-3.5 h-3.5" /> -{car.discount_percentage}%
                  </span>
                </>
              ) : (
                <span className="font-heading font-extrabold text-white text-5xl">${car.price_per_day}</span>
              )}
              <span className="text-zinc-500">{t.fleet.perDay}</span>
            </div>

            {desc && <p className="mt-6 text-zinc-400 leading-relaxed">{desc}</p>}

            {/* SPECS */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {specs.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
                    <div className="text-sm font-medium text-white capitalize">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {isUnavailable ? (
              <div className="mt-8 p-6 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] text-center">
                <p className="text-sm text-rose-300">{t.detail.unavailableMsg}</p>
              </div>
            ) : (
              <div className="mt-8 p-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03]">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-3">{t.detail.selectDates}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">{t.detail.pickupDate}</label>
                    <input type="date" value={booking.pickup} onChange={e => setBooking({...booking, pickup: e.target.value})} className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">{t.detail.returnDate}</label>
                    <input type="date" min={booking.pickup || undefined} value={booking.return} onChange={e => setBooking({...booking, return: e.target.value})} className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors" dir="ltr" />
                  </div>
                </div>
                {days > 0 && !dateConflict && (
                  <p className="mt-3 text-sm text-zinc-300">{days} {t.detail.days} · {t.detail.totalEst}: <span className="font-heading font-bold text-white">${(days * finalPrice).toFixed(0)}</span></p>
                )}
                {dateConflict && (
                  <p className="mt-3 text-sm text-rose-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> {t.detail.dateConflict}</p>
                )}
                {rentals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">{t.detail.busyPeriods}</p>
                    <div className="flex flex-wrap gap-2">
                      {rentals.map(r => (
                        <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs font-mono" dir="ltr">{r.start_date} → {r.end_date}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 space-y-3">
              {isUnavailable ? (
                <div className="w-full px-8 py-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">{t.detail.unavailableMsg}</div>
              ) : dateConflict ? (
                <div className="w-full px-8 py-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">{t.detail.dateConflict}</div>
              ) : (
                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-zinc-950 font-semibold text-sm tracking-wide hover:bg-cyan-400 transition-all duration-300">
                  <MessageCircle className="w-5 h-5" />
                  {t.detail.bookCta}
                </a>
              )}
              {isRented && (
                <button onClick={() => setNotifyOpen(!notifyOpen)} className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-white/15 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all">
                  <Bell className="w-4 h-4 text-sky-400" />
                  {t.detail.notifyMe}
                </button>
              )}
            </div>

            {/* NOTIFY FORM */}
            {notifyOpen && isRented && (
              <div className="mt-4 p-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03]">
                {notifyDone ? (
                  <p className="text-sm text-emerald-300 flex items-start gap-2">
                    <Bell className="w-4 h-4 mt-0.5 shrink-0" />
                    {t.detail.notifySuccess}
                  </p>
                ) : (
                  <form onSubmit={handleNotify} className="space-y-3">
                    <p className="text-sm text-zinc-300 mb-2">{t.detail.notifyTitle}</p>
                    {car.rented_until && (
                      <p className="text-xs text-rose-300 mb-2">{t.detail.availableAgain} {car.rented_until}</p>
                    )}
                    <input required value={notifyForm.name} onChange={e => setNotifyForm({...notifyForm, name: e.target.value})} placeholder={t.detail.notifyName} className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none" />
                    <input required value={notifyForm.phone} onChange={e => setNotifyForm({...notifyForm, phone: e.target.value})} placeholder={t.detail.notifyPhone} className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none" dir="ltr" />
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">{t.detail.notifyDate}</label>
                      <input type="date" value={notifyForm.date || car.rented_until || ''} onChange={e => setNotifyForm({...notifyForm, date: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm focus:border-cyan-400 focus:outline-none transition-colors" dir="ltr" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full px-6 py-3 rounded-lg bg-cyan-400 text-zinc-950 font-semibold text-sm hover:bg-cyan-300 disabled:opacity-50 transition-colors">
                      {submitting ? t.common.loading : t.detail.notifySubmit}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <ReviewsSection carId={car.id} carName={car.name} />
      </div>
    </div>
  );
}