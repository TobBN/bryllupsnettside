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
    links: Array<{
      url: string;
      label: string;
    }>;
  };
  food: {
    title: string;
    description: string;
    allergyNote: string;
  };
  info: {
    title: string;
    description: string;
  };
  schedule?: {
    title: string;
    subtitle: string;
    items: Array<{
      time: string;
      title: string;
      description?: string;
    }>;
  };
  seatingChart?: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    noResultsText: string;
  };
}

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
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded ? 'ring-1 ring-[#E8B4B8]/60 shadow-2xl' : 'hover:ring-1 hover:ring-[#E8B4B8]/30'
      }`}
    >
      {/* Header row — always visible, acts as toggle */}
      <button
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]/50 rounded-t-2xl"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Lukk' : 'Åpne'} ${title.toLowerCase()}`}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
        }}
      >
        <div className="flex items-center gap-3 p-5">
          <div className={`w-10 h-10 shrink-0 flex items-center justify-center text-white transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
            {icon}
          </div>
          <h3 className="flex-1 text-lg sm:text-xl font-semibold text-white drop-shadow-sm leading-snug">
            {title}
          </h3>
          <svg
            className={`w-5 h-5 text-white/70 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 border-t border-white/20 pt-4">
          <div className="text-left text-white/95">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBox = memo(DetailBoxComponent);
DetailBox.displayName = 'DetailBox';

export const WeddingDetailsSection: React.FC<WeddingDetailsSectionProps> = () => {
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  const allContent = useContent();
  const content = useMemo<WeddingDetailsContent | null>(() => {
    if (!allContent) return null;
    const wd = { ...((allContent.weddingDetails as Record<string, unknown>) || {}) };
    if (allContent.schedule && !wd.schedule) wd.schedule = allContent.schedule;
    if (allContent.seatingChart && !wd.seatingChart) wd.seatingChart = allContent.seatingChart;
    return wd as unknown as WeddingDetailsContent;
  }, [allContent]);

  // Seating chart state
  const [tables, setTables] = useState<PublicTable[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tablesLoading, setTablesLoading] = useState<boolean>(false);

  const searchRequestIdRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const headingRef = useScrollReveal({ animationType: 'fade-up', threshold: 0.3 });
  const cardsRef = useScrollReveal({ animationType: 'scale', threshold: 0.1 });

  useEffect(() => {
    if (expandedBox === (content?.seatingChart?.title || 'Bord-kart')) {
      loadTables();
    }
  }, [expandedBox, content?.seatingChart?.title]);

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

  const toggleBox = useCallback((title: string) => {
    setExpandedBox(prev => prev === title ? null : title);
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

        {/* Section heading */}
        <div ref={headingRef} className="mb-10">
          <div className="glass-card rounded-2xl p-7 md:p-9 max-w-xl mx-auto text-center">
            <h2
              id="details-heading"
              className="text-3xl sm:text-4xl md:text-5xl leading-tight text-white drop-shadow-lg"
            >
              {content?.title || 'Praktisk informasjon'}
            </h2>
          </div>
        </div>

        {/* Cards grid — fixed wide container */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">

          {/* Sted */}
          <DetailBox
            title={content?.venue.title || 'Sted'}
            icon={iconLocation}
            isExpanded={expandedBox === (content?.venue.title || 'Sted')}
            onToggle={() => toggleBox(content?.venue.title || 'Sted')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed">
              <p className="drop-shadow-sm">{content?.venue.description || 'Vielse og fest på Garder Østgaard i Halden'}</p>
              <div className="space-y-1.5 pt-1">
                <a
                  href={content?.venue.website || 'https://www.garder-ostgaard.no'}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#E8B4B8] hover:text-white transition-colors block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {content?.venue.websiteLabel || 'www.garder-ostgaard.no'}
                </a>
                <a
                  href={content?.venue.mapsLink || 'https://maps.google.com/?q=Brødenveien+31,+1763+Halden'}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#E8B4B8] hover:text-white transition-colors block"
                  onClick={(e) => e.stopPropagation()}
                >
                  📍 {content?.venue.address || 'Brødenveien 31, 1763 Halden'}
                </a>
              </div>
            </div>
          </DetailBox>

          {/* Antrekk */}
          <DetailBox
            title={content?.dressCode.title || 'Antrekk'}
            icon={iconDress}
            isExpanded={expandedBox === (content?.dressCode.title || 'Antrekk')}
            onToggle={() => toggleBox(content?.dressCode.title || 'Antrekk')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed">
              <p className="drop-shadow-sm">
                <span className="font-semibold text-white/80">Kleskode: </span>
                {content?.dressCode.dressCode || 'Mørk dress (med tilpasninger ved varmt vær)'}
              </p>
              <p className="drop-shadow-sm text-white/90">
                {content?.dressCode.point || 'Pyntet og elegant – gjerne i lette materialer og lysere toner om det blir varmt.'}
              </p>
            </div>
          </DetailBox>

          {/* Gaveønsker */}
          <DetailBox
            title={content?.gifts.title || 'Gaveønsker'}
            icon={iconGift}
            isExpanded={expandedBox === (content?.gifts.title || 'Gaveønsker')}
            onToggle={() => toggleBox(content?.gifts.title || 'Gaveønsker')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed">
              <p className="drop-shadow-sm text-white/95">{content?.gifts.description || 'Vi blir glade for gaver fra ønskelisten og pengebidrag til bryllupsreisen'}</p>
              {content?.gifts.links && content.gifts.links.length > 0 && content.gifts.links[0].url && (
                <div className="space-y-1.5 pt-1">
                  {content.gifts.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[#E8B4B8] hover:text-white transition-colors block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.label || '🎁 Se ønskelisten'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </DetailBox>

          {/* Mat */}
          <DetailBox
            title={content?.food.title || 'Mat'}
            icon={iconFood}
            isExpanded={expandedBox === (content?.food.title || 'Mat')}
            onToggle={() => toggleBox(content?.food.title || 'Mat')}
          >
            <div className="space-y-3 font-body text-sm sm:text-base leading-relaxed">
              <p className="drop-shadow-sm text-white/95">{content?.food.description || 'Meny kommer...'}</p>
              <p className="text-white/70 italic text-sm border-t border-white/20 pt-2">
                {content?.food.allergyNote || '* Allergier meldes fra i RSVP'}
              </p>
            </div>
          </DetailBox>

          {/* Informasjon */}
          <DetailBox
            title={content?.info.title || 'Informasjon'}
            icon={iconInfo}
            isExpanded={expandedBox === (content?.info.title || 'Informasjon')}
            onToggle={() => toggleBox(content?.info.title || 'Informasjon')}
          >
            <div className="font-body text-sm sm:text-base leading-relaxed">
              <p className="drop-shadow-sm text-white/95 whitespace-pre-line">
                {content?.info.description || 'Praktisk informasjon for gjester...'}
              </p>
            </div>
          </DetailBox>

          {/* Program */}
          {content?.schedule && (
            <DetailBox
              title={content.schedule?.title || 'Program'}
              icon={iconClock}
              isExpanded={expandedBox === (content.schedule?.title || 'Program')}
              onToggle={() => toggleBox(content.schedule?.title || 'Program')}
            >
              <div className="space-y-3">
                {content.schedule?.subtitle && (
                  <p className="font-body text-sm text-white/80 mb-3">{content.schedule.subtitle}</p>
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
                              <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-white/70 text-sm py-2">Ingen programpunkter er satt opp ennå.</p>
                )}
              </div>
            </DetailBox>
          )}

          {/* Bord-kart */}
          {content?.seatingChart && (
            <DetailBox
              title={content.seatingChart?.title || 'Bord-kart'}
              icon={iconTable}
              isExpanded={expandedBox === (content.seatingChart?.title || 'Bord-kart')}
              onToggle={() => toggleBox(content.seatingChart?.title || 'Bord-kart')}
            >
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                {content.seatingChart?.subtitle && (
                  <p className="font-body text-sm text-white/80">{content.seatingChart.subtitle}</p>
                )}

                {/* Search */}
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
                      <p className="font-body text-white/80 text-xs">
                        Medgjester: {searchResult.table_guests.filter(g => g.name !== searchResult.name).map(g => g.name).join(', ') || 'Ingen'}
                      </p>
                    </div>
                  )}
                  {searchQuery.length >= 2 && !isSearching && !searchResult && (
                    <p className="mt-2 font-body text-white/70 text-xs text-center">
                      {content.seatingChart?.noResultsText || 'Ingen resultater funnet'}
                    </p>
                  )}
                </div>

                {/* Tables grid */}
                {tablesLoading ? (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="font-body text-white/80 text-sm">Laster bord-kart...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <p className="font-body text-white/70 text-sm text-center py-2">Ingen bord er satt opp ennå.</p>
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
                          <span className="text-xs text-white/80">{table.guest_count}/{table.capacity}</span>
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
