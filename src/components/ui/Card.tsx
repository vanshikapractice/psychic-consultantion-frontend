import { type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "../../utils/clsx";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  title,
  subtitle,
  headerAction,
  footer,
  hover = false,
  padding = "md",
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "card",
        { "card--hover": hover, [`card--p-${padding}`]: true },
        className
      )}
      {...rest}
    >
      {(title || subtitle || headerAction) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
          {headerAction && <div className="card__header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
}
