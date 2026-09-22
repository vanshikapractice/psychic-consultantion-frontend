import {
  FixedSizeList,
  type FixedSizeList as FixedSizeListType,
  type ListOnScrollProps,
} from "react-window";
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

const ITEM_HEIGHT = 92;
const LIST_HEIGHT = 480;

function dateKey(message: Message): string {
  return new Date(message.createdAt).toDateString();
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
  const listRef = useRef<FixedSizeListType<MessageRow[]>>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const previousLengthRef = useRef(rows.length);
  const previousFirstKeyRef = useRef<string | null>(null);
  const lastScrollCheckRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const previousFirst = previousFirstKeyRef.current;
    const nextFirst = rows[0]?.key ?? null;
    if (previousFirst && nextFirst && previousFirst !== nextFirst && rows.length > 0) {
      const index = rows.findIndex((row) => row.key === nextFirst);
      const frame = typeof requestAnimationFrame === "undefined" ? (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 0) : requestAnimationFrame;
      frame(() => listRef.current?.scrollToItem(index, "start"));
    }
    previousFirstKeyRef.current = nextFirst;
  }, [rows]);

  useEffect(() => {
    if (rows.length > previousLengthRef.current && atBottomRef.current && rows.length > 0) {
      listRef.current?.scrollToItem(rows.length - 1, "end");
    }
    previousLengthRef.current = rows.length;
  }, [rows.length]);

  const handleScroll = useCallback(
    ({ scrollOffset: nextScrollTop }: ListOnScrollProps) => {
      const now = Date.now();
      if (now - lastScrollCheckRef.current < 100) return;
      lastScrollCheckRef.current = now;
      setScrollTop(nextScrollTop);
      const element = outerRef.current;
      if (element) {
        atBottomRef.current =
          element.scrollHeight - nextScrollTop - element.clientHeight < 100;
      }
      if (nextScrollTop <= 2 && hasNextPage && !isLoadingMore) loadMore();
    },
    [hasNextPage, isLoadingMore, loadMore]
  );

  const handleItemsRendered = useCallback(
    ({ visibleStartIndex }: { visibleStartIndex: number }) => {
      if (visibleStartIndex <= 1 && hasNextPage && !isLoadingMore) loadMore();
    },
    [hasNextPage, isLoadingMore, loadMore]
  );

  const renderRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const row = rows[index];
      if (!row) return null;
      if (row.kind === "date-separator" && row.date) {
        return (
          <div
            style={style}
            className="flex h-9 items-center justify-center border-b border-neutral-200 dark:border-neutral-700"
            role="separator"
            aria-label={formatDate(`${row.date}T00:00:00`)}
          >
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {formatDate(`${row.date}T00:00:00`)}
            </span>
          </div>
        );
      }
      if (row.kind === "message" && row.message) {
        const isOwn =
          row.message.isOwn ??
          (currentUserId !== undefined && String(row.message.senderId) === String(currentUserId));
        return (
          <div style={style} className="flex h-full items-center px-2 py-1">
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
      ref={scrollRef}
      className={clsx(
        "relative min-h-0 overflow-hidden rounded-lg",
        isLoadingMore && "pointer-events-none opacity-80"
      )}
      data-testid="message-list"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Consultation messages"
    >
      <FixedSizeList<MessageRow[]>
        ref={listRef}
        outerRef={outerRef}
        height={LIST_HEIGHT}
        width="100%"
        itemCount={rows.length}
        itemSize={ITEM_HEIGHT}
        itemData={rows}
        itemKey={(index, data) => data[index]?.key ?? String(index)}
        onScroll={handleScroll}
        onItemsRendered={handleItemsRendered}
        overscanCount={5}
        style={{ height: "100%", width: "100%" }}
      >
        {renderRow}
      </FixedSizeList>

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
