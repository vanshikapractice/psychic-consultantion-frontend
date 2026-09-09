import { apiClient } from "./client";
import type { Review } from "../types";

export interface CreateReviewPayload {
  consultationId: string;
  rating: number;
  comment: string;
}

export const reviewsApi = {
  create: (payload: CreateReviewPayload) =>
    apiClient.post<Review>("/api/reviews", payload),
  getByPsychic: (id: string) =>
    apiClient.get<Review[]>(`/api/psychics/${id}/reviews`),
};
