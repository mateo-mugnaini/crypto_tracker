import { useEffect, useId, useRef } from "react";

import Button from "./Button";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm(): void;
  onCancel(): void;
}

export default function ConfirmDialog({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  description,
  isConfirming = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCancelRef = useRef(onCancel);
  const isConfirmingRef = useRef(isConfirming);

  onCancelRef.current = onCancel;
  isConfirmingRef.current = isConfirming;

  useEffect(() => {
    if (!open) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isConfirmingRef.current) {
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isConfirming) onCancel();
      }}
      role="dialog"
    >
      <div
        className={styles.dialog}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <span aria-hidden="true" className={styles.icon}>
          !
        </span>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className={styles.actions}>
          <Button
            ref={cancelButtonRef}
            disabled={isConfirming}
            onClick={onCancel}
            variant="ghost"
          >
            {cancelLabel}
          </Button>
          <Button loading={isConfirming} onClick={onConfirm} variant="danger">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
