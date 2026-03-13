'use client';

import { useEffect } from 'react';
import { useContentAdmin } from '@/hooks/admin/useContent';
import { HeroEditor } from '@/components/admin/content/HeroEditor';
import { StoryEditor } from '@/components/admin/content/StoryEditor';
import { DetailsEditor } from '@/components/admin/content/DetailsEditor';
import { ScheduleEditor } from '@/components/admin/content/ScheduleEditor';
import { RsvpContentEditor } from '@/components/admin/content/RsvpContentEditor';
import { FooterEditor } from '@/components/admin/content/FooterEditor';

export default function InnholdPage() {
  const { content, loading, error, success, load, save, update } = useContentAdmin();

  useEffect(() => {
    load();
  }, [load]);

  if (!content) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Sticky save bar */}
      <div className="sticky top-4 z-40 mb-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-[#2D1B3D]">Innholdsredigering</h1>
          <div className="flex items-center gap-3">
            {success && <span className="text-green-700 text-sm font-medium">{success}</span>}
            {error && <span className="text-red-600 text-sm">{error}</span>}
            <button
              onClick={save}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold text-sm"
            >
              {loading ? 'Lagrer...' : 'Lagre innhold'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <HeroEditor content={content} update={update} />
        <DetailsEditor content={content} update={update} />
        <ScheduleEditor content={content} update={update} />
        <StoryEditor content={content} update={update} />
        <RsvpContentEditor content={content} update={update} />
        <FooterEditor content={content} update={update} />
      </div>
    </div>
  );
}
