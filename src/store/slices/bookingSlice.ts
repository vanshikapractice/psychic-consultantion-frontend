import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { resetApp } from "../resetAction";
import type { Booking, BookingStatus } from "../../types";

interface BookingState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  items: [],
  loading: false,
  error: null,
};

export const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
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
    [resetApp.type]: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setBookings,
  addBooking,
  updateBookingStatus,
  cancelBooking,
  createBooking,
} = bookingSlice.actions;
export const bookingReducer = bookingSlice.reducer;
