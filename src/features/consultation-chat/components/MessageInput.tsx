import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { clsx } from "../../../utils/clsx";
import { Send, X } from "lucide-react";

export interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  charLimit?: number;
}

const MAX_LINES = 5;
const LINE_HEIGHT = 24;
const TYPING_IDLE_MS = 1_500;

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  (
    {
      onSend,
      onTyping,
      disabled = false,
      placeholder = "Type a message…",
      charLimit = 2_000,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");
    const [height, setHeight] = useState(LINE_HEIGHT);
    const [composing, setComposing] = useState(false);
    const typingTimerRef = useRef<number | null>(null);
    const charCount = value.length;
    const isOverLimit = charCount > charLimit;
    const canSend = value.trim().length > 0 && !disabled && !isOverLimit;

    const clearTypingTimer = useCallback(() => {
      if (typingTimerRef.current !== null) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, []);

    const stopTyping = useCallback(() => {
      clearTypingTimer();
      onTyping(false);
    }, [clearTypingTimer, onTyping]);

    const scheduleTypingStop = useCallback(() => {
      clearTypingTimer();
      typingTimerRef.current = window.setTimeout(() => {
        typingTimerRef.current = null;
        onTyping(false);
      }, TYPING_IDLE_MS);
    }, [clearTypingTimer, onTyping]);

    useEffect(() => () => clearTypingTimer(), [clearTypingTimer]);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

    useLayoutEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = `${LINE_HEIGHT}px`;
      setHeight(Math.min(textarea.scrollHeight, LINE_HEIGHT * MAX_LINES));
    }, [value]);

    const sendValue = useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed || disabled || isOverLimit) return;
      onSend(trimmed);
      setValue("");
      stopTyping();
      textareaRef.current?.focus();
    }, [disabled, isOverLimit, onSend, stopTyping, value]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (composing) return;
        const nextValue = event.currentTarget.value;
        setValue(nextValue);
        if (nextValue.length > 0) {
          onTyping(true);
          scheduleTypingStop();
        } else {
          stopTyping();
        }
      },
      [composing, onTyping, scheduleTypingStop, stopTyping]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          sendValue();
        }
      },
      [sendValue]
    );

    const handleClear = useCallback(() => {
      setValue("");
      stopTyping();
      textareaRef.current?.focus();
    }, [stopTyping]);

    return (
      <div
        className={clsx(
          "rounded-lg border bg-white p-3 transition-colors duration-150 dark:bg-neutral-800",
          disabled ? "cursor-not-allowed border-neutral-300 dark:border-neutral-700" : "border-neutral-300 focus-within:border-primary-500 dark:border-neutral-700",
          isOverLimit && "border-error"
        )}
        data-testid="message-input"
      >
        <textarea
          ref={textareaRef}
          className="min-h-6 w-full resize-none bg-transparent outline-none placeholder:text-neutral-400"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={(event) => {
            setComposing(false);
            const nextValue = event.currentTarget.value;
            setValue(nextValue);
            if (nextValue.length > 0) {
              onTyping(true);
              scheduleTypingStop();
            } else {
              stopTyping();
            }
          }}
          onBlur={scheduleTypingStop}
          placeholder={disabled ? "Connecting…" : placeholder}
          disabled={disabled}
          rows={1}
          maxLength={charLimit}
          aria-label="Message input"
          aria-describedby="message-char-count"
          title={disabled ? "Connecting…" : undefined}
          style={{
            height: `${height}px`,
            maxHeight: `${LINE_HEIGHT * MAX_LINES}px`,
            overflowY: height >= LINE_HEIGHT * MAX_LINES ? "auto" : "hidden",
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span id="message-char-count" className="text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">
            {charCount}/{charLimit}
          </span>
          <div className="flex items-center gap-2">
            {value && !disabled && (
              <button
                type="button"
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-700"
                onClick={handleClear}
                aria-label="Clear message"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white transition-colors duration-150 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={sendValue}
              disabled={!canSend}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";
