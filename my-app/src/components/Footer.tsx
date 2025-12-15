"use client";

import { useState, useEffect } from 'react';
import { FooterProps } from '@/types';
import { useTranslations } from 'next-intl';

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

interface FAQContent {
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const [content, setContent] = useState<FooterContent | null>(null);
  const [faqContent, setFaqContent] = useState<FAQContent | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContent(data.footer);
        setFaqContent(data.faq);
      })
      .catch(err => console.error('Error loading footer content:', err));
  }, []);

  return (
    <footer className="bg-[#2D1B3D] text-white relative">
      <div className="container mx-auto px-4 py-8">
        {/* FAQ Section */}
        {faqContent && faqContent.items && faqContent.items.length > 0 && (
          <div className="mb-12 pb-8 border-b border-white/20">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 text-center">
              {faqContent.title || 'Ofte stilte spørsmål'}
            </h3>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqContent.items.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                    aria-expanded={expandedFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-body font-medium text-white pr-4">
                      {item.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-white flex-shrink-0 transition-transform duration-300 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4">
                      <p className="font-body text-white/90 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
