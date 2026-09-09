import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { clsx } from "../../utils/clsx";

export interface ModalProps
  extends Omit<HTMLAttributes<HTMLDialogElement>, "title"> {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  ...rest
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <dialog
        ref={dialogRef}
        className={clsx("modal", `modal--${size}`, className)}
        onClick={(e: MouseEvent<HTMLDialogElement>) => e.stopPropagation()}
        {...rest}
      >
        <div className="modal__content">
          {title && (
            <div className="modal__header">
              <h2 className="modal__title">{title}</h2>
              {description && (
                <p className="modal__description">{description}</p>
              )}
            </div>
          )}
          <div className="modal__body">{children}</div>
        </div>
        <button
          type="button"
          className="modal__close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </dialog>
    </div>
  );
}
