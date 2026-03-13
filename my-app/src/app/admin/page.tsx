'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRsvpAdmin } from '@/hooks/admin/useRsvpAdmin';
import { useSeatingAdmin } from '@/hooks/admin/useSeatingAdmin';
import { WEDDING_DATE } from '@/utils/dateUtils';

export default function AdminDashboard() {
  const { rsvps, unreadCount, load: loadRsvps } = useRsvpAdmin();
  const { tables, load: loadTables } = useSeatingAdmin();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadRsvps(), loadTables()]).finally(() => setLoaded(true));
  }, [loadRsvps, loadTables]);

  const yesCount = rsvps.filter(r => r.responseRaw === 'yes').length;
  const noCount = rsvps.filter(r => r.responseRaw === 'no').length;
  const guestCount = rsvps.filter(r => r.responseRaw === 'yes').reduce((sum, r) => sum + r.guestCount, 0);
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedSeats = tables.reduce((sum, t) => sum + t.guests.filter(g => g.name).length, 0);

  const cards = [
    {
      href: '/admin/rsvp',
      icon: '📋',
      title: 'RSVP-svar',
      stats: [
        { label: 'Totalt', value: rsvps.length },
        { label: 'Kommer', value: yesCount, accent: true },
        { label: 'Gjester', value: guestCount, accent: true },
        { label: 'Kommer ikke', value: noCount },
      ],
      badge: unreadCount > 0 ? `${unreadCount} uleste` : undefined,
    },
    {
      href: '/admin/bordkart',
      icon: '🪑',
      title: 'Bordkart',
      stats: [
        { label: 'Bord', value: tables.length },
        { label: 'Opptatt', value: occupiedSeats, accent: true },
        { label: 'Ledige', value: totalCapacity - occupiedSeats },
        { label: 'Kapasitet', value: totalCapacity },
      ],
    },
    {
      href: '/admin/innhold',
      icon: '✏️',
      title: 'Innhold',
      description: 'Rediger tekster, program, kontaktinfo og alt annet innhold på nettsiden.',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D1B3D]">Dashboard</h1>
        <p className="text-sm text-[#4A2B5A]/60 mt-1">Alexandra &amp; Tobias · {WEDDING_DATE.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map(({ href, icon, title, stats, description, badge }) => (
            <Link
              key={href}
              href={href}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-[#E8B4B8]/30 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <h2 className="text-base font-bold text-[#2D1B3D]">{title}</h2>
                </div>
                {badge && (
                  <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded-full">{badge}</span>
                )}
              </div>

              {stats ? (
                <div className="grid grid-cols-2 gap-3">
                  {stats.map(({ label, value, accent }) => (
                    <div key={label} className={`rounded-xl p-3 ${accent ? 'bg-gradient-to-br from-[#E8B4B8]/20 to-[#F4A261]/20' : 'bg-gray-50'}`}>
                      <p className={`text-xl font-bold ${accent ? 'text-[#2D1B3D]' : 'text-[#4A2B5A]/70'}`}>{value}</p>
                      <p className="text-xs text-[#4A2B5A]/50 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#4A2B5A]/60">{description}</p>
              )}

              <div className="mt-4 text-xs text-[#E8B4B8] font-medium group-hover:text-[#F4A261] transition-colors">
                Gå til {title.toLowerCase()} →
              </div>
            </Link>
          ))}
        </div>
      )}

      {loaded && rsvps.length > 0 && (
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#2D1B3D]">Siste RSVP-svar</h2>
            <Link href="/admin/rsvp" className="text-xs text-[#E8B4B8] hover:text-[#F4A261] transition-colors">
              Se alle →
            </Link>
          </div>
          <div className="space-y-2">
            {[...rsvps]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(rsvp => (
                <div key={rsvp.id} className={`flex items-center justify-between p-3 rounded-xl ${!rsvp.is_read ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rsvp.responseRaw === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {rsvp.responseRaw === 'yes' ? 'Ja' : 'Nei'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#2D1B3D]">{rsvp.names.join(', ')}</p>
                      <p className="text-xs text-[#4A2B5A]/50">{rsvp.dateFormatted}</p>
                    </div>
                  </div>
                  {!rsvp.is_read && <span className="text-xs text-orange-500 font-medium">Ny</span>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
