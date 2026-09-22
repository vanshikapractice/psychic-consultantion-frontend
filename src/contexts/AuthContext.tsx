import { useState, useEffect, type ReactNode } from "react";
import { apiClient, authApi, normalizeUser } from "../api";
import { initAuthState } from "../api/auth";
import { AuthContext } from "./auth-context";
import type { User, LoginRequest, RegisterRequest } from "../types";
import {
  setAuth as setReduxAuth,
  setAuthError,
  setAuthLoading,
  updateUser,
} from "../store/slices/authSlice";
import { useAppDispatch } from "../store/hooks";
import { resetApp } from "../store/resetAction";
import { clearAppStorage, clearQueryCache } from "../utils/cleanup";

export { AuthContext } from "./auth-context";

function initUser(): User | null {
  return initAuthState().user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(initUser);
  const [token, setToken] = useState<string | null>(apiClient.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restored = initAuthState();
    if (restored.user && restored.token) {
      dispatch(setReduxAuth(restored));
    }
  }, [dispatch]);

  const setAuth = (newToken: string | null, newUser: User | null) => {
    apiClient.setToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setLoading(false);
    setError(null);
    dispatch(setReduxAuth({ user: newUser, token: newToken }));
    dispatch(setAuthLoading(false));
    dispatch(setAuthError(null));
  };

  const failAuth = (authError: unknown) => {
    const message = authError instanceof Error ? authError.message : "Unable to complete authentication.";
    setLoading(false);
    setError(message);
    dispatch(setAuthLoading(false));
    dispatch(setAuthError(message));
  };

  const login = async (payload: LoginRequest) => {
    setLoading(true);
    setError(null);
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      const response = await authApi.login(payload);
      const { user: rawUser, token: jwt } = response.data;
      const loggedInUser = normalizeUser(rawUser) ?? rawUser;
      setAuth(jwt, loggedInUser);
    } catch (authError) {
      failAuth(authError);
      throw authError;
    }
  };

  const register = async (payload: RegisterRequest) => {
    setLoading(true);
    setError(null);
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      const response = await authApi.register(payload);
      const { user: rawUser, token: jwt } = response.data;
      const newUser = normalizeUser(rawUser) ?? rawUser;
      setAuth(jwt, newUser);
    } catch (authError) {
      failAuth(authError);
      throw authError;
    }
  };

  const logout = () => {
    // 1. Clear React Query cache (messages, psychics, bookings, etc.)
    clearQueryCache();
    // 2. Reset every Redux slice to its initial state
    dispatch(resetApp());
    // 3. Clear all user-specific data from localStorage
    clearAppStorage();
    // 4. Clear the in-memory API token and update local React state
    setAuth(null, null);
  };

  const updateProfile = async (payload: {
    name?: string;
    profileImage?: string;
  }) => {
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      const updated = await authApi.updateProfile(payload);
      setUser(updated);
      dispatch(updateUser(updated));
      dispatch(setAuthLoading(false));
    } catch (error) {
      dispatch(setAuthLoading(false));
      dispatch(setAuthError((error as Error).message));
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
