import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  // Allow self, Supabase, Google Fonts, and necessary resources
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev, unsafe-inline for Tailwind
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind + Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts
    "img-src 'self' data: https: blob:", // Images from any HTTPS source
    "connect-src 'self' https://*.supabase.co https://*.supabase.in", // Supabase API
    "frame-src 'self' https://maps.google.com", // Google Maps iframes
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Permissions Policy (formerly Feature-Policy)
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', ');

  response.headers.set('Permissions-Policy', permissionsPolicy);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (well-known files like security.txt)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|\\.well-known).*)',
  ],
};

