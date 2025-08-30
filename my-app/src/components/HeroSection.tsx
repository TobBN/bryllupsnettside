import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CountdownTimer } from './CountdownTimer';
// import { calculateTimeLeft, WEDDING_DATE } from '@/utils/dateUtils';
import { HeroSectionProps } from '@/types';
import { isIOS as isIOSDevice, supportsBackgroundAttachmentFixed } from '@/utils/deviceUtils';

export const HeroSection: React.FC<HeroSectionProps> = ({ timeLeft }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Detect iOS using utility functions
    const checkDevice = () => {
      setIsIOS(isIOSDevice());
    };

    checkDevice();
    
    // Handle resize
    const handleResize = () => {
      checkDevice();
    };

    window.addEventListener('resize', handleResize);
    
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Enhanced JavaScript-based parallax for iOS
  useEffect(() => {
    if (!isIOS || !bgRef.current) return;

    let ticking = false;
    let lastTime = 0;

    const handleScroll = () => {
      const currentTime = performance.now();
      
      // Throttle to 60fps
      if (currentTime - lastTime < 16) return;
      lastTime = currentTime;

      if (!ticking) {
        requestAnimationFrame(() => {
          if (!heroRef.current) return;
          
          const scrollY = window.scrollY || window.pageYOffset;
          const heroRect = heroRef.current.getBoundingClientRect();
          const heroHeight = heroRect.height;
          const heroTop = heroRect.top + scrollY;
          
          // Calculate how much of the hero is visible
          const heroBottom = heroTop + heroHeight;
          const viewportHeight = window.innerHeight;
          
          // Parallax effect: move background slower than scroll
          let offset = 0;
          
          if (scrollY < heroBottom && scrollY > heroTop - viewportHeight) {
            // Calculate parallax offset based on scroll position relative to hero
            const scrollProgress = (scrollY - (heroTop - viewportHeight)) / (heroHeight + viewportHeight);
            offset = scrollProgress * heroHeight * 0.3; // 30% parallax effect
          }
          
          setParallaxOffset(offset);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isIOS]);

  // Alternative iOS parallax using CSS custom properties
  useEffect(() => {
    if (!isIOS) return;

    const updateCSSParallax = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Calculate parallax value as CSS custom property
      const parallaxValue = scrollY * 0.5; // 50% parallax effect
      
      // Set CSS custom property on document root
      document.documentElement.style.setProperty('--parallax-offset', `${parallaxValue}px`);
    };

    window.addEventListener('scroll', updateCSSParallax, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateCSSParallax);
    };
  }, [isIOS]);

  return (
    <section 
      ref={heroRef}
      className="relative h-screen flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background Image with enhanced iOS-compatible parallax */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/couple-bg.jpg)',
          backgroundAttachment: supportsBackgroundAttachmentFixed() ? 'fixed' : 'scroll',
          transform: isIOS ? `translate3d(0, ${parallaxOffset}px, 0)` : 'none',
          willChange: isIOS ? 'transform' : 'auto',
          // iOS-specific optimizations
          WebkitTransform: isIOS ? `translate3d(0, ${parallaxOffset}px, 0)` : 'none',
          WebkitBackfaceVisibility: isIOS ? 'hidden' : 'visible',
          backfaceVisibility: isIOS ? 'hidden' : 'visible'
        }}
      />
      
      {/* Alternative iOS parallax using CSS custom properties */}
      {isIOS && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat ios-parallax-fallback"
          style={{
            backgroundImage: 'url(/couple-bg.jpg)',
            transform: 'translate3d(0, var(--parallax-offset, 0px), 0)',
            WebkitTransform: 'translate3d(0, var(--parallax-offset, 0px), 0)',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        />
      )}
      
      {/* Fallback Image for mobile and better loading */}
      <Image
        src="/couple-bg.jpg"
        alt="Romantic background image of a couple"
        fill
        priority
        className={`object-cover object-center hero-bg-image transition-opacity duration-1000 md:hidden ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        sizes="100vw"
        quality={90}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* Subtle gradient overlay - much lighter for mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B3D]/30 via-[#4A2B5A]/20 to-[#E8B4B8]/10 z-10"></div>
      
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 bg-pattern-romantic opacity-30 z-5"></div>

      {/* Main content with improved animations */}
      <div className={`relative z-20 p-4 max-w-5xl mx-auto transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <header className="mb-8">
          {/* Enhanced gradient lines with animation */}
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent mx-auto mb-6 animate-fade-in-up" 
               role="presentation" 
               aria-hidden="true"></div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl leading-tight md:leading-[1.05] lg:leading-[1.02] text-white mb-6 drop-shadow-2xl tracking-wide animate-fade-in-up" style={{ fontFamily: 'Parisienne, cursive !important', fontWeight: '400 !important', letterSpacing: '0.01em' }}>
            <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s', fontFamily: 'Parisienne, cursive !important', fontWeight: '400 !important' }}>
              Alexandra
            </span>
            <span className="inline-block mx-6 text-gradient-velvet animate-fade-in-up" style={{ animationDelay: '0.4s', fontFamily: 'Parisienne, cursive !important', fontWeight: '400 !important' }}>
              &
            </span>
            <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.6s', fontFamily: 'Parisienne, cursive !important', fontWeight: '400 !important' }}>
              Tobias
            </span>
          </h1>
          
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-[#E8B4B8] to-transparent mx-auto mt-6 animate-fade-in-up" 
               role="presentation" 
               aria-hidden="true"></div>
        </header>

        <p className="font-body-light text-xl md:text-2xl lg:text-3xl text-white/95 mb-10 tracking-wide animate-fade-in-up" 
           style={{ animationDelay: '0.8s' }}>
          Save the date
          <br />
          24. juli 2026
        </p>

        {/* Countdown */}
        <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <CountdownTimer timeLeft={timeLeft} />
        </div>

        {/* Date/time as simple text (no box) */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
          <p className="font-body text-xl md:text-2xl text-white/95 mb-1 font-medium">Østgaard, Halden</p>
        </div>

        {/* Scroll indicator - positioned 30px below bottom */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-[#E8B4B8]/30 rounded-full animate-float"></div>
      <div className="absolute top-32 right-20 w-3 h-3 bg-[#F4A261]/30 rounded-full animate-float-delayed"></div>
      <div className="absolute bottom-32 left-20 w-2 h-2 bg-[#4A2B5A]/30 rounded-full animate-float"></div>
    </section>
  );
};
