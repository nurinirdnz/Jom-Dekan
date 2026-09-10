import { useEffect, useState } from "react";

// Simulates a loading delay for the frontend-only skeleton demo. Kept
// entirely separate from real react-query `isLoading` flags — this timer
// never gates a real request, and should be deleted (not repurposed) once
// every surface it's used on has its own real loading state to show off.
export function useDemoLoading(durationMs = 2000): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return isLoading;
}
