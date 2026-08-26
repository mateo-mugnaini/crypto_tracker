import type { ReactNode } from "react";

import styles from "./Badge.module.css";

type BadgeTone = "neutral" | "success" | "danger";

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
