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
      image?: {
        url: string;
        alt: string;
        storageName?: string;
      };
    }>;
    images?: Array<{
      url: string;
      alt: string;
      storageName?: string;
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
      dressCode: string;
      point: string;
    };
    gifts: {
      title: string;
      description: string;
      links: Array<{ url: string; label: string }>;
    };
    food: {
      title: string;
      description: string;
      courses?: Array<{
        name: string;
        description: string;
        drink?: string;
      }>;
      allergyNote: string;
    };
    info: {
      title: string;
      description: string;
      items?: Array<{
        question: string;
        answer: string;
      }>;
    };
    schedule?: {
      title: string;
      subtitle: string;
      items: Array<{ time: string; title: string; description?: string }>;
    };
    seatingChart?: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      searchLabel: string;
      noResultsText: string;
    };
  };
  footer: {
    heading: string;
    tagline: string;
    contactText: string;
    showContactText: string;
    hideContactText: string;
    contact: {
      title: string;
      bride: { name: string; phone: string };
      groom: { name: string; phone: string };
    };
  };
  rsvp: {
    title: string;
    subtitle: string[];
    buttons: { attending: string; notAttending: string };
    form: {
      nameLabel: string;
      phoneLabel: string;
      allergiesLabel: string;
      guestCountLabel: string;
      guestCountPlaceholder: string;
      namePlaceholder: string;
      phonePlaceholder: string;
      allergiesPlaceholder: string;
      allergiesHelpText: string;
      submitButton: string;
      backButton: string;
      newResponseButton: string;
    };
    messages: { attending: string; notAttending: string };
  };
}

export interface RSVPItem {
  id: string;
  response: string;
  responseRaw: 'yes' | 'no' | 'maybe';
  names: string[];
  phone: string;
  allergies: string[];
  guestCount: number;
  createdAt: string;
  dateFormatted: string;
  timeFormatted: string;
  is_read?: boolean;
}

export interface SeatingGuest {
  id: string;
  name: string;
  seat_number: number;
}

export interface SeatingTable {
  id: string;
  table_number: number;
  capacity: number;
  created_at: string;
  updated_at: string;
  guests: SeatingGuest[];
}

export interface GuestDraft {
  id?: string;
  name: string;
  seat_number: number;
}
