import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, X, Upload, Pin, Loader2, Newspaper, Image as ImageIcon } from 'lucide-react';

const empty = { title_en: '', title_ku: '', title_ar: '', content_en: '', content_ku: '', content_ar: '', type: 'news', image_url: '', active: true, pinned: false };

export default function AdminNews() {
  const { t } = useLang();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const list = await backend.entities.News.list('-created_date', 100);
      setItems(list || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  async function togglePin(item) {
    try { await backend.entities.News.update(item.id, { pinned: !item.pinned }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function toggleActive(item) {
    try { await backend.entities.News.update(item.id, { active: !item.active }); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function del(item) {
    if (!confirm(t.admin.confirmDeleteNews)) return;
    try { await backend.entities.News.delete(item.id); setItems(items.filter(i => i.id !== item.id)); toast({ title: '✓' }); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight">{t.admin.newsMgmt}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t.admin.newsSubtitle}</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" /> {t.admin.addNews}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <Newspaper className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">{t.admin.newsEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-zinc-700" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">{t.news[item.type]}</span>
                  {item.pinned && <Pin className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40" />}
                </div>
                <div className="font-semibold text-white truncate mt-1">{item.title_en}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePin(item)} title="Pin" className={`p-2 rounded-lg transition-colors ${item.pinned ? 'bg-cyan-400/15 text-cyan-300' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}><Pin className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(item)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${item.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-700/30 text-zinc-400'}`}>{item.active ? t.admin.active : t.admin.inactive}</button>
                <button onClick={() => setEditing({ ...item })} className="p-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(item)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <NewsEditor item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function NewsEditor({ item, onClose, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isNew = !item.id;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function uploadImage(file) {
    setUploading(true);
    try { const { file_url } = await backend.integrations.Core.UploadFile({ file }); set('image_url', file_url); }
    catch { toast({ title: 'Upload failed', variant: 'destructive' }); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.title_en) { toast({ title: 'Title (English) required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (isNew) await backend.entities.News.create(form);
      else await backend.entities.News.update(item.id, form);
      toast({ title: '✓' }); onSaved();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors';
  const labelCls = 'block text-xs uppercase tracking-wider text-zinc-500 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-zinc-900 rounded-t-2xl z-10">
          <h2 className="font-heading font-bold text-white text-xl">{isNew ? t.admin.addNews : t.admin.editNews}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>{t.admin.newsType}</label>
            <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="news">{t.news.news}</option>
              <option value="offer">{t.news.offer}</option>
              <option value="price_change">{t.news.price_change}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div><label className={labelCls}>{t.admin.titleEn}</label><input className={inputCls} value={form.title_en} onChange={e => set('title_en', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.titleKu}</label><input className={inputCls} dir="rtl" value={form.title_ku} onChange={e => set('title_ku', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.titleAr}</label><input className={inputCls} dir="rtl" value={form.title_ar} onChange={e => set('title_ar', e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>{t.admin.contentEn}</label><textarea rows={2} className={inputCls} value={form.content_en} onChange={e => set('content_en', e.target.value)} /></div>
          <div><label className={labelCls}>{t.admin.contentKu}</label><textarea rows={2} className={inputCls} dir="rtl" value={form.content_ku} onChange={e => set('content_ku', e.target.value)} /></div>
          <div><label className={labelCls}>{t.admin.contentAr}</label><textarea rows={2} className={inputCls} dir="rtl" value={form.content_ar} onChange={e => set('content_ar', e.target.value)} /></div>

          <div>
            <label className={labelCls}>{t.admin.newsImage}</label>
            {form.image_url ? (
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-white/10">
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => set('image_url', '')} className="absolute top-2 end-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-white/10 cursor-pointer hover:border-cyan-400/50 text-zinc-400 text-sm transition-all">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> {t.admin.uploadImage}</>}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
              </label>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.pinned} onChange={e => set('pinned', e.target.checked)} className="w-4 h-4 rounded accent-cyan-400" />
            <span className="text-sm text-zinc-300">{t.admin.pinTop}</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/5 sticky bottom-0 bg-zinc-900 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-zinc-300 text-sm font-medium hover:bg-white/5">{t.common.cancel}</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50">{saving ? t.common.loading : t.admin.save}</button>
        </div>
      </div>
    </div>
  );
}