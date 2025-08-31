"use client";

import { useState, useEffect } from "react";
import { CountdownTimer } from './CountdownTimer';
import { HeroSectionProps } from '@/types';
import { useTranslations } from 'next-intl';

export const HeroSection: React.FC<HeroSectionProps> = ({ timeLeft }) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('hero');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="relative flex min-h-[70vh] items-end justify-center"
      aria-label="Forside"
    >
      {/* Fixed background image - iOS-safe implementation */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/couple-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
          // iOS-safe: avoid background-attachment: fixed
        }}
      />
      
      {/* Dim overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content card that scrolls over the fixed background */}
      <div
        className={`relative z-10 mx-4 mb-16 w-full max-w-3xl rounded-2xl bg-white/30 p-8 backdrop-blur-sm
        shadow-xl transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        {/* Decorative line */}
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent mx-auto mb-6" 
             role="presentation" 
             aria-hidden="true"></div>
        
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white drop-shadow-lg text-center mb-4"
            style={{ fontFamily: 'Parisienne, cursive' }}>
          <span className="inline-block">Alexandra</span>
          <span className="inline-block mx-4 text-[#E8B4B8]">&</span>
          <span className="inline-block">Tobias</span>
        </h1>

        {/* Date and location */}
        <p className="text-center text-lg md:text-xl text-white/95 mb-6">
          {t('saveTheDate')}
          <br />
          <span className="text-xl md:text-2xl font-medium">{t('date')}</span>
          <br />
          {t('location')}
        </p>

        {/* Countdown timer */}
        <div className="mb-6">
          <CountdownTimer timeLeft={timeLeft} />
        </div>

        {/* Decorative line */}
        <div className="w-40 h-1 bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent mx-auto" 
             role="presentation" 
             aria-hidden="true"></div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-[#E8B4B8]/30 rounded-full animate-float"></div>
      <div className="absolute top-32 right-20 w-3 h-3 bg-[#F4A261]/30 rounded-full animate-float-delayed"></div>
      <div className="absolute bottom-32 left-20 w-2 h-2 bg-[#4A2B5A]/30 rounded-full animate-float"></div>
    </section>
  );
};