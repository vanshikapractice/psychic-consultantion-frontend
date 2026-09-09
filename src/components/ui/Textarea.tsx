import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";
import { clsx } from "../../utils/clsx";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...rest }, ref) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2, 8)}`;
    const hasError = Boolean(error);

    return (
      <div className={clsx("field", { "field--error": hasError }, className)}>
        {label && (
          <label htmlFor={textareaId} className="field__label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx("field__textarea", { "field__textarea--error": hasError })}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : undefined}
          {...rest}
        />
        {hasError && (
          <span id={`${textareaId}-error`} className="field__error" role="alert">
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

Textarea.displayName = "Textarea";
