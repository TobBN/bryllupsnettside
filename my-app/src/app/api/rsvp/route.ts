import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const name = (body?.name ?? '').toString().trim();
    const phone = body?.phone ? String(body.phone).trim() : '';
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Navn er påkrevd' }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: 'Navn må være minst 2 tegn' }, { status: 400 });
    }

    // Map old payload to new schema
    const response: 'yes' | 'no' | 'maybe' = body?.isAttending === true
      ? 'yes'
      : body?.isAttending === false
      ? 'no'
      : 'maybe';

    const messageParts: string[] = [];
    if (phone) messageParts.push(`Phone: ${phone}`);
    if (body?.allergies) messageParts.push(`Allergies: ${String(body.allergies).trim()}`);
    if (body?.timestamp) messageParts.push(`Timestamp: ${String(body.timestamp)}`);
    const message = messageParts.length ? messageParts.join(' | ') : null;

    const supabase = supabaseServer();
    const { error } = await supabase.from('rsvp').insert({
      name,
      email: null,
      attendees: null,
      response,
      message,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      // Provide more specific error messages
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ ok: false, error: 'Det eksisterer allerede en RSVP med dette navnet. Kontakt oss hvis du ønsker å endre svaret ditt.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: 'Kunne ikke lagre RSVP. Prøv igjen senere.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving RSVP:', error);
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


