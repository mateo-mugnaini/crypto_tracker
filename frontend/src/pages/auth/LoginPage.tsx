import { useLocation, useNavigate } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  return (
    <main className={styles.layout}>
      <section className={styles.introPanel}>
        <span className={styles.eyebrow}>Crypto Tracker / Secure access</span>
        <h1>Seguimiento cripto, sin ruido.</h1>
        <p>
          Lee el mercado con claridad, guarda tus activos relevantes y encuentra
          contexto en cada movimiento.
        </p>
        <div className={styles.featureList}>
          <span>Datos del mercado</span>
          <span>Historial y tendencias</span>
          <span>Workspace personal</span>
        </div>
      </section>
      <LoginForm notice={notice} onRegister={() => navigate("/register")} />
    </main>
  );
}
