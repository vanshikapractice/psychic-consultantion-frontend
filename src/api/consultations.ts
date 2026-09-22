import { apiClient } from "./client";
import type { Consultation, ConsultationStatus } from "../types";

export interface StartConsultationResult {
  consultation: Consultation;
  /** JWT used for WebSocket (same as session auth token on this backend). */
  wsToken: string;
}

export interface EndConsultationPayload {
  consultationId: string;
  transcript?: string;
  finalAmount?: number;
}

interface RawConsultation {
  id: number;
  booking_id: number;
  started_at: string;
  ended_at?: string | null;
  actual_duration_minutes?: number | null;
  status: string;
  transcript?: string | null;
  final_amount?: string | number | null;
  customer_id?: number;
  psychic_id?: number;
  duration_minutes?: number;
  customer_name?: string;
  psychic_name?: string;
  scheduled_at?: string;
  total_amount?: string | number;
  notes?: string | null;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function mapStatus(status: string): ConsultationStatus {
  if (status === "ongoing") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "canceled") return "canceled";
  return "active";
}

export function normalizeConsultation(raw: RawConsultation): Consultation {
  const duration =
    raw.actual_duration_minutes ??
    raw.duration_minutes ??
    0;

  const total =
    raw.final_amount !== undefined && raw.final_amount !== null
      ? Number(raw.final_amount)
      : raw.total_amount !== undefined
        ? Number(raw.total_amount)
        : 0;

  return {
    id: String(raw.id),
    bookingId: String(raw.booking_id),
    psychicId: String(raw.psychic_id ?? ""),
    customerId: String(raw.customer_id ?? ""),
    psychicName: raw.psychic_name ?? "Psychic",
    customerName: raw.customer_name,
    startTime: raw.started_at,
    endTime: raw.ended_at ?? undefined,
    duration: Number(duration) || 0,
    rate: 0,
    totalPrice: total,
    costLog: [],
    status: mapStatus(raw.status),
    transcript: raw.transcript ?? undefined,
    notes: raw.notes ?? undefined,
    scheduledAt: raw.scheduled_at,
  };
}

async function parseConsultationResponse(payload: unknown): Promise<Consultation> {
  const data = unwrapData<RawConsultation>(payload);
  return normalizeConsultation(data);
}

async function parseConsultationList(payload: unknown): Promise<Consultation[]> {
  const data = unwrapData<RawConsultation[]>(payload);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeConsultation);
}

export const consultationsApi = {
  start: async (bookingId: string): Promise<StartConsultationResult> => {
    const token = apiClient.token;
    if (!token) {
      throw new Error("You must be logged in to start a consultation.");
    }
    const response = await apiClient.post<unknown>("/api/consultations/start", {
      booking_id: Number(bookingId) || bookingId,
    });
    const consultation = await parseConsultationResponse(response);
    return { consultation, wsToken: token };
  },

  getByBooking: async (bookingId: string): Promise<Consultation | null> => {
    try {
      const response = await apiClient.get<unknown>(
        `/api/consultations/by-booking/${bookingId}`
      );
      return parseConsultationResponse(response);
    } catch {
      return null;
    }
  },

  startOrResume: async (bookingId: string): Promise<StartConsultationResult> => {
    try {
      return await consultationsApi.start(bookingId);
    } catch (err) {
      const apiErr = err as Error & { status?: number; details?: { code?: string } };
      const code =
        apiErr.details && typeof apiErr.details === "object" && "code" in apiErr.details
          ? String((apiErr.details as { code?: string }).code)
          : undefined;
      if (apiErr.status === 409 || code === "CONSULTATION_EXISTS") {
        const existing = await consultationsApi.getByBooking(bookingId);
        if (existing && apiClient.token) {
          return { consultation: existing, wsToken: apiClient.token };
        }
      }
      throw err;
    }
  },

  end: (payload: EndConsultationPayload) =>
    apiClient
      .put<unknown>(`/api/consultations/${payload.consultationId}/end`, {
        transcript: payload.transcript ?? "Session completed",
        final_amount: payload.finalAmount,
      })
      .then(parseConsultationResponse),

  get: (id: string) =>
    apiClient.get<unknown>(`/api/consultations/${id}`).then(parseConsultationResponse),

  listIncoming: () =>
    apiClient
      .get<unknown>("/api/consultations/incoming")
      .then(parseConsultationList),

  list: (filterBy?: "customer" | "psychic") => {
    const params = new URLSearchParams();
    if (filterBy) params.set("filterBy", filterBy);
    const qs = params.toString();
    return apiClient
      .get<unknown>(qs ? `/api/consultations?${qs}` : "/api/consultations")
      .then(parseConsultationList);
  },
};
