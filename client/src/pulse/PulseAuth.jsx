import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import LanguageSelector from "../components/ui/LanguageSelector";
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
  const { t } = useI18n();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("login_failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.languageControl}>
          <LanguageSelector />
        </div>
        <Brand />
        <h1>{t("login_title")}</h1>
        <p className={styles.intro}>{t("login_description")}</p>
        {message && <p className={styles.success}>{message}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="login-email">{t("email")}</label>
            <input
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="login-password">{t("password")}</label>
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
            {isSubmitting ? t("signing_in") : t("sign_in")}
          </button>
        </form>
        <p className={styles.footnote}>
          {t("no_account")} <Link to="/register">{t("create_here")}</Link>
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
  const { t } = useI18n();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.register(username, email, password);
      navigate("/login", {
        replace: true,
        state: { message: t("account_created") },
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.message : t("register_failed"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.languageControl}>
          <LanguageSelector />
        </div>
        <Brand />
        <h1>{t("register_title")}</h1>
        <p className={styles.intro}>{t("register_description")}</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="register-username">{t("username")}</label>
            <input
              id="register-username"
              minLength="3"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="register-email">{t("email")}</label>
            <input
              id="register-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="register-password">{t("password")}</label>
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
            {isSubmitting ? t("signing_up") : t("sign_up")}
          </button>
        </form>
        <p className={styles.footnote}>
          {t("have_account")} <Link to="/login">{t("return_login")}</Link>
        </p>
      </section>
    </main>
  );
}
