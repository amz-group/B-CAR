import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
const AdminAuthContext = createContext();
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); const [loading, setLoading] = useState(true);
  async function loadAdmin(user) { if (!user) { setAdmin(null); setLoading(false); return null; } const { data, error } = await supabase.from('admin_users').select('id,email,name,role,active').eq('auth_user_id', user.id).eq('active', true).single(); if (error) { await supabase.auth.signOut(); throw new Error('This account is not an active administrator'); } setAdmin(data); setLoading(false); return data; }
  useEffect(() => { supabase.auth.getUser().then(({ data }) => loadAdmin(data.user).catch(() => setLoading(false))); }, []);
  async function login(email, password) { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; return loadAdmin(data.user); }
  async function requestOtp(email) { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error; return { success: true }; }
  async function resetPassword(_email, _code, newPassword) { const { error } = await supabase.auth.updateUser({ password: newPassword }); if (error) throw error; return { success: true }; }
  async function createAdmin(email, name, password, role) { const { data, error } = await supabase.functions.invoke('create-admin', { body: { email, name, password, role } }); if (error) throw error; return data; }
  async function logout() { await supabase.auth.signOut(); setAdmin(null); }
  return <AdminAuthContext.Provider value={{ admin, loading, login, logout, requestOtp, resetPassword, createAdmin, isOwner: admin?.role === 'owner' }}>{children}</AdminAuthContext.Provider>;
}
export function useAdminAuth() { const ctx = useContext(AdminAuthContext); if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider'); return ctx; }
