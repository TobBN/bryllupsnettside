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

    // Ensure all required fields exist with defaults if missing
    const content = data.content as Record<string, unknown>;
    
    // Add default RSVP content if missing
    if (!content.rsvp) {
      content.rsvp = {
        title: 'RSVP',
        subtitle: ['Vennligst svar om du kommer innen 1. mai 2026.', 'Vi gleder oss til å feire sammen med dere!'],
        buttons: {
          attending: 'Jeg kommer',
          notAttending: 'Jeg kan dessverre ikke'
        },
        form: {
          nameLabel: 'Navn *',
          phoneLabel: 'Telefonnummer *',
          allergiesLabel: 'Mat-allergier',
          namePlaceholder: 'Ditt navn',
          phonePlaceholder: 'Ditt telefonnummer',
          allergiesPlaceholder: 'Har du noen mat-allergier vi bør vite om? (valgfritt)',
          allergiesHelpText: 'Dette hjelper oss å tilpasse menyen for alle gjester',
          guestCountLabel: 'Antall personer *',
          submitButton: 'Send svar',
          backButton: 'Tilbake',
          newResponseButton: 'Send nytt svar'
        },
        messages: {
          attending: '🎉 Vi gleder oss til å feire sammen med deg!',
          notAttending: '💝 Vi forstår og takker for svar. Vi håper å se deg snart!'
        }
      };
    }

    // Add default footer fields if missing
    if (content.footer && typeof content.footer === 'object') {
      const footer = content.footer as Record<string, unknown>;
      if (!footer.contactText) footer.contactText = 'Ta kontakt med oss direkte for spørsmål';
      if (!footer.showContactText) footer.showContactText = 'Vis kontaktinfo';
      if (!footer.hideContactText) footer.hideContactText = 'Skjul kontaktinfo';
    }

    // Add default weddingDetails.info if missing
    if (content.weddingDetails && typeof content.weddingDetails === 'object') {
      const weddingDetails = content.weddingDetails as Record<string, unknown>;
      if (!weddingDetails.info) {
        weddingDetails.info = {
          title: 'Info',
          description: 'Praktisk informasjon for gjester...'
        };
      }
    }

    // Add default seatingChart content if missing
    if (!content.seatingChart) {
      content.seatingChart = {
        title: 'Bord-kart',
        subtitle: 'Finn ditt bord',
        searchPlaceholder: 'Skriv inn navnet ditt...',
        searchLabel: 'Søk etter navn',
        noResultsText: 'Ingen resultater funnet'
      };
    }

    return NextResponse.json(content);
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

