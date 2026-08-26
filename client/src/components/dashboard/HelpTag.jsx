import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useState } from "react";
import styles from "./HelpTag.module.css";
export default function HelpTag({ title = "Ayuda", children }) {
  const [isOpen, setIsOpen] = useState(false);
  const popupId = useId();
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);
  return _jsxs("span", {
    className: `${styles.root} ${isOpen ? styles.open : ""}`,
    children: [
      _jsxs("button", {
        "aria-expanded": isOpen,
        "aria-controls": popupId,
        "aria-describedby": popupId,
        "aria-label": title,
        className: styles.trigger,
        onClick: (event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        },
        type: "button",
        children: [
          _jsx("span", { className: styles.desktopLabel, children: title }),
          _jsx("span", { className: styles.mobileLabel, children: "?" }),
        ],
      }),
      _jsx("span", {
        className: styles.popup,
        id: popupId,
        role: "tooltip",
        children: children,
      }),
    ],
  });
}
