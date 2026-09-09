import { useCallback, useEffect, useState } from "react";
import { bookingsApi } from "../api";
import type { Booking, BookingStatus } from "../types";

export interface CreateBookingPayload {
  psychicId: string;
  dateTime: string;
  duration: number;
}

export function useBookings(filter?: "customer" | "psychic" | "all") {
  const [data, setData] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookings = await bookingsApi.list(filter);
      setData(bookings);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (payload: CreateBookingPayload) => {
      const booking = await bookingsApi.create(payload);
      setData((prev) => (prev ? [...prev, booking] : [booking]));
      return booking;
    },
    []
  );

  const updateStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      const booking = await bookingsApi.updateStatus(id, status);
      setData((prev) =>
        prev
          ? prev.map((b) => (b.id === id ? booking : b))
          : [booking]
      );
      return booking;
    },
    []
  );

  return {
    data: data ?? [],
    loading,
    error,
    refetch: fetch,
    create,
    updateStatus,
  };
}

export function useBooking(id: string) {
  const [data, setData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const booking = await bookingsApi.get(id);
      setData(booking);
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

  return { data, loading, error, refresh: fetch };
}
