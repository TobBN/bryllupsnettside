'use client';

import type { RSVPItem } from '@/types/admin';

interface Props {
  rsvps: RSVPItem[];
  unreadCount: number;
}

export function RsvpStats({ rsvps, unreadCount }: Props) {
  const yes = rsvps.filter(r => r.responseRaw === 'yes');
  const no = rsvps.filter(r => r.responseRaw === 'no');
  const guestCount = yes.reduce((sum, r) => sum + r.guestCount, 0);

  const stats = [
    { label: 'Totalt svar', value: rsvps.length, color: 'text-[#2D1B3D]', bg: 'bg-white/60' },
    { label: 'Kommer', value: yes.length, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Gjester totalt', value: guestCount, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Kommer ikke', value: no.length, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Uleste', value: unreadCount, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {stats.map(({ label, value, color, bg }) => (
        <div key={label} className={`${bg} rounded-xl p-4 text-center border border-[#E8B4B8]/30`}>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-[#4A2B5A]/60 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
