import { apiClient } from "./client";
import type { Consultation } from "../types";

export interface StartConsultationPayload {
  bookingId: string;
}

export interface EndConsultationPayload {
  consultationId: string;
}

export const consultationsApi = {
  start: (bookingId: string) =>
    apiClient.post<Consultation>("/api/consultations/start", { bookingId }),
  end: (consultationId: string) =>
    apiClient.post<Consultation>("/api/consultations/end", { consultationId }),
  get: (id: string) => apiClient.get<Consultation>(`/api/consultations/${id}`),
};
