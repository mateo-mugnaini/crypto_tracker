import { useState } from "react";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import styles from "./App.module.css";

function AppContent() {
  const { status } = useAuth();
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

  if (status === "loading") {
    return <main className={styles.centeredState}>Verificando sesión…</main>;
  }

  if (status === "anonymous") {
    if (authScreen === "register") {
      return (
        <RegisterPage
          onLogin={() => setAuthScreen("login")}
          onRegistered={() => {
            setRegistrationNotice("Cuenta creada. Ya podés iniciar sesión.");
            setAuthScreen("login");
          }}
        />
      );
    }

    return (
      <LoginPage
        notice={registrationNotice}
        onRegister={() => {
          setRegistrationNotice(null);
          setAuthScreen("register");
        }}
      />
    );
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
