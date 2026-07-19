import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@ai-os/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        if (token) localStorage.setItem('access_token', token);
        else localStorage.removeItem('access_token');
        set({ accessToken: token });
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, accessToken: null });
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, accessToken: s.accessToken }) }
  )
);
