import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const name = (body?.name ?? '').toString().trim();
    // Map old payload to new schema
    const response: 'yes' | 'no' | 'maybe' = body?.isAttending === true
      ? 'yes'
      : body?.isAttending === false
      ? 'no'
      : 'maybe';

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Mangler navn' }, { status: 400 });
    }

    const messageParts: string[] = [];
    if (body?.phone) messageParts.push(`Phone: ${String(body.phone)}`);
    if (body?.allergies) messageParts.push(`Allergies: ${String(body.allergies)}`);
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
      return NextResponse.json({ ok: false, error: 'DB-feil' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json({ ok: false, error: 'Uventet feil' }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({ message: 'Method GET Not Allowed' }, { status: 405 });
};


