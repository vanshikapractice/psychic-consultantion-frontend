import { apiClient } from "./client";
import type { Booking, BookingStatus } from "../types";

export interface CreateBookingPayload {
  psychicId: string;
  dateTime: string;
  duration: number;
  notes?: string;
}

interface ApiBookingResponse {
  success: boolean;
  count: number;
  data: RawBooking[];
}

interface RawBooking {
  id: number;
  customer_id?: number;
  psychic_id: number;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  total_amount: string;
  notes: string | null;
  created_at: string;
  psychic_name?: string;
  customer_name?: string;
  price_per_minute?: string;
}

function normalizeBooking(raw: RawBooking): Booking {
  return {
    id: String(raw.id),
    customerId: raw.customer_id !== undefined ? String(raw.customer_id) : "",
    psychicId: String(raw.psychic_id),
    customerName: raw.customer_name ?? "",
    psychicName: raw.psychic_name ?? "",
    dateTime: raw.scheduled_at,
    durationMinutes: raw.duration_minutes,
    duration: raw.duration_minutes,
    pricePerMinute: raw.price_per_minute ? parseFloat(raw.price_per_minute) : 0,
    rate: raw.price_per_minute ? parseFloat(raw.price_per_minute) : 0,
    totalPrice: parseFloat(raw.total_amount),
    status:
      raw.status === "cancelled"
        ? "canceled"
        : (raw.status as BookingStatus),
    createdAt: raw.created_at,
    notes: raw.notes ?? undefined,
  };
}

function unwrapBooking(payload: unknown): Booking {
  if (payload && typeof payload === "object" && "data" in payload) {
    return normalizeBooking((payload as { data: RawBooking }).data);
  }
  return normalizeBooking(payload as RawBooking);
}

function toBackendPayload(payload: CreateBookingPayload): Record<string, unknown> {
  return {
    psychic_id: Number(payload.psychicId) || payload.psychicId,
    scheduled_at: payload.dateTime,
    duration_minutes: payload.duration,
    notes: payload.notes,
  };
}

export const bookingsApi = {
  create: (payload: CreateBookingPayload) =>
    apiClient
      .post<unknown>("/api/bookings", toBackendPayload(payload))
      .then(unwrapBooking),

  list: async (filterBy?: "customer" | "psychic" | "all"): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filterBy && filterBy !== "all") params.set("filterBy", filterBy);
    const qs = params.toString();
    const url = qs ? `/api/bookings?${qs}` : "/api/bookings/my";
    const response = await apiClient.get<ApiBookingResponse | RawBooking[]>(url);
    if (Array.isArray(response)) {
      return response.map(normalizeBooking);
    }
    return response.data.map(normalizeBooking);
  },

  get: (id: string) =>
    apiClient.get<unknown>(`/api/bookings/${id}`).then(unwrapBooking),

  cancel: (id: string) =>
    apiClient.delete<unknown>(`/api/bookings/${id}`).then(unwrapBooking),

  updateStatus: (id: string, status: BookingStatus) =>
    apiClient
      .put<unknown>(`/api/bookings/${id}/status`, { status })
      .then(unwrapBooking),
};
