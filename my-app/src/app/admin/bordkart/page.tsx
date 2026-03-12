'use client';

import { useEffect, useState } from 'react';
import { useSeatingAdmin } from '@/hooks/admin/useSeatingAdmin';
import { TableCard } from '@/components/admin/seating/TableCard';

export default function BordkartPage() {
  const { tables, loading, error, success, load, createTable, updateTable, deleteTable, saveGuests } = useSeatingAdmin();
  const [newNumber, setNewNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('8');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setFormError('');
    const tn = parseInt(newNumber, 10);
    const cap = parseInt(newCapacity, 10);
    if (!tn || tn < 1) { setFormError('Ugyldig bord-nummer'); return; }
    if (cap < 1 || cap > 20) { setFormError('Kapasitet må være 1–20'); return; }
    const ok = await createTable(tn, cap);
    if (ok) { setNewNumber(''); setNewCapacity('8'); }
  };

  const totalGuests = tables.reduce((sum, t) => sum + t.guests.filter(g => g.name).length, 0);
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  return (
    <div>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2D1B3D]">Bordkart</h1>
          {tables.length > 0 && (
            <p className="text-xs text-[#4A2B5A]/60 mt-0.5">{tables.length} bord · {totalGuests}/{totalCapacity} plasser opptatt</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {success && <span className="text-green-700 text-sm">{success}</span>}
          {error && <span className="text-red-600 text-sm">{error}</span>}
          <button
            onClick={load}
            disabled={loading}
            className="text-sm px-3 py-1.5 border border-[#E8B4B8] rounded-xl hover:bg-[#E8B4B8]/20 text-[#4A2B5A] transition-colors disabled:opacity-50"
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {/* Create table form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md mb-5">
        <h2 className="text-sm font-semibold text-[#2D1B3D] mb-3">Opprett nytt bord</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Bord-nummer</label>
            <input
              type="number"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="1"
              min="1"
              className="w-28 px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Antall plasser</label>
            <input
              type="number"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              min="1"
              max="20"
              className="w-28 px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-medium text-sm"
          >
            Opprett bord
          </button>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
        </div>
      </div>

      {loading && tables.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-16 text-[#4A2B5A]/40">Ingen bord opprettet ennå</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...tables].sort((a, b) => a.table_number - b.table_number).map(table => (
            <TableCard
              key={table.id}
              table={table}
              onUpdate={updateTable}
              onDelete={deleteTable}
              onSaveGuests={saveGuests}
            />
          ))}
        </div>
      )}
    </div>
  );
}
