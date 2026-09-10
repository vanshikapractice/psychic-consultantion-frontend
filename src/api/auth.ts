import { apiClient } from "./client";
import { getUserFromToken } from "./token";
import type { User, LoginRequest, RegisterRequest, AuthResponse } from "../types";

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
    name: payload.email.split("@")[0],
    role: payload.role || "customer",
    roleId: payload.roleId,
    profileImage: undefined,
    profile_image: null,
    createdAt: "",
  };
};
