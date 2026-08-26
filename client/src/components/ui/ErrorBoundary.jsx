import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import styles from "./ErrorBoundary.module.css";
export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // No se exponen detalles internos ni datos sensibles al usuario.
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return _jsxs("main", {
      "aria-live": "assertive",
      className: styles.fallback,
      role: "alert",
      children: [
        _jsx("h1", { children: "Algo sali\u00F3 mal" }),
        _jsx("p", {
          children:
            "La aplicaci\u00F3n no pudo mostrar esta vista. Recarga la p\u00E1gina para intentar recuperar tu sesi\u00F3n.",
        }),
        _jsx("button", {
          onClick: () => window.location.reload(),
          type: "button",
          children: "Recargar aplicaci\u00F3n",
        }),
      ],
    });
  }
}
