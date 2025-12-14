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
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:18',message:'Request body received',data:{guestsCount:body?.guests?.length||0,hasPhone:!!body?.phone,isAttending:body?.isAttending},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:61',message:'Before RSVP insert',data:{guestNames:guestNames,response,phone,guestsLength:guests.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const { data: rsvpData, error: rsvpError } = await supabase.from('rsvps').insert({
      name: guestNames[0], // Keep first name in rsvps.name for backward compatibility
      phone: phone || null,
      email: email || null,
      response,
      message: message || null,
      guest_count: guests.length, // Keep for backward compatibility
    }).select().single();

    if (rsvpError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:70',message:'RSVP insert error',data:{error:rsvpError.message,code:rsvpError.code,details:rsvpError.details,hint:rsvpError.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Supabase RSVP insert error:', rsvpError);
      logSecurityEvent('rsvp_save_error', { clientId, error: rsvpError.message, code: rsvpError.code }, 'error');
      
      // Provide more specific error messages
      if (rsvpError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ ok: false, error: 'Det eksisterer allerede en RSVP med dette navnet. Kontakt oss hvis du ønsker å endre svaret ditt.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: 'Kunne ikke lagre RSVP. Prøv igjen senere.' }, { status: 500 });
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:79',message:'RSVP insert success',data:{rsvpId:rsvpData?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Insert guest records
    const guestRecords = guests.map((guest: { name: string; allergies?: string }, index: number) => ({
      rsvp_id: rsvpData.id,
      name: (guest.name ?? '').toString().trim(),
      allergies: guest.allergies ? String(guest.allergies).trim() : null,
      guest_order: index + 1,
    }));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:87',message:'Before guests insert',data:{guestRecordsCount:guestRecords.length,guestRecords:guestRecords.map(g=>({name:g.name,allergies:g.allergies,order:g.guest_order})),rsvpId:rsvpData.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    const { error: guestsError } = await supabase.from('rsvp_guests').insert(guestRecords);

    if (guestsError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:91',message:'Guests insert error',data:{error:guestsError.message,code:guestsError.code,details:guestsError.details,hint:guestsError.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Supabase guests insert error:', guestsError);
      // Try to clean up: delete the RSVP record if guest insertion fails
      await supabase.from('rsvps').delete().eq('id', rsvpData.id);
      logSecurityEvent('rsvp_guests_save_error', { clientId, error: guestsError.message, code: guestsError.code }, 'error');
      return NextResponse.json({ ok: false, error: 'Kunne ikke lagre gjester. Prøv igjen senere.' }, { status: 500 });
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:97',message:'Guests insert success',data:{guestsCount:guestRecords.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    logSecurityEvent('rsvp_saved', { clientId, names: guestNames, response }, 'info');
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rsvp/route.ts:101',message:'Catch block error',data:{error:String(error),errorType:error instanceof Error?error.constructor.name:'unknown',stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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


