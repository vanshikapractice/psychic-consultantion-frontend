import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Consultation } from "../../types";

interface ConsultationState {
  active: Consultation | null;
  loading: boolean;
  error: string | null;
  isRunning: boolean;
  elapsed: number;
}

const initialState: ConsultationState = {
  active: null,
  loading: false,
  error: null,
  isRunning: false,
  elapsed: 0,
};

export const consultationSlice = createSlice({
  name: "consultations",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setActiveConsultation: (state, action: PayloadAction<Consultation | null>) => {
      state.active = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setElapsed: (state, action: PayloadAction<number>) => {
      state.elapsed = action.payload;
    },
    incrementElapsed: (state) => {
      state.elapsed += 1;
    },
    completeConsultation: (state, action: PayloadAction<Consultation>) => {
      state.active = action.payload;
      state.isRunning = false;
      state.elapsed = action.payload.duration;
      state.loading = false;
      state.error = null;
    },
    resetConsultation: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setActiveConsultation,
  setRunning,
  setElapsed,
  incrementElapsed,
  completeConsultation,
  resetConsultation,
} = consultationSlice.actions;
export const consultationReducer = consultationSlice.reducer;
