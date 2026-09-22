import { memo } from "react";
import type { TypingUser } from "../types";

export interface TypingIndicatorProps {
  users: TypingUser[];
}

function formatTypingUsers(users: TypingUser[]): string {
  if (users.length === 0) return "";
  if (users.length === 1) return `${users[0].name} is typing…`;
  if (users.length === 2) return `${users[0].name} and ${users[1].name} are typing…`;
  return "Several people are typing…";
}

export const TypingIndicator = memo(function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div
      className="flex min-h-6 items-center gap-1 px-1 text-sm italic text-neutral-500 dark:text-neutral-400"
      aria-live="polite"
      data-testid="typing-indicator"
    >
      <span>{formatTypingUsers(users)}</span>
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        <span className="h-1 w-1 rounded-full bg-current animate-pulse motion-reduce:animate-none"></span>
        <span className="h-1 w-1 rounded-full bg-current animate-pulse motion-reduce:animate-none"></span>
        <span className="h-1 w-1 rounded-full bg-current animate-pulse motion-reduce:animate-none"></span>
      </span>
    </div>
  );
});
