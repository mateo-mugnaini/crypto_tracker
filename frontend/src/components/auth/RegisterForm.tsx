import { useState, type FormEvent } from "react";

import { ApiError, api } from "../../api/client";
import { useI18n } from "../../i18n/I18nContext";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Field from "../ui/Field";
import LanguageSelector from "../ui/LanguageSelector";
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
  const { t } = useI18n();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError(t("passwords_mismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.register(username, email, password);
      onRegistered();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("register_failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.languageControl}>
        <LanguageSelector />
      </div>
      <div>
        <span className={styles.eyebrow}>{t("new_workspace")}</span>
        <h2>{t("register_title")}</h2>
        <p className={styles.muted}>{t("register_description")}</p>
      </div>

      <Field id="register-username" label={t("username")}>
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

      <Field id="register-email" label={t("email")}>
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

      <Field id="register-password" label={t("password")}>
        <input
          autoComplete="new-password"
          id="register-password"
          maxLength={128}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("min_password")}
          required
          type="password"
          value={password}
        />
      </Field>

      <Field id="register-password-confirmation" label={t("repeat_password")}>
        <input
          autoComplete="new-password"
          id="register-password-confirmation"
          maxLength={128}
          minLength={8}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder={t("repeat_password_placeholder")}
          required
          type="password"
          value={passwordConfirmation}
        />
      </Field>

      {error && <Alert tone="error">{error}</Alert>}

      <Button fullWidth loading={isSubmitting} type="submit">
        {t("register")}
      </Button>

      <Button className={styles.linkButton} onClick={onLogin} variant="ghost">
        {t("existing_account")}
      </Button>
    </form>
  );
}
