"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { StorySectionProps } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface TimelineItem {
  date: string;
  title: string;
  text: string;
}

interface StoryContent {
  title: string;
  subtitle: string;
  timeline: TimelineItem[];
}

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative max-w-5xl max-h-[90vh] mx-4">
        <button
          onClick={onClose}
          className="absolute -top-16 right-0 text-white hover:text-[#E8B4B8] transition-colors z-10 group"
          aria-label="Lukk bilde"
        >
          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </button>
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            width={1000}
            height={750}
            className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export const StorySection: React.FC<StorySectionProps> = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [content, setContent] = useState<StoryContent | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  const headingRef = useScrollReveal<HTMLDivElement>({ animationType: 'fade-up', threshold: 0.3 });
  const timelineRef = useScrollReveal<HTMLOListElement>({ animationType: 'fade-left', threshold: 0.2 });
  const imagesRef = useScrollReveal<HTMLDivElement>({ animationType: 'fade-right', threshold: 0.2 });

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.story))
      .catch(err => console.error('Error loading story content:', err));
  }, []);

  const storyImages = [
    { src: "/images/story-1.jpg", alt: "Alexandra og Tobias", objectClass: "object-[center_30%]" },
    { src: "/images/story-2.jpg", alt: "Alexandra og Tobias", objectClass: "object-[center_35%]" },
    { src: "/images/story-3.jpg", alt: "Alexandra og Tobias", objectClass: "object-[center_30%]" },
    { src: "/images/story-4.jpg", alt: "Alexandra og Tobias", objectClass: "object-[center_40%]" }
  ];

  const timeline = content?.timeline || [];

  const handleImageClick = (src: string, alt: string) => setSelectedImage({ src, alt });
  const closeModal = () => setSelectedImage(null);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section id="our-story" className="py-24 md:py-32 relative overflow-hidden">
      {/* Mørk overlay for kontrast (som hero-seksjonen) */}
      <div className="absolute inset-0 bg-black/20 -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Overskrift og undertittel i glassmorphism-kort */}
        <div ref={headingRef} className="mb-12">
          <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
            <h2 id="story-heading" className="text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-6 text-center drop-shadow-lg">
              {content?.title || 'Vår historie'}
            </h2>
            <p className="font-body text-lg md:text-xl text-white/95 max-w-3xl mx-auto text-center leading-[1.9] drop-shadow-md">
              {content?.subtitle || 'Et lite tilbakeblikk på vår reise sammen'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Tidslinje i glassmorphism-kort */}
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <ol ref={timelineRef} className="relative border-l-2 border-[#E8B4B8]/50 pl-6">
            {timeline.map((item, idx) => {
              const isExpanded = expandedItems.has(idx);
              return (
                <li key={idx} className="mb-10 ml-2">
                  <span className="absolute -left-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#F4A261] shadow-velvet"></span>
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]/50 rounded-lg p-2 -ml-2 transition-colors hover:bg-[#E8B4B8]/10"
                    aria-expanded={isExpanded}
                    aria-controls={`timeline-content-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-small text-white/80 mb-1 font-medium">{item.date}</p>
                        <h3 className="text-2xl md:text-3xl leading-snug text-white drop-shadow-md">{item.title}</h3>
                      </div>
                      <svg
                        className={`w-6 h-6 text-white transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div
                    id={`timeline-content-${idx}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="font-body text-white/90 leading-[1.9] drop-shadow-sm pl-2">{item.text}</p>
                  </div>
                </li>
              );
            })}
            </ol>
          </div>

          {/* Bilder - beholder eksisterende design */}
          <div ref={imagesRef} role="img" aria-label="Bilder fra vår historie" className="grid grid-cols-2 gap-6">
            {storyImages.map((img, i) => (
              <div 
                key={i}
                className="relative rounded-2xl overflow-hidden shadow-velvet card-hover cursor-pointer group aspect-[4/3] img-hover-zoom"
                onClick={() => handleImageClick(img.src, img.alt)}
                role="button"
                tabIndex={0}
                aria-label={`Klikk for å se ${img.alt} i større format`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(img.src, img.alt); }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className={`object-cover ${img.objectClass}`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B3D]/12 via-transparent to-[#E8B4B8]/15"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {selectedImage && (
          <ImageModal src={selectedImage.src} alt={selectedImage.alt} isOpen={!!selectedImage} onClose={closeModal} />
        )}
      </div>
    </section>
  );
};
