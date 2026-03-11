'use client';

import { useState, useCallback } from 'react';
import type { RSVPItem } from '@/types/admin';

export function useRsvpAdmin() {
  const [rsvps, setRsvps] = useState<RSVPItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/rsvp/list');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Kunne ikke hente RSVP-data');
        return;
      }
      const result = await res.json();
      if (result.success && result.data) {
        setRsvps(result.data);
        setUnreadCount(result.data.filter((r: RSVPItem) => !r.is_read).length);
      }
    } catch {
      setError('Feil ved henting av RSVP-data');
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = async (rsvpId: string) => {
    setError('');
    try {
      const res = await fetch('/api/admin/rsvp/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_id: rsvpId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRsvps(prev => prev.map(r => r.id === rsvpId ? { ...r, is_read: true } : r));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setError(data.error || 'Kunne ikke markere som lest');
      }
    } catch {
      setError('Feil ved markering av RSVP');
    }
  };

  const markAllRead = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/rsvp/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRsvps(prev => prev.map(r => ({ ...r, is_read: true })));
        setUnreadCount(0);
        flash('Alle RSVP-svar markert som lest');
      } else {
        setError(data.error || 'Kunne ikke markere alle som lest');
      }
    } catch {
      setError('Feil ved markering');
    }
  };

  const exportXlsx = async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/rsvp/export');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Kunne ikke eksportere');
        return;
      }
      const contentDisposition = res.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'rsvp-svar.xlsx'
        : 'rsvp-svar.xlsx';
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      flash('RSVP-data eksportert!');
    } catch {
      setError('Feil ved eksport');
    }
  };

  return { rsvps, loading, error, success, unreadCount, load, markRead, markAllRead, exportXlsx };
}
