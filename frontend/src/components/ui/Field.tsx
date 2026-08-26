import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import styles from "./Field.module.css";

interface FieldProps {
  children: ReactNode;
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
}

export default function Field({ children, error, hint, id, label }: FieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? descriptionId : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {control}
      {hint && !error && (
        <small className={styles.hint} id={descriptionId}>
          {hint}
        </small>
      )}
      {error && (
        <small className={styles.error} id={errorId} role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export function getFieldDescribedBy(id: string, hasError: boolean, hasHint: boolean) {
  if (hasError) return `${id}-error`;
  if (hasHint) return `${id}-description`;
  return undefined;
}
