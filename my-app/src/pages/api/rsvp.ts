import type { NextApiRequest, NextApiResponse } from 'next';
import { RSVPData } from '@/types';

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

    const storageUrl = process.env.RSVP_STORAGE_URL;
    if (!storageUrl) {
      console.error('RSVP_STORAGE_URL environment variable is not set');
      return res
        .status(500)
        .json({ message: 'RSVP storage is not configured' });
    }

    const response = await fetch(storageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRsvp),
    });

    if (!response.ok) {
      throw new Error(`Failed to persist RSVP: ${response.statusText}`);
    }

    return res.status(200).json({ message: 'RSVP saved' });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return res.status(500).json({ message: 'Error saving RSVP' });
  }
}
