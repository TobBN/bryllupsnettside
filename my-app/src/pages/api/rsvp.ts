import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { RSVPData } from '@/types';

const filePath = path.join(process.cwd(), 'data', 'rsvps.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const newRsvp: RSVPData = req.body;
    const fileData = await fs.readFile(filePath, 'utf8').catch(() => '[]');
    const rsvps: RSVPData[] = JSON.parse(fileData);
    rsvps.push(newRsvp);
    await fs.writeFile(filePath, JSON.stringify(rsvps, null, 2));

    return res.status(200).json({ message: 'RSVP saved' });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return res.status(500).json({ message: 'Error saving RSVP' });
  }
}
