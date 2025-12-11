import { NextRequest, NextResponse } from 'next/server';
import { Guest } from '@/types';

// WARNING: In-memory storage - data is lost on server restart
// TODO: Migrate to persistent storage (Supabase/database) for production use
let guests: Guest[] = [];

const isAuthorized = (req: NextRequest): boolean => {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.GUESTLIST_PASSWORD}`;
};

export const GET = async (req: NextRequest) => {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Kunne ikke hente gjester' }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const name = body?.name ? String(body.name).trim() : '';
    
    // Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Navn er påkrevd og må være minst 2 tegn' }, { status: 400 });
    }

    // Check for duplicates
    const existingGuest = guests.find(g => g.name.toLowerCase() === name.toLowerCase());
    if (existingGuest) {
      return NextResponse.json({ error: 'En gjest med dette navnet eksisterer allerede' }, { status: 409 });
    }

    const newGuest: Guest = { 
      ...body, 
      id: body?.id || Date.now().toString(),
      name: name,
      attending: body?.attending !== undefined ? Boolean(body.attending) : true
    };
    
    guests.push(newGuest);
    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error('Error adding guest:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Ugyldig dataformat' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Kunne ikke legge til gjest' }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Gjest-ID er påkrevd' }, { status: 400 });
    }

    const initialLength = guests.length;
    guests = guests.filter((g) => g.id !== id);
    
    if (guests.length === initialLength) {
      return NextResponse.json({ error: 'Gjest ikke funnet' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Kunne ikke slette gjest' }, { status: 500 });
  }
};
