import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Hex is fine as a nonce token
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getSupabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const supabaseOrigin = getSupabaseOrigin();
  const isProd = process.env.NODE_ENV === 'production';

  // Propagate nonce to Next.js
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security headers (keep the ones that are already OK)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'same-origin');

  // Content Security Policy (Internet.nl-friendly)
  // - No unsafe-inline/unsafe-eval in production
  // - No broad scheme allowlist like img-src https:
  const connectSrc = ["'self'", supabaseOrigin].filter(Boolean).join(' ');
  const scriptSrc = isProd
    ? ["'self'", 'unsafe-inline' 'unsafe-eval'].join(' ')
    : ["'self'", 'unsafe-inline' 'unsafe-eval', "'unsafe-eval'"].join(' '); // dev-only HMR convenience

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // No inline style attributes; keep style-src strict
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSrc}`,
    // No embedded frames needed for this site; links to maps are regular anchors
    "frame-src 'self' https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Permissions Policy (formerly Feature-Policy)
  response.headers.set(
    'Permissions-Policy',
    ['camera=()', 'microphone=()', 'geolocation=()', 'interest-cohort=()'].join(', ')
  );

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

