'use client';

import { useEffect } from 'react';
import { useRsvpAdmin } from '@/hooks/admin/useRsvpAdmin';
import { RsvpStats } from '@/components/admin/rsvp/RsvpStats';
import { RsvpTable } from '@/components/admin/rsvp/RsvpTable';

export default function RsvpPage() {
  const { rsvps, loading, error, success, unreadCount, load, markRead, markAllRead, exportXlsx } = useRsvpAdmin();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[#2D1B3D]">RSVP-svar</h1>
        <div className="flex items-center gap-2">
          {success && <span className="text-green-700 text-sm">{success}</span>}
          {error && <span className="text-red-600 text-sm">{error}</span>}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm px-3 py-1.5 border border-[#E8B4B8] rounded-xl hover:bg-[#E8B4B8]/20 text-[#4A2B5A] transition-colors"
            >
              Merk alle lest ({unreadCount})
            </button>
          )}
          <button
            onClick={exportXlsx}
            className="text-sm px-4 py-1.5 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Eksporter Excel
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="text-sm px-3 py-1.5 border border-[#E8B4B8] rounded-xl hover:bg-[#E8B4B8]/20 text-[#4A2B5A] transition-colors disabled:opacity-50"
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {loading && rsvps.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
          <RsvpStats rsvps={rsvps} unreadCount={unreadCount} />
          <RsvpTable rsvps={rsvps} onMarkRead={markRead} />
        </div>
      )}
    </div>
  );
}
