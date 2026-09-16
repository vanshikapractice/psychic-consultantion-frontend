import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectIsAuthenticated = createSelector(
  [selectAuthUser, selectAuthToken],
  (user, token) => Boolean(user && token)
);
