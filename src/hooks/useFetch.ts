// src/hooks/useFetch.ts
// ----------------------------------------------------------------------------
// TASK 2: API Fetching & Lifecycle Management
// Generic data-fetching hook. Accepts an async `fetcher` (so it works with the
// function-based api in api/users.ts, not just fetch URLs).
//
// Handles:
//   - loading / error / data state
//   - RACE CONDITIONS: rapid dependency changes could resolve out of order.
//     `cancelled` flag + AbortController ensure only the latest result applies
//     and we never setState on an unmounted component.
//   - `refetch()` to re-run after mutations (create/update/delete).
// ----------------------------------------------------------------------------

import { useCallback, useEffect, useState, type DependencyList } from "react";

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (!cancelled && (err as Error)?.name !== "AbortError") {
          setError(err as Error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reload]);

  const refetch = useCallback(() => setReload((r) => r + 1), []);

  return { data, loading, error, refetch };
}
