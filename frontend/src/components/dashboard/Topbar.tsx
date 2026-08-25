import { useAuth } from "../../auth/AuthContext";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.brandMark}>CT</div>
      <div>
        <strong>Crypto Tracker</strong>
        <span>Panel de mercado</span>
      </div>
      <div className={styles.actions}>
        <span className={styles.userChip}>{user?.username}</span>
        <button className={styles.secondaryButton} onClick={logout} type="button">
          Salir
        </button>
      </div>
    </header>
  );
}
