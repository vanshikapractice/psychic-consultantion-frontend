import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Booking, BookingStatus } from "../../types";

export type BookingsFilter = "customer" | "psychic" | "all";

interface BookingState {
  items: Booking[];
  loading: boolean;
  error: string | null;
  filter: BookingsFilter;
}

const initialState: BookingState = {
  items: [],
  loading: false,
  error: null,
  filter: "all",
};

export const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<BookingsFilter>) => {
      state.filter = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.items.push(action.payload);
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: BookingStatus }>) => {
      const booking = state.items.find((b) => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      const booking = state.items.find((b) => b.id === action.payload);
      if (booking) {
        booking.status = "canceled";
      }
    },
    createBooking: (state, action: PayloadAction<Booking>) => {
      state.items.push(action.payload);
    },
  },
});

export const {
  setFilter,
  setLoading,
  setError,
  setBookings,
  addBooking,
  updateBookingStatus,
  cancelBooking,
  createBooking,
} = bookingSlice.actions;
export const bookingReducer = bookingSlice.reducer;
