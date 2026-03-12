"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type ContentData = Record<string, unknown>;

const ContentContext = createContext<ContentData | null>(null);

interface ContentProviderProps {
  children: ReactNode;
  initialContent?: ContentData | null;
}

export function ContentProvider({ children, initialContent = null }: ContentProviderProps) {
  const [content] = useState<ContentData | null>(initialContent);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentData | null {
  return useContext(ContentContext);
}
