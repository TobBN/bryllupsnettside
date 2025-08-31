import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { RSVPData } from '@/types';

const filePath = path.join(process.cwd(), 'data', 'rsvps.json');

export const POST = async (req: Request) => {
  try {
    const newRsvp = (await req.json()) as RSVPData;
    const fileData = await fs.readFile(filePath, 'utf8').catch(() => '[]');
    const rsvps: RSVPData[] = JSON.parse(fileData);
    rsvps.push(newRsvp);
    await fs.writeFile(filePath, JSON.stringify(rsvps, null, 2));
    return NextResponse.json({ message: 'RSVP saved' }, { status: 200 });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return NextResponse.json({ message: 'Error saving RSVP' }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({ message: 'Method GET Not Allowed' }, { status: 405 });
};


