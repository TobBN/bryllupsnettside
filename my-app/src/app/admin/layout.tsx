'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { useRsvpAdmin } from '@/hooks/admin/useRsvpAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checking, login, logout } = useAdminAuth();
  const { unreadCount, load: loadRsvps } = useRsvpAdmin();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) {
      loadRsvps();
    }
  }, [isAuthenticated, loadRsvps]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const err = await login(password);
    if (err) setLoginError(err);
    else setPassword('');
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-[#2D1B3D] mb-2 text-center">Admin</h1>
          <p className="text-center text-[#4A2B5A]/60 text-sm mb-6">Alexandra &amp; Tobias</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A2B5A] mb-2">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-base"
                autoFocus
                required
              />
            </div>
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold"
            >
              {loginLoading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4]">
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        <AdminSidebar onLogout={handleLogout} unreadCount={unreadCount} />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
