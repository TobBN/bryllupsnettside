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
  
  // #region agent log
  logSecurityEvent('content_post_start', { clientId, hasCookie: !!request.cookies.get('admin_session') }, 'info');
  // #endregion
  
  // Check authentication
  const authenticated = isAuthenticated(request);
  // #region agent log
  logSecurityEvent('content_post_auth_check', { clientId, authenticated }, 'info');
  // #endregion
  
  if (!authenticated) {
    logSecurityEvent('unauthorized_content_update', { clientId }, 'warning');
    return NextResponse.json(
      { error: 'Ikke autentisert' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // #region agent log
    logSecurityEvent('content_post_body_received', { clientId, bodyType: typeof body, isObject: typeof body === 'object', hasKeys: body ? Object.keys(body).length : 0 }, 'info');
    // #endregion
    
    // Validate that body is an object
    if (!body || typeof body !== 'object') {
      logSecurityEvent('invalid_content_format', { clientId }, 'warning');
      return NextResponse.json(
        { error: 'Ugyldig dataformat' },
        { status: 400 }
      );
    }

    // Validate content structure
    const isValidStructure = validateContentStructure(body);
    // #region agent log
    logSecurityEvent('content_post_structure_validation', { clientId, isValidStructure, bodyKeys: Object.keys(body) }, 'info');
    // #endregion
    
    if (!isValidStructure) {
      logSecurityEvent('invalid_content_structure', { clientId, bodyKeys: Object.keys(body) }, 'warning');
      return NextResponse.json(
        { error: 'Ugyldig innholdsstruktur' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    const contentDir = dirname(CONTENT_FILE_PATH);
    // #region agent log
    logSecurityEvent('content_post_dir_check', { clientId, contentDir, dirExists: existsSync(contentDir) }, 'info');
    // #endregion
    
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
      // #region agent log
      logSecurityEvent('content_post_dir_created', { clientId, contentDir }, 'info');
      // #endregion
    }

    // Write to file
    // #region agent log
    logSecurityEvent('content_post_write_start', { clientId, filePath: CONTENT_FILE_PATH }, 'info');
    // #endregion
    
    writeFileSync(CONTENT_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    
    // #region agent log
    logSecurityEvent('content_post_write_success', { clientId }, 'info');
    // #endregion
    
    logSecurityEvent('content_updated', { clientId }, 'info');
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    // #region agent log
    logSecurityEvent('content_post_error', { clientId, error: errorMessage, stack: errorStack }, 'error');
    // #endregion
    logSecurityEvent('content_update_error', { clientId, error: errorMessage }, 'error');
    console.error('Error writing content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre innhold' },
      { status: 500 }
    );
  }
}

