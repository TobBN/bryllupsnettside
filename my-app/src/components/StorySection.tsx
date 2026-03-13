"use client";

import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { StorySectionProps } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useContent } from './ContentContext';

interface TimelineItem {
  date: string;
  title: string;
  text: string;
  image?: {
    url: string;
    alt: string;
    storageName?: string;
  };
}

interface StoryImage {
  url: string;
  alt: string;
  storageName?: string;
}

interface StoryContent {
  title: string;
  subtitle: string;
  timeline: TimelineItem[];
  images?: StoryImage[];
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
          className="absolute -top-14 right-0 text-white hover:text-[#E8B4B8] transition-colors z-10 group"
          aria-label="Lukk bilde"
        >
          <div className="w-11 h-11 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-black/70 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </button>
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
  );
};

export const StorySection: React.FC<StorySectionProps> = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const contentData = useContent();
  const content = contentData?.story as StoryContent | undefined;
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const headingRef = useScrollReveal<HTMLDivElement>({ animationType: 'fade-up', threshold: 0.3 });
  const timelineRef = useScrollReveal<HTMLOListElement>({ animationType: 'fade-left', threshold: 0.2 });
  const imagesRef = useScrollReveal<HTMLDivElement>({ animationType: 'fade-right', threshold: 0.2 });

  const defaultImages = useMemo(() => [
    { src: "/images/story-1.jpg", alt: "Alexandra og Tobias" },
    { src: "/images/story-2.jpg", alt: "Alexandra og Tobias" },
    { src: "/images/story-3.jpg", alt: "Alexandra og Tobias" },
    { src: "/images/story-4.jpg", alt: "Alexandra og Tobias" }
  ], []);

  const storyImages = useMemo(() => {
    if (content?.images && content.images.length > 0) {
      return content.images.map((img) => ({ src: img.url, alt: img.alt }));
    }
    return defaultImages;
  }, [content?.images, defaultImages]);

  const timeline = useMemo(() => content?.timeline || [], [content?.timeline]);

  const handleImageClick = useCallback((src: string, alt: string) => {
    setSelectedImage({ src, alt });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const toggleItem = useCallback((index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }, []);

  return (
    <section id="our-story" className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* Section heading — always visible */}
        <div ref={headingRef} className="mb-10">
          <div className="glass-card rounded-2xl p-7 md:p-9 max-w-xl mx-auto text-center">
            <h2 id="story-heading" className="text-3xl sm:text-4xl md:text-5xl leading-tight text-white drop-shadow-lg mb-3">
              {content?.title || 'Vår historie'}
            </h2>
            <p className="font-body text-base md:text-lg text-white/85 leading-relaxed drop-shadow-sm">
              {content?.subtitle || 'Et lite tilbakeblikk på vår reise sammen'}
            </p>
          </div>
        </div>

        {/* Content — always visible */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8 items-start">

          {/* Timeline */}
          <div className="glass-card rounded-2xl p-5 md:p-7">
            <ol ref={timelineRef} className="relative border-l-2 border-[#E8B4B8]/40 pl-5 space-y-0">
              {timeline.map((item, idx) => {
                const isExpanded = expandedItems.has(idx);
                return (
                  <li key={idx} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[25px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#F4A261] shadow-md" />

                    <button
                      onClick={() => toggleItem(idx)}
                      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]/50 rounded-lg px-2 py-1.5 -ml-2 transition-colors hover:bg-white/5"
                      aria-expanded={isExpanded}
                      aria-controls={`timeline-content-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/60 font-medium mb-0.5 uppercase tracking-wide">{item.date}</p>
                          <h3 className="text-lg sm:text-xl leading-snug text-white drop-shadow-sm font-semibold">{item.title}</h3>
                        </div>
                        <svg
                          className={`w-4 h-4 text-white/60 shrink-0 mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <div
                      id={`timeline-content-${idx}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="font-body text-sm sm:text-base text-white/85 leading-relaxed drop-shadow-sm pl-2 pr-6">{item.text}</p>
                      {item.image && (
                        <div
                          className="mt-3 pl-2 pr-6 cursor-pointer"
                          onClick={() => handleImageClick(item.image!.url, item.image!.alt)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Se ${item.image.alt} i full størrelse`}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(item.image!.url, item.image!.alt); }}
                        >
                          <div className="relative rounded-xl overflow-hidden shadow-md group aspect-[16/9]">
                            <Image
                              src={item.image.url}
                              alt={item.image.alt}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 90vw, 40vw"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-black/40 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Photos grid */}
          <div ref={imagesRef} role="group" aria-label="Bilder fra vår historie" className="grid grid-cols-2 gap-3 md:gap-4">
            {storyImages.map((img, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group aspect-[4/3]"
                onClick={() => handleImageClick(img.src, img.alt)}
                role="button"
                tabIndex={0}
                aria-label={`Se ${img.alt} i full størrelse`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(img.src, img.alt); }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B3D]/10 via-transparent to-[#E8B4B8]/10 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/40 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageModal src={selectedImage.src} alt={selectedImage.alt} isOpen={!!selectedImage} onClose={closeModal} />
      )}
    </section>
  );
};
