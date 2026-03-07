"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ContentData = Record<string, unknown>;

const ContentContext = createContext<ContentData | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(setContent)
      .catch(err => console.error('Error loading content:', err));
  }, []);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentData | null {
  return useContext(ContentContext);
}
