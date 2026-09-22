import {
  isConnectedEvent,
  isConsultationEndedEvent,
  isErrorEvent,
  isMessageEvent,
  isPongEvent,
  isReadEvent,
  isTypingEvent,
} from "../constants/wsEvents";
import type {
  ClientEvent,
  ConnectedServerEvent,
  ConsultationEndedServerEvent,
  ErrorServerEvent,
  MessageServerEvent,
  PongServerEvent,
  ReadServerEvent,
  ServerEvent,
  TypingServerEvent,
} from "../types";

export type WebSocketConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

type EventMap = {
  connected: ConnectedServerEvent;
  message: MessageServerEvent;
  typing: TypingServerEvent;
  read: ReadServerEvent;
  pong: PongServerEvent;
  consultation_ended: ConsultationEndedServerEvent;
  error: ErrorServerEvent;
  status: WebSocketConnectionStatus;
};

type UnknownListener = (payload: unknown) => void;

export interface WebSocketClientOptions {
  consultationId: string | number;
  token: string;
  url?: string;
  WebSocketConstructor?: typeof WebSocket;
  reconnectDelays?: number[];
  heartbeatIntervalMs?: number;
  pongTimeoutMs?: number;
}

const DEFAULT_RECONNECT_DELAYS = [1_000, 2_000, 4_000, 8_000, 30_000];
const DEFAULT_HEARTBEAT_INTERVAL_MS = 30_000;
const DEFAULT_PONG_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseServerEvent(value: unknown): ServerEvent | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;

  if (isMessageEvent(value)) return value;
  if (isTypingEvent(value)) return value;
  if (isReadEvent(value)) return value;
  if (isConnectedEvent(value)) return value;
  if (isPongEvent(value)) return value;
  if (isConsultationEndedEvent(value)) return value;
  if (isErrorEvent(value)) return value;
  return null;
}

function createSocketUrl(
  consultationId: string | number,
  token: string,
  configuredUrl?: string
): string {
  const configured =
    configuredUrl ??
    import.meta.env.VITE_WS_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    (typeof window === "undefined" ? "ws://localhost" : window.location.origin);
  const normalized = configured.replace(/^http(s?):\/\//, "ws$1://");
  const url = new URL("/ws/consultation", normalized);
  url.searchParams.set("token", token);
  url.searchParams.set("consultation_id", String(consultationId));
  return url.toString();
}

export class WebSocketClient {
  private readonly consultationId: string | number;
  private readonly token: string;
  private readonly configuredUrl?: string;
  private readonly WebSocketConstructor: typeof WebSocket;
  private readonly reconnectDelays: number[];
  private readonly heartbeatIntervalMs: number;
  private readonly pongTimeoutMs: number;
  private readonly listeners = new Map<keyof EventMap, Set<UnknownListener>>();
  private readonly sendQueue: ClientEvent[] = [];

  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private pongTimer: number | null = null;
  private reconnectAttempt = 0;
  private manualClose = false;
  private paused = false;
  private online = true;
  private currentStatus: WebSocketConnectionStatus = "disconnected";
  private readonly visibilityHandler?: () => void;
  private readonly onlineHandler?: () => void;
  private readonly offlineHandler?: () => void;

  constructor(options: WebSocketClientOptions) {
    this.consultationId = options.consultationId;
    this.token = options.token;
    this.configuredUrl = options.url;
    this.WebSocketConstructor =
      options.WebSocketConstructor ??
      (typeof window === "undefined" ? (undefined as unknown as typeof WebSocket) : window.WebSocket);
    this.reconnectDelays = options.reconnectDelays ?? DEFAULT_RECONNECT_DELAYS;
    this.heartbeatIntervalMs =
      options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
    this.pongTimeoutMs = options.pongTimeoutMs ?? DEFAULT_PONG_TIMEOUT_MS;

    if (typeof window !== "undefined") {
      this.visibilityHandler = () => {
        if (document.hidden) {
          this.paused = true;
          this.socket?.close(1000, "Page hidden");
        } else {
          this.paused = false;
          if (this.online) this.connect();
        }
      };
      this.onlineHandler = () => {
        this.online = true;
        this.paused = false;
        this.connect();
      };
      this.offlineHandler = () => {
        this.online = false;
        this.paused = true;
        this.socket?.close(1000, "Browser offline");
      };
      window.addEventListener("visibilitychange", this.visibilityHandler);
      window.addEventListener("online", this.onlineHandler);
      window.addEventListener("offline", this.offlineHandler);
    }
  }

  get status(): WebSocketConnectionStatus {
    return this.currentStatus;
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): () => void {
    const listeners = this.listeners.get(event) ?? new Set<UnknownListener>();
    const wrapped: UnknownListener = (payload) => handler(payload as EventMap[K]);
    listeners.add(wrapped);
    this.listeners.set(event, listeners);

    return () => {
      const current = this.listeners.get(event);
      current?.delete(wrapped);
      if (current?.size === 0) this.listeners.delete(event);
    };
  }

  connect(): void {
    if (this.manualClose || this.paused || !this.online) return;
    if (
      this.socket?.readyState === WebSocket.CONNECTING ||
      this.socket?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    this.clearReconnectTimer();
    this.setStatus("connecting");

    try {
      const socket = new this.WebSocketConstructor(
        createSocketUrl(this.consultationId, this.token, this.configuredUrl)
      );
      this.socket = socket;

      socket.onopen = () => {
        if (this.socket !== socket) return;
        this.reconnectAttempt = 0;
        this.setStatus("connected");
        this.startHeartbeat();
        this.flushQueue();
      };

      socket.onmessage = (event) => {
        if (this.socket !== socket) return;
        this.handleMessage(event.data);
      };

      socket.onerror = () => {
        if (this.socket !== socket) return;
        this.emit("error", { type: "error", message: "WebSocket connection failed." });
        this.setStatus("error");
      };

      socket.onclose = () => {
        if (this.socket !== socket) return;
        this.socket = null;
        this.clearHeartbeat();
        if (this.manualClose || this.paused || !this.online) {
          this.setStatus("disconnected");
          return;
        }
        this.scheduleReconnect();
      };
    } catch {
      this.setStatus("error");
      this.scheduleReconnect();
    }
  }

  send(event: ClientEvent): boolean {
    if (this.manualClose) return false;
    if (this.isConnected) {
      this.write(event);
      return true;
    }

    this.sendQueue.push(event);
    return false;
  }

  disconnect(reason = "Component unmounted"): void {
    this.manualClose = true;
    this.clearReconnectTimer();
    this.clearHeartbeat();
    this.sendQueue.length = 0;
    this.socket?.close(1000, reason);
    this.socket = null;
    this.setStatus("disconnected");
  }

  destroy(): void {
    this.disconnect();
    if (this.visibilityHandler) window.removeEventListener("visibilitychange", this.visibilityHandler);
    if (this.onlineHandler) window.removeEventListener("online", this.onlineHandler);
    if (this.offlineHandler) window.removeEventListener("offline", this.offlineHandler);
    this.listeners.clear();
  }

  reconnect(): void {
    this.manualClose = false;
    this.paused = false;
    this.online = true;
    this.clearReconnectTimer();
    this.socket?.close(1000, "Manual reconnect");
    this.connect();
  }

  private handleMessage(raw: unknown): void {
    let parsed: unknown = raw;
    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        this.emit("error", { type: "error", message: "WebSocket message was not valid JSON." });
        return;
      }
    }

    const event = parseServerEvent(parsed);
    if (!event) return;
    if (event.type === "pong") this.clearPongTimeout();
    this.emit(event.type, event);
  }

  private write(event: ClientEvent): void {
    if (!this.isConnected) return;
    this.socket?.send(JSON.stringify(event));
  }

  private flushQueue(): void {
    const queued = this.sendQueue.splice(0, this.sendQueue.length);
    for (const event of queued) {
      if (this.isConnected) this.write(event);
      else this.sendQueue.unshift(event);
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (!this.isConnected) return;
      this.write({ type: "ping" });
      this.clearPongTimeout();
      this.pongTimer = window.setTimeout(() => {
        this.socket?.close(4000, "Heartbeat timeout");
      }, this.pongTimeoutMs);
    }, this.heartbeatIntervalMs);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    this.clearPongTimeout();
  }

  private clearPongTimeout(): void {
    if (this.pongTimer !== null) window.clearTimeout(this.pongTimer);
    this.pongTimer = null;
  }

  private scheduleReconnect(): void {
    if (this.manualClose || this.paused || !this.online || this.reconnectTimer !== null) return;
    const delay =
      this.reconnectDelays[Math.min(this.reconnectAttempt, this.reconnectDelays.length - 1)] ??
      30_000;
    this.reconnectAttempt += 1;
    this.setStatus("reconnecting");
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private setStatus(status: WebSocketConnectionStatus): void {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    this.emit("status", status);
  }

  private emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch {
        // Event handlers are isolated so one subscriber cannot break the socket.
      }
    }
  }
}

export function createWebSocketClient(
  consultationId: string | number,
  token: string,
  options: Omit<WebSocketClientOptions, "consultationId" | "token"> = {}
): WebSocketClient {
  return new WebSocketClient({ consultationId, token, ...options });
}

export { createSocketUrl };
