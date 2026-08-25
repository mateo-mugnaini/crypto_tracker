import { useState, type FormEvent } from "react";

import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  notice?: string | null;
  onRegister(): void;
}

export default function LoginForm({ notice, onRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
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
    <form className={styles.card} onSubmit={handleSubmit}>
      <div>
        <span className={styles.eyebrow}>Acceso</span>
        <h2>Iniciar sesión</h2>
        <p className={styles.muted}>Usá las credenciales de un usuario del backend.</p>
      </div>

      {notice && <p className={styles.successMessage}>{notice}</p>}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mateo@example.com"
          autoComplete="email"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>

      <button className={styles.linkButton} onClick={onRegister} type="button">
        Crear una cuenta
      </button>
    </form>
  );
}
