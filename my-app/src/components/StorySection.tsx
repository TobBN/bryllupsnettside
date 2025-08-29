import Image from "next/image";
import { useState } from "react";
import { StorySectionProps } from '@/types';
import { DecorativeLine } from './DecorativeLine';

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

  const storyImages = [
    { src: "/images/story-1.jpg", alt: "Alexandra og Tobias", position: "center 30%" },
    { src: "/images/story-2.jpg", alt: "Alexandra og Tobias", position: "center 35%" },
    { src: "/images/story-3.jpg", alt: "Alexandra og Tobias", position: "center 30%" },
    { src: "/images/story-4.jpg", alt: "Alexandra og Tobias", position: "center 40%" }
  ];

  const timeline = [
    { date: "Våren 2016", title: "Vi møttes", text: "En solfull dag i Son – en gåtur, en nedlagt jernbanelinje langs sjøen, og en klem som ble starten på alt." },
    { date: "Sommeren 2018", title: "Vår nye hverdag", text: "Midnattsol og mørketid, familieliv og små eventyr som gjorde oss til verdens beste team." },
    { date: "September 2018", title: "Familien øker", text: "Leah, vårt første barn, kommer til verden og sammen er vi nå tre." },
    { date: "Oktober 2019", title: "Familien øker igjen", text: "Lucas kommer som nummer to, lykken er stor og søvnmangelen merkes." },
    { date: "Mars 2021", title: "Familien øker enda en gang", text: "Live ankommer familien som en virvelvind, vi er nå fem i huset." },
    { date: "Oktober 2022", title: "Forlovelsen", text: "Et «ja» på bursdagen til Alexandra, med barna rundt oss, og utsikt over vannet og fremtiden." },
    { date: "Juli 2024", title: "Hjemkomsten", text: "Vi flytter tilbake til Sør-Norge, og begynner å bygge vårt nye liv her." },
    { date: "Sommeren 2026", title: "Bryllup", text: "Vi gleder oss til å feire kjærligheten sammen med dere alle." }
  ];

  const handleImageClick = (src: string, alt: string) => setSelectedImage({ src, alt });
  const closeModal = () => setSelectedImage(null);

  return (
    <section id="our-story" className="py-24 md:py-32 bg-gradient-to-b from-[#F4D1D4]/25 via-[#FEFAE0]/60 to-[#E8B4B8]/25 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-romantic opacity-20"></div>
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#2D1B3D]/10 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <DecorativeLine className="mb-8" />
        <h2 id="story-heading" className="text-4xl md:text-6xl lg:text-7xl leading-tight text-[#2D1B3D] mb-6 text-center" style={{ fontFamily: 'Parisienne, cursive' }}>
          Vår historie
        </h2>
        <p className="font-body text-lg md:text-xl text-[#4A2B5A]/90 max-w-3xl mx-auto text-center mb-14 leading-[1.9]">
          Et lite tilbakeblikk på vår reise sammen
        </p>
        <DecorativeLine className="mb-12" />

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <ol className="relative border-l-2 border-[#E8B4B8]/50 pl-6">
            {timeline.map((item, idx) => (
              <li key={idx} className="mb-10 ml-2">
                <span className="absolute -left-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#E8B4B8] to-[#F4A261] shadow-velvet"></span>
                <p className="font-small text-[#6B7280] mb-1">{item.date}</p>
                <h3 className="text-2xl md:text-3xl leading-snug text-[#2D1B3D] mb-2">{item.title}</h3>
                <p className="font-body text-[#4A2B5A] leading-[1.9]">{item.text}</p>
              </li>
            ))}
          </ol>

          <div role="img" aria-label="Bilder fra vår historie" className="grid grid-cols-2 gap-6">
            {storyImages.map((img, i) => (
              <div 
                key={i}
                className="relative rounded-2xl overflow-hidden shadow-velvet hover-lift cursor-pointer group"
                style={{ aspectRatio: '4 / 3' }}
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
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: img.position }}
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
