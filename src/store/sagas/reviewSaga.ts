import { call, put, takeLatest } from "redux-saga/effects";
import type { Action } from "redux";
import { reviewsApi } from "../../api";
import {
  setPsychicId,
  setLoading,
  setError,
  setReviews,
  addReview,
} from "../slices/reviewSlice";

type ReviewAction = Action<string>;

function* fetchReviews(action: ReviewAction & { payload: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    yield put(setPsychicId(action.payload));
    const data: any = yield call(() => reviewsApi.getByPsychic(action.payload));
    yield put(setReviews(data));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* createReviewSaga(action: ReviewAction & { payload: { consultationId: string; rating: number; comment: string } }): Generator<any, void, any> {
  try {
    const review: any = yield call(() => reviewsApi.create(action.payload));
    yield put(addReview(review));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

export function* watchReviewSagas(): Generator<any, void, any> {
  yield takeLatest("reviews/fetch", fetchReviews);
  yield takeLatest("reviews/create", createReviewSaga);
}
