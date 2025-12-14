"use client";

import { useState, useEffect } from 'react';
import { FooterProps } from '@/types';
import { useTranslations } from 'next-intl';

interface FooterContent {
  heading: string;
  tagline: string;
  contact: {
    title: string;
    bride: {
      name: string;
      phone: string;
    };
    groom: {
      name: string;
      phone: string;
    };
  };
}

export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const [content, setContent] = useState<FooterContent | null>(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.footer))
      .catch(err => console.error('Error loading footer content:', err));
  }, []);

  return (
    <footer className="bg-[#2D1B3D] text-white relative">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Main footer content */}
          <div className="space-y-3">
            <h3 className="font-display text-2xl md:text-3xl text-white">
              {content?.heading || t('heading')}
            </h3>

            <p className="font-body text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              {content?.tagline || t('tagline')}
            </p>
          </div>

          <nav>
            <a
              href="/gallery"
              className="link-hover font-body text-white/80 hover:text-white transition-colors"
            >
              Galleri
            </a>
          </nav>

          {/* Contact info - clickable */}
          <div className="space-y-2">
            <p className="font-body text-sm text-white/80">
              Ta kontakt med oss direkte for spørsmål
            </p>
            <button
              onClick={() => setShowContact(!showContact)}
              className="font-body text-sm text-white/70 hover:text-white transition-colors underline cursor-pointer"
              aria-expanded={showContact}
              aria-label={showContact ? 'Skjul kontaktinformasjon' : 'Vis kontaktinformasjon'}
            >
              {showContact ? 'Skjul kontaktinfo' : 'Vis kontaktinfo'}
            </button>
            {showContact && (
              <p className="font-body text-sm text-white/70 mt-2">
                {content?.contact.bride.name || 'Alexandra'}: {content?.contact.bride.phone || '+47 950 20 606'} • {content?.contact.groom.name || 'Tobias'}: {content?.contact.groom.phone || '+47 905 95 348'}
              </p>
            )}
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="font-body-light text-white/60">
              {t('copyright', {year: currentYear})}
            </p>
            <p className="font-small text-white/40 mt-1">
              {t('madeWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
