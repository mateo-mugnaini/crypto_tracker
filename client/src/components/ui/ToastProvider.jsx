import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./ToastProvider.module.css";
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef([]);
  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );
  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const showToast = useCallback(
    (message, tone = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      const timer = window.setTimeout(() => dismissToast(id), 4500);
      timers.current.push(timer);
    },
    [dismissToast],
  );
  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);
  return _jsxs(ToastContext.Provider, {
    value: value,
    children: [
      children,
      _jsx("div", {
        "aria-label": "Notificaciones",
        className: styles.region,
        children: toasts.map((toast) =>
          _jsxs(
            "div",
            {
              className: `${styles.toast} ${styles[toast.tone]}`,
              role: toast.tone === "error" ? "alert" : "status",
              children: [
                _jsx("span", { children: toast.message }),
                _jsx("button", {
                  "aria-label": "Cerrar notificaci\u00F3n",
                  onClick: () => dismissToast(toast.id),
                  type: "button",
                  children: "\u00D7",
                }),
              ],
            },
            toast.id,
          ),
        ),
      }),
    ],
  });
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe utilizarse dentro de ToastProvider.");
  return context;
}
