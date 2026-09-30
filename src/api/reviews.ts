import { apiClient } from "./client";
import type { Review } from "../types";

export interface CreateReviewPayload {
  consultationId: string;
  rating: number;
  comment: string;
}

function unwrapReviews(payload: unknown): Review[] {
  if (Array.isArray(payload)) return payload as Review[];
  if (payload && typeof payload === "object" && "data" in payload) {
    return unwrapReviews((payload as { data?: unknown }).data);
  }
  return [];
}

export const reviewsApi = {
  create: (payload: CreateReviewPayload) =>
    apiClient.post<Review>("/api/reviews", {
      consultation_id: payload.consultationId,
      rating: payload.rating,
      comment: payload.comment,
    }),
  getByPsychic: async (id: string): Promise<Review[]> => {
    const response = await apiClient.get<unknown>(`/api/reviews/psychic/${id}`);
    return unwrapReviews(response);
  },
};
