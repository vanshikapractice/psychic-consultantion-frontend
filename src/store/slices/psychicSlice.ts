import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { resetApp } from "../resetAction";
import type { Psychic, PsychicsFilter } from "../../types";

interface PsychicState {
  psychics: Psychic[];
  selected: Psychic | null;
  loading: boolean;
  error: string | null;
  filter: PsychicsFilter;
}

const initialState: PsychicState = {
  psychics: [],
  selected: null,
  loading: false,
  error: null,
  filter: { search: "" },
};

export const psychicSlice = createSlice({
  name: "psychics",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<PsychicsFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    resetFilter: (state) => {
      state.filter = { search: "" };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setPsychics: (state, action: PayloadAction<Psychic[]>) => {
      state.psychics = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedPsychic: (state, action: PayloadAction<Psychic | null>) => {
      state.selected = action.payload;
    },
    updatePsychicProfile: (state, action: PayloadAction<Partial<Psychic>>) => {
      if (state.selected) {
        state.selected = { ...state.selected, ...action.payload };
      }
      const idx = state.psychics.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.psychics[idx] = { ...state.psychics[idx], ...action.payload };
      }
    },
    [resetApp.type]: () => initialState,
  },
});

export const {
  setFilter,
  resetFilter,
  setLoading,
  setError,
  setPsychics,
  setSelectedPsychic,
  updatePsychicProfile,
} = psychicSlice.actions;
export type { PsychicsFilter };
export const psychicReducer = psychicSlice.reducer;
