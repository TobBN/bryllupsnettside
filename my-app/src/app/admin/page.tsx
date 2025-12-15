"use client";

import { useState, useEffect } from 'react';

interface ContentData {
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
      dressCode: string;
      point: string;
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
    info: {
      title: string;
      description: string;
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
  rsvp: {
    title: string;
    subtitle: string[];
    buttons: {
      attending: string;
      notAttending: string;
    };
    form: {
      nameLabel: string;
      phoneLabel: string;
      allergiesLabel: string;
      guestCountLabel: string;
      namePlaceholder: string;
      phonePlaceholder: string;
      allergiesPlaceholder: string;
      allergiesHelpText: string;
      submitButton: string;
      backButton: string;
      newResponseButton: string;
    };
    messages: {
      attending: string;
      notAttending: string;
    };
  };
  seatingChart: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    noResultsText: string;
  };
}

interface RSVPItem {
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
}

interface SeatingGuest {
  id: string;
  name: string;
  seat_number: number;
}

interface SeatingTable {
  id: string;
  table_number: number;
  capacity: number;
  created_at: string;
  updated_at: string;
  guests: SeatingGuest[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [content, setContent] = useState<ContentData | null>(null);
  const [rsvps, setRsvps] = useState<RSVPItem[]>([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(false);
  const [showRsvpList, setShowRsvpList] = useState(false);
  
  // Seating chart state
  const [seatingTables, setSeatingTables] = useState<SeatingTable[]>([]);
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [selectedTableForGuests, setSelectedTableForGuests] = useState<string | null>(null);
  const [tableGuests, setTableGuests] = useState<{ [key: string]: { name: string; seat_number: number; id?: string }[] }>({});
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('8');
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('');

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
    loadContent();
  }, []);

  // Automatisk last bord når autentisert
  useEffect(() => {
    if (isAuthenticated) {
      loadSeatingTables();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    // Check authentication status via dedicated auth check endpoint
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:92',message:'checkAuth called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const response = await fetch('/api/admin/auth/check');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:96',message:'checkAuth response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (response.ok) {
        const data = await response.json();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:100',message:'Auth check result',data:{authenticated:data.authenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsAuthenticated(data.authenticated === true);
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:105',message:'Response not OK',data:{status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsAuthenticated(false);
      }
    } catch {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:109',message:'checkAuth catch block',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setIsAuthenticated(false);
    }
  };

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
        await loadContent();
      } else {
        setError(data.error || 'Ugyldig passord');
      }
    } catch {
      setError('Feil ved innlogging');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:144',message:'handleLogout called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    try {
      const response = await fetch('/api/admin/auth', { method: 'DELETE' });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:147',message:'Logout DELETE response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setIsAuthenticated(false);
      setContent(null);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1fdfc7c7-5de7-4035-8d46-6c8089723983',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/page.tsx:151',message:'Logout error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Logout error:', error);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setSuccess('Innhold lagret!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Kunne ikke lagre');
      }
    } catch {
      setError('Feil ved lagring');
    } finally {
      setLoading(false);
    }
  };

  const loadRsvps = async () => {
    setRsvpsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/rsvp/list');

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Kunne ikke hente RSVP-data');
        setRsvpsLoading(false);
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setRsvps(result.data);
      } else {
        setError('Kunne ikke hente RSVP-data');
      }
    } catch {
      setError('Feil ved henting av RSVP-data');
    } finally {
      setRsvpsLoading(false);
    }
  };

  const handleToggleRsvpList = () => {
    if (!showRsvpList && rsvps.length === 0) {
      // Load RSVPs when showing list for the first time
      loadRsvps();
    }
    setShowRsvpList(!showRsvpList);
  };

  const handleExportRSVP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/rsvp/export');

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Kunne ikke eksportere RSVP-data');
        setLoading(false);
        return;
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'rsvp-svar.xlsx'
        : 'rsvp-svar.xlsx';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('RSVP-data eksportert!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Feil ved eksport');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = (path: string[], value: unknown) => {
    if (!content) return;
    
    const newContent = { ...content };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = newContent;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (typeof current[path[i]] !== 'object' || Array.isArray(current[path[i]])) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setContent(newContent);
  };

  // Seating chart functions
  const loadSeatingTables = async () => {
    setSeatingLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/seating');
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Kunne ikke hente bord-data');
        setSeatingLoading(false);
        return;
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setSeatingTables(result.data);
        // Initialize table guests state
        const guestsMap: { [key: string]: { name: string; seat_number: number; id?: string }[] } = {};
        result.data.forEach((table: SeatingTable) => {
          guestsMap[table.id] = table.guests || [];
        });
        setTableGuests(guestsMap);
      }
    } catch {
      setError('Feil ved henting av bord-data');
    } finally {
      setSeatingLoading(false);
    }
  };

  const handleCreateTable = async () => {
    const tableNumber = parseInt(newTableNumber, 10);
    const capacity = parseInt(newTableCapacity, 10);
    
    if (!tableNumber || tableNumber < 1) {
      setError('Bord-nummer må være et positivt tall');
      return;
    }
    
    if (capacity < 1 || capacity > 8) {
      setError('Kapasitet må være mellom 1 og 8');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/seating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: tableNumber, capacity }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setNewTableNumber('');
        setNewTableCapacity('8');
        setSuccess('Bord opprettet!');
        setTimeout(() => setSuccess(''), 3000);
        await loadSeatingTables();
      } else {
        setError(data.error || 'Kunne ikke opprette bord');
      }
    } catch {
      setError('Feil ved opprettelse av bord');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTable = async (tableId: string) => {
    const tableNumber = parseInt(editTableNumber, 10);
    const capacity = parseInt(editTableCapacity, 10);
    
    if (!tableNumber || tableNumber < 1) {
      setError('Bord-nummer må være et positivt tall');
      return;
    }
    
    if (capacity < 1 || capacity > 8) {
      setError('Kapasitet må være mellom 1 og 8');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/seating', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, table_number: tableNumber, capacity }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setEditingTable(null);
        setEditTableNumber('');
        setEditTableCapacity('');
        setSuccess('Bord oppdatert!');
        setTimeout(() => setSuccess(''), 3000);
        await loadSeatingTables();
      } else {
        setError(data.error || 'Kunne ikke oppdatere bord');
      }
    } catch {
      setError('Feil ved oppdatering av bord');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Er du sikker på at du vil slette dette bordet? Alle gjester på bordet vil også bli slettet.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/seating?id=${tableId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Bord slettet!');
        setTimeout(() => setSuccess(''), 3000);
        await loadSeatingTables();
      } else {
        setError(data.error || 'Kunne ikke slette bord');
      }
    } catch {
      setError('Feil ved sletting av bord');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTableGuests = async (tableId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const guests = tableGuests[tableId] || [];
      const currentTable = seatingTables.find(t => t.id === tableId);
      const existingGuests = currentTable?.guests || [];
      
      // Delete removed guests
      for (const existing of existingGuests) {
        if (!guests.find((g: { name: string; seat_number: number; id?: string }) => g.id === existing.id)) {
          await fetch(`/api/admin/seating/guests?id=${existing.id}`, { method: 'DELETE' });
        }
      }
      
      // Add/update guests
      for (const guest of guests) {
        if (guest.name.trim()) {
          if (guest.id) {
            // Update existing
            await fetch('/api/admin/seating/guests', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: guest.id,
                table_id: tableId,
                name: guest.name.trim(),
                seat_number: guest.seat_number,
              }),
            });
          } else {
            // Create new
            await fetch('/api/admin/seating/guests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                table_id: tableId,
                name: guest.name.trim(),
                seat_number: guest.seat_number,
              }),
            });
          }
        }
      }
      
      setSuccess('Gjester lagret!');
      setTimeout(() => setSuccess(''), 3000);
      await loadSeatingTables();
    } catch {
      setError('Feil ved lagring av gjester');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTableForGuests = (tableId: string) => {
    if (selectedTableForGuests === tableId) {
      setSelectedTableForGuests(null);
    } else {
      setSelectedTableForGuests(tableId);
      // Initialize guests if not already loaded
      if (!tableGuests[tableId]) {
        const table = seatingTables.find(t => t.id === tableId);
        const guests = (table?.guests || []).map((g: SeatingGuest) => ({
          id: g.id,
          name: g.name,
          seat_number: g.seat_number,
        }));
        // Fill empty seats
        const capacity = table?.capacity || 8;
        const seats: { name: string; seat_number: number; id?: string }[] = [];
        for (let i = 1; i <= capacity; i++) {
          const existing = guests.find((g: { name: string; seat_number: number; id?: string }) => g.seat_number === i);
          seats.push(existing || { name: '', seat_number: i });
        }
        setTableGuests({ ...tableGuests, [tableId]: seats });
      }
    }
  };

  const addTimelineItem = () => {
    if (!content) return;
    const newContent = {
      ...content,
      story: {
        ...content.story,
        timeline: [
          ...content.story.timeline,
          { date: '', title: '', text: '' },
        ],
      },
    };
    setContent(newContent);
  };

  const removeTimelineItem = (index: number) => {
    if (!content) return;
    const newContent = {
      ...content,
      story: {
        ...content.story,
        timeline: content.story.timeline.filter((_, i) => i !== index),
      },
    };
    setContent(newContent);
  };

  const updateTimelineItem = (index: number, field: string, value: string) => {
    if (!content) return;
    const newContent = {
      ...content,
      story: {
        ...content.story,
        timeline: content.story.timeline.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    };
    setContent(newContent);
  };

  const addGiftLink = () => {
    if (!content) return;
    const newContent = {
      ...content,
      weddingDetails: {
        ...content.weddingDetails,
        gifts: {
          ...content.weddingDetails.gifts,
          links: [
            ...content.weddingDetails.gifts.links,
            { url: '', label: '' },
          ],
        },
      },
    };
    setContent(newContent);
  };

  const removeGiftLink = (index: number) => {
    if (!content) return;
    const newContent = {
      ...content,
      weddingDetails: {
        ...content.weddingDetails,
        gifts: {
          ...content.weddingDetails.gifts,
          links: content.weddingDetails.gifts.links.filter((_, i) => i !== index),
        },
      },
    };
    setContent(newContent);
  };

  const updateGiftLink = (index: number, field: string, value: string) => {
    if (!content) return;
    const newContent = {
      ...content,
      weddingDetails: {
        ...content.weddingDetails,
        gifts: {
          ...content.weddingDetails.gifts,
          links: content.weddingDetails.gifts.links.map((link, i) =>
            i === index ? { ...link, [field]: value } : link
          ),
        },
      },
    };
    setContent(newContent);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-[#2D1B3D] mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                Passord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2D1B3D]">Laster innhold...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFAE0] via-white to-[#F4D1D4] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-[#2D1B3D]">
              Admin Panel
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logg ut
            </button>
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2D1B3D] mb-4">Hero-seksjon</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Dato
                </label>
                <input
                  type="text"
                  value={content.hero.date}
                  onChange={(e) => updateContent(['hero', 'date'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Lokasjon
                </label>
                <input
                  type="text"
                  value={content.hero.location}
                  onChange={(e) => updateContent(['hero', 'location'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Brudens navn
                  </label>
                  <input
                    type="text"
                    value={content.hero.names.bride}
                    onChange={(e) => updateContent(['hero', 'names', 'bride'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Brudgommens navn
                  </label>
                  <input
                    type="text"
                    value={content.hero.names.groom}
                    onChange={(e) => updateContent(['hero', 'names', 'groom'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2D1B3D] mb-4">Vår historie</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Tittel
                </label>
                <input
                  type="text"
                  value={content.story.title}
                  onChange={(e) => updateContent(['story', 'title'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Undertittel
                </label>
                <input
                  type="text"
                  value={content.story.subtitle}
                  onChange={(e) => updateContent(['story', 'subtitle'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-[#4A2B5A]">
                    Timeline-elementer
                  </label>
                  <button
                    type="button"
                    onClick={addTimelineItem}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    + Legg til
                  </button>
                </div>
                <div className="space-y-4">
                  {content.story.timeline.map((item, index) => (
                    <div key={index} className="border border-[#E8B4B8] rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-[#2D1B3D]">Element {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeTimelineItem(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Fjern
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Dato"
                          value={item.date}
                          onChange={(e) => updateTimelineItem(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                        />
                        <input
                          type="text"
                          placeholder="Tittel"
                          value={item.title}
                          onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                        />
                        <textarea
                          placeholder="Tekst"
                          value={item.text}
                          onChange={(e) => updateTimelineItem(index, 'text', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Wedding Details */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2D1B3D] mb-4">Bryllupsdetaljer</h2>
            
            {/* Venue */}
            <div className="mb-6 pb-6 border-b border-[#E8B4B8]">
              <h3 className="text-xl font-semibold text-[#2D1B3D] mb-4">Sted</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.venue.title}
                    onChange={(e) => updateContent(['weddingDetails', 'venue', 'title'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Beskrivelse
                  </label>
                  <textarea
                    value={content.weddingDetails.venue.description}
                    onChange={(e) => updateContent(['weddingDetails', 'venue', 'description'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Nettside URL
                    </label>
                    <input
                      type="text"
                      value={content.weddingDetails.venue.website}
                      onChange={(e) => updateContent(['weddingDetails', 'venue', 'website'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Nettside Label
                    </label>
                    <input
                      type="text"
                      value={content.weddingDetails.venue.websiteLabel}
                      onChange={(e) => updateContent(['weddingDetails', 'venue', 'websiteLabel'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.venue.address}
                    onChange={(e) => updateContent(['weddingDetails', 'venue', 'address'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Google Maps Link
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.venue.mapsLink}
                    onChange={(e) => updateContent(['weddingDetails', 'venue', 'mapsLink'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
            </div>

            {/* Dress Code */}
            <div className="mb-6 pb-6 border-b border-[#E8B4B8]">
              <h3 className="text-xl font-semibold text-[#2D1B3D] mb-4">Antrekk</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.dressCode.title}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'title'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Kleskode
                  </label>
                  <textarea
                    value={content.weddingDetails.dressCode.dressCode}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'dressCode'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    placeholder="Mørk dress (med tilpasninger ved varmt vær)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Poenget
                  </label>
                  <textarea
                    value={content.weddingDetails.dressCode.point}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'point'], e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    placeholder="Pyntet og elegant – gjerne i lette materialer og lysere toner om det blir varmt. Kle deg så du trives hele kvelden, ser bra ut på bilder og kan danse hele natten."
                  />
                </div>
              </div>
            </div>

            {/* Gifts */}
            <div className="mb-6 pb-6 border-b border-[#E8B4B8]">
              <h3 className="text-xl font-semibold text-[#2D1B3D] mb-4">Gaveønsker</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.gifts.title}
                    onChange={(e) => updateContent(['weddingDetails', 'gifts', 'title'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Beskrivelse
                  </label>
                  <textarea
                    value={content.weddingDetails.gifts.description}
                    onChange={(e) => updateContent(['weddingDetails', 'gifts', 'description'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-[#4A2B5A]">
                      Lenker
                    </label>
                    <button
                      type="button"
                      onClick={addGiftLink}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      + Legg til lenke
                    </button>
                  </div>
                  <div className="space-y-3">
                    {content.weddingDetails.gifts.links.map((link, index) => (
                      <div key={index} className="border border-[#E8B4B8] rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-[#2D1B3D]">Lenke {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeGiftLink(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Fjern
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => updateGiftLink(index, 'url', e.target.value)}
                            className="px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                          />
                          <input
                            type="text"
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => updateGiftLink(index, 'label', e.target.value)}
                            className="px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Vipps-tekst
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.gifts.vipps}
                    onChange={(e) => updateContent(['weddingDetails', 'gifts', 'vipps'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
            </div>

            {/* Food */}
            <div>
              <h3 className="text-xl font-semibold text-[#2D1B3D] mb-4">Mat</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.food.title}
                    onChange={(e) => updateContent(['weddingDetails', 'food', 'title'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Beskrivelse
                  </label>
                  <textarea
                    value={content.weddingDetails.food.description}
                    onChange={(e) => updateContent(['weddingDetails', 'food', 'description'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Allergi-notat
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.food.allergyNote}
                    onChange={(e) => updateContent(['weddingDetails', 'food', 'allergyNote'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-[#E8B4B8]">
              <h3 className="text-xl font-semibold text-[#2D1B3D] mb-4">Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.info.title}
                    onChange={(e) => updateContent(['weddingDetails', 'info', 'title'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Beskrivelse
                  </label>
                  <textarea
                    value={content.weddingDetails.info.description}
                    onChange={(e) => updateContent(['weddingDetails', 'info', 'description'], e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    placeholder="Eksempel: Barn kan delta på vielsen, fram til bordsetting..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2D1B3D] mb-4">Footer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Overskrift
                </label>
                <input
                  type="text"
                  value={content.footer.heading}
                  onChange={(e) => updateContent(['footer', 'heading'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Tagline
                </label>
                <textarea
                  value={content.footer.tagline}
                  onChange={(e) => updateContent(['footer', 'tagline'], e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Kontakt-tekst
                </label>
                <input
                  type="text"
                  value={content.footer.contactText}
                  onChange={(e) => updateContent(['footer', 'contactText'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Vis kontaktinfo-tekst
                  </label>
                  <input
                    type="text"
                    value={content.footer.showContactText}
                    onChange={(e) => updateContent(['footer', 'showContactText'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Skjul kontaktinfo-tekst
                  </label>
                  <input
                    type="text"
                    value={content.footer.hideContactText}
                    onChange={(e) => updateContent(['footer', 'hideContactText'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Brudens navn
                  </label>
                  <input
                    type="text"
                    value={content.footer.contact.bride.name}
                    onChange={(e) => updateContent(['footer', 'contact', 'bride', 'name'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Brudens telefon
                  </label>
                  <input
                    type="text"
                    value={content.footer.contact.bride.phone}
                    onChange={(e) => updateContent(['footer', 'contact', 'bride', 'phone'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Brudgommens navn
                  </label>
                  <input
                    type="text"
                    value={content.footer.contact.groom.name}
                    onChange={(e) => updateContent(['footer', 'contact', 'groom', 'name'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Brudgommens telefon
                  </label>
                  <input
                    type="text"
                    value={content.footer.contact.groom.phone}
                    onChange={(e) => updateContent(['footer', 'contact', 'groom', 'phone'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* RSVP Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2D1B3D] mb-4">RSVP-seksjon</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Overskrift
                </label>
                <input
                  type="text"
                  value={content.rsvp.title}
                  onChange={(e) => updateContent(['rsvp', 'title'], e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Undertittel (linje 1)
                </label>
                <input
                  type="text"
                  value={content.rsvp.subtitle[0] || ''}
                  onChange={(e) => {
                    const newSubtitle = [...(content.rsvp.subtitle || [])];
                    newSubtitle[0] = e.target.value;
                    updateContent(['rsvp', 'subtitle'], newSubtitle);
                  }}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                  Undertittel (linje 2)
                </label>
                <input
                  type="text"
                  value={content.rsvp.subtitle[1] || ''}
                  onChange={(e) => {
                    const newSubtitle = [...(content.rsvp.subtitle || [])];
                    newSubtitle[1] = e.target.value;
                    updateContent(['rsvp', 'subtitle'], newSubtitle);
                  }}
                  className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Knapp: Jeg kommer
                  </label>
                  <input
                    type="text"
                    value={content.rsvp.buttons.attending}
                    onChange={(e) => updateContent(['rsvp', 'buttons', 'attending'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Knapp: Jeg kan dessverre ikke
                  </label>
                  <input
                    type="text"
                    value={content.rsvp.buttons.notAttending}
                    onChange={(e) => updateContent(['rsvp', 'buttons', 'notAttending'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
              <div className="border-t border-[#E8B4B8] pt-4 mt-4">
                <h3 className="text-lg font-semibold text-[#2D1B3D] mb-4">Skjema-felter</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                        Navn label
                      </label>
                      <input
                        type="text"
                        value={content.rsvp.form.nameLabel}
                        onChange={(e) => updateContent(['rsvp', 'form', 'nameLabel'], e.target.value)}
                        className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                        Navn placeholder
                      </label>
                      <input
                        type="text"
                        value={content.rsvp.form.namePlaceholder}
                        onChange={(e) => updateContent(['rsvp', 'form', 'namePlaceholder'], e.target.value)}
                        className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                        Telefon label
                      </label>
                      <input
                        type="text"
                        value={content.rsvp.form.phoneLabel}
                        onChange={(e) => updateContent(['rsvp', 'form', 'phoneLabel'], e.target.value)}
                        className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                        Telefon placeholder
                      </label>
                      <input
                        type="text"
                        value={content.rsvp.form.phonePlaceholder}
                        onChange={(e) => updateContent(['rsvp', 'form', 'phonePlaceholder'], e.target.value)}
                        className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                        Antall personer label
                      </label>
                      <input
                        type="text"
                        value={content.rsvp.form.guestCountLabel}
                        onChange={(e) => updateContent(['rsvp', 'form', 'guestCountLabel'], e.target.value)}
                        className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Allergier label
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.form.allergiesLabel}
                      onChange={(e) => updateContent(['rsvp', 'form', 'allergiesLabel'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Allergier placeholder
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.form.allergiesPlaceholder}
                      onChange={(e) => updateContent(['rsvp', 'form', 'allergiesPlaceholder'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Allergier hjelpetekst
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.form.allergiesHelpText}
                      onChange={(e) => updateContent(['rsvp', 'form', 'allergiesHelpText'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-[#E8B4B8] pt-4 mt-4">
                <h3 className="text-lg font-semibold text-[#2D1B3D] mb-4">Knapper</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Send svar
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.form.submitButton}
                      onChange={(e) => updateContent(['rsvp', 'form', 'submitButton'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Tilbake
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.form.backButton}
                      onChange={(e) => updateContent(['rsvp', 'form', 'backButton'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Send nytt svar
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.form.newResponseButton}
                      onChange={(e) => updateContent(['rsvp', 'form', 'newResponseButton'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-[#E8B4B8] pt-4 mt-4">
                <h3 className="text-lg font-semibold text-[#2D1B3D] mb-4">Post-submission meldinger</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Melding når man kommer
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.messages.attending}
                      onChange={(e) => updateContent(['rsvp', 'messages', 'attending'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                      Melding når man ikke kommer
                    </label>
                    <input
                      type="text"
                      value={content.rsvp.messages.notAttending}
                      onChange={(e) => updateContent(['rsvp', 'messages', 'notAttending'], e.target.value)}
                      className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RSVP Export Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#2D1B3D] mb-4">RSVP Eksport</h2>
            <p className="text-sm text-[#4A2B5A] mb-4">
              Se alle RSVP-svar i listen eller last ned som Excel-fil (.xlsx)
            </p>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleToggleRsvpList}
                disabled={rsvpsLoading}
                className="flex-1 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                {rsvpsLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Laster...</span>
                  </>
                ) : (
                  <>
                    <svg 
                      className={`w-5 h-5 transition-transform ${showRsvpList ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>{showRsvpList ? 'Skjul RSVP-liste' : 'Vis RSVP-liste'}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleExportRSVP}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#4A2B5A] to-[#2D1B3D] text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Eksporterer...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Last ned Excel</span>
                  </>
                )}
              </button>
            </div>

            {/* RSVP List Table */}
            {showRsvpList && (
              <div className="mt-6">
                {rsvpsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-[#E8B4B8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#4A2B5A]">Laster RSVP-data...</p>
                  </div>
                ) : rsvps.length === 0 ? (
                  <div className="text-center py-8 text-[#4A2B5A]">
                    <p>Ingen RSVP-svar registrert ennå.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#F4D1D4] text-[#2D1B3D]">
                          <th className="px-4 py-3 text-left font-semibold border border-[#E8B4B8]">Kommer?</th>
                          <th className="px-4 py-3 text-left font-semibold border border-[#E8B4B8]">Navn</th>
                          <th className="px-4 py-3 text-left font-semibold border border-[#E8B4B8]">Antall personer</th>
                          <th className="px-4 py-3 text-left font-semibold border border-[#E8B4B8]">Telefon</th>
                          <th className="px-4 py-3 text-left font-semibold border border-[#E8B4B8]">Allergier</th>
                          <th className="px-4 py-3 text-left font-semibold border border-[#E8B4B8]">Dato og tid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rsvps.map((rsvp, index) => (
                          <tr 
                            key={rsvp.id} 
                            className={index % 2 === 0 ? 'bg-white' : 'bg-[#FEFAE0]/50'}
                          >
                            <td className="px-4 py-3 border border-[#E8B4B8]">
                              <span 
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  rsvp.responseRaw === 'yes' 
                                    ? 'bg-green-100 text-green-800' 
                                    : rsvp.responseRaw === 'no'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {rsvp.response}
                              </span>
                            </td>
                            <td className="px-4 py-3 border border-[#E8B4B8] text-[#2D1B3D]">
                              {rsvp.names && rsvp.names.length > 0 ? rsvp.names.join(', ') : '-'}
                            </td>
                            <td className="px-4 py-3 border border-[#E8B4B8] text-[#4A2B5A] text-center">{rsvp.guestCount || 1}</td>
                            <td className="px-4 py-3 border border-[#E8B4B8] text-[#4A2B5A]">{rsvp.phone}</td>
                            <td className="px-4 py-3 border border-[#E8B4B8] text-[#4A2B5A]">
                              {rsvp.allergies && rsvp.allergies.length > 0 
                                ? rsvp.allergies.filter((a: string) => a && a !== '-').join('; ') || '-'
                                : '-'
                              }
                            </td>
                            <td className="px-4 py-3 border border-[#E8B4B8] text-[#4A2B5A]">
                              {rsvp.dateFormatted} {rsvp.timeFormatted}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-sm text-[#4A2B5A] mt-4 text-center">
                      Totalt {rsvps.length} {rsvps.length === 1 ? 'svar' : 'svar'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Seating Chart Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-[#4A2B5A] mb-6">Bord-kart</h2>
            
            {/* Content editing */}
            {content && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Tittel
                  </label>
                  <input
                    type="text"
                    value={content.seatingChart?.title || ''}
                    onChange={(e) => updateContent(['seatingChart', 'title'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Undertittel
                  </label>
                  <input
                    type="text"
                    value={content.seatingChart?.subtitle || ''}
                    onChange={(e) => updateContent(['seatingChart', 'subtitle'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Søkelabel
                  </label>
                  <input
                    type="text"
                    value={content.seatingChart?.searchLabel || ''}
                    onChange={(e) => updateContent(['seatingChart', 'searchLabel'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Søke-placeholder
                  </label>
                  <input
                    type="text"
                    value={content.seatingChart?.searchPlaceholder || ''}
                    onChange={(e) => updateContent(['seatingChart', 'searchPlaceholder'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Ingen resultater-tekst
                  </label>
                  <input
                    type="text"
                    value={content.seatingChart?.noResultsText || ''}
                    onChange={(e) => updateContent(['seatingChart', 'noResultsText'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
              </div>
            )}

            {/* Table management */}
            <div className="border-t border-[#E8B4B8] pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#4A2B5A]">Bord-administrasjon</h3>
                <button
                  onClick={loadSeatingTables}
                  disabled={seatingLoading}
                  className="px-4 py-2 bg-[#E8B4B8] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {seatingLoading ? 'Laster...' : 'Last inn bord'}
                </button>
              </div>

              {/* Create new table */}
              <div className="bg-[#F4D1D4]/30 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-[#4A2B5A] mb-3">Legg til nytt bord</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-1">
                      Bord-nummer
                    </label>
                    <input
                      type="number"
                      value={newTableNumber}
                      onChange={(e) => setNewTableNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A2B5A] mb-1">
                      Kapasitet
                    </label>
                    <input
                      type="number"
                      value={newTableCapacity}
                      onChange={(e) => setNewTableCapacity(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                      min="1"
                      max="8"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateTable}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-[#E8B4B8] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Opprett bord
                    </button>
                  </div>
                </div>
              </div>

              {/* Tables list */}
              {seatingTables.length === 0 ? (
                <p className="text-[#4A2B5A] text-center py-4">
                  Ingen bord opprettet ennå. Opprett et bord for å begynne.
                </p>
              ) : (
                <div className="space-y-4">
                  {seatingTables.map((table) => (
                    <div key={table.id} className="border border-[#E8B4B8] rounded-lg p-4">
                      {editingTable === table.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[#4A2B5A] mb-1">
                                Bord-nummer
                              </label>
                              <input
                                type="number"
                                value={editTableNumber}
                                onChange={(e) => setEditTableNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#4A2B5A] mb-1">
                                Kapasitet
                              </label>
                              <input
                                type="number"
                                value={editTableCapacity}
                                onChange={(e) => setEditTableCapacity(e.target.value)}
                                className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                                min="1"
                                max="8"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button
                                onClick={() => handleUpdateTable(table.id)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                              >
                                Lagre
                              </button>
                              <button
                                onClick={() => {
                                  setEditingTable(null);
                                  setEditTableNumber('');
                                  setEditTableCapacity('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                              >
                                Avbryt
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-[#4A2B5A]">
                              Bord {table.table_number} (Kapasitet: {table.capacity})
                            </h4>
                            <p className="text-sm text-[#4A2B5A]/70">
                              {table.guests?.length || 0} gjester
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelectTableForGuests(table.id)}
                              className="px-4 py-2 bg-[#F4A261] text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                              {selectedTableForGuests === table.id ? 'Skjul gjester' : 'Administrer gjester'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingTable(table.id);
                                setEditTableNumber(String(table.table_number));
                                setEditTableCapacity(String(table.capacity));
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                              Rediger
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              Slett
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Guest management */}
                      {selectedTableForGuests === table.id && (
                        <div className="mt-4 pt-4 border-t border-[#E8B4B8]">
                          <h5 className="font-semibold text-[#4A2B5A] mb-3">Gjester på bord {table.table_number}</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {Array.from({ length: table.capacity }, (_, i) => i + 1).map((seatNum) => {
                              const guest = tableGuests[table.id]?.find((g: { name: string; seat_number: number; id?: string }) => g.seat_number === seatNum);
                              return (
                                <div key={seatNum} className="space-y-1">
                                  <label className="block text-xs font-medium text-[#4A2B5A]">
                                    Plass {seatNum}
                                  </label>
                                  <input
                                    type="text"
                                    value={guest?.name || ''}
                                    onChange={(e) => {
                                      const updated = [...(tableGuests[table.id] || [])];
                                      const index = updated.findIndex((g: { name: string; seat_number: number; id?: string }) => g.seat_number === seatNum);
                                      if (index >= 0) {
                                        updated[index] = { ...updated[index], name: e.target.value };
                                      } else {
                                        updated.push({ name: e.target.value, seat_number: seatNum });
                                      }
                                      setTableGuests({ ...tableGuests, [table.id]: updated });
                                    }}
                                    placeholder="Navn..."
                                    className="w-full px-3 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8] text-sm"
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => handleSaveTableGuests(table.id)}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {loading ? 'Lagrer...' : 'Lagre gjester'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Save Button */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? 'Lagrer...' : 'Lagre alle endringer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

