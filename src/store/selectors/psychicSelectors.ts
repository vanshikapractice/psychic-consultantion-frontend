import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export const selectPsychics = (state: RootState) => state.psychics.psychics;
export const selectSelectedPsychic = (state: RootState) => state.psychics.selected;
export const selectPsychicLoading = (state: RootState) => state.psychics.loading;
export const selectPsychicError = (state: RootState) => state.psychics.error;
export const selectPsychicFilter = (state: RootState) => state.psychics.filter;

export const selectFilteredPsychics = createSelector(
  [selectPsychics, selectPsychicFilter],
  (psychics, filter) => {
    let results = psychics;
    if (filter.search?.trim()) {
      const term = filter.search.toLowerCase();
      results = psychics.filter((psychic) => {
        const specialties = Array.isArray(psychic.specialties) ? psychic.specialties : [];
        return (
          psychic.name.toLowerCase().includes(term) ||
          specialties.some((specialty) => specialty.toLowerCase().includes(term)) ||
          psychic.email.toLowerCase().includes(term)
        );
      });
    }
    if (filter.specialty) {
      results = results.filter((psychic) =>
        (Array.isArray(psychic.specialties) ? psychic.specialties : []).includes(filter.specialty!)
      );
    }
    const minRating = filter.minRating;
    if (minRating !== undefined) {
      results = results.filter((psychic) => Number(psychic.rating) >= minRating);
    }
    const maxRate = filter.maxRate;
    if (maxRate !== undefined) {
      results = results.filter((psychic) => Number(psychic.rate) <= maxRate);
    }
    return results;
  }
);
