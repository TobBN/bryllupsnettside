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
    // #region agent log
    console.log('[DEBUG] Request body received:', JSON.stringify({guestsCount:body?.guests?.length||0,hasPhone:!!body?.phone,isAttending:body?.isAttending,guests:body?.guests?.map((g:{name?:string;allergies?:string})=>({name:g.name,hasAllergies:!!g.allergies}))}));
    // #endregion
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
    // #region agent log
    console.log('[DEBUG] Before RSVP insert:', JSON.stringify({guestNames,response,phone,guestsLength:guests.length}));
    // #endregion
    const { data: rsvpData, error: rsvpError } = await supabase.from('rsvps').insert({
      name: guestNames[0], // Keep first name in rsvps.name for backward compatibility
      phone: phone || null,
      email: email || null,
      response,
      message: message || null,
      is_read: false, // Mark as unread for admin notification
      // Note: guest_count column removed - using rsvp_guests table instead
    }).select().single();

    if (rsvpError) {
      // #region agent log
      console.error('[DEBUG] RSVP insert error:', JSON.stringify({error:rsvpError.message,code:rsvpError.code,details:rsvpError.details,hint:rsvpError.hint,fullError:rsvpError}));
      // #endregion
      console.error('Supabase RSVP insert error:', rsvpError);
      logSecurityEvent('rsvp_save_error', { clientId, error: rsvpError.message, code: rsvpError.code }, 'error');
      
      // Provide more specific error messages
      if (rsvpError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ ok: false, error: 'Det eksisterer allerede en RSVP med dette navnet. Kontakt oss hvis du ønsker å endre svaret ditt.' }, { status: 409 });
      }
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `RSVP feil: ${rsvpError.message} (${rsvpError.code})`
        : 'Kunne ikke lagre RSVP. Prøv igjen senere.';
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
    }
    // #region agent log
    console.log('[DEBUG] RSVP insert success:', JSON.stringify({rsvpId:rsvpData?.id}));
    // #endregion

    // Insert guest records
    const guestRecords = guests.map((guest: { name: string; allergies?: string }, index: number) => ({
      rsvp_id: rsvpData.id,
      name: (guest.name ?? '').toString().trim(),
      allergies: guest.allergies ? String(guest.allergies).trim() : null,
      guest_order: index + 1,
    }));
    // #region agent log
    console.log('[DEBUG] Before guests insert:', JSON.stringify({guestRecordsCount:guestRecords.length,guestRecords:guestRecords.map(g=>({name:g.name,allergies:g.allergies,order:g.guest_order})),rsvpId:rsvpData.id}));
    // #endregion

    const { error: guestsError } = await supabase.from('rsvp_guests').insert(guestRecords);

    if (guestsError) {
      // #region agent log
      console.error('[DEBUG] Guests insert error:', JSON.stringify({error:guestsError.message,code:guestsError.code,details:guestsError.details,hint:guestsError.hint,fullError:guestsError}));
      // #endregion
      console.error('Supabase guests insert error:', guestsError);
      // Try to clean up: delete the RSVP record if guest insertion fails
      await supabase.from('rsvps').delete().eq('id', rsvpData.id);
      logSecurityEvent('rsvp_guests_save_error', { clientId, error: guestsError.message, code: guestsError.code }, 'error');
      
      // Check if table doesn't exist
      if (guestsError.code === 'PGRST204' || guestsError.message?.includes('relation') || guestsError.message?.includes('does not exist')) {
        const errorMessage = 'rsvp_guests tabellen eksisterer ikke. Kjør SQL-migrasjonen i Supabase først.';
        console.error('[DEBUG] Table missing error:', errorMessage);
        return NextResponse.json({ 
          ok: false, 
          error: process.env.NODE_ENV === 'development' 
            ? errorMessage 
            : 'Database-tabellen mangler. Kontakt administrator.' 
        }, { status: 500 });
      }
      
      // Return detailed error in development, generic in production
      const errorMessage = process.env.NODE_ENV === 'development'
        ? `Gjester feil: ${guestsError.message} (${guestsError.code}). Hint: ${guestsError.hint || 'Ingen hint'}`
        : 'Kunne ikke lagre gjester. Prøv igjen senere.';
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
    }
    // #region agent log
    console.log('[DEBUG] Guests insert success:', JSON.stringify({guestsCount:guestRecords.length}));
    // #endregion

    logSecurityEvent('rsvp_saved', { clientId, names: guestNames, response }, 'info');
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // #region agent log
    console.error('[DEBUG] Catch block error:', JSON.stringify({error:String(error),errorType:error instanceof Error?error.constructor.name:'unknown',stack:error instanceof Error?error.stack:undefined,message:error instanceof Error?error.message:undefined}));
    // #endregion
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


