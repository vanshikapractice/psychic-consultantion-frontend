import type { User } from "../types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ROUTE_NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "API_ERROR";

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  errorCode?: string;
  details?: unknown;
}

export function createApiError(
  message: string,
  status?: number,
  errorCode?: string,
  details?: unknown
): ApiError {
  const err = new Error(message) as ApiError;
  err.status = status;
  err.errorCode = errorCode;
  err.details = details;
  return err;
}

export interface UserRecord extends User {
  password: string;
}

export interface PsychicUserRecord extends UserRecord {
  bio?: string;
  specialties?: string[];
  rate?: number;
  rating?: number;
  reviewCount?: number;
  yearsOfExperience?: number;
}
