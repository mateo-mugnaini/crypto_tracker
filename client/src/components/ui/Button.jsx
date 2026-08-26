import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import styles from "./Button.module.css";
const Button = forwardRef(function Button(
  {
    children,
    className = "",
    disabled,
    fullWidth = false,
    loading = false,
    variant = "primary",
    type = "button",
    ...props
  },
  ref,
) {
  const classes = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return _jsxs("button", {
    ...props,
    "aria-busy": loading || undefined,
    className: classes,
    disabled: disabled || loading,
    ref: ref,
    type: type,
    children: [
      loading && _jsx("span", { "aria-hidden": "true", className: styles.spinner }),
      children,
    ],
  });
});
export default Button;
