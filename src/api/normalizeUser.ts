import type { Role, User } from "../types";

const ROLE_ID_MAP: Record<number, Role> = {
  7: "customer",
  8: "psychic",
  9: "admin",
};

export function roleFromRoleId(roleId: number | undefined): Role {
  if (roleId === undefined) return "customer";
  return ROLE_ID_MAP[roleId] ?? "customer";
}

export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = record.id;
  if (id === undefined || id === null) return null;

  const roleId =
    typeof record.role_id === "number"
      ? record.role_id
      : typeof record.roleId === "number"
        ? record.roleId
        : undefined;

  const role =
    record.role === "customer" || record.role === "psychic" || record.role === "admin"
      ? (record.role as Role)
      : roleFromRoleId(roleId);

  const profileImage =
    typeof record.profile_image === "string"
      ? record.profile_image
      : typeof record.profileImage === "string"
        ? record.profileImage
        : undefined;

  return {
    id: typeof id === "string" || typeof id === "number" ? id : String(id),
    name: String(record.name ?? record.email ?? "User"),
    email: String(record.email ?? ""),
    role,
    roleId,
    profileImage: profileImage || undefined,
    profile_image: profileImage ?? null,
    createdAt: String(record.created_at ?? record.createdAt ?? ""),
  };
}
