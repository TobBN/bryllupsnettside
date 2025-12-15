"use client";

import { useState, useEffect } from "react";
import { CountdownTimer } from './CountdownTimer';
import { HeroSectionProps } from '@/types';
import { useTranslations } from 'next-intl';

interface HeroContent {
  date: string;
  location: string;
  names: {
    bride: string;
    groom: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ timeLeft }) => {
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState<HeroContent | null>(null);
  const t = useTranslations('hero');

  useEffect(() => {
    setMounted(true);
    // Fetch content from API
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.hero))
      .catch(err => console.error('Error loading hero content:', err));
  }, []);

  // Determine greeting text based on days until wedding
  const getGreetingText = (): string => {
    const daysUntilWedding = timeLeft.days;
    
    // If wedding is today or has passed
    if (daysUntilWedding === 0) {
      return t('welcomeToWedding');
    }
    
    // If 1 day until wedding (day before)
    if (daysUntilWedding === 1) {
      return t('welcomeToWedding');
    }
    
    // If 2 days or more until wedding
    return t('weAreGettingMarried');
  };

  return (
    <>
      {/* Global fixed background - visible throughout the page */}
      <div
        className="fixed inset-0 z-0 bg-[url('/couple-bg.jpg')] bg-cover bg-no-repeat bg-[position:center_30%] hero-bg-fixed"
      />
      
      <section
        className="relative flex min-h-screen items-end justify-center pb-16 z-10"
        aria-label="Forside"
      >
        {/* Content card - proportional scaling with enhanced glassmorphism */}
        <div
          className={`relative z-20 mx-4 w-full
          max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl
          rounded-2xl glass-card
          p-6 sm:p-8 md:p-10 lg:p-12
          transition-all duration-700 motion-reduce:transition-none motion-reduce:transform-none ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} motion-reduce:translate-y-0`}
        >
          {/* Decorative line - scales with container */}
          <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-1 
                          bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent 
                          mx-auto mb-4 sm:mb-6" 
               role="presentation" 
               aria-hidden="true"></div>
          
          {/* Main heading - proportional text scaling */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 
                         font-semibold text-white drop-shadow-lg text-center mb-3 sm:mb-4"
          >
            <span className="inline-block">{content?.names.bride || 'Alexandra'}</span>
            <span className="inline-block mx-2 sm:mx-3 md:mx-4 text-[#E8B4B8]">&</span>
            <span className="inline-block">{content?.names.groom || 'Tobias'}</span>
          </h1>

          {/* Date and location - consistent scaling */}
          <div className="text-center text-white/95 mb-4 sm:mb-6 space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base md:text-lg">
              {getGreetingText()}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium">
              {content?.date || t('date')}
            </p>
            <p className="text-sm sm:text-base md:text-lg">
              {content?.location || t('location')}
            </p>
          </div>

          {/* Countdown timer - scales with container */}
          <div className="mb-4 sm:mb-6">
            <CountdownTimer timeLeft={timeLeft} />
          </div>

          {/* Bottom decorative line */}
          <div className="w-20 sm:w-24 md:w-28 lg:w-40 h-0.5 sm:h-1 
                          bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent 
                          mx-auto" 
               role="presentation" 
               aria-hidden="true"></div>
        </div>
      </section>
    </>
  );
};