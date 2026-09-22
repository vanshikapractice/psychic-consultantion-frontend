import { useCallback, useEffect, useRef, useState } from "react";
import { consultationsApi } from "../api";
import type { Consultation } from "../types";

export function useConsultation(initialConsultationId?: string) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(Boolean(initialConsultationId));
  const [error, setError] = useState<Error | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const syncTimerState = useCallback(
    (c: Consultation) => {
      if (c.status === "active" && c.startTime) {
        const startMs = new Date(c.startTime).getTime();
        const secondsSinceStart = Math.floor((Date.now() - startMs) / 1000);
        setElapsed(secondsSinceStart > 0 ? secondsSinceStart : 0);
        if (secondsSinceStart > 0) startTimer();
      } else if (c.endTime && c.startTime) {
        const startMs = new Date(c.startTime).getTime();
        const endMs = new Date(c.endTime).getTime();
        setElapsed(Math.floor((endMs - startMs) / 1000));
        stopTimer();
      }
    },
    [startTimer, stopTimer]
  );

  const fetch = useCallback(async () => {
    if (!initialConsultationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await consultationsApi.get(initialConsultationId);
      setConsultation(data);
      syncTimerState(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [initialConsultationId, syncTimerState]);

  useEffect(() => {
    if (initialConsultationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetch();
    }
    return stopTimer;
  }, [fetch, stopTimer, initialConsultationId]);

  const formattedDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return {
    consultation,
    loading,
    error,
    isRunning,
    elapsed,
    formattedDuration: formattedDuration(elapsed),
    startConsultation: (bookingId: string) =>
      consultationsApi.start(bookingId).then((result) => result.consultation),
    endConsultation: async () => {
      if (!consultation?.id) return;
      stopTimer();
      const data = await consultationsApi.end({ consultationId: consultation.id });
      setConsultation(data);
      setIsRunning(false);
      return data;
    },
    refetch: fetch,
  };
}
