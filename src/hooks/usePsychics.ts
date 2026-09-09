import { useCallback, useEffect, useMemo, useState } from "react";
import { psychicsApi } from "../api";
import { useDebounce } from "./useDebounce";
import type { Psychic, PsychicsFilter } from "../types";

export function usePsychics(filter: PsychicsFilter = {}) {
  const [data, setData] = useState<Psychic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const debouncedSearch = useDebounce(filter.search ?? "", 400);

  const filters = useMemo(
    () => ({
      specialty: filter.specialty,
      minRating: filter.minRating,
      maxRate: filter.maxRate,
    }),
    [filter.specialty, filter.minRating, filter.maxRate]
  );

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const psychics = await psychicsApi.getPsychics(filters);
      let results = psychics;
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.toLowerCase();
        results = psychics.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.specialties.some((s) => s.toLowerCase().includes(term)) ||
            p.email.toLowerCase().includes(term)
        );
      }
      setData(results);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  return { data: data ?? [], loading, error, refetch: fetch };
}

export function usePsychic(id: string) {
  const [data, setData] = useState<Psychic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const psychic = await psychicsApi.getPsychic(id);
      setData(psychic);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
