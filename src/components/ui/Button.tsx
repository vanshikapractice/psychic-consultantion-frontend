import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utils/clsx";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "icon"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  className,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const sizeMap: Record<ButtonSize, string> = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  const classes = clsx(
    "btn",
    `btn--${variant}`,
    sizeMap[size],
    {
      "is-loading": loading,
      "is-icon": variant === "icon",
    },
    className
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <span className="btn__spinner" /> : null}
      <span className={clsx("btn__content", { "btn__content--icon": variant === "icon" })}>
        {children}
      </span>
    </button>
  );
}
