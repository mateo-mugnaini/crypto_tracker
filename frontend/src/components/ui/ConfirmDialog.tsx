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

  useEffect(() => {
    if (!open) return;

    cancelButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isConfirming) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isConfirming, onCancel, open]);

  if (!open) return null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isConfirming) onCancel();
      }}
      role="dialog"
    >
      <div
        aria-describedby={descriptionId}
        className={styles.dialog}
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
