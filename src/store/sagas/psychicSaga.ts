import { call, put, takeLatest } from "redux-saga/effects";
import type { Action } from "redux";
import { psychicsApi } from "../../api";
import {
  setLoading,
  setError,
  setPsychics,
  setSelectedPsychic,
  updatePsychicProfile,
} from "../slices/psychicSlice";

type PsychicAction = Action<string>;

function* fetchPsychics(action: PsychicAction & { payload?: { specialty?: string; minRating?: number; maxRate?: number } }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const filters = action.payload ?? {};
    const data: any = yield call(() => psychicsApi.getPsychics(filters));
    yield put(setPsychics(data));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* fetchPsychic(action: PsychicAction & { payload: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const data: any = yield call(() => psychicsApi.getPsychic(action.payload));
    yield put(setSelectedPsychic(data));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* updateProfileSaga(action: PsychicAction & { payload: { name?: string; profileImage?: string } }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const updated: any = yield call(() => psychicsApi.updateProfile(action.payload));
    yield put(updatePsychicProfile(updated));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

export function* watchPsychicSagas(): Generator<any, void, any> {
  yield takeLatest("psychics/fetch", fetchPsychics);
  yield takeLatest("psychics/fetchOne", fetchPsychic);
  yield takeLatest("psychics/updateProfile", updateProfileSaga);
}
