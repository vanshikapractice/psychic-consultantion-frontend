import type { Role } from "../types";

export interface TokenPayload {
  userId: string | number;
  email: string;
  role?: Role;
  roleId?: number;
  exp: number;
}

function base64UrlDecode(str: string): string {
  const pad = str.length % 4;
  const padded = pad ? str + "=".repeat(4 - pad) : str;
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

export const decodeToken = (token: string): TokenPayload => {
  const payload = token.split(".")[1];
  if (!payload) {
    const raw = JSON.parse(atob(token));
    return raw as TokenPayload;
  }
  const json = base64UrlDecode(payload);
  return JSON.parse(json) as TokenPayload;
};

export const isTokenValid = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    return payload.exp > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = (token: string | null): TokenPayload | null => {
  if (!token) return null;
  try {
    const payload = decodeToken(token);
    if (payload.exp && payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};
