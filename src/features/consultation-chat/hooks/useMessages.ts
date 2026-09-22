import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatQueryKeys, fetchMessages, normalizeMessage } from "../services/chatApi";
import type {
  ClientEvent,
  Message,
  MessageServerEvent,
  ReadServerEventData,
  ReadServerEvent,
} from "../types";

const PAGE_SIZE = 50;
const ACK_TIMEOUT_MS = 15_000;

export interface UseMessagesParams {
  consultationId: string | number;
  userId: string | number;
  userName: string;
  participantType: "customer" | "psychic";
  sendClientEvent: (event: ClientEvent) => boolean;
}

export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  sendMessage: (content: string) => void;
  retryMessage: (messageId: string) => void;
  markRead: (messageId?: string) => void;
  loadMore: () => void;
  handleServerMessage: (event: MessageServerEvent | Message | unknown) => void;
  handleReadReceipt: (event: ReadServerEvent | ReadServerEventData | unknown) => void;
  pendingCount: number;
  hasNextPage: boolean;
}

function findPendingMatch(
  messages: Map<string, Message>,
  message: Message
): string | null {
  if (message.tempId && messages.has(message.tempId)) return message.tempId;
  for (const [key, candidate] of messages) {
    if (
      candidate.status === "sending" &&
      candidate.senderId === message.senderId &&
      candidate.content === message.content
    ) {
      return key;
    }
  }
  return null;
}

function unwrapMessage(value: MessageServerEvent | Message | unknown): Message | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "message" &&
    "data" in value
  ) {
    return (value as { data: Message }).data;
  }
  if (typeof value === "object" && value !== null && "id" in value) {
    return value as Message;
  }
  return null;
}

function unwrapRead(value: ReadServerEvent | ReadServerEventData | unknown): ReadServerEventData | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "read" &&
    "data" in value
  ) {
    return (value as { data: ReadServerEventData }).data;
  }
  if (typeof value === "object" && value !== null && "userId" in value) {
    return value as ReadServerEventData;
  }
  return null;
}

export function useMessages({
  consultationId,
  userId,
  userName,
  participantType,
  sendClientEvent,
}: UseMessagesParams): UseMessagesReturn {
  const query = useInfiniteQuery({
    queryKey: chatQueryKeys.messages(consultationId),
    queryFn: ({ pageParam, signal }) =>
      fetchMessages(consultationId, {
        limit: PAGE_SIZE,
        offset: pageParam ?? 0,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE
        ? allPages.reduce((total, page) => total + page.length, 0)
        : undefined,
    enabled: Boolean(consultationId),
  });

  const [optimisticMessages, setOptimisticMessages] = useState<Map<string, Message>>(
    () => new Map()
  );
  const [remoteMessages, setRemoteMessages] = useState<Map<string, Message>>(
    () => new Map()
  );
  const ackTimersRef = useRef<Map<string, number>>(new Map());

  const restMessages = useMemo(
    () => query.data?.pages.flat() ?? [],
    [query.data]
  );

  const messages = useMemo(() => {
    const merged = new Map<string, Message>();
    for (const message of restMessages) merged.set(message.id, message);
    for (const [id, message] of remoteMessages) merged.set(id, message);
    for (const [id, message] of optimisticMessages) merged.set(id, message);

    return [...merged.values()].sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return leftTime === rightTime ? left.id.localeCompare(right.id) : leftTime - rightTime;
    });
  }, [optimisticMessages, remoteMessages, restMessages]);

  const clearAckTimer = useCallback((tempId: string) => {
    const timer = ackTimersRef.current.get(tempId);
    if (timer !== undefined) window.clearTimeout(timer);
    ackTimersRef.current.delete(tempId);
  }, []);

  useEffect(
    () => () => {
      ackTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      ackTimersRef.current.clear();
    },
    []
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const tempId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const now = new Date().toISOString();
      const optimistic: Message = {
        id: tempId as Message["id"],
        consultationId: Number(consultationId) as Message["consultationId"],
        senderId: userId as Message["senderId"],
        senderName: userName,
        participantType,
        content: trimmed,
        type: "text",
        status: "sending",
        createdAt: now,
        tempId,
      };

      setOptimisticMessages((current) => new Map(current).set(tempId, optimistic));
      sendClientEvent({
        type: "message",
        content: trimmed,
        messageType: "text",
        tempId,
      });

      const timer = window.setTimeout(() => {
        setOptimisticMessages((current) => {
          const next = new Map(current);
          const pending = next.get(tempId);
          if (pending?.status === "sending") {
            next.set(tempId, { ...pending, status: "failed" });
          }
          return next;
        });
        ackTimersRef.current.delete(tempId);
      }, ACK_TIMEOUT_MS);
      ackTimersRef.current.set(tempId, timer);
    },
    [consultationId, participantType, sendClientEvent, userId, userName]
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      const pendingMessage = optimisticMessages.get(messageId);
      if (!pendingMessage || pendingMessage.status !== "failed") return;

      const retry: Message = { ...pendingMessage, status: "sending" };
      setOptimisticMessages((current) => new Map(current).set(messageId, retry));

      clearAckTimer(messageId);
      sendClientEvent({
        type: "message",
        content: retry.content,
        messageType: "text",
        tempId: retry.tempId ?? messageId,
      });
      const timer = window.setTimeout(() => {
        setOptimisticMessages((current) => {
          const next = new Map(current);
          const pending = next.get(messageId);
          if (pending?.status === "sending") {
            next.set(messageId, { ...pending, status: "failed" });
          }
          return next;
        });
        ackTimersRef.current.delete(messageId);
      }, ACK_TIMEOUT_MS);
      ackTimersRef.current.set(messageId, timer);
    },
    [clearAckTimer, optimisticMessages, sendClientEvent]
  );

  const handleServerMessage = useCallback(
    (event: MessageServerEvent | Message | unknown) => {
      const data = unwrapMessage(event);
      if (!data) return;
      const message =
        data.id && data.createdAt
          ? data
          : normalizeMessage(data, consultationId, userId);
      if (!message) return;

      setOptimisticMessages((current) => {
        const next = new Map(current);
        const pendingId = findPendingMatch(next, message);
        if (pendingId) {
          const pending = next.get(pendingId);
          next.delete(pendingId);
          if (pending) clearAckTimer(pendingId);
        }
        return next;
      });
      setRemoteMessages((current) => new Map(current).set(message.id, message));
    },
    [clearAckTimer, consultationId, userId]
  );

  const handleReadReceipt = useCallback(
    (event: ReadServerEvent | ReadServerEventData | unknown) => {
      const data = unwrapRead(event);
      if (!data) return;
      const readerId = String(data.userId);
      if (readerId === String(userId)) return;

      const mark = (current: Map<string, Message>) =>
        new Map(
          [...current.entries()].map(([entryId, message]) => [
            entryId,
            String(message.senderId) === String(userId)
              ? { ...message, status: "read" as const, readAt: message.readAt ?? new Date().toISOString() }
              : message,
          ])
        );
      setRemoteMessages(mark);
      setOptimisticMessages(mark);
    },
    [userId]
  );

  const markRead = useCallback(
    (messageId?: string) => {
      sendClientEvent({ type: "read" });
      if (!messageId) return;
      const markOne = (current: Map<string, Message>) =>
        new Map(
          [...current.entries()].map(([entryId, message]) => [
            entryId,
            entryId === messageId
              ? { ...message, status: "read" as const, readAt: new Date().toISOString() }
              : message,
          ])
        );
      setRemoteMessages(markOne);
      setOptimisticMessages(markOne);
    },
    [sendClientEvent]
  );

  const loadMore = useCallback(() => {
    void query.fetchNextPage();
  }, [query.fetchNextPage]);

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query.refetch]);

  return {
    messages,
    isLoading: query.isPending,
    isLoadingMore: query.isFetchingNextPage,
    isError: query.isError,
    error: query.error,
    refetch,
    sendMessage,
    retryMessage,
    markRead,
    loadMore,
    handleServerMessage,
    handleReadReceipt,
    pendingCount: [...optimisticMessages.values()].filter(
      (message) => message.status === "sending"
    ).length,
    hasNextPage: query.hasNextPage,
  };
}
