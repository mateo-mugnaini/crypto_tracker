import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement } from "react";
import styles from "./Field.module.css";
export default function Field({ children, error, hint, id, label }) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? descriptionId : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;
  return _jsxs("div", {
    className: styles.field,
    children: [
      _jsx("label", { className: styles.label, htmlFor: id, children: label }),
      control,
      hint &&
        !error &&
        _jsx("small", { className: styles.hint, id: descriptionId, children: hint }),
      error &&
        _jsx("small", {
          className: styles.error,
          id: errorId,
          role: "alert",
          children: error,
        }),
    ],
  });
}
export function getFieldDescribedBy(id, hasError, hasHint) {
  if (hasError) return `${id}-error`;
  if (hasHint) return `${id}-description`;
  return undefined;
}
