'use client';

import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";
const textareaClass = `${inputClass} resize-y`;

export function StoryEditor({ content, update }: Props) {
  const addItem = () => {
    update(['story', 'timeline'], [...content.story.timeline, { date: '', title: '', text: '' }]);
  };

  const removeItem = (index: number) => {
    update(['story', 'timeline'], content.story.timeline.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    update(
      ['story', 'timeline'],
      content.story.timeline.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-[#2D1B3D] mb-4 flex items-center gap-2">
        <span>📖</span> Vår historie
      </h2>
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4A2B5A] mb-1.5">Overskrift</label>
            <input
              type="text"
              value={content.story.title}
              onChange={(e) => update(['story', 'title'], e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A2B5A] mb-1.5">Undertittel</label>
            <input
              type="text"
              value={content.story.subtitle}
              onChange={(e) => update(['story', 'subtitle'], e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#2D1B3D]">Tidslinje ({content.story.timeline.length} hendelser)</h3>
        <button
          onClick={addItem}
          className="text-sm px-3 py-1.5 bg-[#E8B4B8]/30 hover:bg-[#E8B4B8]/50 text-[#2D1B3D] rounded-lg transition-colors font-medium"
        >
          + Legg til
        </button>
      </div>

      <div className="space-y-3">
        {content.story.timeline.map((item, i) => (
          <div key={i} className="border border-[#E8B4B8]/60 rounded-xl p-4 bg-white/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#4A2B5A]/60 uppercase tracking-wide">#{i + 1}</span>
              <button
                onClick={() => removeItem(i)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Fjern
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Dato</label>
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) => updateItem(i, 'date', e.target.value)}
                  className={inputClass}
                  placeholder="Våren 2016"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Tittel</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(i, 'title', e.target.value)}
                  className={inputClass}
                  placeholder="Vi møttes"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4A2B5A] mb-1">Beskrivelse</label>
              <textarea
                value={item.text}
                onChange={(e) => updateItem(i, 'text', e.target.value)}
                rows={3}
                className={textareaClass}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
