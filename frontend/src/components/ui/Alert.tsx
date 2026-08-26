import type { ReactNode } from "react";

import styles from "./Alert.module.css";

type AlertTone = "info" | "success" | "error";

interface AlertProps {
  children: ReactNode;
  tone?: AlertTone;
}

export default function Alert({ children, tone = "info" }: AlertProps) {
  return (
    <div
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`${styles.alert} ${styles[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
