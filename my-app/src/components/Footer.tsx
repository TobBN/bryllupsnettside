"use client";

import { useState } from 'react';
import { FooterProps } from '@/types';
import { useTranslations } from 'next-intl';
import { useContent } from './ContentContext';

interface FooterContent {
  heading: string;
  tagline: string;
  contactText: string;
  showContactText: string;
  hideContactText: string;
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
  const contentData = useContent();
  const content = contentData?.footer as FooterContent | undefined;
  const [showContact, setShowContact] = useState(false);

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

          {/* Contact info - clickable */}
          <div className="space-y-2">
            <p className="font-body text-sm text-white/80">
              {content?.contactText || 'Ta kontakt med oss direkte for spørsmål'}
            </p>
            <button
              onClick={() => setShowContact(!showContact)}
              className="font-body text-sm text-white/70 hover:text-white transition-colors underline cursor-pointer"
              aria-expanded={showContact}
              aria-label={showContact ? (content?.hideContactText || 'Skjul kontaktinformasjon') : (content?.showContactText || 'Vis kontaktinformasjon')}
            >
              {showContact ? (content?.hideContactText || 'Skjul kontaktinfo') : (content?.showContactText || 'Vis kontaktinfo')}
            </button>
            {showContact && content?.contact && (
              <p className="font-body text-sm text-white/70 mt-2">
                {content.contact.bride.name}: {content.contact.bride.phone} • {content.contact.groom.name}: {content.contact.groom.phone}
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
