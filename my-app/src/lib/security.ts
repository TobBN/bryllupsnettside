import { createHmac, timingSafeEqual } from 'crypto';
import { appendFileSync } from 'fs';
import { join } from 'path';

const LOG_PATH = join(process.cwd(), '.cursor', 'debug.log');
const SECRET_KEY = process.env.COOKIE_SECRET || process.env.ADMIN_PASSWORD || 'default-secret-change-in-production';

// Rate limiting store (in-memory, reset on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Timing-safe password comparison to prevent timing attacks
export function timingSafeCompare(a: string, b: string): boolean {
  // Normalize lengths to prevent timing leaks
  const maxLength = Math.max(a.length, b.length);
  const aBuffer = Buffer.alloc(maxLength, 0);
  const bBuffer = Buffer.alloc(maxLength, 0);
  aBuffer.write(a, 0, 'utf8');
  bBuffer.write(b, 0, 'utf8');
  
  try {
    // timingSafeEqual throws if buffers differ, returns undefined if equal
    timingSafeEqual(aBuffer, bBuffer);
    return a === b; // Double check actual values match
  } catch {
    return false;
  }
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

// Rate limiting check
export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
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
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      data,
      location: 'security.ts',
    };
    appendFileSync(LOG_PATH, JSON.stringify(logEntry) + '\n');
  } catch {
    // Silently fail if logging fails
  }
}

// Validate and sanitize JSON content structure
export function validateContentStructure(content: unknown): boolean {
  if (!content || typeof content !== 'object') {
    // #region agent log
    logSecurityEvent('validate_structure_fail', { reason: 'not_object', type: typeof content }, 'info');
    // #endregion
    return false;
  }
  
  const requiredFields = ['hero', 'story', 'weddingDetails', 'footer', 'rsvp'];
  const obj = content as Record<string, unknown>;
  
  for (const field of requiredFields) {
    if (!(field in obj)) {
      // #region agent log
      logSecurityEvent('validate_structure_fail', { reason: 'missing_field', field, availableFields: Object.keys(obj) }, 'info');
      // #endregion
      return false;
    }
    if (typeof obj[field] !== 'object' || obj[field] === null) {
      // #region agent log
      logSecurityEvent('validate_structure_fail', { reason: 'field_not_object', field, fieldType: typeof obj[field] }, 'info');
      // #endregion
      return false;
    }
  }
  
  return true;
}

