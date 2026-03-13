import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseServer } from '@/lib/supabase';

// Throw at runtime, not at build time (NEXT_PHASE is set during `next build`)
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build' &&
  !process.env.COOKIE_SECRET
) {
  throw new Error('COOKIE_SECRET env var er påkrevd i produksjon. Sett den i Vercel Dashboard.');
}
const SECRET_KEY = process.env.COOKIE_SECRET || process.env.ADMIN_PASSWORD || 'dev-only-secret';

// Timing-safe password comparison to prevent timing attacks
export function timingSafeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, 'utf8');
  const bBuffer = Buffer.from(b, 'utf8');

  // Length difference is unavoidably leaked, but we still do constant-time
  // comparison on the content to avoid leaking *which* bytes differ.
  if (aBuffer.length !== bBuffer.length) {
    // Compare against self so we burn the same CPU time, then return false
    timingSafeEqual(aBuffer, aBuffer);
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

// Sign cookie value
export function signCookie(value: string): string {
  const hmac = createHmac('sha256', SECRET_KEY);
  hmac.update(value);
  const signature = hmac.digest('hex');
  return `${value}.${signature}`;
}

// Verify signed cookie
export function verifyCookie(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  
  const [value, signature] = parts;
  const expectedSignature = createHmac('sha256', SECRET_KEY)
    .update(value)
    .digest('hex');
  
  if (!timingSafeCompare(signature, expectedSignature)) {
    return null;
  }
  
  return value;
}

// Rate limiting check — uses Supabase for persistence across serverless restarts.
// Fails open (allows request) if the DB call fails, to avoid locking out legitimate users.
export async function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): Promise<boolean> {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
      p_identifier: identifier,
      p_max_attempts: maxAttempts,
      p_window_ms: windowMs,
    });

    if (error) {
      console.warn(JSON.stringify({ event: 'rate_limit_db_error', error: error.message }));
      return true; // Fail open
    }

    return data as boolean;
  } catch {
    return true; // Fail open
  }
}

// Get client identifier for rate limiting
export function getClientIdentifier(request: Request | { headers: { get: (key: string) => string | null } }): string {
  // Use IP address from headers (Vercel sets x-forwarded-for)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return ip;
}

// Log security events
export function logSecurityEvent(event: string, data: Record<string, unknown>, severity: 'info' | 'warning' | 'error' = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    data,
  };
  const message = JSON.stringify(logEntry);
  if (severity === 'error') {
    console.error(message);
  } else if (severity === 'warning') {
    console.warn(message);
  } else {
    console.log(message);
  }
}

// Validate and sanitize JSON content structure
export function validateContentStructure(content: unknown): boolean {
  if (!content || typeof content !== 'object') {
    return false;
  }
  
  const requiredFields = ['hero', 'story', 'weddingDetails', 'footer', 'rsvp'];
  const obj = content as Record<string, unknown>;
  
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return false;
    }
    if (typeof obj[field] !== 'object' || obj[field] === null) {
      return false;
    }
  }
  
  return true;
}

