import { useCallback, useEffect, useState } from "react";
import { consultationsApi } from "../api";
import type { Consultation } from "../types";
import type { Role } from "../types";

export interface UseConsultationsResult {
  data: Consultation[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseConsultationsOptions {
  pollInterval?: number;
}

export function useConsultations(
  role: Role,
  options?: UseConsultationsOptions
): UseConsultationsResult {
  const [data, setData] = useState<Consultation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (role === "psychic") {
        const consultations = await consultationsApi.listIncoming();
        setData(consultations);
      } else {
        const consultations = await consultationsApi.list("customer");
        setData(consultations);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();

    if (options?.pollInterval && role === "psychic") {
      const intervalId = setInterval(fetch, options.pollInterval);
      return () => {
        clearInterval(intervalId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  return {
    data: data ?? [],
    loading,
    error,
    refetch: fetch,
  };
}
