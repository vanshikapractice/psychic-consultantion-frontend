import { roleFromRoleId } from "./normalizeUser";
import type { Role } from "../types";

export interface TokenPayload {
  userId: string | number;
  email: string;
  name?: string;
  role?: Role;
  roleId?: number;
  exp: number;
}

interface RawJwtPayload {
  id?: number;
  userId?: number;
  email?: string;
  role_id?: number;
  roleId?: number;
  exp: number;
}

function base64UrlDecode(str: string): string {
  const pad = str.length % 4;
  const padded = pad ? str + "=".repeat(4 - pad) : str;
  return atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

function normalizePayload(raw: RawJwtPayload): TokenPayload {
  const roleId = raw.role_id ?? raw.roleId;
  return {
    userId: raw.id ?? raw.userId ?? "",
    email: raw.email ?? "",
    roleId,
    role: roleFromRoleId(roleId),
    exp: raw.exp,
  };
}

export const decodeToken = (token: string): TokenPayload => {
  const payload = token.split(".")[1];
  if (!payload) {
    const raw = JSON.parse(atob(token)) as RawJwtPayload;
    return normalizePayload(raw);
  }
  const json = base64UrlDecode(payload);
  return normalizePayload(JSON.parse(json) as RawJwtPayload);
};

export const isTokenValid = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = (token: string | null): TokenPayload | null => {
  if (!token) return null;
  try {
    const payload = decodeToken(token);
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};
