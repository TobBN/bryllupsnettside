import { NextRequest, NextResponse } from 'next/server';
import { timingSafeCompare, signCookie, checkRateLimit, getClientIdentifier, logSecurityEvent } from '@/lib/security';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default for development

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  
  // Rate limiting: max 5 attempts per 15 minutes
  if (!checkRateLimit(`login:${clientId}`, 5, 15 * 60 * 1000)) {
    logSecurityEvent('rate_limit_exceeded', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'For mange innloggingsforsøk. Prøv igjen om 15 minutter.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      logSecurityEvent('login_attempt_invalid', { clientId, reason: 'missing_password' }, 'warning');
      return NextResponse.json(
        { error: 'Passord er påkrevd' },
        { status: 400 }
      );
    }

    // Timing-safe password comparison
    const isValid = timingSafeCompare(password, ADMIN_PASSWORD);

    if (isValid) {
      const signedValue = signCookie('authenticated');
      const response = NextResponse.json({ success: true });
      
      // Set signed session cookie (expires in 2 hours for better security)
      response.cookies.set('admin_session', signedValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2, // 2 hours (reduced from 7 days)
        path: '/',
      });
      
      logSecurityEvent('login_success', { clientId }, 'info');
      return response;
    }

    logSecurityEvent('login_failed', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ugyldig passord' },
      { status: 401 }
    );
  } catch (error) {
    logSecurityEvent('login_error', { clientId, error: String(error) }, 'error');
    return NextResponse.json(
      { error: 'Feil ved autentisering' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  logSecurityEvent('logout', { clientId }, 'info');
  
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
