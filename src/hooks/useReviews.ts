import { useCallback, useEffect, useState } from "react";
import { reviewsApi } from "../api";
import type { Review } from "../types";

interface CreateReviewPayload {
  consultationId: string;
  rating: number;
  comment: string;
}

export function useReviews(psychicId: string) {
  const [data, setData] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!psychicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const reviews = await reviewsApi.getByPsychic(psychicId);
      setData(reviews);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [psychicId]);

   useEffect(() => {
     // eslint-disable-next-line react-hooks/set-state-in-effect
     fetch();
   }, [fetch]);

  return { data: data ?? [], loading, error, refetch: fetch };
}

export function useCreateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (payload: CreateReviewPayload): Promise<Review> => {
      setLoading(true);
      setError(null);
      try {
        const review = await reviewsApi.create(payload);
        return review;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { create, loading, error };
}

export type { CreateReviewPayload };
