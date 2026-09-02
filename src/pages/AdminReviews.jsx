import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Trash2, Star, Loader2, MessageSquare } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function AdminReviews() {
  const { t } = useLang();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending | approved | all

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const list = await backend.entities.Review.list('-created_date', 200);
      setReviews(list || []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  }

  async function approve(r) {
    try { await backend.entities.Review.update(r.id, { approved: true }); load(); toast({ title: '✓' }); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function unapprove(r) {
    try { await backend.entities.Review.update(r.id, { approved: false }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function del(r) {
    if (!confirm(t.admin.confirmDeleteReview)) return;
    try { await backend.entities.Review.delete(r.id); setReviews(reviews.filter(x => x.id !== r.id)); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  const filtered = reviews.filter(r => filter === 'all' ? true : filter === 'pending' ? !r.approved : r.approved);
  const pendingCount = reviews.filter(r => !r.approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight">{t.admin.reviewsMgmt}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t.admin.reviewsSubtitle}</p>
        </div>
        <div className="flex gap-2">
          {[
            { k: 'pending', label: t.reviews.pendingTab, count: pendingCount },
            { k: 'approved', label: t.reviews.approvedTab, count: null },
            { k: 'all', label: t.reviews.allTab, count: null }
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f.k ? 'bg-white text-zinc-950' : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'}`}>
              {f.label}{f.count != null && f.count > 0 ? ` (${f.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">{t.admin.reviewsEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400/20 to-zinc-700/40 border border-white/10 flex items-center justify-center font-heading font-bold text-white shrink-0">
                    {(r.customer_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{r.customer_name}</span>
                      <span className="text-xs text-zinc-500">· {r.car_name}</span>
                      {!r.approved && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">{t.reviews.pendingTab}</span>}
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.approved ? (
                    <button onClick={() => approve(r)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/25 transition-colors"><Check className="w-4 h-4" /> {t.admin.approve}</button>
                  ) : (
                    <button onClick={() => unapprove(r)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition-colors"><X className="w-4 h-4" /> {t.admin.unapprove}</button>
                  )}
                  <button onClick={() => del(r)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {r.comment && <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{r.comment}</p>}
              {r.images?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.images.map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10"><Image src={img} alt="" className="w-full h-full" fittingType="fill" /></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}