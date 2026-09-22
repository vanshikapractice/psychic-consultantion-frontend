import { queryClient } from "../react-query/queryClient";
import { STORAGE_TOKEN_KEY } from "../api/client";

/**
 * Every localStorage key that may hold user-specific data. Kept in sync
 * with the keys referenced across the app (apiClient, chat fallbacks, etc.).
 */
export const APP_STORAGE_KEYS = [
  STORAGE_TOKEN_KEY, // "psychic_app_token"
  "auth_token",
  "psychic_app_token",
] as const;

/**
 * Removes every user-specific key from localStorage so no data persists
 * between different user sessions.
 */
export function clearAppStorage(): void {
  if (typeof localStorage === "undefined") return;
  for (const key of APP_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable — silently ignore */
    }
  }
}

/**
 * Clears the React Query cache so no fetched data (messages, psychics,
 * bookings, etc.) remains in memory after logout.
 */
export function clearQueryCache(): void {
  queryClient.clear();
}