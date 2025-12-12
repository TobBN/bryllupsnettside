import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { checkRateLimit, getClientIdentifier, logSecurityEvent } from '@/lib/security';

export const POST = async (req: NextRequest) => {
  const clientId = getClientIdentifier(req);
  
  // Rate limiting: max 5 attempts per 15 minutes
  if (!checkRateLimit(`rsvp:${clientId}`, 5, 15 * 60 * 1000)) {
    logSecurityEvent('rsvp_rate_limit_exceeded', { clientId }, 'warning');
    return NextResponse.json(
      { ok: false, error: 'For mange RSVP-forsøk. Prøv igjen om 15 minutter.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const name = (body?.name ?? '').toString().trim();
    const phone = body?.phone ? String(body.phone).trim() : '';
    const email = body?.email ? String(body.email).trim() : null;
    const allergies = body?.allergies ? String(body.allergies).trim() : null;
    const message = body?.message ? String(body.message).trim() : null;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Navn er påkrevd' }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: 'Navn må være minst 2 tegn' }, { status: 400 });
    }

    // Map attendance to response format
    const response: 'yes' | 'no' | 'maybe' = body?.isAttending === true
      ? 'yes'
      : body?.isAttending === false
      ? 'no'
      : 'maybe';

    const supabase = supabaseServer();
    const { error } = await supabase.from('rsvps').insert({
      name,
      phone: phone || null,
      email: email || null,
      response,
      allergies: allergies || null,
      message: message || null,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      logSecurityEvent('rsvp_save_error', { clientId, error: error.message, code: error.code }, 'error');
      
      // Provide more specific error messages
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ ok: false, error: 'Det eksisterer allerede en RSVP med dette navnet. Kontakt oss hvis du ønsker å endre svaret ditt.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: 'Kunne ikke lagre RSVP. Prøv igjen senere.' }, { status: 500 });
    }

    logSecurityEvent('rsvp_saved', { clientId, name, response }, 'info');
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    logSecurityEvent('rsvp_error', { clientId, error: String(error) }, 'error');
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: 'Ugyldig dataformat' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'En uventet feil oppstod. Prøv igjen senere.' }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({ message: 'Method GET Not Allowed' }, { status: 405 });
};


