import { jsx as _jsx } from "react/jsx-runtime";
import styles from "./Alert.module.css";
export default function Alert({ children, tone = "info" }) {
  return _jsx("div", {
    "aria-live": tone === "error" ? "assertive" : "polite",
    className: `${styles.alert} ${styles[tone]}`,
    role: tone === "error" ? "alert" : "status",
    children: children,
  });
}
