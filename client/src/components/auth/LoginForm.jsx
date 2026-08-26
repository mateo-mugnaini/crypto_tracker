import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Field from "../ui/Field";
import styles from "./LoginForm.module.css";
export default function LoginForm({ notice, onRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event) {
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
  return _jsxs("form", {
    className: styles.card,
    onSubmit: handleSubmit,
    children: [
      _jsxs("div", {
        children: [
          _jsx("span", { className: styles.eyebrow, children: "Workspace" }),
          _jsx("h2", { children: "Volver al mercado" }),
          _jsx("p", {
            className: styles.muted,
            children: "Ingresa para continuar con tu seguimiento.",
          }),
        ],
      }),
      notice && _jsx(Alert, { tone: "success", children: notice }),
      _jsx(Field, {
        id: "login-email",
        label: "Email",
        children: _jsx("input", {
          autoComplete: "email",
          id: "login-email",
          onChange: (event) => setEmail(event.target.value),
          placeholder: "mateo@example.com",
          required: true,
          type: "email",
          value: email,
        }),
      }),
      _jsx(Field, {
        id: "login-password",
        label: "Contrase\u00F1a",
        children: _jsx("input", {
          autoComplete: "current-password",
          id: "login-password",
          minLength: 8,
          onChange: (event) => setPassword(event.target.value),
          placeholder: "M\u00EDnimo 8 caracteres",
          required: true,
          type: "password",
          value: password,
        }),
      }),
      error && _jsx(Alert, { tone: "error", children: error }),
      _jsx(Button, {
        fullWidth: true,
        loading: isSubmitting,
        type: "submit",
        children: "Ingresar",
      }),
      _jsx(Button, {
        className: styles.linkButton,
        onClick: onRegister,
        variant: "ghost",
        children: "Crear una cuenta",
      }),
    ],
  });
}
