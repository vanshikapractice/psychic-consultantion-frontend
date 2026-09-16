import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Review } from "../../types";

interface ReviewState {
  items: Review[];
  loading: boolean;
  error: string | null;
  psychicId: string | null;
}

const initialState: ReviewState = {
  items: [],
  loading: false,
  error: null,
  psychicId: null,
};

export const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setPsychicId: (state, action: PayloadAction<string | null>) => {
      state.psychicId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addReview: (state, action: PayloadAction<Review>) => {
      state.items.push(action.payload);
    },
  },
});

export const { setPsychicId, setLoading, setError, setReviews, addReview } = reviewSlice.actions;
export const reviewReducer = reviewSlice.reducer;
