import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";
import { clsx } from "../../utils/clsx";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, helperText, className, id, ...rest }, ref) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 8)}`;
    const hasError = Boolean(error);

    return (
      <div className={clsx("field", { "field--error": hasError }, className)}>
        {label && (
          <label htmlFor={selectId} className="field__label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx("field__select", { "field__select--error": hasError })}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {hasError && (
          <span id={`${selectId}-error`} className="field__error" role="alert">
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

Select.displayName = "Select";
