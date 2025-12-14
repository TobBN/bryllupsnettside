import { NextRequest, NextResponse } from 'next/server';
import { verifyCookie, validateContentStructure, logSecurityEvent, getClientIdentifier } from '@/lib/security';
import { supabaseServer } from '@/lib/supabase';

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

export async function GET() {
  // GET endpoint is public (used by website components)
  // No authentication required for reading content
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('website_content')
      .select('content')
      .eq('id', 'main')
      .single();

    if (error) {
      console.error('Error reading content from Supabase:', error);
      return NextResponse.json(
        { error: 'Kunne ikke lese innhold' },
        { status: 500 }
      );
    }

    if (!data || !data.content) {
      return NextResponse.json(
        { error: 'Innhold ikke funnet' },
        { status: 404 }
      );
    }

    return NextResponse.json(data.content);
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

    // Save to Supabase
    // #region agent log
    logSecurityEvent('content_post_save_start', { clientId }, 'info');
    // #endregion
    
    const supabase = supabaseServer();
    const { error: updateError } = await supabase
      .from('website_content')
      .upsert({
        id: 'main',
        content: body,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (updateError) {
      // #region agent log
      logSecurityEvent('content_post_supabase_error', { clientId, error: updateError.message, code: updateError.code }, 'error');
      // #endregion
      console.error('Error saving content to Supabase:', updateError);
      return NextResponse.json(
        { error: 'Kunne ikke lagre innhold til database' },
        { status: 500 }
      );
    }
    
    // #region agent log
    logSecurityEvent('content_post_save_success', { clientId }, 'info');
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

