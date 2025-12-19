"use client";

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { WeddingDetailsSectionProps } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
      className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover-lift ${
        isExpanded ? 'ring-2 ring-[#E8B4B8]/50 shadow-2xl m-1' : ''
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={`Klikk for å ${isExpanded ? 'lukke' : 'åpne'} ${title.toLowerCase()} informasjon`}
      onKeyDown={(e) => {
        // Don't handle keys if focus is on an input or textarea element
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
          onToggle();
        }
      }}
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 flex items-center justify-center transition-all duration-300 ${
            isExpanded ? 'scale-110' : 'scale-100'
          }`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
        <h3 className="text-2xl leading-tight text-white mb-4 drop-shadow-md">{title}</h3>
        
        {isExpanded && (
          <div className="animate-fade-in-up">
            <div className="pt-4 border-t border-white/30">
              {children}
            </div>
          </div>
        )}
        
        <div className={`mt-4 text-white/80 transition-all duration-300 ${
          isExpanded ? 'rotate-180' : ''
        }`}>
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const DetailBox = memo(DetailBoxComponent);
DetailBox.displayName = 'DetailBox';

export const WeddingDetailsSection: React.FC<WeddingDetailsSectionProps> = () => {
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const [content, setContent] = useState<WeddingDetailsContent | null>(null);
  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(false);
  
  // Seating chart state
  const [tables, setTables] = useState<PublicTable[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tablesLoading, setTablesLoading] = useState<boolean>(false);
  
  // Track search requests to handle race conditions
  const searchRequestIdRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const headingRef = useScrollReveal({ animationType: 'fade-up', threshold: 0.3 });
  const cardsRef = useScrollReveal({ animationType: 'scale', threshold: 0.1 });

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        // Handle both old structure (schedule/seatingChart/faq at top level) and new structure (under weddingDetails)
        const weddingDetails = data.weddingDetails || {};
        // If schedule/seatingChart/faq are at top level, move them under weddingDetails
        if (data.schedule && !weddingDetails.schedule) {
          weddingDetails.schedule = data.schedule;
        }
        if (data.seatingChart && !weddingDetails.seatingChart) {
          weddingDetails.seatingChart = data.seatingChart;
        }
        setContent(weddingDetails);
      })
      .catch(err => console.error('Error loading wedding details content:', err));
  }, []);

  // Load tables when seating chart box is expanded
  useEffect(() => {
    if (expandedBox === (content?.seatingChart?.title || 'Bord-kart')) {
      loadTables();
    }
  }, [expandedBox, content?.seatingChart?.title]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const loadTables = async () => {
    try {
      setTablesLoading(true);
      const res = await fetch('/api/seating/tables');
      const data = await res.json();
      if (data.success) {
        setTables(data.data || []);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setTablesLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    // Update query immediately for responsive UI
    setSearchQuery(query);
    
    // Clear result immediately if query is empty or too short
    if (!query || query.trim().length < 2) {
      setSearchResult(null);
      setIsSearching(false);
      // Clear any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }

    // Clear previous debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(async () => {
      // Increment request ID to track this request
      const currentRequestId = ++searchRequestIdRef.current;
      
      try {
        setIsSearching(true);
        const res = await fetch(`/api/seating/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        
        // Only update state if this is still the latest request
        if (currentRequestId === searchRequestIdRef.current) {
          if (data.success && data.found) {
            setSearchResult(data.data);
          } else {
            setSearchResult(null);
          }
          setIsSearching(false);
        }
      } catch (error) {
        // Only update state if this is still the latest request
        if (currentRequestId === searchRequestIdRef.current) {
          console.error('Error searching:', error);
          setSearchResult(null);
          setIsSearching(false);
        }
      }
    }, 300); // 300ms debounce delay
  }, []);

  const toggleBox = useCallback((title: string) => {
    setExpandedBox(prev => prev === title ? null : title);
  }, []);

  return (
    <section id="wedding-details" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Overskrift i glassmorphism-kort */}
        <div ref={headingRef} className="mb-12">
          <button
            onClick={() => setIsSectionExpanded(!isSectionExpanded)}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]/50 rounded-2xl transition-all duration-300 hover:ring-2 hover:ring-[#E8B4B8]/30"
            aria-expanded={isSectionExpanded}
            aria-controls="wedding-details-content"
            aria-label={isSectionExpanded ? 'Kollaps praktisk informasjon' : 'Ekspander praktisk informasjon'}
          >
            <div className="glass-card rounded-2xl p-8 md:p-10 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
              <div className="flex items-center justify-center">
                <h2 
                  id="details-heading"
                  className="text-4xl md:text-6xl leading-tight text-white mb-0 text-center drop-shadow-lg flex-1"
                >
                  {content?.title || 'Praktisk informasjon'}
                </h2>
                <svg
                  className={`w-8 h-8 text-white transition-transform duration-300 flex-shrink-0 ml-4 ${isSectionExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        <div
          id="wedding-details-content"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSectionExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
          {/* Sted */}
          <DetailBox
            title={content?.venue.title || 'Sted'}
            icon={
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.venue.title || 'Sted')}
            onToggle={() => toggleBox(content?.venue.title || 'Sted')}
          >
            <div className="space-y-4">
              <p className="font-body text-white/95 leading-relaxed drop-shadow-sm">
                {content?.venue.description || 'Vielse og fest på Garder Østgaard i Halden'}
              </p>
              <div className="space-y-2">
                <a 
                  href={content?.venue.website || 'https://www.garder-ostgaard.no'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-body text-[#E8B4B8] hover:text-white transition-colors block drop-shadow-sm"
                >
                  {content?.venue.websiteLabel || 'www.garder-ostgaard.no'}
                </a>
                <a 
                  href={content?.venue.mapsLink || 'https://maps.google.com/?q=Brødenveien+31,+1763+Halden'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-body text-[#E8B4B8] hover:text-white transition-colors block drop-shadow-sm"
                >
                  📍 {content?.venue.address || 'Brødenveien 31, 1763 Halden'}
                </a>
              </div>
            </div>
          </DetailBox>

          {/* Antrekk */}
          <DetailBox
            title={content?.dressCode.title || 'Antrekk'}
            icon={
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.dressCode.title || 'Antrekk')}
            onToggle={() => toggleBox(content?.dressCode.title || 'Antrekk')}
          >
            <div className="space-y-4">
              <p className="font-body text-white/95 leading-relaxed drop-shadow-sm">
                <strong>Kleskode:</strong> {content?.dressCode.dressCode || 'Mørk dress (med tilpasninger ved varmt vær)'}
              </p>
              <p className="font-body text-white/95 leading-relaxed drop-shadow-sm">
                <strong>Poenget:</strong> {content?.dressCode.point || 'Pyntet og elegant – gjerne i lette materialer og lysere toner om det blir varmt. Kle deg så du trives hele kvelden, ser bra ut på bilder og kan danse hele natten.'}
              </p>
            </div>
          </DetailBox>

          {/* Gaveønsker */}
          <DetailBox
            title={content?.gifts.title || 'Gaveønsker'}
            icon={
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.gifts.title || 'Gaveønsker')}
            onToggle={() => toggleBox(content?.gifts.title || 'Gaveønsker')}
          >
            <div className="space-y-4">
              <p className="font-body text-white/95 leading-relaxed drop-shadow-sm">
                {content?.gifts.description || 'Vi blir både glade for gaver fra ønskelisten og pengebidrag til vår bryllupsreise'}
              </p>
              {content?.gifts.links && content.gifts.links.length > 0 && content.gifts.links[0].url && (
                <div className="space-y-2">
                  <a 
                    href={content.gifts.links[0].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-body text-[#E8B4B8] hover:text-white transition-colors block drop-shadow-sm"
                  >
                    {content.gifts.links[0].label || '🎁 Se vår ønskeliste på Stas.app'}
                  </a>
                </div>
              )}
            </div>
          </DetailBox>

          {/* Mat */}
          <DetailBox
            title={content?.food.title || 'Mat'}
            icon={
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 3v18M8 3v18M20 3v10a4 4 0 01-4 4h-4" />
              </svg>
            }
            isExpanded={expandedBox === (content?.food.title || 'Mat')}
            onToggle={() => toggleBox(content?.food.title || 'Mat')}
          >
            <div className="space-y-4">
              <p className="font-body text-white/95 leading-relaxed drop-shadow-sm">
                {content?.food.description || 'Meny kommer...'}
              </p>
              <div className="pt-2 border-t border-white/30">
                <p className="font-small text-white/80 italic drop-shadow-sm">
                  {content?.food.allergyNote || '* Allergier meldes fra om i RSVP'}
                </p>
              </div>
            </div>
          </DetailBox>

          {/* Informasjon */}
          <DetailBox
            title={content?.info.title || 'Informasjon'}
            icon={
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.info.title || 'Informasjon')}
            onToggle={() => toggleBox(content?.info.title || 'Informasjon')}
          >
            <div className="space-y-4">
              <p className="font-body text-white/95 leading-relaxed drop-shadow-sm whitespace-pre-line">
                {content?.info.description || 'Praktisk informasjon for gjester...'}
              </p>
            </div>
          </DetailBox>

          {/* Program */}
          {content?.schedule && (
            <DetailBox
              title={content.schedule?.title || 'Program'}
              icon={
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              isExpanded={expandedBox === (content.schedule?.title || 'Program')}
              onToggle={() => toggleBox(content.schedule?.title || 'Program')}
            >
              <div className="space-y-4">
                {content.schedule?.subtitle && (
                  <p className="font-body text-white/95 leading-relaxed drop-shadow-sm text-center">
                    {content.schedule.subtitle}
                  </p>
                )}
                {content.schedule?.items && content.schedule.items.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E8B4B8] via-[#F4A261] to-[#E8B4B8]"></div>
                    <div className="space-y-6 pl-20">
                      {content.schedule.items.map((item, index) => (
                        <div key={index} className="relative">
                          <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] border-2 border-white shadow-lg -translate-x-1/2"></div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                              <div className="flex-shrink-0">
                                <span className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                                  {item.time}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-semibold text-white mb-2 drop-shadow-md">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="font-body text-white/90 leading-relaxed drop-shadow-sm">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-white/80 text-center py-4">
                    Ingen programpunkter er satt opp ennå.
                  </p>
                )}
              </div>
            </DetailBox>
          )}

          {/* Bord-kart */}
          {content?.seatingChart && (
            <DetailBox
              title={content.seatingChart?.title || 'Bord-kart'}
              icon={
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              isExpanded={expandedBox === (content.seatingChart?.title || 'Bord-kart')}
              onToggle={() => toggleBox(content.seatingChart?.title || 'Bord-kart')}
            >
              <div className="space-y-6">
                {content.seatingChart?.subtitle && (
                  <p className="font-body text-white/95 leading-relaxed drop-shadow-sm text-center">
                    {content.seatingChart.subtitle}
                  </p>
                )}
                
                {/* Search field */}
                <div onClick={(e) => e.stopPropagation()}>
                  <label htmlFor="guest-search" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
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
                      onKeyDown={(e) => {
                        e.stopPropagation(); // Prevent DetailBox from handling the event
                        // Allow normal typing behavior (spacebar, etc.)
                      }}
                      placeholder={content.seatingChart?.searchPlaceholder || 'Skriv inn navnet ditt...'}
                      className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[#E8B4B8]/30 border-t-[#E8B4B8] rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Search result */}
                  {searchResult && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-[#E8B4B8]/20 to-[#F4A261]/20 rounded-xl border-2 border-[#E8B4B8]/50">
                      <p className="font-body text-white font-medium text-lg mb-2">
                        {searchResult.name} - Bord {searchResult.table_number}, Plass {searchResult.seat_number}
                      </p>
                      <p className="font-body text-white/90 text-sm">
                        Medgjester: {searchResult.table_guests.filter(g => g.name !== searchResult.name).map(g => g.name).join(', ') || 'Ingen'}
                      </p>
                    </div>
                  )}
                  
                  {searchQuery.length >= 2 && !isSearching && !searchResult && (
                    <p className="mt-4 font-body text-white/80 text-sm text-center">
                      {content.seatingChart?.noResultsText || 'Ingen resultater funnet'}
                    </p>
                  )}
                </div>

                {/* Tables grid */}
                {tablesLoading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-body text-white/95">Laster bord-kart...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <p className="font-body text-white/80 text-center py-4">
                    Ingen bord er satt opp ennå.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" onClick={(e) => e.stopPropagation()}>
                    {tables.map((table) => {
                      const isHighlighted = searchResult?.table_number === table.table_number;
                      
                      return (
                        <div key={table.table_number} className="relative">
                          <div
                            className={`w-full aspect-square rounded-full glass-card flex flex-col items-center justify-center transition-all duration-300 ${
                              isHighlighted ? 'ring-4 ring-[#F4A261] shadow-2xl' : ''
                            }`}
                            aria-label={`Bord ${table.table_number}`}
                          >
                            <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-2">
                              {table.table_number}
                            </span>
                            <span className="text-sm md:text-base text-white/90 drop-shadow-md">
                              {table.guest_count}/{table.capacity}
                            </span>
                          </div>
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
      </div>
    </section>
  );
};
