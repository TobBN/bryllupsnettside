"use client";

import { useState, useEffect } from 'react';
import { WeddingDetailsSectionProps } from '@/types';
import { DecorativeLine } from './DecorativeLine';

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
    general: string;
    men: {
      title: string;
      description: string;
    };
    women: {
      title: string;
      description: string;
    };
    note: string;
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
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#E8B4B8]/30 shadow-velvet hover-lift cursor-pointer transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-[#E8B4B8] shadow-2xl' : ''
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
            {icon}
          </div>
        </div>
        <h3 className="text-2xl leading-tight text-[#2D1B3D] mb-4">{title}</h3>
        
        {isExpanded && (
          <div className="animate-fade-in-up">
            <div className="pt-4 border-t border-[#E8B4B8]/30">
              {children}
            </div>
          </div>
        )}
        
        <div className={`mt-4 text-[#E8B4B8] transition-all duration-300 ${
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
    <section id="wedding-details" className="py-20 md:py-32 bg-gradient-to-br from-[#FEFAE0]/50 via-[#F4D1D4]/30 to-[#E8B4B8]/20">
      <div className="container mx-auto px-4">
        <DecorativeLine className="mb-8" />
        <h2 
          id="details-heading"
          className="text-4xl md:text-6xl leading-tight text-[#2D1B3D] mb-8 text-center"
        >
          {content?.title || 'Selve dagen'}
        </h2>
        <DecorativeLine className="mb-16" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Sted */}
          <DetailBox
            title={content?.venue.title || 'Sted'}
            icon={
              <svg className="w-12 h-12 text-[#2D1B3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.venue.title || 'Sted')}
            onToggle={() => toggleBox(content?.venue.title || 'Sted')}
          >
            <div className="space-y-4">
              <p className="font-body text-[#4A2B5A] leading-relaxed">
                {content?.venue.description || 'Vielse og fest på Garder Østgaard i Halden'}
              </p>
              <div className="space-y-2">
                <a 
                  href={content?.venue.website || 'https://www.garder-ostgaard.no'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-body text-[#E76F51] hover:text-[#2D1B3D] transition-colors block"
                >
                  {content?.venue.websiteLabel || 'www.garder-ostgaard.no'}
                </a>
                <a 
                  href={content?.venue.mapsLink || 'https://maps.google.com/?q=Brødenveien+31,+1763+Halden'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-body text-[#E76F51] hover:text-[#2D1B3D] transition-colors block"
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
              <svg className="w-12 h-12 text-[#2D1B3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.dressCode.title || 'Antrekk')}
            onToggle={() => toggleBox(content?.dressCode.title || 'Antrekk')}
          >
            <div className="space-y-4">
              <h4 className="text-xl leading-snug text-[#2D1B3D]">{content?.dressCode.general || 'Mørk dress / sommerformell'}</h4>
              
              <div className="space-y-3">
                <div>
                  <h5 className="font-body font-medium text-[#4A2B5A] mb-2">{content?.dressCode.men.title || 'Herrer:'}</h5>
                  <p className="font-body text-[#4A2B5A] leading-relaxed">
                    {content?.dressCode.men.description || 'Mørk dress, slips eller sløyfe, skjorte som tåler juli-varme. Lys sommerdress er lov hvis sola koker.'}
                  </p>
                </div>
                
                <div>
                  <h5 className="font-body font-medium text-[#4A2B5A] mb-2">{content?.dressCode.women.title || 'Damer:'}</h5>
                  <p className="font-body text-[#4A2B5A] leading-relaxed">
                    {content?.dressCode.women.description || 'Cocktailkjole, lang kjole eller en elegant sommerkjole – gjerne lett og sommerlig, men fortsatt pyntet.'}
                  </p>
                </div>
                
                <div className="bg-[#F4D1D4]/20 p-3 rounded-lg">
                  <p className="font-body text-[#4A2B5A] leading-relaxed">
                    <strong>Poenget:</strong> {content?.dressCode.note || 'Pent, sommerlig og høytidelig. Kle deg så du ser bra ut på bilder, men fortsatt kan spise, drikke og danse hele kvelden.'}
                  </p>
                </div>
              </div>
            </div>
          </DetailBox>

          {/* Gaveønsker */}
          <DetailBox
            title={content?.gifts.title || 'Gaveønsker'}
            icon={
              <svg className="w-12 h-12 text-[#2D1B3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            isExpanded={expandedBox === (content?.gifts.title || 'Gaveønsker')}
            onToggle={() => toggleBox(content?.gifts.title || 'Gaveønsker')}
          >
            <div className="space-y-4">
              <p className="font-body text-[#4A2B5A] leading-relaxed">
                {content?.gifts.description || 'Vi blir både glade for gaver fra ønskelisten og pengebidrag til vår bryllupsreise'}
              </p>
              <div className="space-y-2">
                {content?.gifts.links.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-body text-[#E76F51] hover:text-[#2D1B3D] transition-colors block"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 border-t border-[#E8B4B8]/30">
                  <p className="font-body text-[#4A2B5A]">
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
              <svg className="w-12 h-12 text-[#2D1B3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 3v18M8 3v18M20 3v10a4 4 0 01-4 4h-4" />
              </svg>
            }
            isExpanded={expandedBox === (content?.food.title || 'Mat')}
            onToggle={() => toggleBox(content?.food.title || 'Mat')}
          >
            <div className="space-y-4">
              <p className="font-body text-[#4A2B5A] leading-relaxed">
                {content?.food.description || 'Meny kommer...'}
              </p>
              <div className="pt-2 border-t border-[#E8B4B8]/30">
                <p className="font-small text-[#6B7280] italic">
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
