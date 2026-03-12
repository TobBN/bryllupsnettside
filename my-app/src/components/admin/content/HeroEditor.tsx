'use client';

import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

export function HeroEditor({ content, update }: Props) {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-[#2D1B3D] mb-4 flex items-center gap-2">
        <span>🌸</span> Hero-seksjon
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Brudens navn">
            <input
              type="text"
              value={content.hero.names.bride}
              onChange={(e) => update(['hero', 'names', 'bride'], e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Brudgommens navn">
            <input
              type="text"
              value={content.hero.names.groom}
              onChange={(e) => update(['hero', 'names', 'groom'], e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Dato">
            <input
              type="text"
              value={content.hero.date}
              onChange={(e) => update(['hero', 'date'], e.target.value)}
              className={inputClass}
              placeholder="24. juli 2026"
            />
          </Field>
          <Field label="Lokasjon">
            <input
              type="text"
              value={content.hero.location}
              onChange={(e) => update(['hero', 'location'], e.target.value)}
              className={inputClass}
              placeholder="Østgaard, Halden"
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4A2B5A] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";
