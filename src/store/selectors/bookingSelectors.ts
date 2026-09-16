import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { Booking } from "../../types";

export const selectBookings = (state: RootState) => state.bookings.items;
export const selectBookingLoading = (state: RootState) => state.bookings.loading;
export const selectBookingError = (state: RootState) => state.bookings.error;
export const selectBookingFilter = (state: RootState) => state.bookings.filter;

export const selectUpcomingBookings = createSelector(
  [selectBookings],
  (bookings) =>
    bookings.filter(
      (b: Booking) =>
        new Date(b.dateTime).getTime() > Date.now() && b.status !== "canceled"
    )
);

export const selectPastBookings = createSelector(
  [selectBookings],
  (bookings) =>
    bookings.filter(
      (b: Booking) =>
        new Date(b.dateTime).getTime() <= Date.now() || b.status === "completed"
    )
);

export const selectBookingById = (id: string) =>
  createSelector([selectBookings], (bookings) =>
    bookings.find((b: Booking) => b.id === id) ?? null
  );
