import { apiClient } from "./client";
import type { Psychic, Review } from "../types";

export interface CreatePsychicPayload {
  name: string;
  email: string;
  password: string;
  bio?: string;
  specialties?: string[];
  pricePerMinute?: number;
  yearsOfExperience?: number;
  profileImage?: string;
}

export const psychicsApi = {
  create: (payload: CreatePsychicPayload) =>
    apiClient.post<Psychic>("/api/psychics", payload),
  getPsychics: (filters?: {
    specialty?: string;
    minRating?: number;
    maxRate?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.specialty) params.set("specialty", filters.specialty);
    if (filters?.minRating !== undefined)
      params.set("minRating", String(filters.minRating));
    if (filters?.maxRate !== undefined)
      params.set("maxRate", String(filters.maxRate));
    const qs = params.toString();
    const url = qs ? `/api/psychics?${qs}` : "/api/psychics";
    return apiClient.get<Psychic[]>(url);
  },
  getPsychic: (id: string) => apiClient.get<Psychic>(`/api/psychics/${id}`),
  getReviews: (id: string) =>
    apiClient.get<Review[]>(`/api/psychics/${id}/reviews`),
  updateProfile: (payload: Partial<Psychic>) =>
    apiClient.put<Psychic>("/api/psychics/profile", payload),
};
