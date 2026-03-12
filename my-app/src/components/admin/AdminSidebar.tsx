'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/innhold', label: 'Innhold', icon: '✏️' },
  { href: '/admin/rsvp', label: 'RSVP', icon: '📋' },
  { href: '/admin/bordkart', label: 'Bordkart', icon: '🪑' },
];

interface AdminSidebarProps {
  onLogout: () => void;
  unreadCount?: number;
}

export function AdminSidebar({ onLogout, unreadCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex flex-col gap-2 h-fit sticky top-6">
      <div className="text-center pb-3 border-b border-[#E8B4B8] mb-1">
        <p className="text-xs text-[#4A2B5A]/60 font-medium uppercase tracking-wide">Bryllupsadmin</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-[#E8B4B8]/30 to-[#F4A261]/20 text-[#2D1B3D]'
                  : 'text-[#4A2B5A]/70 hover:bg-[#E8B4B8]/20 hover:text-[#2D1B3D]'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {label === 'RSVP' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-3 border-t border-[#E8B4B8]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#4A2B5A]/70 hover:bg-[#E8B4B8]/20 hover:text-[#2D1B3D] transition-colors mb-1"
        >
          <span>🌐</span>
          <span>Se nettsiden</span>
        </a>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          <span>Logg ut</span>
        </button>
      </div>
    </aside>
  );
}
