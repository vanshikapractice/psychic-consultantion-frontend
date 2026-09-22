import { apiClient } from "./client";
import type { RoleRecord } from "../types";

interface RolesResponse {
  success?: boolean;
  count?: number;
  data?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function numberValue(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function stringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

/**
 * Normalize a single role object
 *
 * Accepts id under either `id` or `role_id`,
 * and name under either `name` or `role_name`.
 */
function normalizeRole(value: unknown): RoleRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const id = numberValue(record.id ?? record.role_id);

  if (!id) {
    return null;
  }

  return {
    id,
    name: stringValue(record.name ?? record.role_name, "Unnamed Role"),
  };
}

/**
 * Normalize roles listing response
 *
 * Handles both shapes:
 *
 *   [
 *     { id: 1, name: "customer" },
 *     { id: 2, name: "psychic" }
 *   ]
 *
 * and:
 *
 *   {
 *     success: true,
 *     count: 2,
 *     data: [...]
 *   }
 *
 * Returns:
 *
 * RoleRecord[]
 */
function normalizeRoles(payload: unknown): RoleRecord[] {
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeRole)
      .filter(
        (role): role is RoleRecord => role !== null
      );
  }

  if (isRecord(payload)) {
    const response = payload as RolesResponse;

    if (Array.isArray(response.data)) {
      return response.data
        .map(normalizeRole)
        .filter(
          (role): role is RoleRecord => role !== null
        );
    }
  }

  return [];
}

export const rolesApi = {
  /**
   * Get all available roles
   *
   * GET /api/roles
   *
   * API response (either shape):
   *
   *   RoleRecord[]
   *
   * or:
   *
   *   {
   *     success: true,
   *     count: 3,
   *     data: [
   *       { id: 1, name: "customer" },
   *       { id: 2, name: "psychic" },
   *       { id: 3, name: "admin" }
   *     ]
   *   }
   *
   * Returns:
   *
   * RoleRecord[]
   */
  getRoles: () =>
    apiClient.get<unknown>("/api/roles").then(normalizeRoles),
};
