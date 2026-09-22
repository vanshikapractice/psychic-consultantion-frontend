import { apiClient } from "../../../api/client";
import {
  asConsultationId,
  asMessageId,
  asUserId,
  type Message,
  type MessageType,
  type MessageStatus,
  type ParticipantType,
} from "../types";

export const chatQueryKeys = {
  all: ["consultation-chat"] as const,
  messages: (consultationId: string | number) =>
    [...chatQueryKeys.all, "messages", String(consultationId)] as const,
  unread: (consultationId: string | number) =>
    [...chatQueryKeys.all, "unread", String(consultationId)] as const,
};

const PAGE_SIZE = 50;
const TOKEN_KEYS = ["auth_token", "psychic_app_token"] as const;
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown, fallback = ""): string {
  return value === null || value === undefined ? fallback : String(value);
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return value === null || value === undefined || value === "" || !Number.isFinite(parsed)
    ? 0
    : parsed;
}

function participantType(value: unknown): ParticipantType {
  return value === "psychic" ? "psychic" : "customer";
}

function messageType(value: unknown): MessageType {
  if (value === "image" || value === "file" || value === "system") return value;
  return "text";
}

function messageStatus(value: unknown): MessageStatus {
  if (
    value === "sending" ||
    value === "sent" ||
    value === "delivered" ||
    value === "read" ||
    value === "failed"
  ) {
    return value;
  }
  return "sent";
}

function responsePayload<T>(payload: unknown): T | null {
  if (!isRecord(payload)) return null;
  if ("data" in payload && payload.success === true) {
    return payload.data as T;
  }
  return payload as T;
}

export function normalizeMessage(
  value: unknown,
  consultationId: string | number,
  currentUserId?: string | number
): Message | null {
  if (!isRecord(value)) return null;

  const id = stringValue(value.id ?? value.message_id);
  if (!id) return null;

  const senderId = stringValue(value.sender_id ?? value.senderId ?? value.user_id ?? value.userId);
  const senderName = stringValue(
    value.sender_name ??
      value.senderName ??
      value.user_name ??
      value.userName ??
      value.name
  );
  const type = messageType(value.message_type ?? value.messageType ?? value.type);
  const createdAt = stringValue(value.created_at ?? value.createdAt ?? value.timestamp);
  const ownSender = currentUserId !== undefined && senderId === String(currentUserId);

  return {
    id: asMessageId(id),
    consultationId: asConsultationId(numberValue(value.consultation_id ?? value.consultationId ?? consultationId)),
    senderId: asUserId(senderId || currentUserId || 0),
    senderName: senderName || (ownSender ? "You" : "Consultation participant"),
    participantType: participantType(
      value.participant_type ??
        value.participantType ??
        value.sender_type ??
        value.senderType ??
        value.role
    ),
    content: stringValue(value.content ?? value.body ?? value.text),
    type,
    status: messageStatus(value.status ?? value.delivery_status ?? value.deliveryStatus),
    createdAt: createdAt || new Date().toISOString(),
    deliveredAt: stringValue(value.delivered_at ?? value.deliveredAt) || undefined,
    readAt: stringValue(value.read_at ?? value.readAt) || undefined,
    tempId: stringValue(value.temp_id ?? value.tempId) || undefined,
    isOwn: currentUserId !== undefined && senderId === String(currentUserId),
  };
}

export function normalizeMessages(
  payload: unknown,
  consultationId: string | number,
  currentUserId?: string | number
): Message[] {
  const data = responsePayload<unknown>(payload);
  const values = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.messages)
      ? data.messages
      : [];
  return values
    .map((value) => normalizeMessage(value, consultationId, currentUserId))
    .filter((message): message is Message => message !== null);
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const token = TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ?? null;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${url}`, {
    method: "GET",
    headers,
    signal,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const body = isRecord(payload) ? payload : {};
    throw new Error(stringValue(body.message ?? body.error ?? `Request failed with status ${response.status}`));
  }

  const data = responsePayload<T>(payload);
  if (data === null) throw new Error("The server returned an invalid response.");
  return data;
}

export function fetchMessages(
  consultationId: string | number,
  options: { limit?: number; offset?: number; signal?: AbortSignal } = {}
): Promise<Message[]> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? PAGE_SIZE),
    offset: String(options.offset ?? 0),
  });
  const url = `/api/consultations/${encodeURIComponent(String(consultationId))}/messages?${params.toString()}`;
  return requestJson<unknown>(url, options.signal).then((payload) =>
    normalizeMessages(payload, consultationId)
  );
}

export function fetchUnreadCount(
  consultationId: string | number,
  signal?: AbortSignal
): Promise<number> {
  const url = `/api/consultations/${encodeURIComponent(String(consultationId))}/messages/unread`;
  return requestJson<unknown>(url, signal).then((payload) => {
    const data = responsePayload<unknown>(payload);
    if (isRecord(data)) return numberValue(data.unread_count ?? data.unreadCount ?? data.count);
    return 0;
  });
}

export { apiClient };
