import { readFileSync } from 'fs';
import { join } from 'path';

export interface ContentData {
  hero: {
    date: string;
    location: string;
    names: {
      bride: string;
      groom: string;
    };
  };
  story: {
    title: string;
    subtitle: string;
    timeline: Array<{
      date: string;
      title: string;
      text: string;
    }>;
  };
  weddingDetails: {
    title: string;
    venue: {
      title: string;
      description: string;
      website: string;
      websiteLabel: string;
      address: string;
      mapsLink: string;
    };
    dressCode: {
      title: string;
      general: string;
      men: {
        title: string;
        description: string;
      };
      women: {
        title: string;
        description: string;
      };
      note: string;
    };
    gifts: {
      title: string;
      description: string;
      links: Array<{
        url: string;
        label: string;
      }>;
      vipps: string;
    };
    food: {
      title: string;
      description: string;
      allergyNote: string;
    };
  };
  footer: {
    heading: string;
    tagline: string;
    contact: {
      title: string;
      bride: {
        name: string;
        phone: string;
      };
      groom: {
        name: string;
        phone: string;
      };
    };
  };
}

export function getContent(): ContentData {
  try {
    const contentPath = join(process.cwd(), 'data', 'content.json');
    const content = readFileSync(contentPath, 'utf-8');
    return JSON.parse(content) as ContentData;
  } catch (error) {
    console.error('Error reading content:', error);
    // Return default content if file doesn't exist
    throw new Error('Kunne ikke lese innhold');
  }
}

