import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./rootSaga";
import { authReducer } from "./slices/authSlice";
import { bookingReducer } from "./slices/bookingSlice";
import { psychicReducer } from "./slices/psychicSlice";
import { consultationReducer } from "./slices/consultationSlice";
import { reviewReducer } from "./slices/reviewSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bookings: bookingReducer,
    psychics: psychicReducer,
    consultations: consultationReducer,
    reviews: reviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
