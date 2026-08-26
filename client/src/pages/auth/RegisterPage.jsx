import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();

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
        <span className={styles.eyebrow}>Empezá por lo importante</span>
        <h1>Tu mercado empieza con una buena vista.</h1>
        <p>
          Creá tu espacio para guardar monedas, registrar tu cartera y recibir avisos
          cuando un precio llegue a donde te interesa.
        </p>
        <div className={styles.featureList}>
          <span>Una cuenta personal</span>
          <span>Datos guardados</span>
          <span>Acceso seguro</span>
        </div>
      </section>
      <RegisterForm
        onLogin={() => navigate("/login")}
        onRegistered={() =>
          navigate("/login", {
            replace: true,
            state: { notice: "Cuenta creada. Ya podés iniciar sesión." },
          })
        }
      />
    </main>
  );
}
