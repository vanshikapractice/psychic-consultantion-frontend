import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys, fetchUnreadCount } from "../services/chatApi";
import type { ReadServerEventData, ReadServerEvent } from "../types";

export interface UseUnreadCountParams {
  consultationId: string | number;
  currentUserId: string | number;
}

export interface UseUnreadCountReturn {
  count: number;
  reset: () => void;
  refetch: () => void;
  handleRead: (event: ReadServerEvent | ReadServerEventData | unknown) => void;
}

function unwrapRead(event: ReadServerEvent | ReadServerEventData | unknown): ReadServerEventData | null {
  if (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    event.type === "read" &&
    "data" in event
  ) {
    return (event as { data: ReadServerEventData }).data;
  }
  if (typeof event === "object" && event !== null && "userId" in event) {
    return event as ReadServerEventData;
  }
  return null;
}

export function useUnreadCount({
  consultationId,
  currentUserId,
}: UseUnreadCountParams): UseUnreadCountReturn {
  const queryClient = useQueryClient();
  const queryKey = chatQueryKeys.unread(consultationId);
  const { data, refetch: queryRefetch } = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchUnreadCount(consultationId, signal),
    enabled: Boolean(consultationId && currentUserId),
  });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (data !== undefined) setCount(data);
  }, [data]);

  const reset = useCallback(() => {
    setCount(0);
    queryClient.setQueryData(queryKey, 0);
  }, [queryClient, queryKey]);

  const refetch = useCallback(() => {
    void queryRefetch();
  }, [queryRefetch]);

  const handleRead = useCallback(
    (event: ReadServerEvent | ReadServerEventData | unknown) => {
      const data = unwrapRead(event);
      if (!data) return;
      if (String(data.userId) === String(currentUserId)) {
        reset();
        return;
      }
      setCount((current) => Math.max(0, current - 1));
    },
    [currentUserId, reset]
  );

  return {
    count,
    reset,
    refetch,
    handleRead,
  };
}
