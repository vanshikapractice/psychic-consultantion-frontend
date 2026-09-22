import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createWebSocketClient,
  WebSocketClient,
  type WebSocketConnectionStatus,
} from "../services/websocket";
import type {
  ClientEvent,
  ConsultationEndedServerEvent,
  MessageServerEvent,
  ReadServerEvent,
  TypingServerEvent,
} from "../types";

export interface UseWebSocketParams {
  consultationId: string | number;
  token: string;
  onMessage?: (event: MessageServerEvent) => void;
  onTyping?: (event: TypingServerEvent) => void;
  onRead?: (event: ReadServerEvent) => void;
  onConsultationEnded?: (event: ConsultationEndedServerEvent) => void;
  onWsError?: (error: Error) => void;
}

export interface UseWebSocketReturn {
  connectionStatus: WebSocketConnectionStatus;
  sendMessage: (event: ClientEvent) => boolean;
  sendTyping: (isTyping: boolean) => boolean;
  sendRead: () => boolean;
  sendPing: () => boolean;
  reconnect: () => void;
  disconnect: () => void;
  lastError: string | null;
  isOnline: boolean;
  consultationEnded: boolean;
  client: WebSocketClient;
}

export function useWebSocket({
  consultationId,
  token,
  onMessage,
  onTyping,
  onRead,
  onConsultationEnded,
  onWsError,
}: UseWebSocketParams): UseWebSocketReturn {
  const callbacksRef = useRef({ onMessage, onTyping, onRead, onConsultationEnded, onWsError });
  callbacksRef.current = { onMessage, onTyping, onRead, onConsultationEnded, onWsError };

  const client = useMemo(
    () => createWebSocketClient(consultationId, token),
    [consultationId, token]
  );

  const [connectionStatus, setConnectionStatus] =
    useState<WebSocketConnectionStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [consultationEnded, setConsultationEnded] = useState(false);

  useEffect(() => {
    setConsultationEnded(false);
    setLastError(null);
  }, [consultationId, token]);

  useEffect(() => {
    const unsubscribers = [
      client.on("status", setConnectionStatus),
      client.on("message", (event) => callbacksRef.current.onMessage?.(event)),
      client.on("typing", (event) => callbacksRef.current.onTyping?.(event)),
      client.on("read", (event) => callbacksRef.current.onRead?.(event)),
      client.on("consultation_ended", (event) => {
        setConsultationEnded(true);
        callbacksRef.current.onConsultationEnded?.(event);
      }),
      client.on("error", (event) => {
        const error = new Error(event.message);
        setLastError(error.message);
        callbacksRef.current.onWsError?.(error);
      }),
    ];

    if (token) client.connect();
    else setConnectionStatus("disconnected");

    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe();
      client.destroy();
    };
  }, [client, token]);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const sendMessage = useCallback(
    (event: ClientEvent) => client.send(event),
    [client]
  );
  const sendTyping = useCallback(
    (isTyping: boolean) => client.send({ type: "typing", isTyping }),
    [client]
  );
  const sendRead = useCallback(() => client.send({ type: "read" }), [client]);
  const sendPing = useCallback(() => client.send({ type: "ping" }), [client]);
  const reconnect = useCallback(() => client.reconnect(), [client]);
  const disconnect = useCallback(() => client.disconnect(), [client]);

  return {
    connectionStatus,
    sendMessage,
    sendTyping,
    sendRead,
    sendPing,
    reconnect,
    disconnect,
    lastError,
    isOnline,
    consultationEnded,
    client,
  };
}
