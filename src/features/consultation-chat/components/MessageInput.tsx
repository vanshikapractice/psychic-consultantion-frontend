import {
  forwardRef,
  useCallback,
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
    const charCount = value.length;
    const isOverLimit = charCount > charLimit;
    const canSend = value.trim().length > 0 && !disabled && !isOverLimit;

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
      onTyping(false);
      textareaRef.current?.focus();
    }, [disabled, isOverLimit, onSend, onTyping, value]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (composing) return;
        setValue(event.currentTarget.value);
        onTyping(event.currentTarget.value.length > 0);
      },
      [composing, onTyping]
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
      onTyping(false);
      textareaRef.current?.focus();
    }, [onTyping]);

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
            setValue(event.currentTarget.value);
            onTyping(event.currentTarget.value.length > 0);
          }}
          onBlur={() => onTyping(false)}
          placeholder={disabled ? "Connecting…" : placeholder}
          disabled={disabled}
          rows={1}
          maxLength={charLimit}
          aria-label="Message input"
          aria-describedby="message-char-count"
          title={disabled ? "Connecting…" : undefined}
          style={{ height: `${height}px` }}
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
