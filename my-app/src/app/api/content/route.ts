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

    // Add default story images if missing
    if (content.story && typeof content.story === 'object') {
      const story = content.story as Record<string, unknown>;
      if (!story.images) {
        story.images = [];
      }
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

      // Migrate old dressCode structure (general/men/women/note) to new format (dressCode/point)
      if (weddingDetails.dressCode && typeof weddingDetails.dressCode === 'object') {
        const dc = weddingDetails.dressCode as Record<string, unknown>;
        if (!dc.dressCode && (dc.general || dc.men || dc.women)) {
          const parts: string[] = [];
          if (dc.general) parts.push(String(dc.general));
          if (dc.men && typeof dc.men === 'object') {
            const men = dc.men as Record<string, string>;
            if (men.title && men.description) parts.push(`${men.title} ${men.description}`);
          }
          if (dc.women && typeof dc.women === 'object') {
            const women = dc.women as Record<string, string>;
            if (women.title && women.description) parts.push(`${women.title} ${women.description}`);
          }
          dc.dressCode = parts.join('\n\n');
        }
        if (!dc.point && dc.note) {
          dc.point = dc.note;
        }
        // Clean up old fields so they don't persist as orphan data
        delete dc.general;
        delete dc.men;
        delete dc.women;
        delete dc.note;
      }

      // Migrate old gifts.vipps field into description if it exists
      if (weddingDetails.gifts && typeof weddingDetails.gifts === 'object') {
        const gifts = weddingDetails.gifts as Record<string, unknown>;
        if (gifts.vipps) {
          if (gifts.description && typeof gifts.description === 'string' && !String(gifts.description).includes(String(gifts.vipps))) {
            gifts.description = `${gifts.description}\n\n${gifts.vipps}`;
          }
          delete gifts.vipps;
        }
      }
    }

    // Add default schedule, seatingChart, and faq content under weddingDetails if missing
    if (content.weddingDetails && typeof content.weddingDetails === 'object') {
      const weddingDetails = content.weddingDetails as Record<string, unknown>;
      
      if (!weddingDetails.schedule) {
        weddingDetails.schedule = {
          title: 'Program',
          subtitle: 'Tidsplan for dagen',
          items: []
        };
      }
      
      if (!weddingDetails.seatingChart) {
        weddingDetails.seatingChart = {
          title: 'Bord-kart',
          subtitle: 'Finn ditt bord',
          searchPlaceholder: 'Skriv inn navnet ditt...',
          searchLabel: 'Søk etter navn',
          noResultsText: 'Ingen resultater funnet'
        };
      }
      
      // Add default gifts content if missing
      if (!weddingDetails.gifts) {
        weddingDetails.gifts = {
          title: 'Gaveønsker',
          description: 'Vi blir både glade for gaver fra ønskelisten og pengebidrag til vår bryllupsreise',
          links: [
            {
              url: '',
              label: '🎁 Se vår ønskeliste på Stas.app'
            }
          ]
        };
      } else if (weddingDetails.gifts && typeof weddingDetails.gifts === 'object') {
        const gifts = weddingDetails.gifts as Record<string, unknown>;
        // Ensure links array exists and has at least one element
        if (!gifts.links || !Array.isArray(gifts.links) || gifts.links.length === 0) {
          gifts.links = [
            {
              url: '',
              label: '🎁 Se vår ønskeliste på Stas.app'
            }
          ];
        }
      }
      
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
  
  // Check authentication
  const authenticated = isAuthenticated(request);
  
  if (!authenticated) {
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
    const isValidStructure = validateContentStructure(body);
    
    if (!isValidStructure) {
      logSecurityEvent('invalid_content_structure', { clientId, bodyKeys: Object.keys(body) }, 'warning');
      return NextResponse.json(
        { error: 'Ugyldig innholdsstruktur' },
        { status: 400 }
      );
    }

    // Save to Supabase
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
      logSecurityEvent('content_post_supabase_error', { clientId, error: updateError.message, code: updateError.code }, 'error');
      console.error('Error saving content to Supabase:', updateError);
      return NextResponse.json(
        { error: 'Kunne ikke lagre innhold til database' },
        { status: 500 }
      );
    }
    
    logSecurityEvent('content_updated', { clientId }, 'info');
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logSecurityEvent('content_update_error', { clientId, error: errorMessage }, 'error');
    console.error('Error writing content:', error);
    return NextResponse.json(
      { error: 'Kunne ikke lagre innhold' },
      { status: 500 }
    );
  }
}

