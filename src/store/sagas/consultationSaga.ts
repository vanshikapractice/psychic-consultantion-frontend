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

function errorCode(error: unknown): string | undefined {
  const value = error as { errorCode?: unknown; details?: unknown };
  if (value.errorCode) return String(value.errorCode);
  if (value.details && typeof value.details === "object" && "code" in value.details) {
    const code = (value.details as { code?: unknown }).code;
    return code === undefined ? undefined : String(code);
  }
  return undefined;
}

function* startConsultationSaga(action: ConsultationAction & { payload: string }): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const result: any = yield call(() => consultationsApi.start(action.payload));
    yield put(setActiveConsultation(result.consultation ?? result));
    yield put(setRunning(true));
    yield put(setError(null));
  } catch (err) {
    yield put(setError((err as Error).message));
  }
}

function* endConsultationSaga(action: ConsultationAction & { payload: { consultationId: string; transcript?: string; finalAmount?: number } }): Generator<any, void, any> {
  try {
    const consultation: any = yield call(() =>
      consultationsApi.end({
        consultationId: action.payload.consultationId,
        transcript: action.payload.transcript,
        finalAmount: action.payload.finalAmount,
      })
    );
    yield put(completeConsultation(consultation));
    yield put(setError(null));
  } catch (err) {
    if (errorCode(err) === "INVALID_CONSULTATION_STATUS") {
      try {
        const consultation: any = yield call(() =>
          consultationsApi.get(action.payload.consultationId)
        );
        yield put(completeConsultation(consultation));
        yield put(setError(null));
        return;
      } catch (refreshError) {
        yield put(setError((refreshError as Error).message));
        return;
      }
    }
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
      yield put(setRunning(true));
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
