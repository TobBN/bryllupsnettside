'use client';

import { useState, useCallback } from 'react';
import type { ContentData } from '@/types/admin';

export function useContentAdmin() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (e) {
      console.error('Error loading content:', e);
    }
  }, []);

  const save = async () => {
    if (!content) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setSuccess('Innhold lagret!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Kunne ikke lagre');
      }
    } catch {
      setError('Feil ved lagring');
    } finally {
      setLoading(false);
    }
  };

  const update = (path: string[], value: unknown) => {
    if (!content) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newContent = structuredClone(content) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = newContent;
    for (let i = 0; i < path.length - 1; i++) {
      if (typeof current[path[i]] !== 'object' || Array.isArray(current[path[i]])) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setContent(newContent as ContentData);
  };

  return { content, setContent, loading, error, success, load, save, update };
}
