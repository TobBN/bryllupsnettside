"use client";

import { useState, useEffect } from 'react';
import { WeddingDetailsSectionProps } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
    vipps: string;
  };
  food: {
    title: string;
    description: string;
    allergyNote: string;
  };
}

interface DetailBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const DetailBox: React.FC<DetailBoxProps> = ({ title, icon, children, isExpanded, onToggle }) => {
  return (
    <div 
      className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover-lift ${
        isExpanded ? 'ring-2 ring-[#E8B4B8]/50 shadow-2xl' : ''
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={`Klikk for å ${isExpanded ? 'lukke' : 'åpne'} ${title.toLowerCase()} informasjon`}
      onKeyDown={(e) => {
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

export const WeddingDetailsSection: React.FC<WeddingDetailsSectionProps> = () => {
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const [content, setContent] = useState<WeddingDetailsContent | null>(null);
  
  const headingRef = useScrollReveal({ animationType: 'fade-up', threshold: 0.3 });
  const cardsRef = useScrollReveal({ animationType: 'scale', threshold: 0.1 });

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.weddingDetails))
      .catch(err => console.error('Error loading wedding details content:', err));
  }, []);

  const toggleBox = (title: string) => {
    if (expandedBox === title) setExpandedBox(null);
    else setExpandedBox(title);
  };

  return (
    <section id="wedding-details" className="py-20 md:py-32 relative">
      {/* Mørk overlay for kontrast */}
      <div className="absolute inset-0 bg-black/20 -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Overskrift i glassmorphism-kort */}
        <div ref={headingRef} className="mb-12">
          <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
            <h2 
              id="details-heading"
              className="text-4xl md:text-6xl leading-tight text-white mb-0 text-center drop-shadow-lg"
            >
              {content?.title || 'Selve dagen'}
            </h2>
          </div>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
              <div className="space-y-2">
                {content?.gifts.links.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-body text-[#E8B4B8] hover:text-white transition-colors block drop-shadow-sm"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 border-t border-white/30">
                  <p className="font-body text-white/95 drop-shadow-sm">
                    {content?.gifts.vipps || '💰 Vipps: til bryllupsreise'}
                  </p>
                </div>
              </div>
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
        </div>
      </div>
    </section>
  );
};
