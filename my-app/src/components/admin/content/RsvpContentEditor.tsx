'use client';

import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#4A2B5A] mb-1">{label}</label>
      {children}
    </div>
  );
}

export function RsvpContentEditor({ content, update }: Props) {
  const { rsvp } = content;

  const updateSubtitle = (index: number, value: string) => {
    const newSubtitle = [...(rsvp.subtitle || [])];
    newSubtitle[index] = value;
    update(['rsvp', 'subtitle'], newSubtitle);
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-[#2D1B3D] mb-4 flex items-center gap-2">
        <span>📝</span> RSVP-seksjon
      </h2>
      <div className="space-y-5">

        <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40 space-y-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Introduksjon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Overskrift">
              <input type="text" value={rsvp.title} onChange={(e) => update(['rsvp', 'title'], e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Undertittel linje 1">
            <input type="text" value={rsvp.subtitle[0] || ''} onChange={(e) => updateSubtitle(0, e.target.value)} className={inputClass} />
          </Field>
          <Field label="Undertittel linje 2">
            <input type="text" value={rsvp.subtitle[1] || ''} onChange={(e) => updateSubtitle(1, e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40 space-y-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Knapper</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Jeg kommer">
              <input type="text" value={rsvp.buttons.attending} onChange={(e) => update(['rsvp', 'buttons', 'attending'], e.target.value)} className={inputClass} />
            </Field>
            <Field label="Jeg kan dessverre ikke">
              <input type="text" value={rsvp.buttons.notAttending} onChange={(e) => update(['rsvp', 'buttons', 'notAttending'], e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40 space-y-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Skjema</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Navn label"><input type="text" value={rsvp.form.nameLabel} onChange={(e) => update(['rsvp', 'form', 'nameLabel'], e.target.value)} className={inputClass} /></Field>
            <Field label="Navn placeholder"><input type="text" value={rsvp.form.namePlaceholder} onChange={(e) => update(['rsvp', 'form', 'namePlaceholder'], e.target.value)} className={inputClass} /></Field>
            <Field label="Telefon label"><input type="text" value={rsvp.form.phoneLabel} onChange={(e) => update(['rsvp', 'form', 'phoneLabel'], e.target.value)} className={inputClass} /></Field>
            <Field label="Telefon placeholder"><input type="text" value={rsvp.form.phonePlaceholder} onChange={(e) => update(['rsvp', 'form', 'phonePlaceholder'], e.target.value)} className={inputClass} /></Field>
            <Field label="Allergier label"><input type="text" value={rsvp.form.allergiesLabel} onChange={(e) => update(['rsvp', 'form', 'allergiesLabel'], e.target.value)} className={inputClass} /></Field>
            <Field label="Allergier placeholder"><input type="text" value={rsvp.form.allergiesPlaceholder} onChange={(e) => update(['rsvp', 'form', 'allergiesPlaceholder'], e.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Allergi hjelpetekst">
            <input type="text" value={rsvp.form.allergiesHelpText} onChange={(e) => update(['rsvp', 'form', 'allergiesHelpText'], e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Antall gjester label"><input type="text" value={rsvp.form.guestCountLabel} onChange={(e) => update(['rsvp', 'form', 'guestCountLabel'], e.target.value)} className={inputClass} /></Field>
            <Field label="Antall gjester placeholder"><input type="text" value={rsvp.form.guestCountPlaceholder || ''} onChange={(e) => update(['rsvp', 'form', 'guestCountPlaceholder'], e.target.value)} className={inputClass} /></Field>
            <Field label="Send-knapp"><input type="text" value={rsvp.form.submitButton} onChange={(e) => update(['rsvp', 'form', 'submitButton'], e.target.value)} className={inputClass} /></Field>
            <Field label="Tilbake-knapp"><input type="text" value={rsvp.form.backButton} onChange={(e) => update(['rsvp', 'form', 'backButton'], e.target.value)} className={inputClass} /></Field>
            <Field label="Nytt svar-knapp"><input type="text" value={rsvp.form.newResponseButton} onChange={(e) => update(['rsvp', 'form', 'newResponseButton'], e.target.value)} className={inputClass} /></Field>
          </div>
        </div>

        <div className="border border-[#E8B4B8]/40 rounded-xl p-4 bg-white/40 space-y-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Bekreftelsesmeldinger</h3>
          <Field label="Melding ved ja">
            <input type="text" value={rsvp.messages.attending} onChange={(e) => update(['rsvp', 'messages', 'attending'], e.target.value)} className={inputClass} />
          </Field>
          <Field label="Melding ved nei">
            <input type="text" value={rsvp.messages.notAttending} onChange={(e) => update(['rsvp', 'messages', 'notAttending'], e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>
    </section>
  );
}
