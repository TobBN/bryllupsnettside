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
  const [isLoaded, setIsLoaded] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Set initial time and mark content as loaded
    setTimeLeft(calculateTimeLeft(WEDDING_DATE));
    setIsLoaded(true);

    // Start countdown timer
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(WEDDING_DATE);
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => {
      clearInterval(timer);
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

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: 'scheduleNotifications',
        weddingDate: WEDDING_DATE,
      });
    }
  };

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
      <main className={isLoaded ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 0.5s ease-in-out' }}>
        <HeroSection timeLeft={timeLeft} />
        <div className="h-8 bg-gradient-to-b from-transparent via-[#F4D1D4]/10 to-transparent" />
        <StorySection />
        <div className="h-8 bg-gradient-to-b from-transparent via-[#FEFAE0]/12 to-transparent" />
        <WeddingDetailsSection />
        <div className="h-8 bg-gradient-to-b from-transparent via-[#E8B4B8]/10 to-transparent" />
        <RSVPSection />
      </main>

      <Footer />

      {notificationPermission !== 'granted' && (
        <button
          onClick={requestNotificationPermission}
          className="fixed bottom-8 left-8 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white px-4 py-2 rounded-full shadow-2xl hover-lift transition-all duration-300 z-40"
        >
          Aktiver varsler
        </button>
      )}

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white rounded-full shadow-2xl hover-lift transition-all duration-300 opacity-0 hover:opacity-100 group z-40"
        aria-label={t('scrollToTop')}
        style={{
          opacity: typeof window !== 'undefined' && window.scrollY > 500 ? 1 : 0
        }}
      >
        <svg className="w-6 h-6 mx-auto transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
