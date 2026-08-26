import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import styles from "./PulseAuth.module.css";

function Brand() {
  return (
    <Link className={styles.brand} to="/login">
      <span className={styles.mark}>P</span>
      <span>Pulso</span>
    </Link>
  );
}

export function PulseLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const message = location.state?.message;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Brand />
        <h1>Entrá a tu pulso</h1>
        <p className={styles.intro}>
          Consultá el mercado y seguí tu cartera desde un solo lugar.
        </p>
        {message && <p className={styles.success}>{message}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              minLength="8"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submit} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className={styles.footnote}>
          ¿Todavía no tenés cuenta? <Link to="/register">Creala acá</Link>
        </p>
      </section>
    </main>
  );
}

export function PulseRegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.register(username, email, password);
      navigate("/login", {
        replace: true,
        state: { message: "Cuenta creada. Ya podés entrar." },
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo crear la cuenta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Brand />
        <h1>Creá tu cuenta</h1>
        <p className={styles.intro}>
          Un espacio simple para mirar precios y ordenar tus inversiones.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="register-username">Nombre de usuario</label>
            <input
              id="register-username"
              minLength="3"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              minLength="8"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submit} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creando…" : "Crear cuenta"}
          </button>
        </form>
        <p className={styles.footnote}>
          ¿Ya tenés cuenta? <Link to="/login">Volvé a entrar</Link>
        </p>
      </section>
    </main>
  );
}
