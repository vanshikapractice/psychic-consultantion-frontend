import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton React Query client shared across the app.
 *
 * Extracted into its own module so that non-React code (e.g. the logout
 * cleanup utility) can clear the cache without needing a component-level
 * reference.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
