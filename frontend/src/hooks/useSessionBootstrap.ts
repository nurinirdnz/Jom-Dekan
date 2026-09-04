import { useEffect } from 'react';
import { authService } from '../service/authService';
import { useAuthStore } from '../store/useAuthStore';

/**
 * On first app load there is no access token in memory yet (a full
 * page refresh clears it, by design — it is never persisted). This
 * silently attempts a refresh using the HTTP-only cookie so an
 * already-logged-in visitor doesn't have to log in again every time
 * they reload the page. Failure just means "not logged in" — never
 * surfaced as an error.
 */
export function useSessionBootstrap(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (isInitialized) return;
    let cancelled = false;

    authService
      .refresh()
      .then((data) => {
        if (!cancelled) setSession(data.accessToken, data.user);
      })
      .catch(() => {
        // No valid session cookie — that's fine, user stays logged out.
      })
      .finally(() => {
        if (!cancelled) setInitialized();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
