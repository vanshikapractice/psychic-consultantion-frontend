import type { RootState } from "../store";

export const selectReviews = (state: RootState) => state.reviews.items;
export const selectReviewLoading = (state: RootState) => state.reviews.loading;
export const selectReviewError = (state: RootState) => state.reviews.error;
export const selectReviewPsychicId = (state: RootState) => state.reviews.psychicId;
