import { useEffect, useId, useState, type ReactNode } from "react";

import styles from "./HelpTag.module.css";

interface HelpTagProps {
  title?: string;
  children: ReactNode;
}

export default function HelpTag({ title = "Ayuda", children }: HelpTagProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <span className={`${styles.root} ${isOpen ? styles.open : ""}`}>
      <button
        aria-expanded={isOpen}
        aria-controls={popupId}
        aria-describedby={popupId}
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
      <span className={styles.popup} id={popupId} role="tooltip">
        {children}
      </span>
    </span>
  );
}
