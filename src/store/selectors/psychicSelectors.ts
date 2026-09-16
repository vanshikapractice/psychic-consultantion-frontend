import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Psychic } from "../../types";

export const selectPsychics = (state: RootState) => state.psychics.items;
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
      results = psychics.filter(
        (p: Psychic) =>
          p.name.toLowerCase().includes(term) ||
          p.specialties.some((s) => s.toLowerCase().includes(term)) ||
          p.email.toLowerCase().includes(term)
      );
    }
    if (filter.specialty) {
      results = results.filter((p: Psychic) => p.specialties.includes(filter.specialty!));
    }
    if (filter.minRating !== undefined) {
      results = results.filter((p: Psychic) => p.rating >= (filter.minRating as number));
    }
    if (filter.maxRate !== undefined) {
      results = results.filter((p: Psychic) => p.rate <= (filter.maxRate as number));
    }
    return results;
  }
);
