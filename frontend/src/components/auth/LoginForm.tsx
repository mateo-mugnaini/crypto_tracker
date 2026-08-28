import { useState, type FormEvent } from "react";

import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n/I18nContext";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Field from "../ui/Field";
import LanguageSelector from "../ui/LanguageSelector";
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
  const { t } = useI18n();

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
      <div className={styles.languageControl}>
        <LanguageSelector />
      </div>
      <div>
        <span className={styles.eyebrow}>{t("workspace")}</span>
        <h2>{t("login_title")}</h2>
        <p className={styles.muted}>{t("login_description")}</p>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}

      <Field id="login-email" label={t("email")}>
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

      <Field id="login-password" label={t("password")}>
        <input
          autoComplete="current-password"
          id="login-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("min_password")}
          required
          type="password"
          value={password}
        />
      </Field>

      {error && <Alert tone="error">{error}</Alert>}

      <Button fullWidth loading={isSubmitting} type="submit">
        {t("login")}
      </Button>

      <Button className={styles.linkButton} onClick={onRegister} variant="ghost">
        {t("create_account")}
      </Button>
    </form>
  );
}
