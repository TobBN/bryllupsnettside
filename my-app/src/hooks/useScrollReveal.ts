"use client";

import { useEffect, useRef, RefObject } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animationType?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
}

export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): RefObject<T> => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    animationType = 'fade-up'
  } = options;

  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      element.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove('revealed');
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Add appropriate animation class
    const animationClass = `scroll-reveal-${animationType}`;
    element.classList.add(animationClass);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce, animationType]);

  return elementRef;
};

