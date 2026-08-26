import { useState, type FormEvent } from "react";

import { ApiError, api } from "../../api/client";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Field from "../ui/Field";
import styles from "./RegisterForm.module.css";

interface RegisterFormProps {
  onLogin(): void;
  onRegistered(): void;
}

export default function RegisterForm({ onLogin, onRegistered }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.register(username, email, password);
      onRegistered();
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
    <form className={styles.card} onSubmit={handleSubmit}>
      <div>
        <span className={styles.eyebrow}>Nuevo workspace</span>
        <h2>Crear tu cuenta</h2>
        <p className={styles.muted}>
          Guarda tus favoritos y consulta tu mercado desde un solo lugar.
        </p>
      </div>

      <Field id="register-username" label="Usuario">
        <input
          autoComplete="username"
          id="register-username"
          maxLength={50}
          minLength={3}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="mateo"
          required
          type="text"
          value={username}
        />
      </Field>

      <Field id="register-email" label="Email">
        <input
          autoComplete="email"
          id="register-email"
          maxLength={255}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mateo@example.com"
          required
          type="email"
          value={email}
        />
      </Field>

      <Field id="register-password" label="Contraseña">
        <input
          autoComplete="new-password"
          id="register-password"
          maxLength={128}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          type="password"
          value={password}
        />
      </Field>

      <Field id="register-password-confirmation" label="Repetir contraseña">
        <input
          autoComplete="new-password"
          id="register-password-confirmation"
          maxLength={128}
          minLength={8}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repite tu contraseña"
          required
          type="password"
          value={passwordConfirmation}
        />
      </Field>

      {error && <Alert tone="error">{error}</Alert>}

      <Button fullWidth loading={isSubmitting} type="submit">
        Crear cuenta
      </Button>

      <Button className={styles.linkButton} onClick={onLogin} variant="ghost">
        Ya tengo una cuenta
      </Button>
    </form>
  );
}
