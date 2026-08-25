import RegisterForm from "../../components/auth/RegisterForm";
import styles from "./RegisterPage.module.css";

interface RegisterPageProps {
  onLogin(): void;
  onRegistered(): void;
}

export default function RegisterPage({
  onLogin,
  onRegistered,
}: RegisterPageProps) {
  return (
    <main className={styles.layout}>
      <section className={styles.introPanel}>
        <span className={styles.eyebrow}>Crypto Tracker / Registro</span>
        <h1>Empezá a seguir tu mercado.</h1>
        <p>
          Creá tu cuenta y prepará tu espacio para favoritos, historial y
          análisis de precios.
        </p>
        <div className={styles.featureList}>
          <span>● Cuenta propia</span>
          <span>● Datos del backend real</span>
          <span>● Sesión segura</span>
        </div>
      </section>
      <RegisterForm onLogin={onLogin} onRegistered={onRegistered} />
    </main>
  );
}
