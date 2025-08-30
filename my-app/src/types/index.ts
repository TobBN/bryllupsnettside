export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface WeddingDetails {
  date: string;
  time: string;
  location: string;
  city: string;
  program: string;
}

export interface RSVPData {
  name: string;
  phone: string;
  allergies: string;
  isAttending: boolean;
  timestamp: string;
}

export interface CountdownTimerProps {
  timeLeft: TimeLeft;
}

export interface HeroSectionProps {
  timeLeft: TimeLeft;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StorySectionProps {}

export interface WeddingDetailsSectionProps {
  details?: WeddingDetails;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RSVPSectionProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FooterProps {}

export interface DecorativeLineProps {
  className?: string;
}

export interface CountdownCardProps {
  value: number;
  label: string;
  gradient: string;
  animationDelay: number;
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  attending: boolean;
}
