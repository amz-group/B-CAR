import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Video, Car as CarIcon, Loader2 } from 'lucide-react';

const emptyCar = {
  name: '', brand: '', model: '', year: new Date().getFullYear(), price_per_day: 50,
  status: 'available', category: 'luxury', description_en: '', description_ku: '', description_ar: '',
  engine: '', transmission: 'automatic', seats: 5, images: [], video_url: '', featured: false, order: 0, discount_percentage: 0, rented_from: '', rented_until: ''
};

export default function AdminCars() {
  const { t } = useLang();
  const { toast } = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // car object or 'new' or null

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const list = await backend.entities.Car.list('order', 200);
      setCars(list || []);
    } catch { setCars([]); }
    finally { setLoading(false); }
  }

  async function toggleStatus(car) {
    const order = ['available', 'rented', 'unavailable'];
    const idx = order.indexOf(car.status || 'available');
    const newStatus = order[(idx + 1) % 3];
    const update = { status: newStatus };
    if (newStatus !== 'rented') { update.rented_from = ''; update.rented_until = ''; }
    try {
      await backend.entities.Car.update(car.id, update);
      setCars(cars.map(c => c.id === car.id ? { ...c, ...update } : c));
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function deleteCar(car) {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      await backend.entities.Car.delete(car.id);
      setCars(cars.filter(c => c.id !== car.id));
      toast({ title: '✓' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight">{t.admin.fleetMgmt}</h1>
          <p className="text-sm text-zinc-500 mt-1">{cars.length} {t.admin.fleetMgmt.toLowerCase()}</p>
        </div>
        <button onClick={() => setEditing({ ...emptyCar })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" />
          {t.admin.addCar}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cars.map(car => (
            <div key={car.id} className="group rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
              <div className="relative aspect-[3/2] bg-zinc-900">
                {car.images?.[0] ? (
                  <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700"><CarIcon className="w-12 h-12" /></div>
                )}
                <button
                  onClick={() => toggleStatus(car)}
                  className={`absolute top-3 start-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${car.status === 'available' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : car.status === 'rented' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'available' ? 'bg-emerald-400 animate-pulse' : car.status === 'rented' ? 'bg-sky-400' : 'bg-rose-400'}`} />
                  {car.status === 'available' ? t.admin.available : car.status === 'rented' ? t.admin.rented : t.admin.unavailable}
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">{car.name}</h3>
                    <p className="text-xs text-zinc-500">{car.brand} {car.model} · {car.year}</p>
                  {car.status === 'rented' && car.rented_until && (
                    <p className="text-xs text-sky-300 mt-1">{t.detail.rentedUntil} {car.rented_until}</p>
                  )}
                  </div>
                  <div className="text-end shrink-0">
                    {(car.discount_percentage || 0) > 0 ? (
                      <>
                        <div className="text-[11px] text-zinc-600 line-through leading-none">${car.price_per_day}</div>
                        <div className="text-sm font-heading font-bold text-amber-300">${(car.price_per_day * (1 - car.discount_percentage / 100)).toFixed(0)} <span className="text-[10px] text-amber-400/80">-{car.discount_percentage}%</span></div>
                      </>
                    ) : (
                      <span className="text-sm font-heading font-bold text-white">${car.price_per_day}</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setEditing({ ...car })} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-zinc-300 text-xs font-medium hover:bg-white/10 transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> {t.common.edit}
                  </button>
                  <button onClick={() => deleteCar(car)} className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CarEditor car={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function CarEditor({ car, onClose, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState(car);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isNew = !car.id;

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function uploadFile(file, type) {
    setUploading(true);
    try {
      const { file_url } = await backend.integrations.Core.UploadFile({ file });
      if (type === 'video') set('video_url', file_url);
      else set('images', [...(form.images || []), file_url].slice(0, 7));
    } catch { toast({ title: 'Upload failed', variant: 'destructive' }); }
    finally { setUploading(false); }
  }

  function removeImage(idx) {
    set('images', (form.images || []).filter((_, i) => i !== idx));
  }

  async function save() {
    if (!form.name || !form.brand || !form.price_per_day) {
      toast({ title: 'Name, brand, price required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) await backend.entities.Car.create(form);
      else await backend.entities.Car.update(car.id, form);
      toast({ title: '✓' });
      onSaved();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors';
  const labelCls = 'block text-xs uppercase tracking-wider text-zinc-500 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start lg:items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-zinc-900 rounded-t-2xl z-10">
          <h2 className="font-heading font-bold text-white text-xl">{isNew ? t.admin.addCar : t.admin.editCar}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>{t.admin.carName}</label><input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.brand}</label><input className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.model}</label><input className={inputCls} value={form.model} onChange={e => set('model', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.year}</label><input type="number" className={inputCls} value={form.year} onChange={e => set('year', parseInt(e.target.value) || 0)} /></div>
            <div><label className={labelCls}>{t.admin.price}</label><input type="number" className={inputCls} value={form.price_per_day} onChange={e => set('price_per_day', parseFloat(e.target.value) || 0)} /></div>
            <div><label className={labelCls}>{t.admin.discount}</label><input type="number" min="0" max="90" className={inputCls} value={form.discount_percentage || 0} onChange={e => set('discount_percentage', parseFloat(e.target.value) || 0)} placeholder="0" /></div>
            <div>
              <label className={labelCls}>{t.admin.category}</label>
              <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                {['sedan','suv','sports','luxury','van'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.admin.status}</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="available">{t.admin.available}</option>
                <option value="rented">{t.admin.rented}</option>
                <option value="unavailable">{t.admin.unavailable}</option>
              </select>
            </div>
            {form.status === 'rented' && (
              <>
                <div><label className={labelCls}>{t.admin.rentedFrom}</label><input type="date" className={inputCls} value={form.rented_from || ''} onChange={e => set('rented_from', e.target.value)} dir="ltr" /></div>
                <div><label className={labelCls}>{t.admin.rentedUntil}</label><input type="date" className={inputCls} value={form.rented_until || ''} onChange={e => set('rented_until', e.target.value)} dir="ltr" /></div>
              </>
            )}
            <div>
              <label className={labelCls}>{t.admin.transmission}</label>
              <select className={inputCls} value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div><label className={labelCls}>{t.admin.engine}</label><input className={inputCls} value={form.engine} onChange={e => set('engine', e.target.value)} placeholder="V8 4.0L" /></div>
            <div><label className={labelCls}>{t.admin.seats}</label><input type="number" className={inputCls} value={form.seats} onChange={e => set('seats', parseInt(e.target.value) || 0)} /></div>
          </div>

          <div><label className={labelCls}>{t.admin.descriptionEn}</label><textarea rows={2} className={inputCls} value={form.description_en} onChange={e => set('description_en', e.target.value)} /></div>
          <div><label className={labelCls}>{t.admin.descriptionKu}</label><textarea rows={2} className={inputCls} value={form.description_ku} onChange={e => set('description_ku', e.target.value)} dir="rtl" /></div>
          <div><label className={labelCls}>{t.admin.descriptionAr}</label><textarea rows={2} className={inputCls} value={form.description_ar} onChange={e => set('description_ar', e.target.value)} dir="rtl" /></div>

          {/* Images */}
          <div>
            <label className={labelCls}>{t.admin.images} ({(form.images || []).length}/7)</label>
            <div className="grid grid-cols-4 gap-2">
              {(form.images || []).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 end-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(form.images || []).length < 7 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all text-zinc-500">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-[10px]">{t.admin.uploadImage}</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'image')} />
                </label>
              )}
            </div>
          </div>

          {/* Video */}
          <div>
            <label className={labelCls}>{t.admin.video}</label>
            {form.video_url ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-white/10">
                <Video className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-sm text-zinc-300 truncate flex-1">{form.video_url}</span>
                <button onClick={() => set('video_url', '')} className="text-rose-400 hover:text-rose-300"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-white/10 cursor-pointer hover:border-cyan-400/50 text-zinc-400 text-sm transition-all">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> {t.admin.uploadVideo}</>}
                <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], 'video')} />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/5 sticky bottom-0 bg-zinc-900 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-zinc-300 text-sm font-medium hover:bg-white/5 transition-colors">{t.common.cancel}</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors">
            {saving ? t.common.loading : t.admin.save}
          </button>
        </div>
      </div>
    </div>
  );
}