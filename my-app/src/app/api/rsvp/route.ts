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
    const phone = body?.phone ? String(body.phone).trim() : '';
    const email = body?.email ? String(body.email).trim() : null;
    const message = body?.message ? String(body.message).trim() : null;
    const guests = body?.guests || [];
    
    // Validate guests array
    if (!Array.isArray(guests) || guests.length < 1 || guests.length > 5) {
      return NextResponse.json({ ok: false, error: 'Må ha mellom 1 og 5 personer' }, { status: 400 });
    }

    // Validate all guest names
    const guestNames: string[] = [];
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      const name = (guest?.name ?? '').toString().trim();
      
      if (!name) {
        return NextResponse.json({ ok: false, error: `Navn for person ${i + 1} er påkrevd` }, { status: 400 });
      }

      if (name.length < 2) {
        return NextResponse.json({ ok: false, error: `Navn for person ${i + 1} må være minst 2 tegn` }, { status: 400 });
      }

      // Check for duplicate names
      if (guestNames.includes(name)) {
        return NextResponse.json({ ok: false, error: 'Alle navn må være unike' }, { status: 400 });
      }

      guestNames.push(name);
    }

    // Map attendance to response format
    const response: 'yes' | 'no' | 'maybe' = body?.isAttending === true
      ? 'yes'
      : body?.isAttending === false
      ? 'no'
      : 'maybe';

    const supabase = supabaseServer();
    
    // Insert RSVP record first
    const { data: rsvpData, error: rsvpError } = await supabase.from('rsvps').insert({
      name: guestNames[0], // Keep first name in rsvps.name for backward compatibility
      phone: phone || null,
      email: email || null,
      response,
      message: message || null,
      guest_count: guests.length, // Keep for backward compatibility
    }).select().single();

    if (rsvpError) {
      console.error('Supabase RSVP insert error:', rsvpError);
      logSecurityEvent('rsvp_save_error', { clientId, error: rsvpError.message, code: rsvpError.code }, 'error');
      
      // Provide more specific error messages
      if (rsvpError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ ok: false, error: 'Det eksisterer allerede en RSVP med dette navnet. Kontakt oss hvis du ønsker å endre svaret ditt.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: 'Kunne ikke lagre RSVP. Prøv igjen senere.' }, { status: 500 });
    }

    // Insert guest records
    const guestRecords = guests.map((guest: { name: string; allergies?: string }, index: number) => ({
      rsvp_id: rsvpData.id,
      name: (guest.name ?? '').toString().trim(),
      allergies: guest.allergies ? String(guest.allergies).trim() : null,
      guest_order: index + 1,
    }));

    const { error: guestsError } = await supabase.from('rsvp_guests').insert(guestRecords);

    if (guestsError) {
      console.error('Supabase guests insert error:', guestsError);
      // Try to clean up: delete the RSVP record if guest insertion fails
      await supabase.from('rsvps').delete().eq('id', rsvpData.id);
      logSecurityEvent('rsvp_guests_save_error', { clientId, error: guestsError.message, code: guestsError.code }, 'error');
      return NextResponse.json({ ok: false, error: 'Kunne ikke lagre gjester. Prøv igjen senere.' }, { status: 500 });
    }

    logSecurityEvent('rsvp_saved', { clientId, names: guestNames, response }, 'info');
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


