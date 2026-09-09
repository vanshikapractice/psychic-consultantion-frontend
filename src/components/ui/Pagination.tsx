import { type HTMLAttributes } from "react";
import { clsx } from "../../utils/clsx";

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className,
  ...rest
}: PaginationProps) {
  const safePage = Math.min(page, totalPages);
  const siblings = Math.floor(maxVisible / 2);
  let start = Math.max(1, safePage - siblings);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const goTo = (target: number) => {
    if (target >= 1 && target <= totalPages && target !== safePage) {
      onPageChange(target);
    }
  };

  return (
    <nav
      className={clsx("pagination", className)}
      aria-label="Pagination"
      {...rest}
    >
      <button
        type="button"
        className="pagination__btn"
        onClick={() => goTo(safePage - 1)}
        disabled={safePage <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="pagination__ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={clsx("pagination__btn", {
              "pagination__btn--active": p === safePage,
            })}
            onClick={() => goTo(p)}
            aria-current={p === safePage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => goTo(safePage + 1)}
        disabled={safePage >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
