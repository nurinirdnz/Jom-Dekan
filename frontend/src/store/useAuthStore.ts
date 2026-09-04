import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  /** True once the initial silent-refresh attempt on app load has resolved. */
  isInitialized: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  setInitialized: () => void;
}

/**
 * Client-only session state. The access token deliberately lives here
 * (in-memory, never persisted to localStorage/sessionStorage) rather
 * than as TanStack Query data — it is not server data to cache, it is
 * ephemeral UI/session state, and Zustand is reserved for exactly this
 * per the architecture guide.
 *
 * The refresh token never touches JavaScript at all: it lives only in
 * the HTTP-only cookie set by the backend.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
  setInitialized: () => set({ isInitialized: true }),
}));
