import { type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utils/clsx";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "primary";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children?: ReactNode;
}

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "badge",
        `badge--${variant}`,
        `badge--${size}`,
        { "badge--dot": dot },
        className
      )}
      {...rest}
    >
      {dot ? (
        <>
          <span className="badge__dot" />
          {children}
        </>
      ) : (
        children
      )}
    </span>
  );
}
