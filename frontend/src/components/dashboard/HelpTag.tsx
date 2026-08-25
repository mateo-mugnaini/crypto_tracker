import { useState, type ReactNode } from "react";

import styles from "./HelpTag.module.css";

interface HelpTagProps {
  title?: string;
  children: ReactNode;
}

export default function HelpTag({ title = "Ayuda", children }: HelpTagProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className={`${styles.root} ${isOpen ? styles.open : ""}`}>
      <button
        aria-expanded={isOpen}
        aria-label={title}
        className={styles.trigger}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span className={styles.desktopLabel}>{title}</span>
        <span className={styles.mobileLabel}>?</span>
      </button>
      <span className={styles.popup} role="tooltip">
        {children}
      </span>
    </span>
  );
}
