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

  return (
    <div aria-live="assertive" className={styles.notice} role="alert">
      Sin conexión. Se muestran solo recursos guardados; los precios pueden estar
      desactualizados.
    </div>
  );
}
