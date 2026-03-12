import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-6xl text-[#E8B4B8] mb-4">404</h1>
        <h2 className="font-display text-2xl text-[#2D1B3D] mb-3">Siden finnes ikke</h2>
        <p className="font-body text-[#4A2B5A]/70 mb-8">
          Denne siden eksisterer ikke. Kanskje du lette etter bryllupssiden?
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-7 py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
        >
          Til forsiden
        </Link>
      </div>
    </div>
  );
}
