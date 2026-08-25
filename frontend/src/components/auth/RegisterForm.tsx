import { useState, type FormEvent } from "react";

import { ApiError, api } from "../../api/client";
import styles from "./RegisterForm.module.css";

interface RegisterFormProps {
  onLogin(): void;
  onRegistered(): void;
}

export default function RegisterForm({
  onLogin,
  onRegistered,
}: RegisterFormProps) {
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
        <span className={styles.eyebrow}>Registro</span>
        <h2>Crear cuenta</h2>
        <p className={styles.muted}>
          Registrate para guardar tus monedas y consultar tu mercado.
        </p>
      </div>

      <label>
        Usuario
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="mateo"
          autoComplete="username"
          minLength={3}
          maxLength={50}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mateo@example.com"
          autoComplete="email"
          maxLength={255}
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
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </label>

      <label>
        Repetir password
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repetí tu password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </label>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando…" : "Crear cuenta"}
      </button>

      <button className={styles.linkButton} onClick={onLogin} type="button">
        Ya tengo una cuenta
      </button>
    </form>
  );
}
