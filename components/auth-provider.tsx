'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000000',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@legacyvault.com',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
} as User;

const AuthContext = createContext<AuthContextType>({
  user: MOCK_USER,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>(MOCK_USER);

  const signOut = async () => {
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
