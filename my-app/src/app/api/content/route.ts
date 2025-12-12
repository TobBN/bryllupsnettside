import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const CONTENT_FILE_PATH = join(process.cwd(), 'data', 'content.json');
const LOG_PATH = join(process.cwd(), '.cursor', 'debug.log');

// Helper to verify admin session
function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  // #region agent log
  try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/content/route.ts:12',message:'isAuthenticated check',data:{hasSession:!!session,sessionValue:session?.value,isAuthenticated:session?.value === 'authenticated'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n'); } catch {}
  // #endregion
  return session?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
  // #region agent log
  try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/content/route.ts:19',message:'GET /api/content called',data:{hasAuthCheck:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n'); } catch {}
  // #endregion
  try {
    const content = readFileSync(CONTENT_FILE_PATH, 'utf-8');
    // #region agent log
    try { appendFileSync(LOG_PATH, JSON.stringify({location:'api/content/route.ts:23',message:'GET returning content without auth check',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n'); } catch {}
    // #endregion
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lese innhold' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate that body is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Ugyldig dataformat' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    const contentDir = dirname(CONTENT_FILE_PATH);
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
    }

    // Write to file
    writeFileSync(CONTENT_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre innhold' },
      { status: 500 }
    );
  }
}

