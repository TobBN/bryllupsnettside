'use client';

import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";

const defaultSchedule = {
  title: 'Program',
  subtitle: 'Tidsplan for dagen',
  items: [],
};

export function ScheduleEditor({ content, update }: Props) {
  const schedule = content.weddingDetails.schedule ?? defaultSchedule;

  const setSchedule = (val: typeof schedule) => update(['weddingDetails', 'schedule'], val);

  const addItem = () => {
    setSchedule({ ...schedule, items: [...schedule.items, { time: '', title: '', description: '' }] });
  };

  const removeItem = (i: number) => {
    setSchedule({ ...schedule, items: schedule.items.filter((_, idx) => idx !== i) });
  };

  const updateItem = (i: number, field: string, value: string) => {
    setSchedule({
      ...schedule,
      items: schedule.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
    });
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-[#2D1B3D] mb-4 flex items-center gap-2">
        <span>🗓️</span> Program
      </h2>
      <div className="space-y-3 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Overskrift</label>
            <input type="text" value={schedule.title} onChange={(e) => setSchedule({ ...schedule, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Undertittel</label>
            <input type="text" value={schedule.subtitle} onChange={(e) => setSchedule({ ...schedule, subtitle: e.target.value })} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#2D1B3D]">Programpunkter ({schedule.items.length})</span>
        <button onClick={addItem} className="text-sm px-3 py-1.5 bg-[#E8B4B8]/30 hover:bg-[#E8B4B8]/50 text-[#2D1B3D] rounded-lg transition-colors font-medium">
          + Legg til
        </button>
      </div>

      <div className="space-y-2">
        {schedule.items.map((item, i) => (
          <div key={i} className="border border-[#E8B4B8]/60 rounded-xl p-3 bg-white/40 flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-12 gap-2">
              <div className="col-span-3">
                <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Tid</label>
                <input type="text" value={item.time} onChange={(e) => updateItem(i, 'time', e.target.value)} className={inputClass} placeholder="10:00" />
              </div>
              <div className="col-span-4">
                <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Tittel</label>
                <input type="text" value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} className={inputClass} placeholder="Vielse" />
              </div>
              <div className="col-span-5">
                <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Beskrivelse (valgfritt)</label>
                <input type="text" value={item.description ?? ''} onChange={(e) => updateItem(i, 'description', e.target.value)} className={inputClass} />
              </div>
            </div>
            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs mt-6 shrink-0">✕</button>
          </div>
        ))}
      </div>
    </section>
  );
}
