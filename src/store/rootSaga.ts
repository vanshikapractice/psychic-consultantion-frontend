import { all, fork } from "redux-saga/effects";
import { watchAuthSagas } from "./sagas/authSaga";
import { watchBookingSagas } from "./sagas/bookingSaga";
import { watchPsychicSagas } from "./sagas/psychicSaga";
import { watchConsultationSagas } from "./sagas/consultationSaga";
import { watchReviewSagas } from "./sagas/reviewSaga";

export function* rootSaga() {
  yield all([
    fork(watchAuthSagas),
    fork(watchBookingSagas),
    fork(watchPsychicSagas),
    fork(watchConsultationSagas),
    fork(watchReviewSagas),
  ]);
}
