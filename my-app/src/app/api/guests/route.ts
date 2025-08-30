import { NextRequest, NextResponse } from 'next/server';
import { Guest } from '@/types';

let guests: Guest[] = [];

const isAuthorized = (req: NextRequest): boolean => {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.GUESTLIST_PASSWORD}`;
};

export const GET = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(guests);
};

export const POST = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const guest = (await req.json()) as Guest;
  const newGuest: Guest = { ...guest, id: guest.id || Date.now().toString() };
  guests.push(newGuest);
  return NextResponse.json(newGuest, { status: 201 });
};

export const DELETE = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  guests = guests.filter((g) => g.id !== id);
  return NextResponse.json({ success: true });
};
