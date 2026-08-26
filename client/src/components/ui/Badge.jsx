import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./Badge.module.css";
export default function Badge({ children, tone = "neutral" }) {
  return _jsx("span", {
    className: `${styles.badge} ${styles[tone]}`,
    children: children,
  });
}
