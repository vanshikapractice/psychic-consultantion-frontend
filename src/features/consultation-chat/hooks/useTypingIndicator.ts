import { useCallback, useEffect, useRef, useState } from "react";
import type { TypingServerEventData, TypingUser } from "../types";

export interface UseTypingIndicatorParams {
  sendTyping: (isTyping: boolean) => boolean;
}

export interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  handleTypingEvent: (data: TypingServerEventData) => void;
  broadcastTyping: (isTyping: boolean) => void;
  clearTyping: () => void;
}

const TYPING_EXPIRY_MS = 3_000;
const BROADCAST_DEBOUNCE_MS = 300;

export function useTypingIndicator({
  sendTyping,
}: UseTypingIndicatorParams): UseTypingIndicatorReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const usersRef = useRef<Map<string | number, TypingUser>>(new Map());
  const timeoutsRef = useRef<Map<string | number, number>>(new Map());
  const broadcastTimerRef = useRef<number | null>(null);
  const sendTypingRef = useRef(sendTyping);
  sendTypingRef.current = sendTyping;

  useEffect(
    () => () => {
      timeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
      timeoutsRef.current.clear();
      if (broadcastTimerRef.current !== null) {
        window.clearTimeout(broadcastTimerRef.current);
        broadcastTimerRef.current = null;
      }
    },
    []
  );

  const removeUser = useCallback((userId: string | number) => {
    usersRef.current.delete(userId);
    const timer = timeoutsRef.current.get(userId);
    if (timer !== undefined) window.clearTimeout(timer);
    timeoutsRef.current.delete(userId);
    setTypingUsers([...usersRef.current.values()]);
  }, []);

  const handleTypingEvent = useCallback(
    (data: TypingServerEventData) => {
      const userId = data.userId;
      if (!data.isTyping) {
        removeUser(userId);
        return;
      }

      const user: TypingUser = {
        userId,
        name: data.userName,
        participantType: data.participantType,
      };
      usersRef.current.set(userId, user);
      const existingTimer = timeoutsRef.current.get(userId);
      if (existingTimer !== undefined) window.clearTimeout(existingTimer);
      const timer = window.setTimeout(() => removeUser(userId), TYPING_EXPIRY_MS);
      timeoutsRef.current.set(userId, timer);
      setTypingUsers([...usersRef.current.values()]);
    },
    [removeUser]
  );

  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      if (broadcastTimerRef.current !== null) {
        window.clearTimeout(broadcastTimerRef.current);
        broadcastTimerRef.current = null;
      }
      if (!isTyping) {
        sendTypingRef.current(false);
        return;
      }
      broadcastTimerRef.current = window.setTimeout(() => {
        broadcastTimerRef.current = null;
        sendTypingRef.current(true);
      }, BROADCAST_DEBOUNCE_MS);
    },
    []
  );

  const clearTyping = useCallback(() => {
    timeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
    timeoutsRef.current.clear();
    usersRef.current.clear();
    setTypingUsers([]);
    if (broadcastTimerRef.current !== null) {
      window.clearTimeout(broadcastTimerRef.current);
      broadcastTimerRef.current = null;
    }
    sendTypingRef.current(false);
  }, []);

  return {
    typingUsers,
    handleTypingEvent,
    broadcastTyping,
    clearTyping,
  };
}
