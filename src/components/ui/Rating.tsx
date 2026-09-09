import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent,
} from "react";
import { clsx } from "../../utils/clsx";

export interface RatingProps extends ComponentPropsWithoutRef<"div"> {
  value: number;
  max?: number;
  precision?: number;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (value: number) => void;
  showValue?: boolean;
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      max = 5,
      precision = 1,
      readOnly = false,
      size = "md",
      onRate,
      showValue = false,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const rounded = Math.round(value / precision) * precision;

    const handleMouse = (e: MouseEvent<HTMLButtonElement>, index: number) => {
      if (readOnly || !onRate) return;
      e.preventDefault();
      onRate(index);
    };

    return (
      <div
        ref={ref}
        className={clsx("rating", `rating--${size}`, {
          "rating--readonly": readOnly,
        }, className)}
        role="radiogroup"
        aria-label="Rating"
        onClick={onClick}
        {...rest}
      >
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = starValue <= rounded;
          return (
            <button
              key={starValue}
              type="button"
              className={clsx("rating__star", {
                "rating__star--filled": filled,
              })}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              disabled={readOnly}
              onClick={(e: MouseEvent<HTMLButtonElement>) =>
                handleMouse(e, starValue)
              }
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
        {showValue && (
          <span className="rating__value">{value.toFixed(1)}</span>
        )}
      </div>
    );
  }
);

Rating.displayName = "Rating";
