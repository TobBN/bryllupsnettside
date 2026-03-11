'use client';

import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";
const textareaClass = `${inputClass} resize-y`;

export function FooterEditor({ content, update }: Props) {
  const { footer } = content;
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-[#2D1B3D] mb-4 flex items-center gap-2">
        <span>🔗</span> Footer
      </h2>
      <div className="space-y-4">
        <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40 space-y-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Tekst</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Overskrift</label>
              <input type="text" value={footer.heading} onChange={(e) => update(['footer', 'heading'], e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Tagline</label>
            <textarea value={footer.tagline} onChange={(e) => update(['footer', 'tagline'], e.target.value)} rows={2} className={textareaClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Kontaktinfo-tekst</label>
            <input type="text" value={footer.contactText} onChange={(e) => update(['footer', 'contactText'], e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Vis kontakt-knapp</label>
              <input type="text" value={footer.showContactText} onChange={(e) => update(['footer', 'showContactText'], e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Skjul kontakt-knapp</label>
              <input type="text" value={footer.hideContactText} onChange={(e) => update(['footer', 'hideContactText'], e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40 space-y-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Kontaktinfo</h3>
          <div>
            <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Kontakt-tittel</label>
            <input type="text" value={footer.contact.title} onChange={(e) => update(['footer', 'contact', 'title'], e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#4A2B5A]">Bruden</p>
              <div>
                <label className="block text-xs text-[#4A2B5A]/70 mb-1">Navn</label>
                <input type="text" value={footer.contact.bride.name} onChange={(e) => update(['footer', 'contact', 'bride', 'name'], e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#4A2B5A]/70 mb-1">Telefon</label>
                <input type="text" value={footer.contact.bride.phone} onChange={(e) => update(['footer', 'contact', 'bride', 'phone'], e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#4A2B5A]">Brudgommen</p>
              <div>
                <label className="block text-xs text-[#4A2B5A]/70 mb-1">Navn</label>
                <input type="text" value={footer.contact.groom.name} onChange={(e) => update(['footer', 'contact', 'groom', 'name'], e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#4A2B5A]/70 mb-1">Telefon</label>
                <input type="text" value={footer.contact.groom.phone} onChange={(e) => update(['footer', 'contact', 'groom', 'phone'], e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
