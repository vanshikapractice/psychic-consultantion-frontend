// src/hooks/useDebounce.ts
// ----------------------------------------------------------------------------
// TASK 4: Custom Debounce Hook
// Returns a value that only updates after `value` has stopped changing for
// `delay` ms. Every keystroke clears the previous pending timer, so only the
// LAST change survives (this is what prevents an API call per keystroke).
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cancel pending timer on each change
  }, [value, delay]);

  return debounced;
}
