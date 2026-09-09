import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
} from "react";
import { clsx } from "../../utils/clsx";

export interface SearchBarProps extends ComponentPropsWithoutRef<"input"> {
  icon?: ReactNode;
  onClear?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, icon, onClear, value, ...rest }, ref) => {
    const hasValue = Boolean(value);
    return (
      <div className={clsx("search-bar", className)}>
        {icon && <span className="search-bar__icon">{icon}</span>}
        <input
          ref={ref}
          type="search"
          className={clsx("search-bar__input", {
            "search-bar__input--with-icon": Boolean(icon),
            "search-bar__input--has-value": hasValue,
          })}
          value={value}
          {...rest}
        />
        {hasValue && onClear && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={onClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
