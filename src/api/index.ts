export { apiClient } from "./client";
export {
  authApi,
  decodeUserProfile,
  getCurrentUserProfile,
  normalizeUser,
  type AuthResponse,
} from "./auth";
export {
  psychicsApi,
  normalizePsychic,
  normalizePsychics,
  normalizePsychicResponse,
  type CreatePsychicPayload,
} from "./psychics";
export { rolesApi } from "./roles";
export type { RoleRecord } from "../types";
export { bookingsApi, type CreateBookingPayload } from "./bookings";
export {
  consultationsApi,
  type StartConsultationResult,
  type EndConsultationPayload,
} from "./consultations";
export { reviewsApi, type CreateReviewPayload } from "./reviews";
export { healthApi } from "./health";
export {
  decodeToken,
  getUserFromToken,
  isTokenValid,
  type TokenPayload,
} from "./token";
export { createApiError } from "./types";
export type {
  HttpMethod,
  RequestConfig,
  ApiError,
  ErrorCode,
  UserRecord,
  PsychicUserRecord,
} from "./types";
