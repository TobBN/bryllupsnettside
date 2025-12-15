"use client";

import { useState, useEffect } from "react";
import { TimeLeft } from "@/types";
import { calculateTimeLeft, WEDDING_DATE } from "@/utils/dateUtils";
import { useTranslations } from 'next-intl';
import { 
  HeroSection, 
  StorySection, 
  WeddingDetailsSection, 
  RSVPSection,
  SeatingChartSection,
  Footer 
} from "@/components";


export default function Home() {
  const t = useTranslations('common');
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isLoaded, setIsLoaded] = useState(true); // Start with loaded=true to prevent blocking
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Set initial time and loaded state immediately
    setTimeLeft(calculateTimeLeft(WEDDING_DATE));
    
    // Set loaded state with a minimal delay to ensure smooth transition
    const loadedTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Start countdown timer
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(WEDDING_DATE);
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(loadedTimer);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  // Update permission state on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Removed notification permission request logic

  useEffect(() => {
    if (notificationPermission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: 'scheduleNotifications',
          weddingDate: WEDDING_DATE,
        });
      });
    }
  }, [notificationPermission]);

  // Add smooth scrolling for navigation
  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId || '');
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);

  // Handle scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 900);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4]">
      {/* Loading state */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#FEFAE0] to-[#F4D1D4] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-body text-[#2D1B3D] text-lg">{t('loading')}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ease-in-out`}>
        <HeroSection timeLeft={timeLeft} />
        <WeddingDetailsSection />
        <RSVPSection />
        <StorySection />
        <SeatingChartSection />
      </main>

      <Footer />

      {/* Removed alert/notification button */}

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 w-10 h-10 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white rounded-full shadow-xl transition-all duration-300 group z-40 motion-reduce:transition-none ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label={t('scrollToTop')}
      >
        <svg className="w-5 h-5 mx-auto transform group-hover:-translate-y-0.5 transition-transform duration-300 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
