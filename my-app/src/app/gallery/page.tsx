import Image from "next/image";
import { Footer } from "@/components/Footer";

const images = [
  "/images/story-1.jpg",
  "/images/story-2.jpg",
  "/images/story-3.jpg",
  "/images/story-4.jpg",
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4]">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-center font-display text-4xl text-[#2D1B3D] mb-8">Galleri</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, index) => (
            <div key={index} className="relative w-full h-64">
              <Image
                src={src}
                alt={`Galleri bilde ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
