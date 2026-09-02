import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import { useLang } from '@/lib/LanguageContext';
import { Car, Settings, Users, LogOut, ShieldCheck, Menu, X, Newspaper, Star, CalendarCheck } from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout, isOwner } = useAdminAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!admin) return <Navigate to="/admin" replace />;

  const links = [
    { to: '/admin/dashboard', label: t.admin.fleetMgmt, Icon: Car, ownerOnly: false },
    { to: '/admin/rentals', label: t.admin.rentalsMgmt, Icon: CalendarCheck, ownerOnly: false },
    { to: '/admin/news', label: t.admin.newsMgmt, Icon: Newspaper, ownerOnly: false },
    { to: '/admin/reviews', label: t.admin.reviewsMgmt, Icon: Star, ownerOnly: false },
    { to: '/admin/settings', label: t.admin.settings, Icon: Settings, ownerOnly: true },
    { to: '/admin/admins', label: t.admin.admins, Icon: Users, ownerOnly: true }
  ].filter(l => !l.ownerOnly || isOwner);

  function handleLogout() {
    logout();
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 inset-y-0 start-0 z-40 w-64 bg-zinc-900/80 backdrop-blur-2xl border-e border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0 rtl:translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-zinc-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="font-heading font-bold text-white text-sm leading-tight">{t.admin.dashboard}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{admin.role}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="px-4 py-2 mb-2">
            <div className="text-sm text-white font-medium truncate">{admin.name}</div>
            <div className="text-xs text-zinc-500 font-mono" dir="ltr">{admin.phone}</div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut className="w-4 h-4" />
            {t.admin.logout}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6 text-white" /></button>
          <span className="font-heading font-bold text-white text-sm">{t.admin.dashboard}</span>
          <div className="w-6" />
        </div>
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}