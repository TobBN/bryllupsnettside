import { Guest } from '@/types';

const API_URL = '/api/guests';

export const fetchGuests = async (token: string): Promise<Guest[]> => {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch guests');
  }

  return res.json();
};

export const addGuest = async (guest: Omit<Guest, 'id'>, token: string): Promise<Guest> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(guest),
  });

  if (!res.ok) {
    throw new Error('Failed to add guest');
  }

  return res.json();
};

export const deleteGuest = async (id: string, token: string): Promise<void> => {
  const res = await fetch(`${API_URL}?id=${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete guest');
  }
};
