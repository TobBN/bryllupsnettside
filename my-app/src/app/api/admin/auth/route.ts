import { NextRequest, NextResponse } from 'next/server';
import { appendFileSync } from 'fs';
import { join } from 'path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default for development
const LOG_PATH = join(process.cwd(), '.cursor', 'debug.log');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Passord er påkrevd' },
        { status: 400 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // Set session cookie (expires in 7 days)
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      // #region agent log
      try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/admin/auth/route.ts:28',message:'Cookie set in login response',data:{isProduction:process.env.NODE_ENV === 'production'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n'); } catch {}
      // #endregion

      return response;
    }

    return NextResponse.json(
      { error: 'Ugyldig passord' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Feil ved autentisering' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // #region agent log
  try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/admin/auth/route.ts:48',message:'DELETE logout called',data:{hasCookieBefore:!!request.cookies.get('admin_session')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch {}
  // #endregion
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  // #region agent log
  try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/admin/auth/route.ts:51',message:'Cookie deleted in response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n'); } catch {}
  // #endregion
  return response;
}

