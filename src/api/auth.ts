import { apiClient } from "./client";
import { getUserFromToken } from "./token";
import { normalizeUser, roleFromRoleId } from "./normalizeUser";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "../types";

export type { AuthResponse } from "../types";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>("/api/auth/login", payload),
  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>("/api/auth/register", payload),
  getProfile: () => apiClient.get<User>("/api/users/profile"),
  updateProfile: (payload: { name?: string; profileImage?: string }) =>
    apiClient.put<User>("/api/users/profile", payload),
};

export const getCurrentUserProfile = (token: string | null): User | null => {
  return decodeUserProfile(token);
};

export const decodeUserProfile = (token: string | null): User | null => {
  const payload = getUserFromToken(token);

  if (!payload) return null;
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name ?? payload.email.split("@")[0],
    role: payload.role ?? roleFromRoleId(payload.roleId),
    roleId: payload.roleId,
    profileImage: undefined,
    profile_image: null,
    createdAt: "",
  };
};

export { normalizeUser };

export interface AuthStateShape {
  user: User | null;
  token: string | null;
}

/**
 * Rebuild the auth state from the persisted token (localStorage).
 *
 * Mirrors the restoration logic that AuthContext performs on mount so
 * that the Redux store and the React context start in sync after a
 * page refresh.
 */
export const initAuthState = (): AuthStateShape => {
  const token = apiClient.token;

  if (!token) {
    return { user: null, token: null };
  }

  return { user: getCurrentUserProfile(token), token };
};
