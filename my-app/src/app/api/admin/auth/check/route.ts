import { NextRequest, NextResponse } from 'next/server';
import { appendFileSync } from 'fs';
import { join } from 'path';

const LOG_PATH = join(process.cwd(), '.cursor', 'debug.log');

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  const isAuthenticated = session?.value === 'authenticated';
  
  // #region agent log
  try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/admin/auth/check/route.ts:8',message:'Auth check endpoint called',data:{hasSession:!!session,sessionValue:session?.value,isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n'); } catch {}
  // #endregion
  
  return NextResponse.json({ authenticated: isAuthenticated });
}

