'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SocialContent } from '@/lib/social/types';
import { useWallet } from '@/hooks/useWallet';

type SocialContextType = {
  posts: SocialContent[];
  addPost: (post: SocialContent) => void;
  clearPosts: () => void;
};

const SocialContext = createContext<SocialContextType | undefined>(undefined);

function storageKey(addr?: string) {
  const k = addr || 'anon';
  return `sophia:posts:${k.toLowerCase()}`;
}

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useWallet();
  const [posts, setPosts] = useState<SocialContent[]>([]);

  // Load from localStorage on mount or when address changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(address));
      if (raw) {
        const parsed = JSON.parse(raw) as SocialContent[];
        setPosts(parsed);
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    }
  }, [address]);

  const addPost = (post: SocialContent) => {
    setPosts(prev => {
      const next = [post, ...prev];
      localStorage.setItem(storageKey(address), JSON.stringify(next));
      return next;
    });
  };

  const clearPosts = () => {
    setPosts([]);
    localStorage.removeItem(storageKey(address));
  };

  const value = useMemo(() => ({ posts, addPost, clearPosts }), [posts]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};

export function useSocialFeedContext(): SocialContextType {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocialFeedContext must be used within SocialProvider');
  return ctx;
}