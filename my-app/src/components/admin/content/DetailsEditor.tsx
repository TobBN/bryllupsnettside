'use client';

import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";
const textareaClass = `${inputClass} resize-y`;

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40">
      <h3 className="text-sm font-semibold text-[#2D1B3D] mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#4A2B5A] mb-1">{label}</label>
      {children}
    </div>
  );
}

export function DetailsEditor({ content, update }: Props) {
  const { weddingDetails: d } = content;

  const addGiftLink = () => {
    const links = [...(d.gifts.links || []), { url: '', label: '' }];
    update(['weddingDetails', 'gifts', 'links'], links);
  };

  const removeGiftLink = (i: number) => {
    update(['weddingDetails', 'gifts', 'links'], d.gifts.links.filter((_, idx) => idx !== i));
  };

  const updateGiftLink = (i: number, field: 'url' | 'label', value: string) => {
    update(
      ['weddingDetails', 'gifts', 'links'],
      d.gifts.links.map((l, idx) => idx === i ? { ...l, [field]: value } : l)
    );
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-[#2D1B3D] mb-4 flex items-center gap-2">
        <span>💍</span> Praktisk informasjon
      </h2>
      <div className="space-y-4">
        <SubSection title="📍 Sted">
          <Field label="Tittel">
            <input type="text" value={d.venue.title} onChange={(e) => update(['weddingDetails', 'venue', 'title'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Beskrivelse">
            <textarea value={d.venue.description} onChange={(e) => update(['weddingDetails', 'venue', 'description'], e.target.value)} rows={2} className={textareaClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nettside URL">
              <input type="text" value={d.venue.website} onChange={(e) => update(['weddingDetails', 'venue', 'website'], e.target.value)} className={inputClass} />
            </Field>
            <Field label="Nettside tekst">
              <input type="text" value={d.venue.websiteLabel} onChange={(e) => update(['weddingDetails', 'venue', 'websiteLabel'], e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Adresse">
            <input type="text" value={d.venue.address} onChange={(e) => update(['weddingDetails', 'venue', 'address'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Google Maps-lenke">
            <input type="text" value={d.venue.mapsLink} onChange={(e) => update(['weddingDetails', 'venue', 'mapsLink'], e.target.value)} className={inputClass} />
          </Field>
        </SubSection>

        <SubSection title="👔 Antrekk">
          <Field label="Tittel">
            <input type="text" value={d.dressCode.title} onChange={(e) => update(['weddingDetails', 'dressCode', 'title'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Kleskode (kort)">
            <textarea value={d.dressCode.dressCode} onChange={(e) => update(['weddingDetails', 'dressCode', 'dressCode'], e.target.value)} rows={2} className={textareaClass} />
          </Field>
          <Field label="Utfyllende beskrivelse">
            <textarea value={d.dressCode.point} onChange={(e) => update(['weddingDetails', 'dressCode', 'point'], e.target.value)} rows={3} className={textareaClass} />
          </Field>
        </SubSection>

        <SubSection title="🍽️ Mat">
          <Field label="Tittel">
            <input type="text" value={d.food.title} onChange={(e) => update(['weddingDetails', 'food', 'title'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Beskrivelse">
            <textarea value={d.food.description} onChange={(e) => update(['weddingDetails', 'food', 'description'], e.target.value)} rows={3} className={textareaClass} />
          </Field>
          <Field label="Allergi-notat">
            <input type="text" value={d.food.allergyNote} onChange={(e) => update(['weddingDetails', 'food', 'allergyNote'], e.target.value)} className={inputClass} />
          </Field>
        </SubSection>

        <SubSection title="🎁 Gaveønsker">
          <Field label="Tittel">
            <input type="text" value={d.gifts.title} onChange={(e) => update(['weddingDetails', 'gifts', 'title'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Beskrivelse">
            <textarea value={d.gifts.description} onChange={(e) => update(['weddingDetails', 'gifts', 'description'], e.target.value)} rows={3} className={textareaClass} />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#4A2B5A]">Lenker</label>
              <button onClick={addGiftLink} className="text-xs px-2 py-1 bg-[#E8B4B8]/30 hover:bg-[#E8B4B8]/50 rounded transition-colors">+ Legg til</button>
            </div>
            <div className="space-y-2">
              {(d.gifts.links || []).map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="https://..." value={link.url} onChange={(e) => updateGiftLink(i, 'url', e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Lenketekst" value={link.label} onChange={(e) => updateGiftLink(i, 'label', e.target.value)} className={inputClass} />
                  </div>
                  <button onClick={() => removeGiftLink(i)} className="text-red-400 hover:text-red-600 text-xs pt-2.5 shrink-0">✕</button>
                </div>
              ))}
            </div>
          </div>
        </SubSection>

        <SubSection title="ℹ️ Informasjon">
          <Field label="Tittel">
            <input type="text" value={d.info.title} onChange={(e) => update(['weddingDetails', 'info', 'title'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Beskrivelse (støtter linjeskift)">
            <textarea value={d.info.description} onChange={(e) => update(['weddingDetails', 'info', 'description'], e.target.value)} rows={6} className={textareaClass} />
          </Field>
        </SubSection>
      </div>
    </section>
  );
}
