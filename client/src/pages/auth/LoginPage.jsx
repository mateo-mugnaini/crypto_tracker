import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice;

  return (
    <main className={styles.layout}>
      <section className={styles.introPanel}>
        <div className={styles.brandLockup}>
          <span className={styles.brandMark}>P</span>
          <span>
            <strong>Pulso</strong>
            <small>Seguimiento cripto</small>
          </span>
        </div>
        <span className={styles.eyebrow}>Tu mercado, en claro</span>
        <h1>Tomá mejores decisiones con menos ruido.</h1>
        <p>
          Precios, cartera y alertas en un solo lugar. Una vista simple para saber qué
          está pasando con tus monedas.
        </p>
        <div className={styles.featureList}>
          <span>Precios actualizados</span>
          <span>Tu cartera</span>
          <span>Alertas útiles</span>
        </div>
      </section>
      <LoginForm notice={notice} onRegister={() => navigate("/register")} />
    </main>
  );
}
