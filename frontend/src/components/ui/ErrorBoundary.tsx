import { Component, type ReactNode } from "react";

import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // No se exponen detalles internos ni datos sensibles al usuario.
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main aria-live="assertive" className={styles.fallback} role="alert">
        <h1>Algo salió mal</h1>
        <p>
          La aplicación no pudo mostrar esta vista. Recarga la página para intentar
          recuperar tu sesión.
        </p>
        <button onClick={() => window.location.reload()} type="button">
          Recargar aplicación
        </button>
      </main>
    );
  }
}
