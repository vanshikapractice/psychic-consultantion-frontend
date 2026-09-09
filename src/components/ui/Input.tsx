import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { clsx } from "../../utils/clsx";

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className, id, ...rest }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 8)}`;
    const hasError = Boolean(error);

    return (
      <div className={clsx("field", { "field--error": hasError }, className)}>
        {label && (
          <label htmlFor={inputId} className="field__label">
            {label}
          </label>
        )}
        <div className="field__control">
          {icon && <span className="field__icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={clsx("field__input", {
              "field__input--with-icon": Boolean(icon),
              "field__input--error": hasError,
            })}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...rest}
          />
        </div>
        {hasError && (
          <span id={`${inputId}-error`} className="field__error" role="alert">
            {error}
          </span>
        )}
        {!hasError && helperText && (
          <span className="field__helper">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
