import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase environment variables');

export const supabase = createClient(supabaseUrl, supabaseKey);
const tableNames = { AdminUser: 'admin_users', Car: 'cars', News: 'news', NotifyRequest: 'notify_requests', OtpCode: 'otp_codes', Rental: 'rentals', Review: 'reviews', SiteSettings: 'site_settings' };
function unwrap({ data, error }) { if (error) throw error; return data; }

function entity(name) {
  const table = tableNames[name];
  return {
    async list(sort = '-created_date', limit = 100) {
      const descending = sort.startsWith('-'); const column = sort.replace(/^-/, '') || 'created_date';
      return unwrap(await supabase.from(table).select('*').order(column, { ascending: !descending }).limit(limit));
    },
    async filter(filters = {}, sort = '-created_date', limit = 100) {
      const descending = sort.startsWith('-'); const column = sort.replace(/^-/, '') || 'created_date';
      let query = supabase.from(table).select('*');
      Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
      return unwrap(await query.order(column, { ascending: !descending }).limit(limit));
    },
    async get(id) { return unwrap(await supabase.from(table).select('*').eq('id', id).single()); },
    async create(values) { return unwrap(await supabase.from(table).insert(values).select().single()); },
    async update(id, values) { return unwrap(await supabase.from(table).update(values).eq('id', id).select().single()); },
    async delete(id) { unwrap(await supabase.from(table).delete().eq('id', id)); return true; },
  };
}

async function uploadFile({ file }) {
  const extension = file.name?.split('.').pop() || 'bin';
  const path = `${crypto.randomUUID()}.${extension}`;
  unwrap(await supabase.storage.from('media').upload(path, file, { contentType: file.type }));
  return { file_url: supabase.storage.from('media').getPublicUrl(path).data.publicUrl };
}

export const backend = {
  entities: Object.fromEntries(Object.keys(tableNames).map((name) => [name, entity(name)])),
  integrations: { Core: { UploadFile: uploadFile } },
  functions: { async invoke(name, body) { const functionName = name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`); const { data, error } = await supabase.functions.invoke(functionName, { body }); if (error) throw error; return { data }; } },
  auth: {
    async me() { const { data, error } = await supabase.auth.getUser(); if (error) throw error; return data.user; },
    async register({ email, password }) { return unwrap(await supabase.auth.signUp({ email, password })); },
    async verifyOtp({ email, otpCode }) { const data = unwrap(await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' })); return data.session || data; },
    async resendOtp(email) { return unwrap(await supabase.auth.resend({ type: 'signup', email })); },
    async loginViaEmailPassword(email, password) { return unwrap(await supabase.auth.signInWithPassword({ email, password })); },
    async loginWithProvider(provider, redirectTo = window.location.origin) { return unwrap(await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })); },
    async logout(redirectTo) { await supabase.auth.signOut(); if (redirectTo) window.location.href = '/'; },
    redirectToLogin(returnTo = '/') { window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`; },
    async resetPasswordRequest(email) { return unwrap(await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })); },
    async resetPassword({ newPassword }) { return unwrap(await supabase.auth.updateUser({ password: newPassword })); },
    setToken() {},
  },
};
