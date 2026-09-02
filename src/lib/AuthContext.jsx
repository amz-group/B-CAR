import React, { createContext, useContext, useEffect, useState } from 'react';
import { backend, supabase } from '@/api/supabaseClient';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const checkUserAuth = async () => { try { setUser(await backend.auth.me()); } catch { setUser(null); } finally { setIsLoadingAuth(false); } };
  useEffect(() => { checkUserAuth(); const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setIsLoadingAuth(false); }); return () => data.subscription.unsubscribe(); }, []);
  const logout = async (redirect = true) => { setUser(null); await backend.auth.logout(redirect ? '/' : undefined); };
  return <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoadingAuth, isLoadingPublicSettings: false, authError: null, appPublicSettings: { public_settings: {} }, authChecked: !isLoadingAuth, logout, navigateToLogin: () => backend.auth.redirectToLogin(window.location.href), checkUserAuth, checkAppState: checkUserAuth }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within an AuthProvider'); return context; };
