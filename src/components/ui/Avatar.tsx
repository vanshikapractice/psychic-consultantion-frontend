import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { clsx } from "../../utils/clsx";

export interface AvatarProps extends ComponentPropsWithoutRef<"img"> {
  src?: string;
  alt: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: ReactNode;
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, alt, name, size = "md", fallback, className, ...rest }, ref) => {
    const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
      xs: "avatar--xs",
      sm: "avatar--sm",
      md: "avatar--md",
      lg: "avatar--lg",
      xl: "avatar--xl",
    };

    const fallbackContent = fallback ?? name?.[0] ?? "?";

    const imgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      img.style.display = "none";
      const parent = img.parentElement;
      if (parent) {
        const fb = parent.querySelector(".avatar__fallback");
        if (fb) (fb as HTMLElement).style.display = "flex";
      }
    };

    return (
      <div
        className={clsx("avatar", sizeMap[size], className)}
        role="img"
        aria-label={name ?? alt}
      >
        {src ? (
          <img
            ref={ref}
            src={src}
            alt={alt}
            onError={imgError}
            style={{ display: "block" }}
            {...rest}
          />
        ) : null}
        <span
          className="avatar__fallback"
          style={{ display: src ? "none" : "flex" }}
        >
          {fallbackContent}
        </span>
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
