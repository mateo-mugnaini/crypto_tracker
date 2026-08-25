import LoginForm from "../../components/auth/LoginForm";
import styles from "./LoginPage.module.css";

interface LoginPageProps {
  notice?: string | null;
  onRegister(): void;
}

export default function LoginPage({ notice, onRegister }: LoginPageProps) {
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
      <LoginForm notice={notice} onRegister={onRegister} />
    </main>
  );
}
