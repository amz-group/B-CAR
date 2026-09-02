import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { Image } from '@/components/ui/image';
import { Star, MessageSquare, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function ReviewsSection({ carId, carName }) {
  const { t, lang } = useLang();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const list = await backend.entities.Review.filter({ car_id: carId, approved: true }, '-created_date', 50);
        setReviews(list || []);
      } catch { setReviews([]); }
      finally { setLoading(false); }
    })();
  }, [carId, refresh]);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0;

  return (
    <div className="mt-16 pt-16 border-t border-white/[0.06]">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 mb-3">{t.reviews.eyebrow}</p>
          <h2 className="font-heading font-extrabold text-white tracking-tight text-3xl lg:text-4xl">{t.reviews.title}</h2>
          {reviews.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${i <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                ))}
              </div>
              <span className="text-sm text-zinc-400">{avg.toFixed(1)} · {reviews.length} {t.reviews.count}</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(s => !s)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          {t.reviews.write}
        </button>
      </div>

      {showForm && <ReviewForm carId={carId} carName={carName} t={t} lang={lang} onDone={() => { setShowForm(false); setRefresh(r => r + 1); }} />}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-zinc-500">{t.reviews.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map(r => <ReviewCard key={r.id} r={r} t={t} />)}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ r, t }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl p-6 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400/20 to-zinc-700/40 border border-white/10 flex items-center justify-center font-heading font-bold text-white">
            {(r.customer_name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white">{r.customer_name}</div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {r.comment && <p className="text-sm text-zinc-300 leading-relaxed">{r.comment}</p>}
      {r.images?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {r.images.slice(0, 5).map((img, i) => (
            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-white/10">
              <Image src={img} alt="" className="w-full h-full" fittingType="fill" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ carId, carName, t, onDone }) {
  const [form, setForm] = useState({ customer_name: '', rating: 5, comment: '', images: [] });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function uploadImage(file) {
    setUploading(true);
    try {
      const { file_url } = await backend.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, images: [...(f.images || []), file_url].slice(0, 5) }));
    } catch { /* ignore */ }
    finally { setUploading(false); }
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.customer_name || !form.comment) return;
    setSaving(true);
    try {
      await backend.entities.Review.create({
        car_id: carId, car_name: carName,
        customer_name: form.customer_name, rating: form.rating, comment: form.comment,
        images: form.images, approved: false
      });
      setDone(true);
      setTimeout(onDone, 1800);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  if (done) {
    return (
      <div className="mb-8 p-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-200">{t.reviews.pending}</p>
      </div>
    );
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors';

  return (
    <form onSubmit={submit} className="mb-8 p-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input required className={inputCls} placeholder={t.reviews.name} value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
        <div className="flex items-center gap-2 px-4 rounded-xl bg-zinc-900 border border-white/10">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{t.reviews.rating}</span>
          <div className="flex items-center gap-1 ms-auto py-3">
            {[1, 2, 3, 4, 5].map(i => (
              <button type="button" key={i} onClick={() => setForm({ ...form, rating: i })}>
                <Star className={`w-6 h-6 transition-colors ${i <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700 hover:text-zinc-500'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <textarea required rows={3} className={inputCls} placeholder={t.reviews.comment} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />

      <div>
        <div className="flex flex-wrap gap-2">
          {(form.images || []).map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute top-1 end-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {(form.images || []).length < 5 && (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cyan-400/50 text-zinc-500 transition-all">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /><span className="text-[9px]">{t.reviews.addPhoto}</span></>}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors">
        {saving ? t.common.loading : t.reviews.submit}
      </button>
    </form>
  );
}