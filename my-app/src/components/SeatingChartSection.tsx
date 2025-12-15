"use client";

import { useState, useEffect } from "react";
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface SeatingChartContent {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  noResultsText: string;
}

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

export const SeatingChartSection: React.FC = () => {
  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(false);
  const [content, setContent] = useState<SeatingChartContent | null>(null);
  const [tables, setTables] = useState<PublicTable[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tablesLoading, setTablesLoading] = useState<boolean>(true);

  const headingRef = useScrollReveal<HTMLDivElement>({ animationType: 'fade-up', threshold: 0.3 });

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.seatingChart))
      .catch(err => console.error('Error loading seating chart content:', err));
  }, []);

  useEffect(() => {
    if (isSectionExpanded) {
      loadTables();
    }
  }, [isSectionExpanded]);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2) {
      setSearchResult(null);
      return;
    }

    try {
      setIsSearching(true);
      const res = await fetch(`/api/seating/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.success && data.found) {
        setSearchResult(data.data);
        setSelectedTable(data.data.table_number);
      } else {
        setSearchResult(null);
        setSelectedTable(null);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTableClick = (tableNumber: number) => {
    if (selectedTable === tableNumber) {
      setSelectedTable(null);
    } else {
      setSelectedTable(tableNumber);
    }
  };

  return (
    <section id="seating-chart" className="py-24 md:py-32 relative overflow-hidden">
      {/* Mørk overlay for kontrast */}
      <div className="absolute inset-0 bg-black/20 -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Overskrift i glassmorphism-kort */}
        <div ref={headingRef} className="mb-12">
          <button
            onClick={() => setIsSectionExpanded(!isSectionExpanded)}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]/50 rounded-2xl transition-all duration-300 hover:ring-2 hover:ring-[#E8B4B8]/30"
            aria-expanded={isSectionExpanded}
            aria-controls="seating-chart-content"
            aria-label={isSectionExpanded ? 'Kollaps bord-kart' : 'Ekspander bord-kart'}
          >
            <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 id="seating-heading" className="text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-6 text-center drop-shadow-lg">
                    {content?.title || 'Bord-kart'}
                  </h2>
                  <p className="font-body text-lg md:text-xl text-white/95 max-w-3xl mx-auto text-center leading-[1.9] drop-shadow-md">
                    {content?.subtitle || 'Finn ditt bord'}
                  </p>
                </div>
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
          id="seating-chart-content"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSectionExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Søkefelt */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="glass-card rounded-2xl p-6">
              <label htmlFor="guest-search" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                {content?.searchLabel || 'Søk etter navn'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="guest-search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={content?.searchPlaceholder || 'Skriv inn navnet ditt...'}
                  className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#E8B4B8]/30 border-t-[#E8B4B8] rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Søkeresultat */}
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
                  {content?.noResultsText || 'Ingen resultater funnet'}
                </p>
              )}
            </div>
          </div>

          {/* Bord-kart */}
          {tablesLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-body text-white/95">Laster bord-kart...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-white/95 text-lg">Ingen bord er satt opp ennå.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {tables.map((table) => {
                const isSelected = selectedTable === table.table_number;
                const isHighlighted = searchResult?.table_number === table.table_number;
                
                return (
                  <div key={table.table_number} className="relative">
                    <button
                      onClick={() => handleTableClick(table.table_number)}
                      className={`w-full aspect-square rounded-full glass-card flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/20 ${
                        isHighlighted ? 'ring-4 ring-[#F4A261] shadow-2xl' : ''
                      } ${isSelected ? 'ring-2 ring-[#E8B4B8]' : ''}`}
                      aria-label={`Bord ${table.table_number}`}
                    >
                      <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-2">
                        {table.table_number}
                      </span>
                      <span className="text-sm md:text-base text-white/90 drop-shadow-md">
                        {table.guest_count}/{table.capacity}
                      </span>
                    </button>
                    
                    {/* Gjesterliste når bordet er valgt */}
                    {isSelected && (
                      <div className="absolute top-full left-0 right-0 mt-4 glass-card rounded-2xl p-4 z-10">
                        <h3 className="font-body font-semibold text-white mb-3 text-center">
                          Bord {table.table_number}
                        </h3>
                        <ul className="space-y-2">
                          {table.guests.length > 0 ? (
                            table.guests.map((guest, idx) => (
                              <li key={idx} className="font-body text-white/95 text-sm">
                                {guest.name}
                              </li>
                            ))
                          ) : (
                            <li className="font-body text-white/70 text-sm italic text-center">
                              Ingen gjester satt opp
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

