import { useCallback, useEffect, useRef } from "react";
import { apiClient } from "../../../api/client";
import { useMessages, type UseMessagesReturn } from "./useMessages";
import { useTypingIndicator, type UseTypingIndicatorReturn } from "./useTypingIndicator";
import { useUnreadCount, type UseUnreadCountReturn } from "./useUnreadCount";
import { useWebSocket } from "./useWebSocket";
import type { ChatUser } from "../types";

export interface UseConsultationChatParams {
  consultationId: string | number;
  user: ChatUser;
}

export interface UseConsultationChatReturn {
  messages: UseMessagesReturn["messages"];
  connectionStatus: ReturnType<typeof useWebSocket>["connectionStatus"];
  typingUsers: UseTypingIndicatorReturn["typingUsers"];
  unreadCount: UseUnreadCountReturn["count"];
  sendMessage: UseMessagesReturn["sendMessage"];
  retryMessage: UseMessagesReturn["retryMessage"];
  markRead: UseMessagesReturn["markRead"];
  loadMore: UseMessagesReturn["loadMore"];
  reconnect: ReturnType<typeof useWebSocket>["reconnect"];
  disconnect: ReturnType<typeof useWebSocket>["disconnect"];
  broadcastTyping: UseTypingIndicatorReturn["broadcastTyping"];
  consultationEnded: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  isError: boolean;
  error: Error | null;
  pendingCount: number;
  isOnline: boolean;
  lastError: string | null;
  refetch: UseMessagesReturn["refetch"];
  resetUnread: UseUnreadCountReturn["reset"];
}

export function useConsultationChat({
  consultationId,
  user,
}: UseConsultationChatParams): UseConsultationChatReturn {
  const token =
    apiClient.token ??
    (typeof localStorage === "undefined"
      ? ""
      : localStorage.getItem("auth_token") ?? localStorage.getItem("psychic_app_token")) ??
    "";
  const messagesRef = useRef<UseMessagesReturn | null>(null);
  const typingRef = useRef<UseTypingIndicatorReturn | null>(null);
  const unreadRef = useRef<UseUnreadCountReturn | null>(null);

  const ws = useWebSocket({
    consultationId,
    token,
    onMessage: (event) => messagesRef.current?.handleServerMessage(event),
    onTyping: (event) => typingRef.current?.handleTypingEvent(event.data),
    onRead: (event) => {
      messagesRef.current?.handleReadReceipt(event);
      unreadRef.current?.handleRead(event);
    },
    onConsultationEnded: () => undefined,
    onWsError: () => undefined,
  });

  const messages = useMessages({
    consultationId,
    userId: String(user.id),
    userName: user.name,
    participantType: user.role === "psychic" ? "psychic" : "customer",
    sendClientEvent: ws.sendMessage,
  });

  const typing = useTypingIndicator({
    sendTyping: ws.sendTyping,
  });

  const unread = useUnreadCount({
    consultationId,
    currentUserId: String(user.id),
  });

  useEffect(() => {
    messagesRef.current = messages;
    typingRef.current = typing;
    unreadRef.current = unread;
  }, [messages, typing, unread]);

  useEffect(() => {
    unread.reset();
  }, [consultationId, user.id, unread.reset]);

  const markRead = useCallback(() => {
    messages.markRead();
    unread.reset();
  }, [messages, unread]);

  const error = messages.error ?? (ws.lastError ? new Error(ws.lastError) : null);

  return {
    messages: messages.messages,
    connectionStatus: ws.connectionStatus,
    typingUsers: typing.typingUsers,
    unreadCount: unread.count,
    sendMessage: messages.sendMessage,
    retryMessage: messages.retryMessage,
    markRead,
    loadMore: messages.loadMore,
    reconnect: ws.reconnect,
    disconnect: ws.disconnect,
    broadcastTyping: typing.broadcastTyping,
    consultationEnded: ws.consultationEnded,
    isLoading: messages.isLoading,
    isLoadingMore: messages.isLoadingMore,
    hasNextPage: messages.hasNextPage,
    isError: messages.isError || Boolean(ws.lastError),
    error,
    pendingCount: messages.pendingCount,
    isOnline: ws.isOnline,
    lastError: ws.lastError,
    refetch: messages.refetch,
    resetUnread: unread.reset,
  };
}
