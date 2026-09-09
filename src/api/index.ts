export { apiClient } from "./client";
export {
  authApi,
  decodeUserProfile,
  getCurrentUserProfile,
  type AuthResponse,
} from "./auth";
export { psychicsApi, type CreatePsychicPayload } from "./psychics";
export { bookingsApi, type CreateBookingPayload } from "./bookings";
export { consultationsApi, type StartConsultationPayload } from "./consultations";
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
