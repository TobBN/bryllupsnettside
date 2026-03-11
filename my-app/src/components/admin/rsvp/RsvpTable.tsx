'use client';

import { useState } from 'react';
import type { RSVPItem } from '@/types/admin';

interface Props {
  rsvps: RSVPItem[];
  onMarkRead: (id: string) => void;
}

type Filter = 'all' | 'yes' | 'no' | 'unread';

export function RsvpTable({ rsvps, onMarkRead }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = rsvps.filter(r => {
    if (filter === 'yes' && r.responseRaw !== 'yes') return false;
    if (filter === 'no' && r.responseRaw !== 'no') return false;
    if (filter === 'unread' && r.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.names.some(n => n.toLowerCase().includes(q)) ||
        r.phone.includes(q)
      );
    }
    return true;
  });

  const filterButtons: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Alle' },
    { key: 'yes', label: 'Kommer' },
    { key: 'no', label: 'Kommer ikke' },
    { key: 'unread', label: 'Uleste' },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-1 bg-white/60 rounded-xl p-1">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white shadow-sm'
                  : 'text-[#4A2B5A]/70 hover:text-[#2D1B3D]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Søk navn eller telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-[#E8B4B8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] bg-white/60"
        />
        <span className="text-xs text-[#4A2B5A]/60 ml-auto">{filtered.length} svar</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#4A2B5A]/40">Ingen svar å vise</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(rsvp => (
            <div
              key={rsvp.id}
              className={`border rounded-xl p-4 transition-all ${
                !rsvp.is_read ? 'border-orange-300 bg-orange-50/60' : 'border-[#E8B4B8]/40 bg-white/50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      rsvp.responseRaw === 'yes'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {rsvp.responseRaw === 'yes' ? 'Kommer' : 'Kommer ikke'}
                    </span>
                    {!rsvp.is_read && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Ny</span>
                    )}
                    <span className="text-xs text-[#4A2B5A]/50">{rsvp.dateFormatted} {rsvp.timeFormatted}</span>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {rsvp.names.map((name, i) => (
                      <p key={i} className="text-sm font-medium text-[#2D1B3D]">
                        {name}
                        {rsvp.allergies[i] && (
                          <span className="ml-2 text-xs text-amber-600 font-normal">({rsvp.allergies[i]})</span>
                        )}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-[#4A2B5A]/60 mt-1">📞 {rsvp.phone} · {rsvp.guestCount} gjest{rsvp.guestCount !== 1 ? 'er' : ''}</p>
                </div>
                {!rsvp.is_read && (
                  <button
                    onClick={() => onMarkRead(rsvp.id)}
                    className="text-xs px-3 py-1.5 bg-white border border-[#E8B4B8] rounded-lg hover:bg-[#E8B4B8]/20 transition-colors text-[#4A2B5A] shrink-0"
                  >
                    Merk lest
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
