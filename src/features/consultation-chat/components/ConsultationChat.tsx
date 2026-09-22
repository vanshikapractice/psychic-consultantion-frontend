import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AlertCircle, X } from "lucide-react";
import { useConsultationChat } from "../hooks/useConsultationChat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { ConnectionStatus } from "./ConnectionStatus";
import { SystemMessage } from "./SystemMessage";
import { UnreadBadge } from "./UnreadBadge";
import type { ChatUser, ConsultationStatus } from "../types";

export interface ConsultationChatProps {
  consultationId: string | number;
  user: ChatUser;
  onClose?: () => void;
  psychicName?: string;
  customerName?: string;
  consultationStatus?: ConsultationStatus;
  variant?: "customer" | "psychic";
}

export interface ConsultationChatHandle {
  focusInput: () => void;
  scrollToBottom: () => void;
}

export const ConsultationChat = forwardRef<ConsultationChatHandle, ConsultationChatProps>(
  (
    {
      consultationId,
      user,
      onClose,
      psychicName,
      customerName,
      consultationStatus,
      variant = "customer",
    },
    ref
  ) => {
    const chatTitle =
      variant === "psychic"
        ? customerName
          ? `Chat with ${customerName}`
          : "Customer chat"
        : psychicName
          ? `Chat with ${psychicName}`
          : "Consultation chat";
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [didMarkRead, setDidMarkRead] = useState(false);

    const chat = useConsultationChat({
      consultationId,
      user,
    });

    const handleReconnect = useCallback(() => chat.reconnect(), [chat.reconnect]);
    const handleLoadMore = useCallback(() => chat.loadMore(), [chat.loadMore]);
    const handleRetryMessage = useCallback(
      (messageId: string) => chat.retryMessage(messageId),
      [chat.retryMessage]
    );
    const handleSend = useCallback(
      (content: string) => {
        chat.sendMessage(content);
        chat.broadcastTyping(false);
      },
      [chat.broadcastTyping, chat.sendMessage]
    );
    const handleTyping = useCallback(
      (isTyping: boolean) => chat.broadcastTyping(isTyping),
      [chat.broadcastTyping]
    );
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") onClose?.();
      },
      [onClose]
    );
    const handleRefetch = useCallback(() => chat.refetch(), [chat.refetch]);

    useImperativeHandle(
      ref,
      () => ({
        focusInput: () => inputRef.current?.focus(),
        scrollToBottom: () => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }),
      }),
      []
    );

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    useEffect(() => {
      setDidMarkRead(false);
    }, [consultationId, user.id]);

    useEffect(() => {
      if (chat.connectionStatus === "connected") inputRef.current?.focus();
    }, [chat.connectionStatus]);

    useEffect(() => {
      if (
        chat.connectionStatus === "connected" &&
        !chat.isLoading &&
        !didMarkRead
      ) {
        setDidMarkRead(true);
        chat.markRead();
      }
    }, [chat.connectionStatus, chat.isLoading, chat.markRead, didMarkRead]);

    const ended =
      chat.consultationEnded ||
      consultationStatus === "completed" ||
      consultationStatus === "canceled";
    const disconnected =
      chat.connectionStatus === "disconnected" || chat.connectionStatus === "error";
    const inputDisabled = ended || disconnected;

    return (
      <div
        ref={rootRef}
        className={`flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900 ${
          variant === "psychic"
            ? "border-indigo-200 dark:border-indigo-800"
            : "border-violet-200 dark:border-violet-800"
        }`}
        data-testid="consultation-chat"
        role="main"
        aria-label="Consultation chat"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-neutral-900 dark:text-white">
              {chatTitle}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <ConnectionStatus
                status={chat.connectionStatus}
                onRetry={handleReconnect}
              />
              <UnreadBadge count={chat.unreadCount} />
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800"
              onClick={onClose}
              aria-label="Close chat"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </header>

        <section className="flex min-h-0 flex-1 flex-col gap-2 px-3 py-3" aria-label="Messages">
          <MessageList
            messages={chat.messages}
            isLoadingMore={chat.isLoadingMore}
            loadMore={handleLoadMore}
            scrollRef={listRef}
            onRetryMessage={handleRetryMessage}
            hasNextPage={chat.hasNextPage}
            currentUserId={user.id}
          />

          {chat.isLoading && chat.messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500" role="status">
              Loading messages…
            </div>
          )}

          {chat.isError && (
            <div className="flex items-center justify-between rounded-lg bg-error/10 p-3 text-sm text-error" role="alert">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {chat.error?.message ?? "Failed to load messages"}
              </span>
              <button
                type="button"
                className="rounded-md border border-error/40 px-2 py-1 text-xs font-semibold hover:bg-error/10"
                onClick={handleRefetch}
              >
                Retry
              </button>
            </div>
          )}

          <TypingIndicator users={chat.typingUsers} />
        </section>

        {ended ? (
          <div className="border-t border-neutral-200 px-3 py-3 dark:border-neutral-700" role="status" aria-live="polite">
            <SystemMessage
              type="consultation_ended"
              text="This consultation has ended."
            />
          </div>
        ) : (
          <div className="border-t border-neutral-200 px-3 py-3 dark:border-neutral-700">
            <MessageInput
              ref={inputRef}
              onSend={handleSend}
              onTyping={handleTyping}
              disabled={inputDisabled}
              placeholder={ended ? "Consultation has ended" : "Type a message…"}
            />
          </div>
        )}
      </div>
    );
  }
);

ConsultationChat.displayName = "ConsultationChat";

export default ConsultationChat;
