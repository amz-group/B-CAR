import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useLang } from '@/lib/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, X, Loader2, CalendarCheck, Check, Ban, Car as CarIcon, Phone } from 'lucide-react';

const empty = { car_id: '', car_name: '', customer_name: '', customer_phone: '', start_date: '', end_date: '', status: 'active', notes: '' };

export default function AdminRentals() {
  const { t } = useLang();
  const { toast } = useToast();
  const [rentals, setRentals] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [list, carList] = await Promise.all([
        backend.entities.Rental.list('-start_date', 200),
        backend.entities.Car.list('order', 200)
      ]);
      setRentals(list || []);
      setCars(carList || []);
    } catch { setRentals([]); }
    finally { setLoading(false); }
  }

  async function syncCar(carId) {
    if (!carId) return;
    const today = new Date().toISOString().slice(0, 10);
    const active = await backend.entities.Rental.filter({ car_id: carId, status: 'active' }, 'start_date', 100);
    const list = active || [];
    const current = list.find(r => r.start_date <= today && r.end_date >= today);
    const upcoming = list.filter(r => r.start_date > today).sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
    const target = current || upcoming;
    try {
      if (target) {
        await backend.entities.Car.update(carId, { status: 'rented', rented_from: target.start_date, rented_until: target.end_date });
      } else {
        const car = cars.find(c => c.id === carId);
        if (car?.status !== 'unavailable') {
          await backend.entities.Car.update(carId, { status: 'available', rented_from: '', rented_until: '' });
        }
      }
    } catch {}
  }

  async function complete(r) {
    try { await backend.entities.Rental.update(r.id, { status: 'completed' }); await syncCar(r.car_id); load(); toast({ title: '✓' }); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function cancel(r) {
    try { await backend.entities.Rental.update(r.id, { status: 'cancelled' }); await syncCar(r.car_id); load(); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  async function del(r) {
    if (!confirm(t.admin.confirmDeleteRental)) return;
    try { await backend.entities.Rental.delete(r.id); await syncCar(r.car_id); setRentals(rentals.filter(x => x.id !== r.id)); }
    catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  const filtered = rentals.filter(r => filter === 'all' ? true : r.status === filter);
  const statusChip = {
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    completed: 'bg-zinc-600/20 text-zinc-300 border-zinc-500/30',
    cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  };
  const statusLabel = { active: t.admin.rentalActive, completed: t.admin.rentalCompleted, cancelled: t.admin.rentalCancelled };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight">{t.admin.rentalsMgmt}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t.admin.rentalsSubtitle}</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" /> {t.admin.addRental}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { k: 'active', label: t.admin.rentalActive },
          { k: 'completed', label: t.admin.rentalCompleted },
          { k: 'cancelled', label: t.admin.rentalCancelled },
          { k: 'all', label: t.reviews.allTab }
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f.k ? 'bg-white text-zinc-950' : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'}`}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <CalendarCheck className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">{t.admin.rentalEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const car = cars.find(c => c.id === r.car_id);
            return (
              <div key={r.id} className="p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                      {car?.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CarIcon className="w-5 h-5 text-zinc-700" /></div>}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{r.car_name}</div>
                      <div className="text-sm text-zinc-400 mt-0.5 font-mono" dir="ltr">{r.start_date} → {r.end_date}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                        <span>{r.customer_name}</span>
                        {r.customer_phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" /> {r.customer_phone}</span>}
                      </div>
                      {r.notes && <p className="text-xs text-zinc-500 mt-1.5">{r.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusChip[r.status]}`}>{statusLabel[r.status]}</span>
                    {r.status === 'active' && (
                      <>
                        <button onClick={() => complete(r)} title={t.admin.completeRental} className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => cancel(r)} title={t.admin.cancelRental} className="p-2 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-colors"><Ban className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => setEditing({ ...r })} className="p-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(r)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <RentalEditor rental={editing} cars={cars} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} syncCar={syncCar} />}
    </div>
  );
}

function RentalEditor({ rental, cars, onClose, onSaved, syncCar }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState(rental);
  const [saving, setSaving] = useState(false);
  const isNew = !rental.id;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.car_id || !form.customer_name || !form.start_date || !form.end_date) {
      toast({ title: 'Car, customer, dates required', variant: 'destructive' }); return;
    }
    if (form.end_date < form.start_date) { toast({ title: 'End date before start', variant: 'destructive' }); return; }
    const car = cars.find(c => c.id === form.car_id);
    const payload = { ...form, car_name: car?.name || form.car_name || '' };
    setSaving(true);
    try {
      if (isNew) await backend.entities.Rental.create(payload);
      else await backend.entities.Rental.update(rental.id, payload);
      await syncCar(form.car_id);
      toast({ title: '✓' }); onSaved();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors';
  const labelCls = 'block text-xs uppercase tracking-wider text-zinc-500 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-zinc-900 rounded-t-2xl z-10">
          <h2 className="font-heading font-bold text-white text-xl">{isNew ? t.admin.addRental : t.admin.editRental}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>{t.admin.rentalCar}</label>
            <select className={inputCls} value={form.car_id} onChange={e => set('car_id', e.target.value)}>
              <option value="">—</option>
              {cars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.brand})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>{t.admin.rentalCustomer}</label><input className={inputCls} value={form.customer_name} onChange={e => set('customer_name', e.target.value)} /></div>
            <div><label className={labelCls}>{t.admin.rentalPhone}</label><input className={inputCls} value={form.customer_phone || ''} onChange={e => set('customer_phone', e.target.value)} dir="ltr" /></div>
            <div><label className={labelCls}>{t.admin.rentalStart}</label><input type="date" className={inputCls} value={form.start_date} onChange={e => set('start_date', e.target.value)} dir="ltr" /></div>
            <div><label className={labelCls}>{t.admin.rentalEnd}</label><input type="date" min={form.start_date || undefined} className={inputCls} value={form.end_date} onChange={e => set('end_date', e.target.value)} dir="ltr" /></div>
          </div>
          <div>
            <label className={labelCls}>{t.admin.rentalStatus}</label>
            <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">{t.admin.rentalActive}</option>
              <option value="completed">{t.admin.rentalCompleted}</option>
              <option value="cancelled">{t.admin.rentalCancelled}</option>
            </select>
          </div>
          <div><label className={labelCls}>{t.admin.rentalNotes}</label><textarea rows={2} className={inputCls} value={form.notes || ''} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/5 sticky bottom-0 bg-zinc-900 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-zinc-300 text-sm font-medium hover:bg-white/5">{t.common.cancel}</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50">{saving ? t.common.loading : t.admin.save}</button>
        </div>
      </div>
    </div>
  );
}