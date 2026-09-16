import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import type { Action } from "redux";
import { bookingsApi } from "../../api";
import type { BookingStatus } from "../../types";
import {
  setLoading,
  setError,
  setBookings,
  addBooking,
  updateBookingStatus,
  cancelBooking,
} from "../slices/bookingSlice";

type BookingAction = Action<string>;

function* fetchBookings(action: BookingAction & { payload?: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const filter = action.payload ?? "all";
    const data: any = yield call(() => bookingsApi.list(filter as any));
    yield put(setBookings(data));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* createBooking(action: BookingAction & { payload: { psychicId: string; dateTime: string; duration: number } }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const booking: any = yield call(() => bookingsApi.create(action.payload));
    yield put(addBooking(booking));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* updateBookingStatusSaga(action: BookingAction & { payload: { id: string; status: string } }): Generator<any, void, any> {
  try {
    yield call(() => bookingsApi.updateStatus(action.payload.id, action.payload.status as BookingStatus));
    yield put(updateBookingStatus({ id: action.payload.id, status: action.payload.status as BookingStatus }));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* cancelBookingSaga(action: BookingAction & { payload: string }): Generator<any, void, any> {
  try {
    yield call(() => bookingsApi.cancel(action.payload));
    yield put(cancelBooking(action.payload));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

export function* watchBookingSagas(): Generator<any, void, any> {
  yield takeLatest("bookings/fetch", fetchBookings);
  yield takeLatest("bookings/create", createBooking);
  yield takeEvery("bookings/updateStatus", updateBookingStatusSaga);
  yield takeEvery("bookings/cancel", cancelBookingSaga);
}
