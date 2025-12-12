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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [content, setContent] = useState<ContentData | null>(null);

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
    loadContent();
  }, []);

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
                    Generelt
                  </label>
                  <input
                    type="text"
                    value={content.weddingDetails.dressCode.general}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'general'], e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Herrer
                  </label>
                  <textarea
                    value={content.weddingDetails.dressCode.men.description}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'men', 'description'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Damer
                  </label>
                  <textarea
                    value={content.weddingDetails.dressCode.women.description}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'women', 'description'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A2B5A] mb-2">
                    Notat
                  </label>
                  <textarea
                    value={content.weddingDetails.dressCode.note}
                    onChange={(e) => updateContent(['weddingDetails', 'dressCode', 'note'], e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-[#E8B4B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B4B8]"
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

