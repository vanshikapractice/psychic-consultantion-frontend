import { apiClient } from "./client";
import type { Booking, BookingStatus } from "../types";

export interface CreateBookingPayload {
  psychicId: string;
  dateTime: string;
  duration: number;
}

export const bookingsApi = {
  create: (payload: CreateBookingPayload) =>
    apiClient.post<Booking>("/api/bookings", payload),
  list: (filterBy?: "customer" | "psychic" | "all") => {
    const params = new URLSearchParams();
    if (filterBy && filterBy !== "all") params.set("filterBy", filterBy);
    const qs = params.toString();
    const url = qs ? `/api/bookings?${qs}` : "/api/bookings";
    return apiClient.get<Booking[]>(url);
  },
  get: (id: string) => apiClient.get<Booking>(`/api/bookings/${id}`),
  cancel: (id: string) =>
    apiClient.patch<Booking>(`/api/bookings/${id}/cancel`, {}),
  updateStatus: (id: string, status: BookingStatus) =>
    apiClient.patch<Booking>(`/api/bookings/${id}/status`, { status }),
};
