import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ApiError, api } from "../../api/client";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Field from "../ui/Field";
import styles from "./RegisterForm.module.css";
export default function RegisterForm({ onLogin, onRegistered }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event) {
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
  return _jsxs("form", {
    className: styles.card,
    onSubmit: handleSubmit,
    children: [
      _jsxs("div", {
        children: [
          _jsx("span", { className: styles.eyebrow, children: "Nuevo workspace" }),
          _jsx("h2", { children: "Crear tu cuenta" }),
          _jsx("p", {
            className: styles.muted,
            children: "Guarda tus favoritos y consulta tu mercado desde un solo lugar.",
          }),
        ],
      }),
      _jsx(Field, {
        id: "register-username",
        label: "Usuario",
        children: _jsx("input", {
          autoComplete: "username",
          id: "register-username",
          maxLength: 50,
          minLength: 3,
          onChange: (event) => setUsername(event.target.value),
          placeholder: "mateo",
          required: true,
          type: "text",
          value: username,
        }),
      }),
      _jsx(Field, {
        id: "register-email",
        label: "Email",
        children: _jsx("input", {
          autoComplete: "email",
          id: "register-email",
          maxLength: 255,
          onChange: (event) => setEmail(event.target.value),
          placeholder: "mateo@example.com",
          required: true,
          type: "email",
          value: email,
        }),
      }),
      _jsx(Field, {
        id: "register-password",
        label: "Contrase\u00F1a",
        children: _jsx("input", {
          autoComplete: "new-password",
          id: "register-password",
          maxLength: 128,
          minLength: 8,
          onChange: (event) => setPassword(event.target.value),
          placeholder: "M\u00EDnimo 8 caracteres",
          required: true,
          type: "password",
          value: password,
        }),
      }),
      _jsx(Field, {
        id: "register-password-confirmation",
        label: "Repetir contrase\u00F1a",
        children: _jsx("input", {
          autoComplete: "new-password",
          id: "register-password-confirmation",
          maxLength: 128,
          minLength: 8,
          onChange: (event) => setPasswordConfirmation(event.target.value),
          placeholder: "Repite tu contrase\u00F1a",
          required: true,
          type: "password",
          value: passwordConfirmation,
        }),
      }),
      error && _jsx(Alert, { tone: "error", children: error }),
      _jsx(Button, {
        fullWidth: true,
        loading: isSubmitting,
        type: "submit",
        children: "Crear cuenta",
      }),
      _jsx(Button, {
        className: styles.linkButton,
        onClick: onLogin,
        variant: "ghost",
        children: "Ya tengo una cuenta",
      }),
    ],
  });
}
