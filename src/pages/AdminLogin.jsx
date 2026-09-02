import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import { useLang } from '@/lib/LanguageContext';
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const { login, requestOtp, resetPassword } = useAdminAuth();
  const { t, dir } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | forgotOtp | forgotReset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const Arrow = dir === 'rtl' ? 'rotate-180' : '';

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(t.admin.invalid);
    } finally { setLoading(false); }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      await requestOtp(email);
      setInfo(t.admin.otpSent);
      setMode('forgotReset');
    } catch (err) {
      setError(err.response?.data?.error || t.admin.invalid);
    } finally { setLoading(false); }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setMode('login'); setPassword(''); setOtp(''); setNewPassword('');
      setInfo(t.admin.reset + ' ✓');
    } catch (err) {
      setError(err.response?.data?.error || t.admin.invalid);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 -start-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -end-20 w-96 h-96 bg-zinc-700/20 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-zinc-700 items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-zinc-950" />
          </div>
          <h1 className="font-heading font-extrabold text-white text-3xl tracking-tight">
            {mode === 'login' ? t.admin.loginTitle : t.admin.otpTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{mode === 'login' ? t.admin.loginSubtitle : t.admin.otpSubtitle}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8">
          {error && <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
          {info && <div className="mb-4 px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm">{info}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field icon={Mail} placeholder={t.admin.email} value={email} onChange={setEmail} dir="ltr" />
              <Field icon={Lock} placeholder={t.admin.password} value={password} onChange={setPassword} type="password" />
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors">
                {loading ? t.common.loading : t.admin.login}
                <ArrowRight className={`w-4 h-4 ${Arrow}`} />
              </button>
              <button type="button" onClick={() => { setMode('forgotOtp'); setError(''); setInfo(''); }} className="w-full text-sm text-zinc-500 hover:text-cyan-400 transition-colors">
                {t.admin.forgot}
              </button>
            </form>
          )}

          {mode === 'forgotOtp' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Field icon={Mail} placeholder={t.admin.email} value={email} onChange={setEmail} dir="ltr" />
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors">
                {loading ? t.common.loading : t.admin.sendOtp}
              </button>
              <button type="button" onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="w-full text-sm text-zinc-500 hover:text-cyan-400">
                {t.admin.backToLogin}
              </button>
            </form>
          )}

          {mode === 'forgotReset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <Field icon={KeyRound} placeholder={t.admin.otpPlaceholder} value={otp} onChange={setOtp} dir="ltr" maxLength={6} />
              <Field icon={Lock} placeholder={t.admin.newPassword} value={newPassword} onChange={setNewPassword} type="password" />
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 text-zinc-950 font-semibold text-sm hover:bg-cyan-300 disabled:opacity-50 transition-colors">
                {loading ? t.common.loading : t.admin.reset}
              </button>
              <button type="button" onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="w-full text-sm text-zinc-500 hover:text-cyan-400">
                {t.admin.backToLogin}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = 'text', dir, maxLength }) {
  return (
    <div className="relative">
      <Icon className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-zinc-500" />
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={dir} maxLength={maxLength}
        className="w-full ps-11 pe-4 py-3.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none transition-colors"
      />
    </div>
  );
}