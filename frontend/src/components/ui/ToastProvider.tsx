import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import styles from "./ToastProvider.module.css";

type ToastTone = "info" | "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}
interface ToastContextValue {
  showToast(message: string, tone?: ToastTone): void;
  dismissToast(id: number): void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      const timer = window.setTimeout(() => dismissToast(id), 4500);
      timers.current.push(timer);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-label="Notificaciones" className={styles.region}>
        {toasts.map((toast) => (
          <div
            className={`${styles.toast} ${styles[toast.tone]}`}
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <span>{toast.message}</span>
            <button
              aria-label="Cerrar notificación"
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe utilizarse dentro de ToastProvider.");
  return context;
}
