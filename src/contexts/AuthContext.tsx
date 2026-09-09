import { useState, type ReactNode } from "react";
import { apiClient, authApi } from "../api";
import { getCurrentUserProfile } from "../api/auth";
import { AuthContext } from "./auth-context";
import type { User, LoginRequest, RegisterRequest } from "../types";

export { AuthContext } from "./auth-context";

function initUser(): User | null {
  const storedToken = apiClient.token;
  if (!storedToken) return null;
  return getCurrentUserProfile(storedToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initUser);
  const [token, setToken] = useState<string | null>(apiClient.token);

  const setAuth = (newToken: string | null, newUser: User | null) => {
    apiClient.setToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (payload: LoginRequest) => {
    const { user: loggedInUser, token: jwt } = await authApi.login(payload);
    console.log({loggedInUser});
    
    setAuth(jwt, loggedInUser);
  };

  const register = async (payload: RegisterRequest) => {
    const { user: newUser, token: jwt } = await authApi.register(payload);
    setAuth(jwt, newUser);
  };

  const logout = () => {
    setAuth(null, null);
  };

  const updateProfile = async (payload: {
    name?: string;
    profileImage?: string;
  }) => {
    const updated = await authApi.updateProfile(payload);
    setUser(updated);
  };

  const value = {
    user,
    token,
    loading: false,
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
