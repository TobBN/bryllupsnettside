"use client";

import { useState, useEffect } from "react";
import { TimeLeft } from "@/types";
import { calculateTimeLeft, WEDDING_DATE } from "@/utils/dateUtils";
import {
  HeroSection,
  StorySection,
  WeddingDetailsSection,
  RSVPSection,
  Footer,
  ContentProvider,
} from "@/components";

interface HomeClientProps {
  initialContent: Record<string, unknown> | null;
}

export default function HomeClient({ initialContent }: HomeClientProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(WEDDING_DATE));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(WEDDING_DATE));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId || '');
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 900);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pink-light">
      <ContentProvider initialContent={initialContent}>
        <main>
          <HeroSection timeLeft={timeLeft} />
          <WeddingDetailsSection />
          <RSVPSection />
          <StorySection />
        </main>

        <Footer />
      </ContentProvider>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 w-10 h-10 bg-gradient-to-r from-pink to-apricot text-white rounded-full shadow-xl transition-all duration-300 group z-40 motion-reduce:transition-none ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Rull til toppen"
      >
        <svg className="w-5 h-5 mx-auto transform group-hover:-translate-y-0.5 transition-transform duration-300 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
