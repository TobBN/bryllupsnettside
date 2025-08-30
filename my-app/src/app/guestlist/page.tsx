"use client";

import { useState, useEffect } from 'react';
import { Guest } from '@/types';
import { fetchGuests, addGuest, deleteGuest } from '@/utils/guestlist';

export default function GuestlistPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState<Omit<Guest, 'id'>>({
    name: '',
    email: '',
    attending: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('guestlist_token');
    if (saved) {
      fetchGuests(saved)
        .then((data) => {
          setToken(saved);
          setGuests(data);
          setIsAuth(true);
        })
        .catch(() => {
          localStorage.removeItem('guestlist_token');
        });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchGuests(password);
      setToken(password);
      localStorage.setItem('guestlist_token', password);
      setGuests(data);
      setIsAuth(true);
    } catch {
      alert('Feil passord');
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await addGuest(newGuest, token);
      setGuests((prev) => [...prev, added]);
      setNewGuest({ name: '', email: '', attending: true });
    } catch {
      alert('Kunne ikke legge til gjest');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuest(id, token);
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert('Kunne ikke slette gjest');
    }
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passord"
            className="border p-2"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Logg inn
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Gjesteliste</h1>
      <ul className="mb-8">
        {guests.map((guest) => (
          <li key={guest.id} className="flex justify-between items-center mb-2">
            <span>
              {guest.name} {guest.attending ? '(Kommer)' : '(Kommer ikke)'}
            </span>
            <button
              onClick={() => handleDelete(guest.id)}
              className="text-red-500 hover:underline"
            >
              Slett
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddGuest} className="space-y-4">
        <input
          type="text"
          value={newGuest.name}
          onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
          placeholder="Navn"
          className="border p-2 w-full"
          required
        />
        <input
          type="email"
          value={newGuest.email}
          onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
          placeholder="E-post (valgfritt)"
          className="border p-2 w-full"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newGuest.attending}
            onChange={(e) =>
              setNewGuest({ ...newGuest, attending: e.target.checked })
            }
          />
          <span>Kommer</span>
        </label>
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
          Legg til gjest
        </button>
      </form>
    </div>
  );
}
