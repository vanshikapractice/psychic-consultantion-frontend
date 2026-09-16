import { call, put, takeEvery } from "redux-saga/effects";
import type { Action } from "redux";
import { authApi } from "../../api";
import {
  setAuth,
  setAuthLoading,
  setAuthError,
  updateUser,
} from "../slices/authSlice";

type AuthAction = Action<string>;

function* handleLogin(action: AuthAction & { payload: { email: string; password: string } }): Generator<any, void, any> {
  try {
    yield put(setAuthLoading(true));
    const response: any = yield call(() => authApi.login(action.payload));
    yield put(
      setAuth({
        user: response.data.user,
        token: response.data.token,
      })
    );
  } catch (err) {
    yield put(setAuthError((err as Error).message));
  }
}

function* handleRegister(action: AuthAction & { payload: { name: string; email: string; password: string; role: string } }): Generator<any, void, any> {
  try {
    yield put(setAuthLoading(true));
    const response: any = yield call(() => authApi.register(action.payload as any));
    yield put(
      setAuth({
        user: response.data.user,
        token: response.data.token,
      })
    );
  } catch (err) {
    yield put(setAuthError((err as Error).message));
  }
}

function* handleUpdateProfile(action: AuthAction & { payload: { name?: string; profileImage?: string } }): Generator<any, void, any> {
  try {
    yield put(setAuthLoading(true));
    const updated: any = yield call(() => authApi.updateProfile(action.payload));
    yield put(updateUser(updated));
    yield put(setAuthError(null));
  } catch (err) {
    yield put(setAuthError((err as Error).message));
  }
}

export function* watchAuthSagas(): Generator<any, void, any> {
  yield takeEvery("auth/login", handleLogin);
  yield takeEvery("auth/register", handleRegister);
  yield takeEvery("auth/updateProfile", handleUpdateProfile);
}
