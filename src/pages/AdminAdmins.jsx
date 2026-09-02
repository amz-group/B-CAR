import React, { useState, useEffect } from 'react';
import { backend } from '@/api/supabaseClient';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import { useLang } from '@/lib/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Loader2, Shield, User, Mail, Lock } from 'lucide-react';

export default function AdminAdmins() {
  const { isOwner, createAdmin } = useAdminAuth();
  const { t } = useLang();
  const { toast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const list = await backend.entities.AdminUser.list();
      setAdmins(list || []);
    } catch { setAdmins([]); }
    finally { setLoading(false); }
  }

  async function toggleActive(admin) {
    try {
      await backend.entities.AdminUser.update(admin.id, { active: !admin.active });
      load();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  }

  if (!isOwner) {
    return <div className="flex flex-col items-center justify-center py-20 text-center">
      <Shield className="w-12 h-12 text-zinc-700 mb-4" />
      <p className="text-zinc-400">{t.admin.ownerOnly}</p>
    </div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight">{t.admin.admins}</h1>
          <p className="text-sm text-zinc-500 mt-1">{t.admin.ownerOnly}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" />
          {t.admin.addAdmin}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {admins.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.03]">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${a.role === 'owner' ? 'bg-cyan-400/15 text-cyan-400' : 'bg-white/5 text-zinc-400'}`}>
                {a.role === 'owner' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{a.name}</div>
                <div className="text-xs text-zinc-500 font-mono truncate" dir="ltr">{a.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-zinc-500">{a.role === 'owner' ? t.admin.owner : t.admin.admin}</span>
                {a.role !== 'owner' && (
                  <button
                    onClick={() => toggleActive(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${a.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-700/30 text-zinc-400'}`}
                  >
                    {a.active ? t.admin.active : t.admin.inactive}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddAdminModal onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); load(); }} createAdmin={createAdmin} />}
    </div>
  );
}

function AddAdminModal({ onClose, onDone, createAdmin }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.email || !form.password) { toast({ title: 'Email & password required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await createAdmin(form.email, form.name, form.password, form.role);
      toast({ title: '✓' });
      onDone();
    } catch (err) {
      toast({ title: err.response?.data?.error || 'Failed', variant: 'destructive' });
    } finally { setSaving(false); }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="font-heading font-bold text-white text-xl">{t.admin.addAdmin}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative"><User className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-500" /><input className={inputCls + ' ps-11'} placeholder={t.admin.adminName} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div className="relative"><Mail className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-500" /><input className={inputCls + ' ps-11'} dir="ltr" placeholder={t.admin.adminEmail} value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="relative"><Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-500" /><input type="password" className={inputCls + ' ps-11'} placeholder={t.admin.adminPassword} value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5">{t.admin.adminRole}</label>
            <select className={inputCls} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="admin">{t.admin.admin}</option>
            </select>
            <p className="text-xs text-zinc-600 mt-1.5">{t.admin.ownerOnly} — {t.admin.admin}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/5">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-zinc-300 text-sm font-medium hover:bg-white/5">{t.common.cancel}</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50">
            {saving ? t.common.loading : t.admin.addAdmin}
          </button>
        </div>
      </div>
    </div>
  );
}