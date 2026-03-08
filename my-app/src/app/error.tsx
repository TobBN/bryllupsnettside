"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page render error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0] p-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#2D1B3D]">Noe gikk galt</h2>
        <p className="text-[#2D1B3D]/70 text-sm font-mono bg-gray-100 rounded p-3 text-left break-all">
          {error.message}
        </p>
        {error.digest && (
          <p className="text-[#2D1B3D]/50 text-xs">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#E8B4B8] text-white rounded-full hover:bg-[#d4a0a4] transition-colors"
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );
}
