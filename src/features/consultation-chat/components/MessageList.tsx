import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { clsx } from "../../../utils/clsx";
import { ChevronUp, Loader2 } from "lucide-react";
import { formatDate } from "../../../utils/dateFormat";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { SystemMessage } from "./SystemMessage";

export interface MessageListProps {
  messages: Message[];
  isLoadingMore: boolean;
  loadMore: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onRetryMessage?: (messageId: string) => void;
  hasNextPage?: boolean;
  currentUserId?: string | number;
}

interface MessageRow {
  key: string;
  kind: "date-separator" | "message";
  date?: string;
  message?: Message;
}

function dateKey(message: Message): string {
  const date = new Date(message.createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
    .join("-");
}

function buildRows(messages: Message[]): MessageRow[] {
  const rows: MessageRow[] = [];
  let lastDate = "";
  for (const message of messages) {
    const key = dateKey(message);
    if (key !== lastDate) {
      rows.push({ key: `date-${key}`, kind: "date-separator", date: key });
      lastDate = key;
    }
    rows.push({ key: `message-${message.id}`, kind: "message", message });
  }
  return rows;
}

export function MessageList({
  messages,
  isLoadingMore,
  loadMore,
  scrollRef,
  onRetryMessage,
  hasNextPage = false,
  currentUserId,
}: MessageListProps) {
  const rows = useMemo(() => buildRows(messages), [messages]);
  const outerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const lastScrollCheckRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const setScrollElement = useCallback(
    (element: HTMLDivElement | null) => {
      outerRef.current = element;
      scrollRef.current = element;
    },
    [scrollRef]
  );

  useEffect(() => {
    const element = outerRef.current;
    if (element && atBottomRef.current) element.scrollTop = element.scrollHeight;
  }, [rows.length]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const nextScrollTop = element.scrollTop;
      const now = Date.now();
      if (now - lastScrollCheckRef.current < 100) return;
      lastScrollCheckRef.current = now;
      setScrollTop(nextScrollTop);
      atBottomRef.current = element.scrollHeight - nextScrollTop - element.clientHeight < 100;
      if (nextScrollTop <= 2 && hasNextPage && !isLoadingMore) loadMore();
    },
    [hasNextPage, isLoadingMore, loadMore]
  );

  const renderRow = useCallback(
    (row: MessageRow) => {
      if (!row) return null;
      if (row.kind === "date-separator" && row.date) {
        return (
          <div
            key={row.key}
            className="flex h-9 shrink-0 items-center justify-center border-b border-neutral-200 dark:border-neutral-700"
            role="separator"
            aria-label={formatDate(row.date)}
          >
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {formatDate(row.date)}
            </span>
          </div>
        );
      }
      if (row.kind === "message" && row.message) {
        const isOwn =
          row.message.isOwn ??
          (currentUserId !== undefined && String(row.message.senderId) === String(currentUserId));
        return (
          <div key={row.key} className="flex min-w-0 px-2 py-1">
            {row.message.type === "system" ? (
              <SystemMessage type="consultation_started" text={row.message.content} />
            ) : (
              <MessageBubble
                message={row.message}
                isOwn={isOwn}
                onRetry={onRetryMessage}
              />
            )}
          </div>
        );
      }
      return null;
    },
    [currentUserId, onRetryMessage, rows]
  );

  return (
    <div
      ref={setScrollElement}
      className={clsx(
        "relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-lg",
        isLoadingMore && "pointer-events-none opacity-80"
      )}
      data-testid="message-list"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Consultation messages"
      onScroll={handleScroll}
    >
      <div className="flex min-h-full flex-col justify-end">
        {rows.map(renderRow)}
      </div>

      {rows.length === 0 && !isLoadingMore && (
        <div className="flex h-full items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
          No messages yet. Start the conversation.
        </div>
      )}

      {isLoadingMore && hasNextPage && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-3 py-2 shadow dark:bg-neutral-800" role="status" aria-live="polite">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Loading older messages…</span>
        </div>
      )}

      {!isLoadingMore && hasNextPage && scrollTop <= 2 && rows.length > 0 && (
        <button
          type="button"
          className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-primary-600"
          onClick={loadMore}
          aria-label="Load older messages"
        >
          <ChevronUp className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Load older messages
        </button>
      )}
    </div>
  );
}
