import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { verifyCookie, validateContentStructure, logSecurityEvent, getClientIdentifier } from '@/lib/security';

const CONTENT_FILE_PATH = join(process.cwd(), 'data', 'content.json');

// Helper to verify admin session with signed cookie
function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get('admin_session');
  
  if (!session?.value) {
    return false;
  }
  
  // Verify signed cookie
  const verifiedValue = verifyCookie(session.value);
  return verifiedValue === 'authenticated';
}

export async function GET(request: NextRequest) {
  // GET endpoint is public (used by website components)
  // No authentication required for reading content
  try {
    const content = readFileSync(CONTENT_FILE_PATH, 'utf-8');
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
  const clientId = getClientIdentifier(request);
  
  // Check authentication
  if (!isAuthenticated(request)) {
    logSecurityEvent('unauthorized_content_update', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate that body is an object
    if (!body || typeof body !== 'object') {
      logSecurityEvent('invalid_content_format', { clientId }, 'warning');
      return NextResponse.json(
        { error: 'Ugyldig dataformat' },
        { status: 400 }
      );
    }

    // Validate content structure
    if (!validateContentStructure(body)) {
      logSecurityEvent('invalid_content_structure', { clientId }, 'warning');
      return NextResponse.json(
        { error: 'Ugyldig innholdsstruktur' },
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
    
    logSecurityEvent('content_updated', { clientId }, 'info');
    return NextResponse.json({ success: true });
  } catch (error) {
    logSecurityEvent('content_update_error', { clientId, error: String(error) }, 'error');
    console.error('Error writing content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre innhold' },
      { status: 500 }
    );
  }
}

