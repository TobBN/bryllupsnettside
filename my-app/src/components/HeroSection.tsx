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
      {/* Global fixed background for iOS-safe scroll-over effect */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/couple-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll", // Avoid iOS issues
        }}
      />
      
      <section
        className="relative flex min-h-screen items-end justify-center pb-16 z-10"
        aria-label="Forside"
      >
        {/* Dim overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 -z-10" />
        
        {/* Content card - proportional scaling */}
        <div
          className={`relative z-20 mx-4 w-full
          max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl
          rounded-2xl bg-white/25 backdrop-blur-sm
          p-6 sm:p-8 md:p-10 lg:p-12
          shadow-2xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
              style={{ fontFamily: 'Parisienne, cursive' }}>
            <span className="inline-block">Alexandra</span>
            <span className="inline-block mx-2 sm:mx-3 md:mx-4 text-[#E8B4B8]">&</span>
            <span className="inline-block">Tobias</span>
          </h1>

          {/* Date and location - consistent scaling */}
          <div className="text-center text-white/95 mb-4 sm:mb-6 space-y-1 sm:space-y-2">
            <p className="text-sm sm:text-base md:text-lg">
              {getGreetingText()}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium">
              {t('date')}
            </p>
            <p className="text-sm sm:text-base md:text-lg">
              {t('location')}
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

        {/* Scroll indicator - consistent size */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-5 sm:w-6 h-8 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-1 sm:mt-2 animate-pulse"></div>
          </div>
        </div>

        {/* Floating decorative elements - scale with screen */}
        <div className="absolute top-16 sm:top-20 left-6 sm:left-10 
                        w-3 sm:w-4 h-3 sm:h-4 bg-[#E8B4B8]/30 rounded-full animate-float z-20"></div>
        <div className="absolute top-24 sm:top-32 right-12 sm:right-20 
                        w-2 sm:w-3 h-2 sm:h-3 bg-[#F4A261]/30 rounded-full animate-float-delayed z-20"></div>
        <div className="absolute bottom-24 sm:bottom-32 left-12 sm:left-20 
                        w-2 h-2 bg-[#4A2B5A]/30 rounded-full animate-float z-20"></div>
      </section>
    </>
  );
};