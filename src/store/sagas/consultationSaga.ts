import { call, put, takeEvery } from "redux-saga/effects";
import type { Action } from "redux";
import { consultationsApi } from "../../api";
import {
  setLoading,
  setError,
  setActiveConsultation,
  setRunning,
  setElapsed,
  completeConsultation,
} from "../slices/consultationSlice";

type ConsultationAction = Action<string>;

function* startConsultationSaga(action: ConsultationAction & { payload: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const consultation: any = yield call(() => consultationsApi.start(action.payload));
    yield put(setActiveConsultation(consultation));
    yield put(setRunning(true));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* endConsultationSaga(action: ConsultationAction & { payload: { consultationId: string } }): Generator<any, void, any> {
  try {
    const consultation: any = yield call(() => consultationsApi.end(action.payload.consultationId));
    yield put(completeConsultation(consultation));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* fetchConsultationSaga(action: ConsultationAction & { payload: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const data: any = yield call(() => consultationsApi.get(action.payload));
    yield put(setActiveConsultation(data));
    if (data.status === "active" && data.startTime) {
      const startMs = new Date(data.startTime).getTime();
      const secondsSinceStart = Math.floor((Date.now() - startMs) / 1000);
      yield put(setElapsed(secondsSinceStart > 0 ? secondsSinceStart : 0));
      yield put(setRunning(secondsSinceStart > 0));
    } else if (data.endTime && data.startTime) {
      const startMs = new Date(data.startTime).getTime();
      const endMs = new Date(data.endTime).getTime();
      yield put(setElapsed(Math.floor((endMs - startMs) / 1000)));
      yield put(setRunning(false));
    }
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

export function* watchConsultationSagas(): Generator<any, void, any> {
  yield takeEvery("consultations/start", startConsultationSaga);
  yield takeEvery("consultations/end", endConsultationSaga);
  yield takeEvery("consultations/fetch", fetchConsultationSaga);
}
