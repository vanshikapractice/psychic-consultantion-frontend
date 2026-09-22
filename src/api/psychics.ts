import { apiClient } from "./client";
import type { Psychic, Review } from "../types";

export interface CreatePsychicPayload {
  name: string;
  email: string;
  password: string;
  bio?: string;
  specialties?: string[];
  pricePerMinute?: number;
  yearsOfExperience?: number;
  profileImage?: string;
}

interface PsychicRecord {
  id?: unknown;
  user_id?: unknown;
  display_name?: unknown;
  name?: unknown;
  user_name?: unknown;
  user_email?: unknown;
  email?: unknown;
  bio?: unknown;
  rating?: unknown;
  review_count?: unknown;
  reviewCount?: unknown;
  price_per_minute?: unknown;
  pricePerMinute?: unknown;
  rate?: unknown;
  years_of_experience?: unknown;
  yearsOfExperience?: unknown;
  specialties?: unknown;
  specialty?: unknown;
  profile_image?: unknown;
  profileImage?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  status?: unknown;
}

interface PsychicsResponse {
  success?: boolean;
  count?: number;
  data?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function numberValue(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => stringValue(item))
    .filter(Boolean);
}

/**
 * Normalize a single psychic object
 */
export function normalizePsychic(value: unknown): Psychic | null {
  if (!isRecord(value)) {
    return null;
  }

  const record = value as PsychicRecord;

  const id = stringValue(
    record.id ?? record.user_id
  );

  if (!id) {
    return null;
  }

  const specialties = stringArray(record.specialties);

  const specialty = stringValue(
    record.specialty
  );

  const name = stringValue(
    record.display_name ??
      record.name ??
      record.user_name
  );

  const email = stringValue(
    record.user_email ??
      record.email
  );

  const profileImageValue = stringValue(
    record.profile_image ??
      record.profileImage
  );

  return {
    id,

    userId:
      record.user_id === undefined
        ? undefined
        : stringValue(record.user_id),

    displayName: stringValue(
      record.display_name
    ),

    name: name || "Unnamed Psychic",

    email,

    userName: stringValue(
      record.user_name
    ),

    userEmail: stringValue(
      record.user_email
    ),

    role: "psychic",

    bio: stringValue(
      record.bio
    ),

    specialties:
      specialties.length > 0
        ? specialties
        : specialty
          ? [specialty]
          : ["General"],

    pricePerMinute: numberValue(
      record.price_per_minute ??
        record.pricePerMinute ??
        record.rate
    ),

    rate: numberValue(
      record.rate ??
        record.price_per_minute ??
        record.pricePerMinute
    ),

    rating: numberValue(
      record.rating
    ),

    reviewCount: numberValue(
      record.review_count ??
        record.reviewCount
    ),

    yearsOfExperience: numberValue(
      record.years_of_experience ??
        record.yearsOfExperience
    ),

    profileImage:
      profileImageValue || undefined,

    profile_image:
      profileImageValue || null,

    createdAt: stringValue(
      record.created_at ??
        record.createdAt
    ),

    status: stringValue(
      record.status
    ),
  };
}

/**
 * Normalize psychics listing response
 *
 * Expected API response:
 *
 * {
 *   success: true,
 *   count: 10,
 *   data: [...]
 * }
 *
 * Returns:
 *
 * Psychic[]
 */
export function normalizePsychics(
  payload: unknown
): Psychic[] {
  // Case 1:
  // API directly returns an array
  if (Array.isArray(payload)) {
    return payload
      .map(normalizePsychic)
      .filter(
        (psychic): psychic is Psychic =>
          psychic !== null
      );
  }

  // Case 2:
  // API returns { data: [...] }
  if (isRecord(payload)) {
    const response =
      payload as PsychicsResponse;

    if (Array.isArray(response.data)) {
      return response.data
        .map(normalizePsychic)
        .filter(
          (psychic): psychic is Psychic =>
            psychic !== null
        );
    }
  }

  return [];
}

/**
 * Normalize single psychic response
 */
export function normalizePsychicResponse(
  payload: unknown
): Psychic | null {
  if (isRecord(payload)) {
    const response =
      payload as PsychicsResponse;

    // API response:
    // { success: true, data: {...} }
    if (
      isRecord(response.data) &&
      !Array.isArray(response.data)
    ) {
      return normalizePsychic(
        response.data
      );
    }
  }

  return normalizePsychic(payload);
}

export const psychicsApi = {
  /**
   * Create psychic
   */
  create: (
    payload: CreatePsychicPayload
  ) =>
    apiClient
      .post<unknown>(
        "/api/psychics",
        payload
      )
      .then(normalizePsychicResponse)
      .then((psychic) => {
        if (!psychic) {
          throw new Error(
            "Psychic response is invalid."
          );
        }

        return psychic;
      }),

  /**
   * Get all psychics
   *
   * API response:
   *
   * {
   *   success: true,
   *   count: 2,
   *   data: [
   *     {...},
   *     {...}
   *   ]
   * }
   *
   * Returns:
   *
   * Psychic[]
   */
  getPsychics: (
  filters?: {
    specialty?: string;
    minRating?: number;
    maxRate?: number;
  }
): Promise<Psychic[]> => {
  const params = new URLSearchParams();

  if (filters?.specialty) {
    params.set("specialty", filters.specialty);
  }

  if (filters?.minRating !== undefined) {
    params.set(
      "minRating",
      String(filters.minRating)
    );
  }

  if (filters?.maxRate !== undefined) {
    params.set(
      "maxRate",
      String(filters.maxRate)
    );
  }

  const qs = params.toString();

  const url = qs
    ? `/api/psychics?${qs}`
    : "/api/psychics";

  return apiClient
    .get<unknown>(url)
    .then(normalizePsychics);
},

  /**
   * Get single psychic
   */
  getPsychic: (id: string) =>
    apiClient
      .get<unknown>(
        `/api/psychics/${id}`
      )
      .then(
        normalizePsychicResponse
      )
      .then((psychic) => {
        if (!psychic) {
          throw new Error(
            "Psychic response is invalid."
          );
        }

        return psychic;
      }),

  /**
   * Get psychic reviews
   */
  getReviews: (id: string) =>
    apiClient.get<Review[]>(
      `/api/reviews/psychic/${id}`
    ),

  /**
   * Update psychic profile
   */
  updateProfile: (
    payload: Partial<Psychic>
  ) =>
    apiClient
      .put<unknown>(
        "/api/psychics/profile",
        payload
      )
      .then(
        normalizePsychicResponse
      )
      .then((psychic) => {
        if (!psychic) {
          throw new Error(
            "Psychic response is invalid."
          );
        }

        return psychic;
      }),
};