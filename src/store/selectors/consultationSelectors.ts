import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export const selectActiveConsultation = (state: RootState) => state.consultations.active;
export const selectConsultationLoading = (state: RootState) => state.consultations.loading;
export const selectConsultationError = (state: RootState) => state.consultations.error;
export const selectIsRunning = (state: RootState) => state.consultations.isRunning;
export const selectElapsed = (state: RootState) => state.consultations.elapsed;

export const selectFormattedDuration = createSelector(
  [selectElapsed],
  (elapsed) => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
);
