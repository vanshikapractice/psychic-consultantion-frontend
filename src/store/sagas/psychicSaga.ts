import { call, put, takeLatest } from "redux-saga/effects";
import type { Action } from "redux";
import { psychicsApi, normalizePsychicResponse } from "../../api";
import type { Psychic } from "../../types";
import {
  setLoading,
  setError,
  setPsychics,
  setSelectedPsychic,
  updatePsychicProfile,
} from "../slices/psychicSlice";

type PsychicAction = Action<string>;

function* fetchPsychics(
  action: PsychicAction & {
    payload?: {
      specialty?: string;
      minRating?: number;
      maxRate?: number;
    };
  }
): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const filters = action.payload ?? {};

    const data: Psychic[] = yield call(() =>
      psychicsApi.getPsychics(filters)
    );

    yield put(setPsychics(data));

  } catch (err) {
    yield put(
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch psychics"
      )
    );
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchPsychic(action: PsychicAction & { payload: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const data: unknown = yield call(() => psychicsApi.getPsychic(action.payload));
    const psychic = normalizePsychicResponse(data);
    yield put(setSelectedPsychic(psychic));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* updateProfileSaga(action: PsychicAction & { payload: { name?: string; profileImage?: string } }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const updated: unknown = yield call(() => psychicsApi.updateProfile(action.payload));
    const psychic = normalizePsychicResponse(updated);
    if (psychic) {
      yield put(updatePsychicProfile(psychic));
    }
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
