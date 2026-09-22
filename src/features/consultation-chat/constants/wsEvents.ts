import type {
  ConnectedServerEvent,
  ConsultationEndedServerEvent,
  ErrorServerEvent,
  MessageServerEvent,
  PongServerEvent,
  ReadServerEvent,
  ServerEvent,
  TypingServerEvent,
} from "../types";

export const WS_EVENT_TYPES = {
  CONNECTED: "connected",
  MESSAGE: "message",
  TYPING: "typing",
  READ: "read",
  PONG: "pong",
  CONSULTATION_ENDED: "consultation_ended",
  ERROR: "error",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasType(value: unknown, type: string): value is Record<string, unknown> {
  return isRecord(value) && value.type === type;
}

export function isMessageEvent(event: unknown): event is MessageServerEvent {
  return hasType(event, WS_EVENT_TYPES.MESSAGE) && isRecord(event.data);
}

export function isTypingEvent(event: unknown): event is TypingServerEvent {
  return hasType(event, WS_EVENT_TYPES.TYPING) && isRecord(event.data);
}

export function isReadEvent(event: unknown): event is ReadServerEvent {
  return hasType(event, WS_EVENT_TYPES.READ) && isRecord(event.data);
}

export function isConnectedEvent(event: unknown): event is ConnectedServerEvent {
  return hasType(event, WS_EVENT_TYPES.CONNECTED);
}

export function isPongEvent(event: unknown): event is PongServerEvent {
  return hasType(event, WS_EVENT_TYPES.PONG);
}

export function isConsultationEndedEvent(
  event: unknown
): event is ConsultationEndedServerEvent {
  return hasType(event, WS_EVENT_TYPES.CONSULTATION_ENDED) && isRecord(event.data);
}

export function isErrorEvent(event: unknown): event is ErrorServerEvent {
  return hasType(event, WS_EVENT_TYPES.ERROR);
}

export function isServerEvent(event: unknown): event is ServerEvent {
  return (
    isMessageEvent(event) ||
    isTypingEvent(event) ||
    isReadEvent(event) ||
    isConnectedEvent(event) ||
    isPongEvent(event) ||
    isConsultationEndedEvent(event) ||
    isErrorEvent(event)
  );
}
