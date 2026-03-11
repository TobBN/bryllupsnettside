'use client';

import { useState } from 'react';
import type { SeatingTable, GuestDraft } from '@/types/admin';

interface Props {
  table: SeatingTable;
  onUpdate: (id: string, table_number: number, capacity: number) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSaveGuests: (tableId: string, guests: GuestDraft[], existing: GuestDraft[]) => Promise<boolean>;
}

const inputClass = "w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";

export function TableCard({ table, onUpdate, onDelete, onSaveGuests }: Props) {
  const [editing, setEditing] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [editNumber, setEditNumber] = useState(String(table.table_number));
  const [editCapacity, setEditCapacity] = useState(String(table.capacity));
  const [localError, setLocalError] = useState('');

  // Initialize guest drafts from current table data
  const buildDrafts = (): GuestDraft[] => {
    const seats: GuestDraft[] = [];
    for (let i = 1; i <= table.capacity; i++) {
      const existing = table.guests.find(g => g.seat_number === i);
      seats.push(existing ? { id: existing.id, name: existing.name, seat_number: i } : { name: '', seat_number: i });
    }
    return seats;
  };

  const [guestDrafts, setGuestDrafts] = useState<GuestDraft[]>(buildDrafts);

  const handleUpdate = async () => {
    setLocalError('');
    const tn = parseInt(editNumber, 10);
    const cap = parseInt(editCapacity, 10);
    if (!tn || tn < 1) { setLocalError('Ugyldig bord-nummer'); return; }
    if (cap < 1 || cap > 20) { setLocalError('Kapasitet må være 1–20'); return; }
    const ok = await onUpdate(table.id, tn, cap);
    if (ok) setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Slette bord ${table.table_number}? Alle gjester på bordet vil også bli slettet.`)) return;
    await onDelete(table.id);
  };

  const handleSaveGuests = async () => {
    const existing: GuestDraft[] = table.guests.map(g => ({ id: g.id, name: g.name, seat_number: g.seat_number }));
    await onSaveGuests(table.id, guestDrafts, existing);
  };

  const handleToggleGuests = () => {
    if (!showGuests) {
      setGuestDrafts(buildDrafts());
    }
    setShowGuests(v => !v);
  };

  const occupiedCount = table.guests.filter(g => g.name).length;

  return (
    <div className="border border-[#E8B4B8]/50 rounded-2xl bg-white/60 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-3">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <div>
              <label className="block text-xs text-[#4A2B5A]/60 mb-0.5">Bord #</label>
              <input type="number" value={editNumber} onChange={(e) => setEditNumber(e.target.value)} className="w-20 px-2 py-1.5 border border-[#E8B4B8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]" min="1" />
            </div>
            <div>
              <label className="block text-xs text-[#4A2B5A]/60 mb-0.5">Plasser</label>
              <input type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} className="w-20 px-2 py-1.5 border border-[#E8B4B8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]" min="1" max="20" />
            </div>
            {localError && <p className="text-xs text-red-500">{localError}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#F4A261] flex items-center justify-center text-white font-bold text-sm">
              {table.table_number}
            </div>
            <div>
              <p className="font-semibold text-[#2D1B3D] text-sm">Bord {table.table_number}</p>
              <p className="text-xs text-[#4A2B5A]/60">{occupiedCount}/{table.capacity} plasser opptatt</p>
            </div>
            <div className="flex gap-1 ml-1">
              {Array.from({ length: table.capacity }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < occupiedCount ? 'bg-green-400' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <>
              <button onClick={handleUpdate} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium">Lagre</button>
              <button onClick={() => { setEditing(false); setLocalError(''); }} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Avbryt</button>
            </>
          ) : (
            <>
              <button onClick={handleToggleGuests} className="text-xs px-3 py-1.5 border border-[#E8B4B8] rounded-lg hover:bg-[#E8B4B8]/20 text-[#4A2B5A] transition-colors">
                {showGuests ? 'Skjul' : 'Gjester'}
              </button>
              <button onClick={() => { setEditing(true); setEditNumber(String(table.table_number)); setEditCapacity(String(table.capacity)); }} className="text-xs px-3 py-1.5 border border-[#E8B4B8] rounded-lg hover:bg-[#E8B4B8]/20 text-[#4A2B5A] transition-colors">Rediger</button>
              <button onClick={handleDelete} className="text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors">Slett</button>
            </>
          )}
        </div>
      </div>

      {/* Guest editor */}
      {showGuests && (
        <div className="border-t border-[#E8B4B8]/40 p-4 bg-white/40">
          <div className="space-y-2 mb-3">
            {guestDrafts.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-[#4A2B5A]/50 w-5 text-right shrink-0">{g.seat_number}</span>
                <input
                  type="text"
                  value={g.name}
                  onChange={(e) => {
                    const updated = [...guestDrafts];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setGuestDrafts(updated);
                  }}
                  placeholder={`Plass ${g.seat_number}`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveGuests}
            className="w-full py-2 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Lagre gjester
          </button>
        </div>
      )}
    </div>
  );
}
