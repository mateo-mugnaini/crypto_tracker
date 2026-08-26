import { useState, type FormEvent } from "react";

import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Field from "../ui/Field";
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
        <span className={styles.eyebrow}>Workspace</span>
        <h2>Volver al mercado</h2>
        <p className={styles.muted}>Ingresa para continuar con tu seguimiento.</p>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}

      <Field id="login-email" label="Email">
        <input
          autoComplete="email"
          id="login-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mateo@example.com"
          required
          type="email"
          value={email}
        />
      </Field>

      <Field id="login-password" label="Contraseña">
        <input
          autoComplete="current-password"
          id="login-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          type="password"
          value={password}
        />
      </Field>

      {error && <Alert tone="error">{error}</Alert>}

      <Button fullWidth loading={isSubmitting} type="submit">
        Ingresar
      </Button>

      <Button className={styles.linkButton} onClick={onRegister} variant="ghost">
        Crear una cuenta
      </Button>
    </form>
  );
}
