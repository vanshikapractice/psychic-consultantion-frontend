import { type HTMLAttributes } from "react";
import { clsx } from "../../utils/clsx";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  label,
  showValue = false,
  className,
  ...rest
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={clsx("progress", className)} {...rest}>
      {(label || showValue) && (
        <div className="progress__meta">
          {label && <span className="progress__label">{label}</span>}
          {showValue && (
            <span className="progress__value">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        className={clsx("progress__track", `progress--${variant}`, `progress--${size}`)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={clsx("progress__fill", `progress__fill--${variant}`)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
