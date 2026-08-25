import { useNavigate } from "react-router-dom";

import RegisterForm from "../../components/auth/RegisterForm";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.layout}>
      <section className={styles.introPanel}>
        <span className={styles.eyebrow}>Crypto Tracker / Create account</span>
        <h1>Tu mercado empieza aquí.</h1>
        <p>
          Crea tu espacio personal para seguir favoritos, revisar precios y
          analizar la evolución de tus monedas.
        </p>
        <div className={styles.featureList}>
          <span>Cuenta propia</span>
          <span>Datos persistentes</span>
          <span>Acceso seguro</span>
        </div>
      </section>
      <RegisterForm
        onLogin={() => navigate("/login")}
        onRegistered={() =>
          navigate("/login", {
            replace: true,
            state: { notice: "Cuenta creada. Ya puedes iniciar sesión." },
          })
        }
      />
    </main>
  );
}
