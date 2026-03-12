'use client';

import { useState, useCallback } from 'react';
import type { SeatingTable, GuestDraft } from '@/types/admin';

export function useSeatingAdmin() {
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seating');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Kunne ikke hente bord-data');
        return;
      }
      const result = await res.json();
      if (result.success && result.data) {
        setTables(result.data);
      }
    } catch {
      setError('Feil ved henting av bord-data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTable = async (table_number: number, capacity: number): Promise<boolean> => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number, capacity }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        flash('Bord opprettet!');
        await load();
        return true;
      }
      setError(data.error || 'Kunne ikke opprette bord');
      return false;
    } catch {
      setError('Feil ved opprettelse av bord');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTable = async (id: string, table_number: number, capacity: number): Promise<boolean> => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seating', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, table_number, capacity }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        flash('Bord oppdatert!');
        await load();
        return true;
      }
      setError(data.error || 'Kunne ikke oppdatere bord');
      return false;
    } catch {
      setError('Feil ved oppdatering av bord');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (id: string): Promise<boolean> => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seating?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        flash('Bord slettet!');
        await load();
        return true;
      }
      setError(data.error || 'Kunne ikke slette bord');
      return false;
    } catch {
      setError('Feil ved sletting av bord');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveGuests = async (tableId: string, currentGuests: GuestDraft[], existingGuests: GuestDraft[]): Promise<boolean> => {
    setError('');
    setLoading(true);
    try {
      // Delete removed guests
      for (const existing of existingGuests) {
        if (existing.id && !currentGuests.find(g => g.id === existing.id)) {
          const res = await fetch(`/api/admin/seating/guests?id=${existing.id}`, { method: 'DELETE' });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Kunne ikke slette gjest');
          }
        }
      }
      // Add or update guests
      for (const guest of currentGuests) {
        if (!guest.name.trim()) continue;
        if (guest.id) {
          const res = await fetch('/api/admin/seating/guests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: guest.id, table_id: tableId, name: guest.name.trim(), seat_number: guest.seat_number }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Kunne ikke oppdatere gjest');
          }
        } else {
          const res = await fetch('/api/admin/seating/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_id: tableId, name: guest.name.trim(), seat_number: guest.seat_number }),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Kunne ikke opprette gjest');
          }
        }
      }
      flash('Gjester lagret!');
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Feil ved lagring av gjester');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { tables, loading, error, success, load, createTable, updateTable, deleteTable, saveGuests };
}
