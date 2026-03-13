'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import type { ContentData } from '@/types/admin';

interface Props {
  content: ContentData;
  update: (path: string[], value: unknown) => void;
}

const inputClass = "w-full px-3 py-2.5 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm";
const textareaClass = `${inputClass} resize-y`;

export function StoryEditor({ content, update }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingEventIndex, setUploadingEventIndex] = useState<number | null>(null);
  const eventFileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const images = useMemo(() => content.story.images || [], [content.story.images]);

  const addItem = () => {
    update(['story', 'timeline'], [...content.story.timeline, { date: '', title: '', text: '' }]);
  };

  const removeItem = async (index: number) => {
    const item = content.story.timeline[index];
    // Delete event image from storage if it exists
    if (item.image?.storageName) {
      try {
        await fetch('/api/admin/story-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.image.storageName }),
        });
      } catch {
        // Continue removing event even if storage delete fails
      }
    }
    update(['story', 'timeline'], content.story.timeline.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    update(
      ['story', 'timeline'],
      content.story.timeline.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/story-images', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Opplasting feilet');
        return;
      }

      const newImages = [...images, { url: data.url, alt: 'Alexandra og Tobias', storageName: data.name }];
      update(['story', 'images'], newImages);
    } catch {
      setUploadError('Nettverksfeil ved opplasting');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [images, update]);

  const removeImage = useCallback(async (index: number) => {
    const img = images[index];

    // Delete from storage if it has a storageName
    if (img.storageName) {
      try {
        await fetch('/api/admin/story-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: img.storageName }),
        });
      } catch {
        // Continue removing from content even if storage delete fails
      }
    }

    update(['story', 'images'], images.filter((_, i) => i !== index));
  }, [images, update]);

  const updateImageAlt = useCallback((index: number, alt: string) => {
    update(
      ['story', 'images'],
      images.map((img, i) => i === index ? { ...img, alt } : img),
    );
  }, [images, update]);

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
    update(['story', 'images'], newImages);
  }, [images, update]);

  const handleEventImageUpload = useCallback(async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEventIndex(index);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/story-images', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Opplasting feilet');
        return;
      }

      const updatedTimeline = content.story.timeline.map((item, i) =>
        i === index ? { ...item, image: { url: data.url, alt: item.title || 'Hendelse-bilde', storageName: data.name } } : item
      );
      update(['story', 'timeline'], updatedTimeline);
    } catch {
      setUploadError('Nettverksfeil ved opplasting');
    } finally {
      setUploadingEventIndex(null);
      const input = eventFileInputRefs.current.get(index);
      if (input) input.value = '';
    }
  }, [content.story.timeline, update]);

  const removeEventImage = useCallback(async (index: number) => {
    const item = content.story.timeline[index];
    if (!item.image) return;

    if (item.image.storageName) {
      try {
        await fetch('/api/admin/story-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.image.storageName }),
        });
      } catch {
        // Continue removing from content even if storage delete fails
      }
    }

    const updatedTimeline = content.story.timeline.map((item, i) => {
      if (i !== index) return item;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image: _removed, ...rest } = item;
      return rest;
    });
    update(['story', 'timeline'], updatedTimeline);
  }, [content.story.timeline, update]);

  const updateEventImageAlt = useCallback((index: number, alt: string) => {
    const updatedTimeline = content.story.timeline.map((item, i) =>
      i === index && item.image ? { ...item, image: { ...item.image, alt } } : item
    );
    update(['story', 'timeline'], updatedTimeline);
  }, [content.story.timeline, update]);

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

      {/* Image management */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#2D1B3D]">Bilder ({images.length})</h3>
          <div className="flex items-center gap-2">
            {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
            <label
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                uploading
                  ? 'bg-gray-200 text-gray-400 cursor-wait'
                  : 'bg-[#E8B4B8]/30 hover:bg-[#E8B4B8]/50 text-[#2D1B3D]'
              }`}
            >
              {uploading ? 'Laster opp...' : '+ Last opp bilde'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-[#4A2B5A]/60 italic">
            Ingen bilder lagt til ennå. Standard plassholder-bilder vises på nettsiden.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={img.storageName || img.url} className="border border-[#E8B4B8]/60 rounded-xl overflow-hidden bg-white/50">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="p-2 space-y-1.5">
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateImageAlt(i, e.target.value)}
                    className="w-full px-2 py-1 border border-[#E8B4B8]/40 rounded text-xs"
                    placeholder="Alt-tekst"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="text-xs px-1.5 py-0.5 rounded bg-[#E8B4B8]/20 hover:bg-[#E8B4B8]/40 disabled:opacity-30 transition-colors"
                        title="Flytt til venstre"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => moveImage(i, 1)}
                        disabled={i === images.length - 1}
                        className="text-xs px-1.5 py-0.5 rounded bg-[#E8B4B8]/20 hover:bg-[#E8B4B8]/40 disabled:opacity-30 transition-colors"
                        title="Flytt til høyre"
                      >
                        →
                      </button>
                    </div>
                    <button
                      onClick={() => removeImage(i)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Fjern
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

            {/* Event image */}
            <div className="mt-3 pt-3 border-t border-[#E8B4B8]/30">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-[#4A2B5A]">Bilde</label>
                {!item.image && (
                  <label
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      uploadingEventIndex === i
                        ? 'bg-gray-200 text-gray-400 cursor-wait'
                        : 'bg-[#E8B4B8]/30 hover:bg-[#E8B4B8]/50 text-[#2D1B3D]'
                    }`}
                  >
                    {uploadingEventIndex === i ? 'Laster opp...' : '+ Last opp'}
                    <input
                      ref={(el) => { if (el) eventFileInputRefs.current.set(i, el); }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => handleEventImageUpload(i, e)}
                      disabled={uploadingEventIndex !== null}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {item.image ? (
                <div className="flex gap-3 items-start">
                  <div className="relative w-28 aspect-[4/3] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={item.image.alt}
                      onChange={(e) => updateEventImageAlt(i, e.target.value)}
                      className="w-full px-2 py-1 border border-[#E8B4B8]/40 rounded text-xs"
                      placeholder="Alt-tekst"
                    />
                    <button
                      onClick={() => removeEventImage(i)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Fjern bilde
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#4A2B5A]/50 italic">Ingen bilde lagt til for denne hendelsen.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
