import { forwardRef, useState } from "react";
import { clsx } from "../../../utils/clsx";
import {
  AlertCircle,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
} from "lucide-react";
import { formatDateTime } from "../../../utils/dateFormat";
import type { Message, MessageStatus } from "../types";

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  status?: MessageStatus;
  onRetry?: (messageId: string) => void;
}

const COLLAPSE_LENGTH = 240;

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, isOwn, showAvatar = true, status, onRetry }, ref) => {
    const [expanded, setExpanded] = useState(false);
    const collapsed = !expanded && message.content.length > COLLAPSE_LENGTH;
    const messageStatus = status ?? message.status;

    const handleRetry = () => {
      if (messageStatus === "failed") onRetry?.(message.id);
    };

    const statusIcon = () => {
      switch (messageStatus) {
        case "sending":
          return <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />;
        case "sent":
          return <Check className="h-4 w-4" aria-hidden="true" />;
        case "delivered":
          return <CheckCheck className="h-4 w-4" aria-hidden="true" />;
        case "read":
          return <CheckCheck className="h-4 w-4 text-sky-100" aria-hidden="true" />;
        case "failed":
          return (
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
              onClick={handleRetry}
              aria-label="Retry sending message"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        default:
          return <Clock className="h-4 w-4" aria-hidden="true" />;
      }
    };

    return (
      <article
        ref={ref}
        className={clsx(
          "flex max-w-full gap-2 rounded-lg px-3 py-2 transition-colors duration-150 sm:max-w-chat",
          isOwn ? "ml-auto bg-primary-500 text-white" : "mr-auto bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white",
          message.type === "system" && "opacity-80"
        )}
        aria-label={`Message from ${message.senderName}`}
        data-testid="message-bubble"
      >
        {!isOwn && showAvatar && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-100"
            aria-hidden="true"
          >
            {message.senderName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-end gap-2 text-[11px] opacity-80">
            {!isOwn && <span className="truncate font-medium">{message.senderName}</span>}
            <time
              dateTime={message.createdAt}
              title={formatDateTime(message.createdAt)}
              className="shrink-0"
            >
              {new Date(message.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          <p
            className={clsx(
              "whitespace-pre-wrap break-words",
              collapsed && "line-clamp-4"
            )}
          >
            {message.content}
          </p>

          {collapsed && (
            <button
              type="button"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              aria-label={expanded ? "Show less" : "Show more"}
            >
              {expanded ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
              {expanded ? "Show less" : "Show more"}
            </button>
          )}

          {isOwn && (
            <div className="mt-1 flex items-center justify-end gap-1" aria-live="polite">
              {statusIcon()}
              <span className="sr-only">{messageStatus}</span>
            </div>
          )}
        </div>
      </article>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
