import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./EmptyState.module.css";
export default function EmptyState({ action, description, title }) {
  return _jsxs("div", {
    className: styles.emptyState,
    children: [
      _jsx("span", {
        "aria-hidden": "true",
        className: styles.icon,
        children: "\u2014",
      }),
      _jsx("strong", { children: title }),
      _jsx("span", { children: description }),
      action,
    ],
  });
}
