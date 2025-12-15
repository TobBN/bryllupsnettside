"use client";

import { useState, useEffect } from "react";
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScheduleContent {
  title: string;
  subtitle: string;
  items: Array<{
    time: string;
    title: string;
    description?: string;
  }>;
}

export const ScheduleSection: React.FC = () => {
  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(false);
  const [content, setContent] = useState<ScheduleContent | null>(null);

  const headingRef = useScrollReveal<HTMLDivElement>({ animationType: 'fade-up', threshold: 0.3 });

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.schedule))
      .catch(err => console.error('Error loading schedule content:', err));
  }, []);

  return (
    <section id="schedule" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Overskrift i glassmorphism-kort */}
        <div ref={headingRef} className="mb-12">
          <button
            onClick={() => setIsSectionExpanded(!isSectionExpanded)}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]/50 rounded-2xl transition-all duration-300 hover:ring-2 hover:ring-[#E8B4B8]/30"
            aria-expanded={isSectionExpanded}
            aria-controls="schedule-content"
            aria-label={isSectionExpanded ? 'Kollaps program' : 'Ekspander program'}
          >
            <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 id="schedule-heading" className="text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-6 text-center drop-shadow-lg">
                    {content?.title || 'Program'}
                  </h2>
                  <p className="font-body text-lg md:text-xl text-white/95 max-w-3xl mx-auto text-center leading-[1.9] drop-shadow-md">
                    {content?.subtitle || 'Tidsplan for dagen'}
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
          id="schedule-content"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSectionExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {content && content.items && content.items.length > 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="glass-card rounded-2xl p-6 md:p-8">
                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E8B4B8] via-[#F4A261] to-[#E8B4B8]"></div>
                  
                  {/* Timeline items */}
                  <div className="space-y-8">
                    {content.items.map((item, index) => (
                      <div key={index} className="relative pl-20">
                        {/* Timeline dot */}
                        <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] border-2 border-white shadow-lg"></div>
                        
                        {/* Content */}
                        <div className="glass-card rounded-xl p-4 md:p-6 bg-white/10 backdrop-blur-sm">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                            <div className="flex-shrink-0">
                              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                                {item.time}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 drop-shadow-md">
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
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-white/95 text-lg">Ingen programpunkter er satt opp ennå.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

