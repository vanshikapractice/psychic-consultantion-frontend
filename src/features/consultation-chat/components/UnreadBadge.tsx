import { clsx } from "../../../utils/clsx";

export interface UnreadBadgeProps {
  count: number;
  max?: number;
}

export function UnreadBadge({ count, max = 9 }: UnreadBadgeProps) {
  if (count <= 0) return null;
  const displayed = max > 0 && count > max ? `${max}+` : String(count);

  return (
    <span
      key={count}
      className={clsx(
        "inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-error px-1.5 text-xs font-semibold text-white animate-pulse",
        count > max && "min-w-7"
      )}
      aria-label={`${count} unread messages`}
      data-testid="unread-badge"
    >
      {displayed}
    </span>
  );
}
