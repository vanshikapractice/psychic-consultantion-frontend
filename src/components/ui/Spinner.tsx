import { type HTMLAttributes } from "react";
import { clsx } from "../../utils/clsx";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...rest }: SpinnerProps) {
  return (
    <div
      className={clsx("spinner", `spinner--${size}`, className)}
      aria-label="Loading"
      {...rest}
    />
  );
}
