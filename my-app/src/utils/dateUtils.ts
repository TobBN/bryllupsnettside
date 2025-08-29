import { TimeLeft } from '@/types';

export const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const distance = target - now;

  if (distance > 0) {
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }

  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
};

export const WEDDING_DATE = new Date('2026-07-24T12:00:00');
export const RSVP_DEADLINE = new Date('2026-06-01T00:00:00');
