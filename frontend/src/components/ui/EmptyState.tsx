import type { ReactNode } from "react";

import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <span aria-hidden="true" className={styles.icon}>
        —
      </span>
      <strong>{title}</strong>
      <span>{description}</span>
      {action}
    </div>
  );
}
