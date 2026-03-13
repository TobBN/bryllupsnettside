"use client";

import { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import { WeddingDetailsSectionProps } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useContent } from './ContentContext';

interface PublicGuest {
  name: string;
}

interface PublicTable {
  table_number: number;
  capacity: number;
  guests: PublicGuest[];
  guest_count: number;
}

interface SearchResult {
  table_number: number;
  seat_number: number;
  name: string;
  table_guests: Array<{ name: string; seat_number: number }>;
}

interface FoodCourse {
  name: string;
  description: string;
  drink?: string;
}

interface InfoItem {
  question: string;
  answer: string;
}

interface WeddingDetailsContent {
  title: string;
  venue: {
    title: string;
    description: string;
    website: string;
    websiteLabel: string;
    address: string;
    mapsLink: string;
  };
  dressCode: {
    title: string;
    dressCode: string;
    point: string;
  };
  gifts: {
    title: string;
    description: string;
    links: Array<{ url: string; label: string }>;
  };
  food: {
    title: string;
    description: string;
    courses?: FoodCourse[];
    allergyNote: string;
  };
  info: {
    title: string;
    description: string;
    items?: InfoItem[];
  };
  schedule?: {
    title: string;
    subtitle: string;
    items: Array<{ time: string; title: string; description?: string }>;
  };
  seatingChart?: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    noResultsText: string;
  };
}

// Fixed keys — never tied to content title strings to avoid collision
type BoxKey = 'venue' | 'dressCode' | 'gifts' | 'food' | 'info' | 'schedule' | 'seatingChart';

interface DetailBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const DetailBoxComponent: React.FC<DetailBoxProps> = ({ title, icon, children, isExpanded, onToggle }) => {
  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden self-start transition-all duration-300 ${
        isExpanded ? 'ring-1 ring-[#E8B4B8]/60 shadow-2xl' : 'hover:ring-1 hover:ring-[#E8B4B8]/30'
      }`}
    >
      <button
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B4B8] rounded-t-2xl"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Lukk' : 'Åpne'} ${title.toLowerCase()}`}
      >
        <div className="flex items-center gap-3 p-5">
          <div className={`w-10 h-10 shrink-0 flex items-center justify-center text-white transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
            {icon}
          </div>
          <h3 className="flex-1 text-lg sm:text-xl font-semibold text-white drop-shadow-sm leading-snug">
            {title}
          </h3>
          <svg
            className={`w-5 h-5 text-white/90 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 border-t border-white/20 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const DetailBox = memo(DetailBoxComponent);
DetailBox.displayName = 'DetailBox';

export const WeddingDetailsSection: React.FC<WeddingDetailsSectionProps> = () => {
  const [expandedBox, setExpandedBox] = useState<BoxKey | null>(null);

  const allContent = useContent();
  const content = useMemo<WeddingDetailsContent | null>(() => {
    if (!allContent) return null;
    const wd = { ...((allContent.weddingDetails as Record<string, unknown>) || {}) };
    if (allContent.schedule && !wd.schedule) wd.schedule = allContent.schedule;
    if (allContent.seatingChart && !wd.seatingChart) wd.seatingChart = allContent.seatingChart;
    return wd as unknown as WeddingDetailsContent;
  }, [allContent]);

  const [tables, setTables] = useState<PublicTable[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tablesLoading, setTablesLoading] = useState<boolean>(false);

  const searchRequestIdRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const headingRef = useScrollReveal({ animationType: 'fade-up', threshold: 0.3 });
  const cardsRef = useScrollReveal({ animationType: 'scale', threshold: 0.1 });

  // Load tables when seating chart is opened — use fixed key
  useEffect(() => {
    if (expandedBox === 'seatingChart') {
      loadTables();
    }
  }, [expandedBox]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const loadTables = async () => {
    try {
      setTablesLoading(true);
      const res = await fetch('/api/seating/tables');
      const data = await res.json();
      if (data.success) setTables(data.data || []);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setTablesLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResult(null);
      setIsSearching(false);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(async () => {
      const currentRequestId = ++searchRequestIdRef.current;
      try {
        setIsSearching(true);
        const res = await fetch(`/api/seating/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (currentRequestId === searchRequestIdRef.current) {
          setSearchResult(data.success && data.found ? data.data : null);
          setIsSearching(false);
        }
      } catch (error) {
        if (currentRequestId === searchRequestIdRef.current) {
          console.error('Error searching:', error);
          setSearchResult(null);
          setIsSearching(false);
        }
      }
    }, 300);
  }, []);

  // Fixed keys — no title-string collision possible
  const toggleBox = useCallback((key: BoxKey) => {
    setExpandedBox(prev => prev === key ? null : key);
  }, []);

  const iconLocation = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  const iconDress = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
  const iconGift = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const iconFood = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 3v18M8 3v18M20 3v10a4 4 0 01-4 4h-4" />
    </svg>
  );
  const iconInfo = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const iconClock = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const iconTable = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  return (
    <section id="wedding-details" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4 relative z-10">

        <div ref={headingRef} className="mb-10">
          <div className="glass-card rounded-2xl p-7 md:p-9 max-w-xl mx-auto text-center">
            <h2
              id="details-heading"
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-white drop-shadow-lg"
            >
              {content?.title}
            </h2>
          </div>
        </div>

        {/*
          items-start: each card only takes its own height.
          Without this, all cards in the same grid row stretch to the tallest card,
          making neighbors appear to "open" when one card expands.
        */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto items-start">

          {/* Sted */}
          <DetailBox
            title={content?.venue.title || ''}
            icon={iconLocation}
            isExpanded={expandedBox === 'venue'}
            onToggle={() => toggleBox('venue')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed text-white/90">
              {content?.venue.description && <p>{content.venue.description}</p>}
              <div className="space-y-1.5 pt-1">
                {content?.venue.website && (
                  <a
                    href={content.venue.website}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[#E8B4B8] hover:text-white transition-colors block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {content?.venue.websiteLabel || content.venue.website}
                  </a>
                )}
                {content?.venue.mapsLink && (
                  <a
                    href={content.venue.mapsLink}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[#E8B4B8] hover:text-white transition-colors block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 {content?.venue.address || ''}
                  </a>
                )}
              </div>
            </div>
          </DetailBox>

          {/* Antrekk */}
          <DetailBox
            title={content?.dressCode.title || ''}
            icon={iconDress}
            isExpanded={expandedBox === 'dressCode'}
            onToggle={() => toggleBox('dressCode')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed text-white/90">
              {content?.dressCode.dressCode && (
                <p className="whitespace-pre-line">{content.dressCode.dressCode}</p>
              )}
              {content?.dressCode.point && (
                <p className={`${content?.dressCode.dressCode ? 'border-t border-white/15 pt-3' : ''}`}>
                  {content.dressCode.point}
                </p>
              )}
            </div>
          </DetailBox>

          {/* Gaveønsker */}
          <DetailBox
            title={content?.gifts.title || ''}
            icon={iconGift}
            isExpanded={expandedBox === 'gifts'}
            onToggle={() => toggleBox('gifts')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed text-white/90">
              {content?.gifts.description && <p className="whitespace-pre-line">{content.gifts.description}</p>}
              {content?.gifts.links && content.gifts.links.length > 0 && content.gifts.links[0].url && (
                <div className="space-y-1.5 border-t border-white/15 pt-3">
                  {content.gifts.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[#E8B4B8] hover:text-white transition-colors block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.label || link.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </DetailBox>

          {/* Mat — structured courses OR description fallback */}
          <DetailBox
            title={content?.food.title || ''}
            icon={iconFood}
            isExpanded={expandedBox === 'food'}
            onToggle={() => toggleBox('food')}
          >
            <div className="font-body text-sm sm:text-base leading-relaxed text-white/90">
              {content?.food.description && (
                <p className="whitespace-pre-line mb-4 text-white/90">{content.food.description}</p>
              )}
              {content?.food.courses && content.food.courses.length > 0 && (
                <div className="space-y-4">
                  {content.food.courses.map((course, i) => (
                    <div key={i} className={i > 0 ? 'border-t border-white/15 pt-4' : ''}>
                      <p className="font-semibold text-white text-sm uppercase tracking-wide mb-1.5">
                        {course.name}
                      </p>
                      <p className="whitespace-pre-line">{course.description}</p>
                      {course.drink && (
                        <p className="mt-1.5 text-white/90 text-sm flex items-center gap-1">
                          <span>🥂</span>
                          <span>{course.drink}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {content?.food.allergyNote && (
                <p className="text-white/90 italic text-sm border-t border-white/15 pt-3 mt-3">
                  {content.food.allergyNote}
                </p>
              )}
            </div>
          </DetailBox>

          {/* Informasjon — FAQ style */}
          <DetailBox
            title={content?.info.title || ''}
            icon={iconInfo}
            isExpanded={expandedBox === 'info'}
            onToggle={() => toggleBox('info')}
          >
            <div className="font-body text-sm sm:text-base leading-relaxed text-white/90">
              {content?.info.description && (
                <p className="whitespace-pre-line mb-4 text-white/90">{content.info.description}</p>
              )}
              {content?.info.items && content.info.items.length > 0 && (
                <div className="space-y-0 divide-y divide-white/15">
                  {content.info.items.map((item, i) => (
                    <InfoFaqItem key={i} question={item.question} answer={item.answer} />
                  ))}
                </div>
              )}
            </div>
          </DetailBox>

          {/* Program */}
          {content?.schedule && (
            <DetailBox
              title={content.schedule?.title || 'Program'}
              icon={iconClock}
              isExpanded={expandedBox === 'schedule'}
              onToggle={() => toggleBox('schedule')}
            >
              <div className="space-y-3">
                {content.schedule?.subtitle && (
                  <p className="font-body text-sm text-white/90 mb-3">{content.schedule.subtitle}</p>
                )}
                {content.schedule?.items && content.schedule.items.length > 0 ? (
                  <div className="relative pl-4 border-l-2 border-[#E8B4B8]/50 space-y-4">
                    {content.schedule.items.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] border border-white/50 shadow" />
                        <div className="flex items-baseline gap-3">
                          <span className="text-base font-bold text-white shrink-0">{item.time}</span>
                          <div>
                            <p className="text-sm font-semibold text-white/95">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-white/90 mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-white/90 text-sm py-2">Ingen programpunkter er satt opp ennå.</p>
                )}
              </div>
            </DetailBox>
          )}

          {/* Bord-kart */}
          {content?.seatingChart && (
            <DetailBox
              title={content.seatingChart?.title || 'Bord-kart'}
              icon={iconTable}
              isExpanded={expandedBox === 'seatingChart'}
              onToggle={() => toggleBox('seatingChart')}
            >
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                {content.seatingChart?.subtitle && (
                  <p className="font-body text-sm text-white/90">{content.seatingChart.subtitle}</p>
                )}

                <div>
                  <label htmlFor="guest-search" className="block font-body font-medium text-white/90 mb-2 text-sm">
                    {content.seatingChart?.searchLabel || 'Søk etter navn'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="guest-search"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder={content.seatingChart?.searchPlaceholder || 'Skriv inn navnet ditt...'}
                      className="w-full px-4 py-3 border border-white/30 rounded-xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/30 text-base"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#E8B4B8]/40 border-t-[#E8B4B8] rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {searchResult && (
                    <div className="mt-3 p-3 bg-white/15 rounded-xl border border-[#E8B4B8]/40">
                      <p className="font-body text-white font-semibold text-sm mb-1">
                        {searchResult.name} — Bord {searchResult.table_number}, Plass {searchResult.seat_number}
                      </p>
                      <p className="font-body text-white/90 text-sm">
                        Medgjester: {searchResult.table_guests.filter(g => g.name !== searchResult.name).map(g => g.name).join(', ') || 'Ingen'}
                      </p>
                    </div>
                  )}
                  {searchQuery.length >= 2 && !isSearching && !searchResult && (
                    <p className="mt-2 font-body text-white/90 text-sm text-center">
                      {content.seatingChart?.noResultsText || 'Ingen resultater funnet'}
                    </p>
                  )}
                </div>

                {tablesLoading ? (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="font-body text-white/90 text-sm">Laster bord-kart...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <p className="font-body text-white/90 text-sm text-center py-2">Ingen bord er satt opp ennå.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3" onClick={(e) => e.stopPropagation()}>
                    {tables.map((table) => {
                      const isHighlighted = searchResult?.table_number === table.table_number;
                      return (
                        <div
                          key={table.table_number}
                          className={`aspect-square rounded-full glass-card flex flex-col items-center justify-center transition-all duration-300 ${
                            isHighlighted ? 'ring-2 ring-[#F4A261] shadow-xl scale-110' : ''
                          }`}
                          aria-label={`Bord ${table.table_number}`}
                        >
                          <span className="text-lg font-bold text-white drop-shadow">{table.table_number}</span>
                          <span className="text-sm text-white/90">{table.guest_count}/{table.capacity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </DetailBox>
          )}
        </div>
      </div>
    </section>
  );
};

// Inline FAQ item with its own expand/collapse
function InfoFaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-3">
      <button
        className="w-full text-left flex items-start justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B4B8] rounded-lg group"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        aria-expanded={open}
      >
        <span className="font-semibold text-white/95 text-sm leading-snug group-hover:text-white transition-colors">
          {question}
        </span>
        <svg
          className={`w-4 h-4 text-white/90 shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${open ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <p className="text-white/90 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
