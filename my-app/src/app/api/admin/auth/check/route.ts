import { NextRequest, NextResponse } from 'next/server';
import { verifyCookie } from '@/lib/security';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  
  if (!session?.value) {
    return NextResponse.json({ authenticated: false });
  }
  
  // Verify signed cookie
  const verifiedValue = verifyCookie(session.value);
  const isAuthenticated = verifiedValue === 'authenticated';
  
  return NextResponse.json({ authenticated: isAuthenticated });
}

