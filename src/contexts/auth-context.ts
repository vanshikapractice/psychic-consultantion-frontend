import { createContext } from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: {
    name?: string;
    profileImage?: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
