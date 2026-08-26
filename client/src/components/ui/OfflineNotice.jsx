import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import styles from "./OfflineNotice.module.css";
export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  if (!isOffline) return null;
  return _jsx("div", {
    "aria-live": "assertive",
    className: styles.notice,
    role: "alert",
    children:
      "Sin conexi\u00F3n. Se muestran solo recursos guardados; los precios pueden estar desactualizados.",
  });
}
