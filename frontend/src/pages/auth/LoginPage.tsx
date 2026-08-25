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
        <span className={styles.eyebrow}>Crypto Tracker / Frontend 01</span>
        <h1>Seguimiento cripto con datos propios.</h1>
        <p>
          Una interfaz liviana sobre la API FastAPI que construimos. Primero
          autenticación; después, favoritos, historial y análisis.
        </p>
        <div className={styles.featureList}>
          <span>● API FastAPI conectada</span>
          <span>● JWT Bearer</span>
          <span>● Historial preparado</span>
        </div>
      </section>
      <LoginForm notice={notice} onRegister={() => navigate("/register")} />
    </main>
  );
}
