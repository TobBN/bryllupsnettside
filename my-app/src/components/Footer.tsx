"use client";

import { FooterProps } from '@/types';
import { useTranslations } from 'next-intl';

export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  return (
    <footer className="bg-gradient-to-br from-[#2D1B3D] via-[#4A2B5A] to-[#2D1B3D] text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-pattern-romantic opacity-10"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center space-y-8">
          {/* Main footer content */}
          <div className="space-y-6">
            <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
              {t('heading')}
            </h3>

            <div className="w-24 h-1 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] mx-auto rounded-full"></div>

            <p className="font-body text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          <nav>
            <a
              href="/gallery"
              className="font-body text-white/80 hover:text-white transition-colors"
            >
              Galleri
            </a>
          </nav>

          {/* Contact information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
            <h4 className="font-body font-medium text-white mb-4">{t('contact')}</h4>
            <div className="grid md:grid-cols-2 gap-4 text-base">
              <div className="text-center">
                <p className="font-body text-white/80">Alexandra</p>
                <p className="font-body text-white/60">+47 950 20 606</p>
              </div>
              <div className="text-center">
                <p className="font-body text-white/80">Tobias</p>
                <p className="font-body text-white/60">+47 905 95 348</p>
              </div>
            </div>
          </div>
          
          {/* Decorative line */}
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent mx-auto rounded-full"></div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="font-body-light text-white/60">
              {t('copyright', {year: currentYear})}
            </p>
            <p className="font-small text-white/40 mt-2">
              {t('madeWith')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-[#E8B4B8]/30 rounded-full animate-float"></div>
      <div className="absolute top-20 right-20 w-2 h-2 bg-[#F4A261]/30 rounded-full animate-float-delayed"></div>
      <div className="absolute bottom-20 left-20 w-4 h-4 bg-[#E8B4B8]/20 rounded-full animate-float"></div>
    </footer>
  );
};
